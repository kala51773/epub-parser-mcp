# EPUB Parser MCP Server 📚

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)]()
[![MCP](https://img.shields.io/badge/MCP-0.5.0-green)]()
[![License: GPL](https://img.shields.io/badge/License-GPL-yellow)]()
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)]()

A powerful TypeScript-based Model Context Protocol (MCP) server for parsing EPUB files and extracting content with AI assistance. Built for seamless integration with AI assistants like Claude Desktop.

## ✨ Features

- 📄 **Metadata Extraction** - Extract EPUB metadata (title, author, publisher, language, etc.)
- 📑 **Table of Contents** - Parse hierarchical table of contents structure
- 📖 **Text Content Extraction** - Extract clean text from chapters with formatting options
- 🔍 **Advanced Search** - Search text within EPUB files with case sensitivity options
- 🌐 **Resource Access** - Access EPUB resources via URI templates
- 🚀 **TypeScript** - Built with TypeScript for type safety and better development experience
- ⚡ **High Performance** - Optimized EPUB parsing algorithms
- 🔧 **MCP Standard** - Fully compliant with Model Context Protocol standards

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

#### 方法1: 从源码安装
```bash
# Clone the repository
git clone https://github.com/your-username/epub-parser-mcp.git
cd epub-parser-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

#### 方法2: 使用npx（推荐用于生产环境）
```bash
# 直接使用npx运行，无需安装
npx epub-parser-mcp
```

#### 方法3: 全局安装
```bash
# 全局安装
npm install -g epub-parser-mcp

# 然后直接运行
epub-parser-mcp
```

## 🔧 MCP Configuration

### 服务配置 (Server Config)

以下是完整的MCP服务配置，可用于Claude Desktop或其他MCP客户端：

```json
{
  "mcpServers": {
    "epub-parser": {
      "command": "npx",
      "args": ["-y", "epub-parser-mcp"]
    }
  }
}
```

**环境变量配置 (Environment Variables):**
```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file:

**使用npx (推荐):**
```json
{
  "mcpServers": {
    "epub-parser": {
      "command": "npx",
      "args": ["-y", "epub-parser-mcp"]
    }
  }
}
```

**备选方案: 使用node直接运行 (如果npx不支持):**
```json
{
  "mcpServers": {
    "epub-parser": {
      "command": "node",
      "args": ["/path/to/epub-parser-mcp/build/index.js"]
    }
  }
}
```

**注意:** Claude Desktop目前支持以 `python -m`、`uv`、`uvx` 或 `npx` 开头的命令。在某些环境中，`node` 命令可能不被支持。

### Configuration File Locations

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Configuration Steps

1. **Build the project** (if not already built):
   ```bash
   npm run build
   ```

2. **Locate your Claude Desktop configuration file** (see locations above)

3. **Add the MCP server configuration** to the `mcpServers` section

4. **Restart Claude Desktop** to load the new configuration

5. **Verify the server is running** by checking the Claude Desktop logs

### Configuration Validation

After configuration, you can verify the server is working by:

1. **Check Claude Desktop logs** for any MCP-related errors
2. **Test the tools** by asking Claude to use the EPUB parser tools
3. **Verify server startup** - the server should start automatically when Claude Desktop launches

### Troubleshooting

**Common Issues:**

1. **Path Issues**: Ensure the path to `build/index.js` is correct and accessible
2. **Node.js Version**: Make sure Node.js 18+ is installed and in your PATH
3. **Permissions**: Ensure the build files have proper execution permissions
4. **Dependencies**: Run `npm install` if dependencies are missing

**Error Messages:**
- "Command not found": Check Node.js installation and PATH
- "File not found": Verify the path to build/index.js
- "Permission denied": Check file permissions on build directory

### Advanced Configuration

For development, you can run the server manually:

```bash
# Build and start the server
npm run build
npm start

# Or run directly
node build/index.js
```

The server will output connection information and any errors to the console.

## 📖 Usage Examples

### Get EPUB Information
```json
{
  "filePath": "/path/to/book.epub"
}
```

### Extract Table of Contents
```json
{
  "filePath": "/path/to/book.epub"
}
```

### Extract Text Content
```json
{
  "filePath": "/path/to/book.epub",
  "chapterIds": ["chapter-1", "chapter-2"],
  "maxLength": 5000
}
```

### Search in EPUB
```json
{
  "filePath": "/path/to/book.epub",
  "query": "artificial intelligence",
  "caseSensitive": false
}
```

## 🔧 Available Tools

### 1. `epub_info`
Get comprehensive EPUB file information including metadata and structure.

**Parameters:**
- `filePath` (string): Path to the EPUB file

### 2. `epub_toc`
Parse and display the table of contents structure.

**Parameters:**
- `filePath` (string): Path to the EPUB file

### 3. `epub_extract_text`
Extract text content from specified chapters.

**Parameters:**
- `filePath` (string): Path to the EPUB file
- `chapterIds` (array, optional): List of chapter IDs to extract
- `maxLength` (number, optional): Maximum text length limit

### 4. `epub_search`
Search for text within the EPUB file.

**Parameters:**
- `filePath` (string): Path to the EPUB file
- `query` (string): Search query
- `caseSensitive` (boolean, optional): Case-sensitive search (default: false)

## 🌐 Resource Templates

Access EPUB resources via URI:

- `epub://{file}/metadata` - EPUB metadata in JSON format
- `epub://{file}/toc` - Table of contents structure
- `epub://{file}/chapter/{id}` - Specific chapter content

## 🛠️ Development

### Project Structure
```
epub-parser-mcp/
├── src/
│   ├── index.ts          # MCP server implementation
│   ├── epub-parser.ts    # EPUB parsing core
│   └── types.ts          # TypeScript type definitions
├── build/                # Compiled JavaScript
├── package.json
└── README.md
```

### Building from Source
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Testing
```bash
# Run tests (if available)
npm test
```

## 📊 Performance

- **Fast Parsing**: Optimized EPUB container and content parsing
- **Memory Efficient**: Stream-based processing for large EPUB files
- **Concurrent Safe**: Supports multiple concurrent requests

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Code Style
- Use TypeScript for type safety
- Follow existing code formatting
- Add appropriate comments and documentation

## 📄 License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- EPUB parsing powered by [adm-zip](https://github.com/cthackers/adm-zip) and [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
- Text extraction using [cheerio](https://github.com/cheeriojs/cheerio)




*Empowering AI assistants to read and understand EPUB documents*
