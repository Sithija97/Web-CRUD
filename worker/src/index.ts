import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AwsClient } from 'aws4fetch'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  ALLOWED_ORIGINS: string
  R2_ACCOUNT_ID: string
  R2_BUCKET_NAME: string
  // Secrets
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
}

const PAPER_TYPES = [
  'past_paper',
  'model_paper',
  'marking_scheme',
  'notes',
  'other',
] as const
type PaperType = (typeof PAPER_TYPES)[number]

const PDF = 'application/pdf'
const UPLOAD_URL_TTL_SECONDS = 600
const DOWNLOAD_URL_TTL_SECONDS = 300
const KEY_PREFIX = 'uploads/'
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const MAX_DELETE_IDS = 100 // also keeps us under D1's 100 bound-parameter limit

class HttpError extends Error {
  constructor(
    readonly status: 400 | 404,
    message: string,
  ) {
    super(message)
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
      return allowed.includes('*') || allowed.includes(origin) ? origin : null
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
)

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status)
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// ---------- helpers ----------

function r2Client(env: Bindings) {
  return new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  })
}

/** A presigned S3-compatible URL for one object in the private R2 bucket. */
async function presign(
  env: Bindings,
  method: 'PUT' | 'GET',
  key: string,
  expiresInSeconds: number,
  query: Record<string, string> = {},
) {
  const path = key.split('/').map(encodeURIComponent).join('/')
  const url = new URL(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${path}`,
  )
  url.searchParams.set('X-Amz-Expires', String(expiresInSeconds))
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v)
  const signed = await r2Client(env).sign(new Request(url, { method }), {
    aws: { signQuery: true },
  })
  return signed.url
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function optionalStr(value: unknown, max: number, field: string) {
  const s = str(value)
  if (s.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`)
  return s || null
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return body as Record<string, unknown>
    }
  } catch {
    // fall through
  }
  throw new HttpError(400, 'Request body must be a JSON object')
}

function safeFilename(name: string) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^[._]+/, '')
    .slice(-120)
  return cleaned || 'file.pdf'
}

interface FileRow {
  id: string
  title: string
  subject: string
  grade_level: string
  paper_type: PaperType
  year: number | null
  term: string | null
  description: string | null
  filename: string
  size_bytes: number
  content_type: string
  uploaded_at: string
}

const FILE_COLUMNS =
  'id, title, subject, grade_level, paper_type, year, term, description, filename, size_bytes, content_type, uploaded_at'

function toFile(row: FileRow) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    gradeLevel: row.grade_level,
    paperType: row.paper_type,
    year: row.year,
    term: row.term,
    description: row.description,
    filename: row.filename,
    sizeBytes: row.size_bytes,
    contentType: row.content_type,
    uploadedAt: row.uploaded_at,
  }
}

function positiveInt(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// ---------- routes ----------

// Step 1 of an upload: hand the browser a short-lived URL to PUT the PDF straight into R2.
app.post('/upload-url', async (c) => {
  const body = await readJson(c.req.raw)
  const filename = str(body.filename)
  const contentType = str(body.contentType)

  if (!filename) throw new HttpError(400, 'filename is required')
  if (!/\.pdf$/i.test(filename)) throw new HttpError(400, 'Only PDF files are allowed')
  if (contentType !== PDF) throw new HttpError(400, `contentType must be ${PDF}`)

  const key = `${KEY_PREFIX}${crypto.randomUUID()}/${safeFilename(filename)}`
  const uploadUrl = await presign(c.env, 'PUT', key, UPLOAD_URL_TTL_SECONDS)
  return c.json({ key, uploadUrl })
})

// Step 2: record the metadata once the bytes are in R2.
app.post('/files', async (c) => {
  const body = await readJson(c.req.raw)

  const key = str(body.key)
  const filename = str(body.filename)
  const title = str(body.title)
  const subject = str(body.subject).replace(/\s+/g, ' ')
  const gradeLevel = str(body.gradeLevel)
  const paperType = str(body.paperType)

  const missing = Object.entries({ title, subject, gradeLevel, paperType, key, filename })
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) {
    throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`)
  }
  if (!(PAPER_TYPES as readonly string[]).includes(paperType)) {
    throw new HttpError(400, `paperType must be one of: ${PAPER_TYPES.join(', ')}`)
  }
  if (title.length > 200) throw new HttpError(400, 'title must be at most 200 characters')
  if (subject.length > 100 || gradeLevel.length > 100 || filename.length > 255) {
    throw new HttpError(400, 'subject, gradeLevel or filename is too long')
  }
  if (!key.startsWith(KEY_PREFIX) || key.length > 400) {
    throw new HttpError(400, 'Invalid key')
  }

  let year: number | null = null
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    year = Number(body.year)
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      throw new HttpError(400, 'year is not valid')
    }
  }
  const term = optionalStr(body.term, 100, 'term')
  const description = optionalStr(body.description, 1000, 'description')

  // Retrying after a lost response must not create a duplicate row.
  const existing = await c.env.DB.prepare('SELECT id FROM files WHERE r2_key = ?')
    .bind(key)
    .first<{ id: string }>()
  if (existing) return c.json({ ok: true, id: existing.id })

  // Subjects are free-form, so reuse the existing spelling when only the case differs
  // ("physics" must not become a second subject next to "Physics").
  const sameSubject = await c.env.DB.prepare(
    'SELECT subject FROM files WHERE lower(subject) = lower(?) LIMIT 1',
  )
    .bind(subject)
    .first<{ subject: string }>()

  // Trust R2, not the client: the object must exist and actually be a PDF.
  const object = await c.env.BUCKET.get(key, { range: { offset: 0, length: 5 } })
  if (!object) throw new HttpError(400, 'Uploaded file not found — upload the PDF first')
  if ((await object.text()) !== '%PDF-') {
    await c.env.BUCKET.delete(key)
    throw new HttpError(400, 'The uploaded file is not a valid PDF')
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO files (id, r2_key, title, subject, grade_level, paper_type, year, term,
                        description, filename, size_bytes, content_type, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      key,
      title,
      sameSubject?.subject ?? subject,
      gradeLevel,
      paperType,
      year,
      term,
      description,
      filename,
      object.size,
      PDF,
      new Date().toISOString(),
    )
    .run()

  return c.json({ ok: true, id }, 201)
})

// Subjects currently in use, for the filter menu and the upload form's suggestions.
app.get('/subjects', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT subject AS name, COUNT(*) AS count FROM files WHERE status = 'active'
     GROUP BY subject ORDER BY subject COLLATE NOCASE`,
  ).all<{ name: string; count: number }>()
  return c.json({ subjects: results })
})

// Counts per paper type for the filter tabs. Declared before /files/:id routes.
app.get('/files/counts', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT paper_type, COUNT(*) AS n FROM files WHERE status = 'active' GROUP BY paper_type`,
  ).all<{ paper_type: PaperType; n: number }>()

  const counts: Record<'all' | PaperType, number> = {
    all: 0,
    past_paper: 0,
    model_paper: 0,
    marking_scheme: 0,
    notes: 0,
    other: 0,
  }
  for (const row of results) {
    if (row.paper_type in counts) counts[row.paper_type] = row.n
    counts.all += row.n
  }
  return c.json(counts)
})

app.get('/files', async (c) => {
  const q = c.req.query()
  const page = positiveInt(q.page, 1)
  const pageSize = Math.min(positiveInt(q.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)

  const where = ["status = 'active'"]
  const params: (string | number)[] = []

  const search = str(q.search)
  if (search) {
    // Escape LIKE wildcards so "100%" searches for a literal percent sign.
    where.push("title LIKE ? ESCAPE '\\'")
    params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`)
  }
  if (str(q.subject)) {
    where.push('subject = ?')
    params.push(str(q.subject))
  }
  if (str(q.gradeLevel)) {
    where.push('grade_level = ?')
    params.push(str(q.gradeLevel))
  }
  if (str(q.paperType)) {
    where.push('paper_type = ?')
    params.push(str(q.paperType))
  }
  const whereSql = where.join(' AND ')

  const [list, count] = await c.env.DB.batch([
    c.env.DB.prepare(
      `SELECT ${FILE_COLUMNS} FROM files WHERE ${whereSql}
       ORDER BY uploaded_at DESC, id DESC LIMIT ? OFFSET ?`,
    ).bind(...params, pageSize, (page - 1) * pageSize),
    c.env.DB.prepare(`SELECT COUNT(*) AS total FROM files WHERE ${whereSql}`).bind(...params),
  ])

  const total = (count.results[0] as { total: number }).total
  return c.json({
    files: (list.results as unknown as FileRow[]).map(toFile),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
})

app.get('/files/:id/download', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT r2_key, filename FROM files WHERE id = ? AND status = 'active'`,
  )
    .bind(c.req.param('id'))
    .first<{ r2_key: string; filename: string }>()
  if (!row) throw new HttpError(404, 'File not found')

  const asciiName = row.filename.replace(/[^A-Za-z0-9._-]+/g, '_')
  const downloadUrl = await presign(c.env, 'GET', row.r2_key, DOWNLOAD_URL_TTL_SECONDS, {
    'response-content-type': PDF,
    'response-content-disposition': `attachment;filename="${asciiName}";filename*=UTF-8''${encodeURIComponent(row.filename)}`,
  })
  return c.json({ downloadUrl })
})

// Permanently deletes one or many files (single delete = one id).
app.post('/files/delete', async (c) => {
  const body = await readJson(c.req.raw)
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.filter((i): i is string => typeof i === 'string' && i !== ''))]
    : []
  if (ids.length === 0) throw new HttpError(400, 'ids must be a non-empty array of file ids')
  if (ids.length > MAX_DELETE_IDS) {
    throw new HttpError(400, `Cannot delete more than ${MAX_DELETE_IDS} files at once`)
  }

  const placeholders = ids.map(() => '?').join(',')
  const { results } = await c.env.DB.prepare(
    `SELECT id, r2_key FROM files WHERE id IN (${placeholders})`,
  )
    .bind(...ids)
    .all<{ id: string; r2_key: string }>()
  if (results.length === 0) return c.json({ ok: true, deleted: 0 })

  // Rows go first: a leftover R2 object is invisible and harmless, whereas a row
  // whose object is gone would show up in the list and fail to download.
  await c.env.DB.prepare(`DELETE FROM files WHERE id IN (${placeholders})`)
    .bind(...ids)
    .run()
  try {
    await c.env.BUCKET.delete(results.map((r) => r.r2_key))
  } catch (err) {
    console.error('R2 delete failed; orphaned keys:', results.map((r) => r.r2_key), err)
  }

  return c.json({ ok: true, deleted: results.length })
})

export default app
