"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/app/contexts/AuthContext'
import CardWrapper from "./card-wrapper"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { LoginSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { z } from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"

const LoginForm = () => {
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { login, isAuthenticated, isLoading, checkAuth } = useAuth()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    useEffect(() => {
        const init = async () => {
            if (!isLoading) {
                try {
                    const authResult = await checkAuth();
                    if (authResult) {
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                }
            }
        };
        init();
    }, [isLoading, checkAuth, router]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
        setError(null)
        try {
            const loginSuccess = await login(data.email, data.password)
            if (!loginSuccess) {
                setError('Giriş başarısız oldu. Lütfen tekrar deneyin.')
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.')
        }
    }

    if (isLoading) {
        return <div>Yükleniyor...</div>
    }

    return (
        <CardWrapper
            label="Hesabınıza giriş yapın"
            title="Giriş"
            backButtonHref="/auth/register"
            backButtonLabel="Hesabınız yok mu? Buradan kaydolun."
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-4">
                        <FormField 
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="ornek@email.com" />
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
                                    <FormLabel>Şifre</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="••••••" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default LoginForm