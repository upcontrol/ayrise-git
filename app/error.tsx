'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Bir şeyler yanlış gitti!</h2>
      <button
        onClick={() => reset()}
      >
        Tekrar dene
      </button>
    </div>
  )
}