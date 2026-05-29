export interface Document {
  id: string;
  title: string;
  tags: string[];
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentImage {
  id: string;
  documentId: string;
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
  createdAt: number;
}

export interface DocumentStats {
  totalDocs: number;
  totalWords: number;
}

export type ExportFormat = 'markdown' | 'html';