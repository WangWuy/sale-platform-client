export interface HttpOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  reportProgress?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}