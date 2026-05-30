export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
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

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
