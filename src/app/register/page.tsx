
"use client"

import { useAuth } from "@/hooks/auth";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { type UserRole } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto mx-auto mb-2 dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/4wdbj1XL/claifyblacko-1.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto mx-auto mb-2 hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);

export default function RegisterPage() {
  const { user, signUpWithEmailAndPassword, loading } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  
  useEffect(() => {
    if (user) {
      redirect('/dashboard');
    }
  }, [user]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUpWithEmailAndPassword(data.email, data.password, data.name);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message || "An unknown error occurred.",
        });
    }
  };

  if (loading) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 py-12 px-4">
      <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Join the beta. It's free.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                
                 <div className="items-top flex space-x-2">
                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I agree to the
                        <Link href="/dashboard/settings?tab=policies" target="_blank" className="underline text-primary"> Terms & Privacy Policy</Link>.
                      </label>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !agreedToTerms}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p className="w-full">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
    </div>
  );
}
