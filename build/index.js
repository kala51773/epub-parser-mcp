#!/usr/bin/env node
/**
 * EPUB解析MCP服务器主入口文件
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListResourceTemplatesRequestSchema, ListToolsRequestSchema, McpError, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { EpubParser } from './epub-parser.js';
class EpubParserServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'epub-parser',
            version: '1.0.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupResourceHandlers();
        // 错误处理
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    /**
     * 设置工具处理器
     */
    setupToolHandlers() {
        // 列出可用工具
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'epub_info',
                    description: '获取EPUB文件的基本信息，包括元数据和章节结构',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'EPUB文件的完整路径',
                            },
                        },
                        required: ['filePath'],
                    },
                },
                {
                    name: 'epub_toc',
                    description: '获取EPUB文件的目录结构',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'EPUB文件的完整路径',
                            },
                        },
                        required: ['filePath'],
                    },
                },
                {
                    name: 'epub_extract_text',
                    description: '从EPUB文件中提取文本内容',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'EPUB文件的完整路径',
                            },
                            chapterIds: {
                                type: 'array',
                                items: { type: 'string' },
                                description: '要提取的章节ID列表（可选）',
                            },
                            maxLength: {
                                type: 'number',
                                description: '最大文本长度限制（可选）',
                            },
                        },
                        required: ['filePath'],
                    },
                },
                {
                    name: 'epub_search',
                    description: '在EPUB文件中搜索文本',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'EPUB文件的完整路径',
                            },
                            query: {
                                type: 'string',
                                description: '搜索关键词',
                            },
                            caseSensitive: {
                                type: 'boolean',
                                description: '是否区分大小写（默认false）',
                            },
                        },
                        required: ['filePath', 'query'],
                    },
                },
            ],
        }));
        // 处理工具调用
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const args = request.params.arguments || {};
            switch (request.params.name) {
                case 'epub_info':
                    return await this.handleEpubInfo(this.validateEpubInfoArgs(args));
                case 'epub_toc':
                    return await this.handleEpubToc(this.validateEpubTocArgs(args));
                case 'epub_extract_text':
                    return await this.handleEpubExtractText(this.validateEpubExtractTextArgs(args));
                case 'epub_search':
                    return await this.handleEpubSearch(this.validateEpubSearchArgs(args));
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    /**
     * 设置资源处理器
     */
    setupResourceHandlers() {
        // 列出资源模板
        this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
            resourceTemplates: [
                {
                    uriTemplate: 'epub://{file}/metadata',
                    name: 'EPUB文件元数据',
                    description: '获取EPUB文件的元数据信息',
                },
                {
                    uriTemplate: 'epub://{file}/toc',
                    name: 'EPUB文件目录',
                    description: '获取EPUB文件的目录结构',
                },
                {
                    uriTemplate: 'epub://{file}/chapter/{id}',
                    name: 'EPUB章节内容',
                    description: '获取EPUB文件的特定章节内容',
                },
            ],
        }));
        // 处理资源读取
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            const match = uri.match(/^epub:\/\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
            if (!match) {
                throw new McpError(ErrorCode.InvalidRequest, `Invalid URI format: ${uri}`);
            }
            const filePath = decodeURIComponent(match[1]);
            const resourceType = match[2];
            const chapterId = match[3];
            try {
                const parser = new EpubParser(filePath);
                const info = await parser.getInfo();
                let content;
                switch (resourceType) {
                    case 'metadata':
                        content = JSON.stringify(info.metadata, null, 2);
                        break;
                    case 'toc':
                        content = JSON.stringify(info.toc, null, 2);
                        break;
                    case 'chapter':
                        if (!chapterId) {
                            throw new McpError(ErrorCode.InvalidParams, 'Chapter ID is required for chapter resource');
                        }
                        const chapter = info.chapters.find(ch => ch.id === chapterId);
                        if (!chapter) {
                            throw new McpError(ErrorCode.InvalidParams, `Chapter not found: ${chapterId}`);
                        }
                        content = chapter.content;
                        break;
                    default:
                        throw new McpError(ErrorCode.InvalidParams, `Unknown resource type: ${resourceType}`);
                }
                return {
                    contents: [
                        {
                            uri: request.params.uri,
                            mimeType: 'application/json',
                            text: content,
                        },
                    ],
                };
            }
            catch (error) {
                throw new McpError(ErrorCode.InternalError, `Failed to read EPUB resource: ${error}`);
            }
        });
    }
    /**
     * 参数验证方法 - 简化版本
     */
    validateEpubInfoArgs(args) {
        if (typeof args.filePath !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'filePath must be a string');
        }
        return { filePath: args.filePath };
    }
    validateEpubTocArgs(args) {
        if (typeof args.filePath !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'filePath must be a string');
        }
        return { filePath: args.filePath };
    }
    validateEpubExtractTextArgs(args) {
        if (typeof args.filePath !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'filePath must be a string');
        }
        const result = { filePath: args.filePath };
        if (args.chapterIds && Array.isArray(args.chapterIds))
            result.chapterIds = args.chapterIds;
        if (args.maxLength && typeof args.maxLength === 'number')
            result.maxLength = args.maxLength;
        return result;
    }
    validateEpubSearchArgs(args) {
        if (typeof args.filePath !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'filePath must be a string');
        }
        if (typeof args.query !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'query must be a string');
        }
        const result = { filePath: args.filePath, query: args.query };
        if (typeof args.caseSensitive === 'boolean')
            result.caseSensitive = args.caseSensitive;
        return result;
    }
    /**
     * 处理EPUB信息工具
     */
    async handleEpubInfo(args) {
        try {
            const parser = new EpubParser(args.filePath);
            const info = await parser.getInfo();
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            metadata: info.metadata,
                            fileStats: {
                                fileSize: info.fileSize,
                                fileCount: info.fileCount,
                                chapterCount: info.chapters.length,
                            },
                            chapters: info.chapters.map(ch => ({
                                id: ch.id,
                                title: ch.title,
                                href: ch.href,
                            })),
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error reading EPUB file: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * 处理EPUB目录工具
     */
    async handleEpubToc(args) {
        try {
            const parser = new EpubParser(args.filePath);
            const info = await parser.getInfo();
            // 格式化目录显示
            const formatToc = (items, level = 0) => {
                let result = '';
                const indent = '  '.repeat(level);
                items.forEach(item => {
                    result += `${indent}- ${item.label}`;
                    if (item.href) {
                        result += ` (${item.href})`;
                    }
                    result += '\n';
                    if (item.children && item.children.length > 0) {
                        result += formatToc(item.children, level + 1);
                    }
                });
                return result;
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: `EPUB目录结构:\n\n${formatToc(info.toc)}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error reading EPUB TOC: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * 处理EPUB文本提取工具
     */
    async handleEpubExtractText(args) {
        try {
            const parser = new EpubParser(args.filePath);
            const info = await parser.getInfo();
            let chaptersToExtract = info.chapters;
            // 如果指定了章节ID，只提取指定章节
            if (args.chapterIds && args.chapterIds.length > 0) {
                chaptersToExtract = info.chapters.filter(ch => args.chapterIds.includes(ch.id));
            }
            let extractedText = '';
            for (const chapter of chaptersToExtract) {
                extractedText += `=== ${chapter.title} ===\n\n`;
                extractedText += chapter.content + '\n\n';
            }
            // 应用长度限制
            if (args.maxLength && extractedText.length > args.maxLength) {
                extractedText = extractedText.substring(0, args.maxLength) + '...\n\n[内容被截断]';
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: extractedText,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error extracting EPUB text: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * 处理EPUB搜索工具
     */
    async handleEpubSearch(args) {
        try {
            const parser = new EpubParser(args.filePath);
            const results = await parser.searchContent(args.query, args.caseSensitive || false);
            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `在EPUB文件中未找到匹配 "${args.query}" 的内容`,
                        },
                    ],
                };
            }
            const resultText = results.map((result, index) => `${index + 1}. 章节: ${result.chapterTitle}\n   上下文: ...${result.context}...\n   位置: ${result.position}\n`).join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `找到 ${results.length} 个匹配 "${args.query}" 的结果:\n\n${resultText}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error searching EPUB: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * 运行服务器
     */
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('EPUB Parser MCP server running on stdio');
    }
}
// 启动服务器
const server = new EpubParserServer();
server.run().catch(console.error);
