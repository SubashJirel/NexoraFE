import { useEffect } from 'react'
import { Home, RefreshCw, TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import Button from '@/components/ui/Button'
import { attemptChunkRecovery, isDynamicImportError } from '@/utils/chunkRecovery'

function getErrorMessage(error) {
  if (isRouteErrorResponse(error)) {
    return error.statusText || error.data?.message || `Request failed with status ${error.status}`
  }

  return error?.message || 'An unexpected error occurred while loading this page.'
}

export default function RouteErrorPage() {
  const error = useRouteError()
  const chunkFailed = isDynamicImportError(error)

  useEffect(() => {
    if (chunkFailed) attemptChunkRecovery(error)
  }, [chunkFailed, error])

  const title = chunkFailed
    ? 'A new version of Nexora is available'
    : 'This page could not be loaded'
  const description = chunkFailed
    ? 'The application was updated while this browser tab was open. Reload to use the latest version.'
    : 'Please reload the page. If the problem continues, return to the dashboard and try again.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFA] p-6">
      <section className="w-full max-w-lg rounded-2xl border border-[#dce5e0] bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3f0] text-[#496B5A]">
          <TriangleAlert size={26} aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#263238]">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#637079]">{description}</p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            leftIcon={<RefreshCw size={17} />}
            onClick={() => window.location.reload()}
          >
            Reload Nexora
          </Button>
          <Button
            variant="outlined"
            size="lg"
            leftIcon={<Home size={17} />}
            onClick={() => window.location.assign('/dashboard')}
          >
            Back to dashboard
          </Button>
        </div>

        {import.meta.env.DEV && (
          <details className="mt-7 rounded-lg bg-[#F8FAFA] p-3 text-left text-xs text-[#637079]">
            <summary className="cursor-pointer font-semibold">Developer details</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap">{getErrorMessage(error)}</pre>
          </details>
        )}
      </section>
    </main>
  )
}
