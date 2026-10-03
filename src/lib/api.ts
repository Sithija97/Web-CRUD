import axios, { AxiosError } from 'axios'
import type {
  CreateFileInput,
  FileCounts,
  FilesPage,
  FilesQuery,
  SubjectCount,
} from '@/lib/types'

const http = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, ''),
})

/** Pulls the most useful human-readable message out of any thrown error. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const apiMessage = (err.response?.data as { error?: string } | undefined)
      ?.error
    if (apiMessage) return apiMessage
    if (!err.response) return 'Network error — check your connection.'
    return `Request failed (${err.response.status})`
  }
  return err instanceof Error ? err.message : 'Something went wrong'
}

export async function fetchFiles(query: FilesQuery): Promise<FilesPage> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== '' && v != null),
  )
  const { data } = await http.get<FilesPage>('/files', { params })
  return data
}

export async function fetchSubjects(): Promise<SubjectCount[]> {
  const { data } = await http.get<{ subjects: SubjectCount[] }>('/subjects')
  return data.subjects
}

export async function fetchCounts(): Promise<FileCounts> {
  const { data } = await http.get<FileCounts>('/files/counts')
  return data
}

export async function requestUploadUrl(filename: string, contentType: string) {
  const { data } = await http.post<{ key: string; uploadUrl: string }>(
    '/upload-url',
    { filename, contentType },
  )
  return data
}

/** PUTs the bytes straight to R2 (not through the Worker), reporting progress 0–100. */
export async function putToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  // A bare axios call: the API baseURL and any default headers must not leak to R2.
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type || 'application/pdf' },
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export async function createFile(input: CreateFileInput) {
  const { data } = await http.post<{ ok: true; id: string }>('/files', input)
  return data
}

export async function fetchDownloadUrl(id: string) {
  const { data } = await http.get<{ downloadUrl: string }>(
    `/files/${id}/download`,
  )
  return data.downloadUrl
}

export async function deleteFiles(ids: string[]) {
  const { data } = await http.post<{ ok: true; deleted: number }>(
    '/files/delete',
    { ids },
  )
  return data
}
