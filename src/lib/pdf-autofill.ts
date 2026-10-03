// Best-effort detection of upload-form fields from a PDF's filename and first-page
// text. Everything runs in the browser; nothing is sent anywhere. Grade and paper type
// are matched against the constants lists; subjects are open-ended (known ones are
// matched, and a new one may be proposed). The user can edit all of it.
import { GRADE_LEVELS, MIN_YEAR } from './constants.ts'

export interface DetectedFields {
  title?: string
  subject?: string
  gradeLevel?: string
  paperType?: string
  year?: string
  term?: string
}

export interface PdfInfo {
  /** Text of the first page(s); empty for scanned/image-only PDFs. */
  text: string
  /** Title from the PDF's own metadata, if any. */
  metaTitle?: string
}

// How much of the page text counts as the "header" where titles live. Body text
// (questions) mentions words like "notes" or "English" that say nothing about the paper.
const HEAD_CHARS = 700

const SUBJECT_ALIASES: Record<string, RegExp> = {
  Mathematics: /\bmaths?\b|mathematics|ගණිත/gi,
  Physics: /physics|භෞතික/gi,
  Chemistry: /chemistry|රසායන/gi,
  Biology: /biology|\bbio\b/gi,
  English: /english/gi,
  ICT: /\bict\b|information\s*(?:&|and)?\s*communication|information\s+technology/gi,
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function count(re: RegExp, s: string) {
  return s.match(re)?.length ?? 0
}

/** Filename without extension, with separators turned into spaces. */
export function cleanTitle(filename: string) {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pattern matching a subject's own name, tolerant of spacing ("Business  Studies"). */
function subjectPattern(subject: string) {
  const body = subject.trim().split(/\s+/).map(escapeRegExp).join('\\s+')
  // \b only makes sense next to Latin letters.
  return /^[\w\s&/-]+$/.test(subject)
    ? new RegExp(`\\b${body}\\b`, 'gi')
    : new RegExp(body, 'gi')
}

/** Best match among the subjects the library already knows. */
function detectSubject(
  filename: string,
  head: string,
  knownSubjects: readonly string[],
) {
  let best: { subject: string; score: number } | undefined
  for (const subject of knownSubjects) {
    if (subject.toLowerCase() === 'other') continue
    const re = SUBJECT_ALIASES[subject] ?? subjectPattern(subject)
    // The filename is deliberate, so a hit there outweighs mentions in the text.
    const score = count(re, filename) * 3 + count(re, head)
    if (score > 0 && (!best || score > best.score)) best = { subject, score }
  }
  return best?.subject
}

// Words that are about the paper, not the subject, plus junk from scanner/camera names.
const NOT_SUBJECT_WORDS = new Set(
  `paper papers past model marking scheme schemes notes note term test exam examination
   answers answer grade year class part unit chapter lesson first second third final
   scan scanned img image document doc file untitled new copy pdf page screenshot
   download time date name index medium marks`.split(/\s+/),
)

function titleCase(words: string[]) {
  const small = new Set(['and', 'of', '&'])
  return words
    .map((w, i) => {
      const lower = w.toLowerCase()
      if (i > 0 && small.has(lower)) return lower
      // Keep short all-caps acronyms (ICT, GCE) as they are.
      if (w === w.toUpperCase() && w.length <= 4) return w
      return lower[0].toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

/** Turns a raw fragment into a subject name, or undefined if it doesn't look like one. */
function asSubject(fragment: string) {
  const words = fragment
    .replace(/\b(?:19|20)\d{2}\b|\b\d+\b|\b[IVX]{1,4}\b/g, ' ')
    .split(/[^A-Za-z&]+/)
    .filter(Boolean)
  if (words.length < 1 || words.length > 4) return undefined
  if (words.some((w) => w.length < 2 && w !== '&')) return undefined
  if (words.some((w) => NOT_SUBJECT_WORDS.has(w.toLowerCase()))) return undefined
  return titleCase(words)
}

/**
 * Suggests a subject that isn't in the known list: an explicit "Subject: …" label in
 * the page text, or the part of a "Subject - rest of the name" style filename.
 */
function proposeSubject(filename: string, head: string) {
  const labelled = head.match(
    /\bsubject\s*[:\-–]\s*((?:[A-Za-z&]+\s*){1,4})/i,
  )
  if (labelled) {
    // The capture runs on into the next field ("Business Studies Grade 12 …"); stop at
    // the first word that isn't part of a subject name.
    const words: string[] = []
    for (const w of labelled[1].split(/\s+/).filter(Boolean)) {
      if (NOT_SUBJECT_WORDS.has(w.toLowerCase())) break
      words.push(w)
    }
    const fromLabel = asSubject(words.join(' '))
    if (fromLabel) return fromLabel
  }

  // Only trust the filename when it has a separator, i.e. is shaped "Subject - details".
  const parts = filename.split(/\s+[-–—|:]\s+|\s*[:|]\s*/)
  if (parts.length > 1) {
    for (const part of parts) {
      const fromName = asSubject(part)
      if (fromName) return fromName
    }
  }
  return undefined
}

/** Earliest match position across several patterns, or -1. */
function firstIndex(source: string, ...patterns: RegExp[]) {
  const hits = patterns.map((re) => source.search(re)).filter((i) => i >= 0)
  return hits.length ? Math.min(...hits) : -1
}

function detectGrade(source: string) {
  // Explicit exam levels first: "Grade 11" papers are often labelled "O/L" too.
  // Bare "AL"/"OL" must be uppercase so ordinary words ("al", "ol") don't match.
  const al = firstIndex(source, /\bA\s*\/\s*L\b|advanced\s+level/i, /\bAL\b/)
  const ol = firstIndex(source, /\bO\s*\/\s*L\b|ordinary\s+level/i, /\bOL\b/)
  const level =
    al >= 0 && (ol < 0 || al < ol) ? 'A/L' : ol >= 0 ? 'O/L' : undefined
  if (level && (GRADE_LEVELS as readonly string[]).includes(level)) return level

  const m = source.match(/\b(?:grade|gr|year|class)\.?\s*[-.]?\s*(\d{1,2})\b/i)
  if (!m) return undefined
  const n = Number(m[1])
  const exact = `Grade ${n}`
  if ((GRADE_LEVELS as readonly string[]).includes(exact)) return exact
  // Grades 12–13 are the A/L years.
  if (n >= 12 && n <= 13 && (GRADE_LEVELS as readonly string[]).includes('A/L')) {
    return 'A/L'
  }
  return undefined
}

function detectPaperType(source: string, fromFilename: boolean) {
  if (/marking\s*(?:scheme|guide)|answer\s*scheme|answers?\s*(?:key|guide)/i.test(source)) {
    return 'marking_scheme'
  }
  if (/model\s*(?:paper|question|test|exam)/i.test(source)) return 'model_paper'
  // Page text is full of phrases like "write short notes on…", so "notes" and the
  // bare word "paper" are only trusted in the filename.
  if (fromFilename && /\bnotes\b/i.test(source)) return 'notes'
  if (/past\s*paper|term\s*test|\bterm\b.{0,20}\b(?:exam|test|paper)|examination|\bexam\b|question\s*paper/i.test(source)) {
    return 'past_paper'
  }
  if (fromFilename && /\bpapers?\b/i.test(source)) return 'past_paper'
  return undefined
}

function detectTerm(source: string) {
  const words: Record<string, number> = {
    first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3,
  }
  const a = source.match(/\b(first|1st|second|2nd|third|3rd)\s+term\b/i)
  if (a) return `Term ${words[a[1].toLowerCase()]}`
  const b = source.match(/\bterm\s*([123])\b/i)
  return b ? `Term ${b[1]}` : undefined
}

function detectYear(filename: string, head: string) {
  const currentYear = new Date().getFullYear()
  const years = (s: string) =>
    [...s.matchAll(/(?<!\d)((?:19|20)\d{2})(?!\d)/g)]
      .map((m) => Number(m[1]))
      .filter((y) => y >= MIN_YEAR && y <= currentYear)

  const fromName = years(filename)
  if (fromName.length) return String(fromName[0])

  // In text, the most repeated plausible year is usually the exam year.
  const tally = new Map<number, number>()
  for (const y of years(head)) tally.set(y, (tally.get(y) ?? 0) + 1)
  let best: [number, number] | undefined
  for (const entry of tally) if (!best || entry[1] > best[1]) best = entry
  return best ? String(best[0]) : undefined
}

export function detectFields(
  filename: string,
  info: PdfInfo,
  knownSubjects: readonly string[],
): DetectedFields {
  const head = info.text.slice(0, HEAD_CHARS)
  const out: DetectedFields = {}

  const title = cleanTitle(filename) || info.metaTitle?.trim()
  if (title) out.title = title

  // Filename is checked before the page text for each field.
  // Detectors see the filename with underscores as spaces ("Marking_Scheme").
  const name = cleanTitle(filename)
  out.subject =
    detectSubject(name, head, knownSubjects) ?? proposeSubject(name, head)
  out.year = detectYear(name, head)
  out.gradeLevel = detectGrade(name) ?? detectGrade(head)
  out.paperType = detectPaperType(name, true) ?? detectPaperType(head, false)
  out.term = detectTerm(name) ?? detectTerm(head)

  for (const key of Object.keys(out) as (keyof DetectedFields)[]) {
    if (!out[key]) delete out[key]
  }
  return out
}

/** Reads the title metadata and first-page text. Throws on unreadable PDFs. */
async function extractPdfInfo(file: File): Promise<PdfInfo> {
  // Loaded on demand: pdf.js is large and only needed once a file is chosen.
  const pdfjs = await import('pdfjs-dist')
  const { default: workerSrc } = await import(
    'pdfjs-dist/build/pdf.worker.min.mjs?url'
  )
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  })
  try {
    const doc = await task.promise
    let text = ''
    for (let n = 1; n <= Math.min(doc.numPages, 2); n++) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      text += content.items.map((i) => ('str' in i ? i.str : '')).join(' ') + '\n'
      // A real first page is enough; only fall through when it has almost no text
      // (e.g. a cover page).
      if (text.trim().length > 200) break
    }

    let metaTitle: string | undefined
    try {
      const meta = (await doc.getMetadata()).info as { Title?: string }
      metaTitle = meta.Title
    } catch {
      // Metadata is optional.
    }
    return { text: text.replace(/\s+/g, ' ').trim(), metaTitle }
  } finally {
    void task.destroy()
  }
}

const READ_TIMEOUT_MS = 10_000

/**
 * Detects form fields for a chosen PDF. Never throws: if the PDF can't be read
 * (scanned, encrypted, corrupt, too slow) it falls back to the filename alone.
 */
export async function autofillFromFile(
  file: File,
  knownSubjects: readonly string[],
): Promise<{
  fields: DetectedFields
  readText: boolean
  /** Set when the detected subject isn't one the library already has. */
  newSubject?: string
}> {
  let info: PdfInfo = { text: '' }
  try {
    info = await Promise.race([
      extractPdfInfo(file),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), READ_TIMEOUT_MS),
      ),
    ])
  } catch {
    // Fall back to the filename.
  }
  const fields = detectFields(file.name, info, knownSubjects)
  const subject = fields.subject
  const isNew =
    subject !== undefined &&
    !knownSubjects.some((s) => s.toLowerCase() === subject.toLowerCase())
  return {
    fields,
    readText: info.text.length > 0,
    newSubject: isNew ? subject : undefined,
  }
}
