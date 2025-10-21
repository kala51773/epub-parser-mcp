/**
 * EPUB解析器核心实现
 */

import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';
import { 
  EpubMetadata, 
  EpubTocItem, 
  EpubChapter, 
  EpubInfo 
} from './types.js';

export class EpubParser {
  private zip: AdmZip;
  private basePath: string = '';

  constructor(private filePath: string) {
    this.zip = new AdmZip(filePath);
  }

  /**
   * 获取EPUB文件的基本信息
   */
  async getInfo(): Promise<EpubInfo> {
    const container = await this.parseContainer();
    const opfPath = await this.findOpfPath(container);
    this.basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    
    const opfContent = await this.parseOpf(opfPath);
    const metadata = await this.extractMetadata(opfContent);
    const toc = await this.extractToc(opfContent);
    const chapters = await this.extractChapters(opfContent);

    return {
      metadata,
      toc,
      chapters,
      fileSize: this.zip.getEntries().length,
      fileCount: this.zip.getEntries().length
    };
  }

  /**
   * 解析容器文件
   */
  private async parseContainer(): Promise<any> {
    const containerEntry = this.zip.getEntry('META-INF/container.xml');
    if (!containerEntry) {
      throw new Error('Container file not found');
    }

    const containerXml = containerEntry.getData().toString('utf8');
    return await parseStringPromise(containerXml);
  }

  /**
   * 查找OPF文件路径
   */
  private async findOpfPath(container: any): Promise<string> {
    const rootfiles = container?.container?.rootfiles?.[0]?.rootfile;
    if (!rootfiles || rootfiles.length === 0) {
      throw new Error('No rootfile found in container');
    }

    const rootfile = rootfiles[0];
    const opfPath = rootfile.$['full-path'];
    if (!opfPath) {
      throw new Error('OPF path not found in container');
    }

    return opfPath;
  }

  /**
   * 解析OPF文件
   */
  private async parseOpf(opfPath: string): Promise<any> {
    const opfEntry = this.zip.getEntry(opfPath);
    if (!opfEntry) {
      throw new Error(`OPF file not found: ${opfPath}`);
    }

    const opfXml = opfEntry.getData().toString('utf8');
    return await parseStringPromise(opfXml);
  }

  /**
   * 提取元数据
   */
  private async extractMetadata(opfContent: any): Promise<EpubMetadata> {
    const metadata = opfContent?.package?.metadata?.[0];
    if (!metadata) {
      return {};
    }

    const getFirst = (field: any) => field?.[0] || '';

    return {
      title: getFirst(metadata['dc:title']),
      creator: getFirst(metadata['dc:creator']),
      author: getFirst(metadata['dc:creator']),
      publisher: getFirst(metadata['dc:publisher']),
      language: getFirst(metadata['dc:language']),
      description: getFirst(metadata['dc:description']),
      date: getFirst(metadata['dc:date']),
      identifier: getFirst(metadata['dc:identifier']),
      rights: getFirst(metadata['dc:rights'])
    };
  }

  /**
   * 提取目录
   */
  private async extractToc(opfContent: any): Promise<EpubTocItem[]> {
    // 首先尝试从OPF的spine中提取
    const spine = opfContent?.package?.spine?.[0]?.itemref;
    if (!spine) {
      return [];
    }

    const manifest = opfContent?.package?.manifest?.[0]?.item;
    if (!manifest) {
      return [];
    }

    const tocItems: EpubTocItem[] = [];

    // 创建ID到manifest项的映射
    const manifestMap: { [id: string]: any } = {};
    manifest.forEach((item: any) => {
      manifestMap[item.$.id] = item;
    });

    // 从spine构建基本目录
    spine.forEach((itemRef: any, index: number) => {
      const id = itemRef.$.idref;
      const manifestItem = manifestMap[id];
      if (manifestItem) {
        tocItems.push({
          id: `chapter-${index}`,
          label: `Chapter ${index + 1}`,
          href: manifestItem.$.href
        });
      }
    });

    // 尝试查找NCX文件以获取更好的目录结构
    try {
      const ncxPath = await this.findNcxPath(opfContent);
      if (ncxPath) {
        const ncxToc = await this.parseNcxToc(ncxPath);
        if (ncxToc.length > 0) {
          return ncxToc;
        }
      }
    } catch (error) {
      console.warn('Failed to parse NCX file, using basic TOC');
    }

    return tocItems;
  }

  /**
   * 查找NCX文件路径
   */
  private async findNcxPath(opfContent: any): Promise<string | null> {
    const manifest = opfContent?.package?.manifest?.[0]?.item;
    if (!manifest) {
      return null;
    }

    for (const item of manifest) {
      const mediaType = String(item.$['media-type'] || '');
      const href = String(item.$.href || '');
      
      if (mediaType === 'application/x-dtbncx+xml' || 
          href.endsWith('.ncx')) {
        return this.resolvePath(href);
      }
    }
    return null;
  }

  /**
   * 解析NCX目录文件
   */
  private async parseNcxToc(ncxPath: string): Promise<EpubTocItem[]> {
    const ncxEntry = this.zip.getEntry(ncxPath);
    if (!ncxEntry) {
      return [];
    }

    const ncxXml = ncxEntry.getData().toString('utf8');
    const ncxContent = await parseStringPromise(ncxXml);

    const parseNavPoints = (navPoints: any[]): EpubTocItem[] => {
      if (!navPoints) return [];

      return navPoints.map((navPoint: any) => {
        const label = navPoint.navLabel?.[0]?.text?.[0] || 'Untitled';
        const content = navPoint.content?.[0]?.$?.src || '';
        
        return {
          id: navPoint.$.id,
          label,
          href: content,
          children: parseNavPoints(navPoint.navPoint)
        };
      });
    };

    const navMap = ncxContent?.ncx?.navMap?.[0];
    if (!navMap) {
      return [];
    }

    return parseNavPoints(navMap.navPoint);
  }

  /**
   * 提取章节内容
   */
  private async extractChapters(opfContent: any): Promise<EpubChapter[]> {
    const spine = opfContent?.package?.spine?.[0]?.itemref;
    const manifest = opfContent?.package?.manifest?.[0]?.item;

    if (!spine || !manifest) {
      return [];
    }

    const chapters: EpubChapter[] = [];
    const manifestMap: { [id: string]: any } = {};

    manifest.forEach((item: any) => {
      manifestMap[item.$.id] = item;
    });

    for (let i = 0; i < spine.length; i++) {
      const itemRef = spine[i];
      const id = itemRef.$.idref;
      const manifestItem = manifestMap[id];

      if (manifestItem && this.isContentFile(manifestItem.$.href)) {
        try {
          const content = await this.extractChapterContent(manifestItem.$.href);
          chapters.push({
            id: `chapter-${i}`,
            title: `Chapter ${i + 1}`,
            content,
            href: manifestItem.$.href
          });
        } catch (error) {
          console.warn(`Failed to extract chapter ${i}: ${error}`);
        }
      }
    }

    return chapters;
  }

  /**
   * 提取章节内容
   */
  private async extractChapterContent(href: string): Promise<string> {
    const fullPath = this.resolvePath(href);
    const entry = this.zip.getEntry(fullPath);
    
    if (!entry) {
      throw new Error(`Chapter file not found: ${fullPath}`);
    }

    const content = entry.getData().toString('utf8');
    
    // 使用cheerio提取文本内容
    const $ = cheerio.load(content);
    
    // 移除脚本和样式标签
    $('script, style').remove();
    
    // 获取文本内容
    let text = $('body').text() || $('html').text() || content;
    
    // 清理文本：移除多余空白字符
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * 检查是否为内容文件
   */
  private isContentFile(href: string): boolean {
    return href.endsWith('.html') || href.endsWith('.xhtml') || href.endsWith('.htm');
  }

  /**
   * 解析相对路径
   */
  private resolvePath(relativePath: string): string {
    if (relativePath.startsWith('/')) {
      return relativePath.substring(1);
    }
    return this.basePath + relativePath;
  }

  /**
   * 搜索内容
   */
  async searchContent(query: string, caseSensitive: boolean = false): Promise<any[]> {
    const info = await this.getInfo();
    const results: any[] = [];

    for (const chapter of info.chapters) {
      const content = chapter.content;
      const regex = new RegExp(
        caseSensitive ? query : query.toLowerCase(), 
        caseSensitive ? 'g' : 'gi'
      );

      let match;
      while ((match = regex.exec(content)) !== null) {
        results.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          text: match[0],
          position: match.index,
          context: content.substring(
            Math.max(0, match.index - 50),
            Math.min(content.length, match.index + match[0].length + 50)
          )
        });
      }
    }

    return results;
  }
}
