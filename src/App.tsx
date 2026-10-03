import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { LibraryPage } from '@/components/library/library-page'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LibraryPage />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
