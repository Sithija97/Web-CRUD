import { z } from 'zod'
import {
  GRADE_LEVELS,
  MAX_FILE_SIZE_MB,
  MIN_YEAR,
  PAPER_TYPES,
} from '@/lib/constants'

const currentYear = new Date().getFullYear()

export const uploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Choose a PDF file' })
    .refine(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name),
      'Only PDF files are allowed',
    )
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `File must be ${MAX_FILE_SIZE_MB} MB or smaller`,
    ),
  title: z.string().trim().min(1, 'Title is required').max(200),
  // Free-form: pick an existing subject or type a new one.
  subject: z
    .string()
    .trim()
    .min(1, 'Select or enter a subject')
    .max(100, 'Subject must be 100 characters or fewer'),
  gradeLevel: z.enum(GRADE_LEVELS, { message: 'Select a grade/level' }),
  paperType: z.enum(PAPER_TYPES.map((t) => t.value), {
    message: 'Select a paper type',
  }),
  // Kept as a string so the number input stays controlled; converted on submit.
  year: z
    .string()
    .regex(/^\d{4}$/, 'Enter a 4-digit year')
    .refine(
      (v) => Number(v) >= MIN_YEAR && Number(v) <= currentYear,
      `Year must be between ${MIN_YEAR} and ${currentYear}`,
    ),
  term: z.string().trim().max(100),
  description: z.string().trim().max(1000),
})

export type UploadFormValues = z.infer<typeof uploadSchema>
