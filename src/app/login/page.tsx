

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
    <svg role="img" viewBox="0 0 114 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto mx-auto mb-2 text-primary">
        <path d="M23.01 24H11.595V0H23.01v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24zM39.695 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM42.23 24V0h11.415v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24H42.23zM60.15 5.1V0h-2.58v5.1c-1.44-1.8-3.3-2.64-5.58-2.64-4.59 0-8.25 3.66-8.25 8.28s3.66 8.28 8.25 8.28c2.28 0 4.14-.84 5.58-2.64v2.04h2.58V5.1h-2.58zM52.01 10.74c0-3.15 2.52-5.7 5.58-5.7s5.58 2.55 5.58 5.7-2.52 5.7-5.58 5.7-5.58-2.55-5.58-5.7zM70.16 24V0h2.58v24h-2.58zM84.77 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM96.425 24h-9.9V0h9.9v2.559h-7.32v7.92h7.32v2.52h-7.32v8.442h7.32V24zM102.83 24V0h2.58v21.48h8.28V24h-10.86zM0 24V0h8.67a11.959 11.959 0 018.61 3.515c2.31 2.31 3.465 5.265 3.465 8.415s-1.155 6.105-3.465 8.415A11.959 11.959 0 018.67 24H0zm2.58-2.52h6.09c5.85 0 8.775-2.925 8.775-8.835S14.52 3.81 8.67 3.81H2.58v17.67z" />
    </svg>
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
