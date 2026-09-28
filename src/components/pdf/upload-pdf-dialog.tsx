import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FileDropZone } from '@/components/pdf/file-drop-zone'
import { useUploadPdf } from '@/hooks/use-upload-pdf'
import { CATEGORIES } from '@/lib/types'
import { uploadFormSchema, type UploadFormValues } from '@/lib/upload-schema'

interface UploadPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadPdfDialog({ open, onOpenChange }: UploadPdfDialogProps) {
  const [progress, setProgress] = useState(0)
  const uploadPdf = useUploadPdf()

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    mode: 'onChange',
    defaultValues: {
      file: undefined,
      title: '',
      category: undefined,
      description: '',
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next && uploadPdf.isPending) return
    if (!next) {
      form.reset()
      setProgress(0)
      uploadPdf.reset()
    }
    onOpenChange(next)
  }

  async function onSubmit(values: UploadFormValues) {
    setProgress(0)
    try {
      await uploadPdf.mutateAsync({
        ...values,
        onProgress: setProgress,
      })
      toast.success('PDF uploaded successfully')
      form.reset()
      setProgress(0)
      onOpenChange(false)
    } catch {
      toast.error('Upload failed. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            Add a new PDF to the library with its details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <FileDropZone
                      value={field.value ?? null}
                      onChange={field.onChange}
                      disabled={uploadPdf.isPending}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
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
                      placeholder="Q3 Invoice"
                      disabled={uploadPdf.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={uploadPdf.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this file"
                      disabled={uploadPdf.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadPdf.isPending && (
              <div className="flex flex-col gap-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploading… {progress}%
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={!form.formState.isValid || uploadPdf.isPending}
              >
                {uploadPdf.isPending ? 'Uploading…' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
