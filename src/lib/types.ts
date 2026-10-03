import type { PAPER_TYPES } from '@/lib/constants'

export type PaperType = (typeof PAPER_TYPES)[number]['value']

export interface StudyFile {
  id: string
  title: string
  subject: string
  gradeLevel: string
  paperType: PaperType
  year: number | null
  term: string | null
  description: string | null
  filename: string
  sizeBytes: number
  contentType: string
  uploadedAt: string
}

export interface SubjectCount {
  name: string
  count: number
}

export interface FilesQuery {
  page: number
  pageSize: number
  search: string
  subject: string
  gradeLevel: string
  paperType: PaperType | ''
}

export interface FilesPage {
  files: StudyFile[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type FileCounts = Record<'all' | PaperType, number>

export interface CreateFileInput {
  key: string
  filename: string
  size: number
  contentType: string
  title: string
  subject: string
  gradeLevel: string
  paperType: PaperType
  year: number
  term?: string
  description?: string
}
