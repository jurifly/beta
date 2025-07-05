
"use client"

import { useAuth } from "@/hooks/auth";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserRole } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  legalRegion: z.string({ required_error: "Please select a region." }).min(1, "Please select a region."),
  role: z.enum(["Founder", "CA", "Legal Advisor", "Enterprise"], { required_error: "Please select a role." }),
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

export default function RegisterPage() {
  const { user, signUpWithEmailAndPassword, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

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
      await signUpWithEmailAndPassword(data.email, data.password, data.name, data.legalRegion, data.role, refId || undefined);
      localStorage.removeItem('referralId'); // Clear after use
      router.push('/dashboard');
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mx-auto text-primary mb-2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Get started with LexIQ today.</CardDescription>
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
