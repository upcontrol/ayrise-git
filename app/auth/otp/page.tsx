// "use client"
// import {
//     InputOTP,
//     InputOTPGroup,
//     InputOTPSeparator,
//     InputOTPSlot,
// } from "@/components/ui/input-otp"

// import * as React from "react"


// export default function Page() {
//     const [value, setValue] = React.useState("")

//     return (
//         <div className="space-y-2">
//             <InputOTP
//                 maxLength={6}
//                 value={value}
//                 onChange={(value) => setValue(value)}
//             >
//                 <InputOTPGroup>
//                     <InputOTPSlot index={0} />
//                     <InputOTPSlot index={1} />
//                     <InputOTPSlot index={2} />
//                 </InputOTPGroup>
//                 <InputOTPSeparator />
//                 <InputOTPGroup>
//                     <InputOTPSlot index={3} />
//                     <InputOTPSlot index={4} />
//                     <InputOTPSlot index={5} />
//                 </InputOTPGroup>
//             </InputOTP>
//             <div className="text-center text-sm">
//                 {value === "" ? (
//                     <>Enter your one-time password.</>
//                 ) : (
//                     <>You entered: {value}</>
//                 )}
//             </div>
//         </div>

//     )
// }

'use client';

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OTP() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      if (res.ok) {
        const { token } = await res.json()
        localStorage.setItem('token', token)
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.message)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
          <CardDescription>
            Please enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}