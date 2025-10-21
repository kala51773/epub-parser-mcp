/**
 * EPUB解析MCP服务器的类型定义
 */

export interface EpubMetadata {
  title?: string;
  creator?: string;
  author?: string;
  publisher?: string;
  language?: string;
  description?: string;
  date?: string;
  identifier?: string;
  rights?: string;
}

export interface EpubTocItem {
  id: string;
  label: string;
  href?: string;
  children?: EpubTocItem[];
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string;
  href: string;
}

export interface EpubInfo {
  metadata: EpubMetadata;
  toc: EpubTocItem[];
  chapters: EpubChapter[];
  fileSize: number;
  fileCount: number;
}

export interface SearchResult {
  chapterId: string;
  chapterTitle: string;
  matches: {
    text: string;
    position: number;
  }[];
}

// MCP工具参数类型
export interface EpubInfoArgs {
  filePath: string;
}

export interface EpubTocArgs {
  filePath: string;
}

export interface EpubExtractTextArgs {
  filePath: string;
  chapterIds?: string[];
  maxLength?: number;
}

export interface EpubSearchArgs {
  filePath: string;
  query: string;
  caseSensitive?: boolean;
}
