// Edit these lists to change what the upload form and filters offer.

// Starter suggestions only: subjects are open-ended. Anything uploaded under a new
// subject is remembered (the library's subject list comes from the files themselves),
// and these defaults just keep the list from starting empty.
export const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'ICT',
  'Other',
] as const

export const GRADE_LEVELS = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'O/L',
  'A/L',
] as const

export const PAPER_TYPES = [
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'model_paper', label: 'Model Paper' },
  { value: 'marking_scheme', label: 'Marking Scheme' },
  { value: 'notes', label: 'Notes' },
  { value: 'other', label: 'Other' },
] as const

export const MIN_YEAR = 2010
export const MAX_FILE_SIZE_MB = 50
export const PAGE_SIZE = 20
