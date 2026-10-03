import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AutofillNote } from '@/components/library/autofill-note'
import { SubjectCombobox } from '@/components/library/subject-combobox'
import { FileDropZone } from '@/components/library/file-drop-zone'
import { usePdfAutofill } from '@/hooks/use-pdf-autofill'
import { useSubjects } from '@/hooks/use-subjects'
import { useUploadFile } from '@/hooks/use-upload-file'
import { getErrorMessage } from '@/lib/api'
import {
  GRADE_LEVELS,
  MIN_YEAR,
  PAPER_TYPES,
} from '@/lib/constants'
import { uploadSchema, type UploadFormValues } from '@/lib/upload-schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: Props) {
  const upload = useUploadFile()

  return (
    // Closing mid-upload would orphan the request, so dismissal is blocked until it settles.
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!upload.isPending) onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload study material</DialogTitle>
          <DialogDescription>
            Add a PDF and tell students what it is.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form resets each time it is reopened. */}
        <UploadForm upload={upload} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function UploadForm({
  upload,
  onClose,
}: {
  upload: ReturnType<typeof useUploadFile>
  onClose: () => void
}) {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: '', year: '', term: '', description: '' },
  })
  const subjects = useSubjects()
  const autofill = usePdfAutofill(form, subjects.options)
  const busy = upload.isPending

  function onSubmit(values: UploadFormValues) {
    upload.mutate(values, {
      onSuccess: () => {
        toast.success('Study material uploaded', {
          description: values.title,
        })
        onClose()
      },
      onError: (err) => {
        // The form keeps everything the user typed, so Retry is a plain resubmit.
        toast.error('Upload failed', {
          description: getErrorMessage(err),
          action: {
            label: 'Retry',
            onClick: () => void form.handleSubmit(onSubmit)(),
          },
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-0 space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="file"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <FileDropZone
                  value={field.value}
                  onChange={(file) => {
                    field.onChange(file)
                    if (file) void autofill.autofill(file)
                    else autofill.clear()
                  }}
                  disabled={busy}
                  invalid={!!fieldState.error}
                />
              </FormControl>
              <AutofillNote
                status={autofill.status}
                filled={autofill.filled}
                readText={autofill.readText}
                newSubject={autofill.newSubject}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 2023 O/L Mathematics Paper I"
                  disabled={busy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2 *:min-w-0">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <SubjectCombobox
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    options={subjects.options}
                    disabled={busy}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade/Level</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={busy}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select grade/level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADE_LEVELS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paperType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Type</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={busy}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAPER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={MIN_YEAR}
                    max={new Date().getFullYear()}
                    placeholder={String(new Date().getFullYear())}
                    disabled={busy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Term / exam session{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Term 2, August session"
                  disabled={busy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea rows={3} disabled={busy} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {busy && (
          <div className="space-y-1.5">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={upload.progress}
              className="h-2 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {upload.progress < 100
                ? `Uploading… ${upload.progress}%`
                : 'Saving…'}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
