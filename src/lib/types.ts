export const CATEGORIES = ['Invoice', 'Report', 'Contract', 'Other'] as const

export type Category = (typeof CATEGORIES)[number]

export interface PdfFile {
  id: string
  filename: string
  title: string
  category: string
  description: string | null
  size_bytes: number
  content_type: string
  uploaded_at: string
}

export interface FilesPage {
  files: PdfFile[]
  nextCursor: string | null
}

export interface UploadUrlResponse {
  key: string
  uploadUrl: string
}

export interface CreateFileRequest {
  key: string
  filename: string
  size: number
  contentType: string
  title: string
  category: string
  description?: string
}

export interface DownloadUrlResponse {
  downloadUrl: string
}
