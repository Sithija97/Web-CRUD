import axios from 'axios'
import type {
  CreateFileRequest,
  DownloadUrlResponse,
  FilesPage,
  UploadUrlResponse,
} from '@/lib/types'

const API_BASE = import.meta.env.VITE_API_BASE

if (!API_BASE) {
  console.warn(
    'VITE_API_BASE is not set. Set it in a .env file to point at the PDF library API.',
  )
}

const client = axios.create({
  baseURL: API_BASE,
})

export async function getUploadUrl(
  filename: string,
  contentType: string,
): Promise<UploadUrlResponse> {
  const res = await client.post<UploadUrlResponse>('/upload-url', {
    filename,
    contentType,
  })
  return res.data
}

export async function uploadFileToUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (event) => {
      if (!onProgress) return
      const percent = event.total
        ? Math.round((event.loaded / event.total) * 100)
        : 0
      onProgress(percent)
    },
  })
}

export async function createFileRecord(
  payload: CreateFileRequest,
): Promise<void> {
  await client.post('/files', payload)
}

export async function getFiles(cursor?: string | null): Promise<FilesPage> {
  const res = await client.get<FilesPage>('/files', {
    params: cursor ? { cursor } : undefined,
  })
  return res.data
}

export async function getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
  const res = await client.get<DownloadUrlResponse>(`/files/${id}/download`)
  return res.data
}
