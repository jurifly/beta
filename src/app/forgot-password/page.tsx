
"use client"

import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const { sendPasswordResetLink } = useAuth();
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await sendPasswordResetLink(data.email);
            setIsSubmitted(true);
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send password reset email.",
            });
        }
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
                    <CardDescription>
                        {isSubmitted 
                            ? "Check your inbox for a password reset link." 
                            : "Enter your email and we'll send you a link to reset your password."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email")} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                If an account with that email exists, you will receive instructions to reset your password shortly.
                            </p>
                        </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="flex items-center justify-center gap-1 text-muted-foreground hover:text-primary">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
