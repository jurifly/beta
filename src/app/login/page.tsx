

"use client"

import { useAuth } from "@/hooks/auth";
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <title>Google Logo</title>
      <clipPath id="g">
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
      </clipPath>
      <g clipPath="url(#g)">
        <path fill="#FBBC05" d="M0 37V11l17 13z" />
        <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
        <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
        <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
      </g>
    </svg>
  );
}

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/N6p2H0cq/jurifly-icon-new.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto mx-auto mb-2 text-primary dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/B58rpgyK/jurifly-icon-new-dark.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-8 w-auto mx-auto mb-2 hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);


export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmailAndPassword, loading } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      redirect('/dashboard');
    }
  }, [user]);

  const onSubmit = async (data: LoginFormData) => {
    try {
        await signInWithEmailAndPassword(data.email, data.password);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-headline">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to Jurifly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="ml-auto inline-block text-xs underline">
                        Forgot your password?
                    </Link>
                </div>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
          </div>
          <Button className="w-full" variant="outline" onClick={signInWithGoogle} disabled={isSubmitting}>
              <GoogleIcon className="mr-2 h-5 w-5"/>
              Sign in with Google
          </Button>
        </CardContent>
         <CardFooter className="text-center text-sm">
          <p className="w-full">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
