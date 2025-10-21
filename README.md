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

```bash
# Clone the repository
git clone https://github.com/your-username/epub-parser-mcp.git
cd epub-parser-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Usage with Claude Desktop

Add to your Claude Desktop configuration:

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

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FAQ](#) section
2. Open an [issue](https://github.com/your-username/epub-parser-mcp/issues)
3. Contact the maintainer

---

**Made with ❤️ for the AI community**

*Empowering AI assistants to read and understand EPUB documents*
