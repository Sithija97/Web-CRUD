import { z } from 'zod'
import { CATEGORIES } from '@/lib/types'

export const uploadFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a PDF file' })
    .refine((file) => file.type === 'application/pdf', {
      message: 'Only PDF files are allowed',
    }),
  title: z.string().trim().min(1, 'Title is required'),
  category: z.enum(CATEGORIES, { message: 'Please select a category' }),
  description: z.string().trim().optional(),
})

export type UploadFormValues = z.infer<typeof uploadFormSchema>
