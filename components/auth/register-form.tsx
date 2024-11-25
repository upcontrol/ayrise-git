"use client"

import CardWrapper from "./card-wrapper"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { RegisterSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            name: "",
            password: "",
            confirmPassword: "",
        },
    })

    const handleSubmit = async (data: z.infer<typeof RegisterSchema>) => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const responseData = await res.json()

            if (res.ok) {
                router.push(`/auth/otp?email=${encodeURIComponent(data.email)}`)
            } else {
                setError(responseData.message || 'An error occurred during registration')
            }
        } catch (error) {
            console.error('Registration error:', error)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <CardWrapper
            label="Create an account"
            title="Register"
            backButtonHref="/auth/login"
            backButtonLabel="Already have an account? Login here."
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField 
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="johndoe@gmail.com" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="John Doe" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="••••••" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="••••••" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Register"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default RegisterForm