# EPUB Parser MCP Server - Project Structure

## Overview

This is a minimal, production-ready MCP server for parsing EPUB files. The project has been精简ed to include only essential files and dependencies.

## Package Contents

```
epub-parser-mcp/
├── build/              # Compiled JavaScript files
│   ├── epub-parser.js  # Core EPUB parsing logic
│   ├── index.js        # MCP server entry point
│   └── types.js        # TypeScript type definitions
├── src/                # TypeScript source files
│   ├── epub-parser.ts  # Core EPUB parsing implementation
│   ├── index.ts        # MCP server implementation
│   └── types.ts        # Type definitions
├── package.json        # Package configuration and dependencies
├── README.md          # Usage instructions
└── tsconfig.json      # TypeScript configuration
```

## Key Features

### Tools Provided
1. **epub_info** - Extract EPUB metadata
2. **epub_toc** - Parse table of contents
3. **epub_extract_text** - Extract chapter text content
4. **epub_search** - Search text within EPUB

### Resources Available
- `epub://{file}/metadata` - EPUB metadata
- `epub://{file}/toc` - Table of contents
- `epub://{file}/chapter/{id}` - Specific chapter content

## Dependencies

- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **adm-zip**: EPUB file handling (ZIP format)
- **xml2js**: XML parsing for EPUB metadata
- **cheerio**: HTML content extraction

## Installation

1. Extract the package
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript files

## MCP Configuration

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "epub-parser": {
      "command": "node",
      "args": ["path/to/epub-parser-mcp/build/index.js"]
    }
  }
}
```

## Usage Examples

### Get EPUB Info
```json
{
  "name": "epub_info",
  "arguments": {
    "filePath": "/path/to/book.epub"
  }
}
```

### Extract Text
```json
{
  "name": "epub_extract_text",
  "arguments": {
    "filePath": "/path/to/book.epub",
    "maxLength": 1000
  }
}
```

### Search Content
```json
{
  "name": "epub_search",
  "arguments": {
    "filePath": "/path/to/book.epub",
    "query": "keyword"
  }
}
```

## Author and License

- **Author**: kala
- **License**: GPL

## File Size

- **Compressed**: ~9.5 KB
- **Uncompressed**: ~22 KB

This is a lightweight, standards-compliant MCP server ready for production use.
