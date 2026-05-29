export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UploadedImage {
  id: string;
  name: string;
  file: File;
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';