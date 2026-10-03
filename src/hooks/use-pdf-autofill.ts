import { useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { autofillFromFile, type DetectedFields } from '@/lib/pdf-autofill'
import type { UploadFormValues } from '@/lib/upload-schema'

const LABELS: Record<keyof DetectedFields, string> = {
  title: 'Title',
  subject: 'Subject',
  gradeLevel: 'Grade/Level',
  paperType: 'Paper Type',
  year: 'Year',
  term: 'Term',
}

interface State {
  status: 'idle' | 'reading' | 'done'
  /** Labels of the fields that were filled in. */
  filled: string[]
  /** False when the PDF had no readable text (e.g. a scan), so only the filename was used. */
  readText: boolean
  /** A detected subject the library doesn't have yet; it is created on upload. */
  newSubject?: string
}

const IDLE: State = { status: 'idle', filled: [], readText: false }

/**
 * Fills the upload form from a chosen PDF. It only writes into fields the user
 * hasn't typed in, so edits are never overwritten (values it filled itself are
 * refreshed if the user picks a different file).
 */
export function usePdfAutofill(
  form: UseFormReturn<UploadFormValues>,
  knownSubjects: readonly string[],
) {
  const [state, setState] = useState<State>(IDLE)
  const lastAutoFilled = useRef<Partial<DetectedFields>>({})
  const latestRun = useRef(0)

  async function autofill(file: File) {
    const run = ++latestRun.current
    setState({ ...IDLE, status: 'reading' })

    const { fields, readText, newSubject } = await autofillFromFile(
      file,
      knownSubjects,
    )
    // The user picked another file (or removed this one) while we were reading.
    if (run !== latestRun.current) return

    // Values we filled for the previous file but can't support for this one are
    // stale; clear them unless the user has since changed them.
    for (const key of Object.keys(lastAutoFilled.current) as (keyof DetectedFields)[]) {
      if (fields[key]) continue
      if (form.getValues(key) === lastAutoFilled.current[key]) {
        form.setValue(key, '' as never)
      }
      delete lastAutoFilled.current[key]
    }

    const filled: string[] = []
    for (const key of Object.keys(fields) as (keyof DetectedFields)[]) {
      const value = fields[key]
      if (!value) continue
      const current = form.getValues(key)
      if (current && current !== lastAutoFilled.current[key]) continue
      form.setValue(key, value as never, { shouldValidate: true })
      lastAutoFilled.current[key] = value
      filled.push(LABELS[key])
    }
    // Only announce a new subject if it actually ended up in the form.
    const announce =
      newSubject && form.getValues('subject') === newSubject ? newSubject : undefined
    setState({ status: 'done', filled, readText, newSubject: announce })
  }

  function clear() {
    latestRun.current++
    setState(IDLE)
  }

  return { ...state, autofill, clear }
}
