

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserRole } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  legalRegion: z.string({ required_error: "Please select a region." }).min(1, "Please select a region."),
  role: z.enum(["Founder", "CA", "Legal Advisor", "Enterprise"], { required_error: "Please select a role." }),
  accessPass: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const legalRegions = [
    { value: 'India', label: 'India' },
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Canada', label: 'Canada' },
]

const betaRoles: { id: UserRole, label: string }[] = [
    { id: "Founder", label: "Founder" },
    { id: "CA", label: "Chartered Accountant" },
];

const Logo = () => (
    <svg role="img" viewBox="0 0 114 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto mx-auto mb-2 text-primary">
        <path d="M23.01 24H11.595V0H23.01v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24zM39.695 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM42.23 24V0h11.415v2.559h-8.85v7.92h7.52v2.52h-7.52v8.442h8.85V24H42.23zM60.15 5.1V0h-2.58v5.1c-1.44-1.8-3.3-2.64-5.58-2.64-4.59 0-8.25 3.66-8.25 8.28s3.66 8.28 8.25 8.28c2.28 0 4.14-.84 5.58-2.64v2.04h2.58V5.1h-2.58zM52.01 10.74c0-3.15 2.52-5.7 5.58-5.7s5.58 2.55 5.58 5.7-2.52 5.7-5.58 5.7-5.58-2.55-5.58-5.7zM70.16 24V0h2.58v24h-2.58zM84.77 24h-2.8l-7.8-10.8v10.8h-2.58V0h2.58l7.8 10.8V0h2.8v24zM96.425 24h-9.9V0h9.9v2.559h-7.32v7.92h7.32v2.52h-7.32v8.442h7.32V24zM102.83 24V0h2.58v21.48h8.28V24h-10.86zM0 24V0h8.67a11.959 11.959 0 018.61 3.515c2.31 2.31 3.465 5.265 3.465 8.415s-1.155 6.105-3.465 8.415A11.959 11.959 0 018.67 24H0zm2.58-2.52h6.09c5.85 0 8.775-2.925 8.775-8.835S14.52 3.81 8.67 3.81H2.58v17.67z" />
    </svg>
);


export default function RegisterPage() {
  const { user, signUpWithEmailAndPassword, loading } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, control } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Founder' }
  });

  useEffect(() => {
    const refId = searchParams.get('ref');
    if (refId) {
        localStorage.setItem('referralId', refId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      redirect('/dashboard');
    }
  }, [user]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const refId = localStorage.getItem('referralId');
      await signUpWithEmailAndPassword(data.email, data.password, data.name, data.legalRegion, data.role, refId || undefined, data.accessPass);
      localStorage.removeItem('referralId'); // Clear after use
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Get started with Jurifly today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>I am a...</Label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                           {betaRoles.map(role => (
                                <Label key={role.id} htmlFor={role.id} className={cn("flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === role.id && "border-primary")}>
                                    <RadioGroupItem value={role.id} id={role.id} className="sr-only" />
                                    {role.label}
                                </Label>
                           ))}
                        </RadioGroup>
                    )}
                />
                 {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
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
             <div className="space-y-1">
              <Label>Legal Region</Label>
                <Controller
                    name="legalRegion"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your country..." />
                            </SelectTrigger>
                            <SelectContent>
                                {legalRegions.map(region => (
                                    <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
              {errors.legalRegion && <p className="text-sm text-destructive">{errors.legalRegion.message}</p>}
            </div>
             <div className="space-y-1">
                <Label htmlFor="accessPass" className="flex items-center gap-2">
                    Access Pass <span className="text-xs text-muted-foreground">(Optional)</span>
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input id="accessPass" placeholder="Enter code for special access" {...register("accessPass")} />
            </div>
             <div className="items-top flex space-x-2">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to the
                    <Link href="/dashboard/settings?tab=policies" target="_blank" className="underline text-primary"> Terms of Service </Link> 
                    and 
                    <Link href="/dashboard/settings?tab=policies" target="_blank" className="underline text-primary"> Privacy Policy</Link>.
                  </label>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !agreedToTerms}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
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
