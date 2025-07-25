

'use client';

import { useAuth } from "@/hooks/auth";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";
import type { UserRole } from "@/lib/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


const founderSchema = z.object({
  companyName: z.string().optional(),
  complianceHeadache: z.string().optional(),
  hasCA: z.enum(['yes', 'no']),
});

const caSchema = z.object({
  firmName: z.string().min(1, "Firm name is required."),
  experience: z.coerce.number().min(0, "Experience cannot be negative."),
  services: z.string().min(1, "Please select a service."),
  hasClients: z.enum(['yes', 'no']),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Founder", "CA"]),
  referralCode: z.string().optional(),
  founderDetails: founderSchema.optional(),
  caDetails: caSchema.optional(),
}).refine(data => {
    if (data.role === 'Founder') return !!data.founderDetails;
    if (data.role === 'CA') return !!data.caDetails;
    return false;
}, {
    message: "Role-specific details are required.",
    path: ["founderDetails"], // path doesn't matter much as this is a form-level error
});


type RegisterFormData = z.infer<typeof registerSchema>;

const betaRoles: { id: UserRole, label: string }[] = [
    { id: "Founder", label: "Founder" },
    { id: "CA", label: "Chartered Accountant" },
];

const Logo = () => (
    <>
      <Image 
        src="https://i.ibb.co/yc2DGvPk/2-2.png"
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto dark:hidden"
        data-ai-hint="logo company"
      />
      <Image 
        src="https://i.ibb.co/4wdbj1XL/claifyblacko-1.png" 
        alt="Jurifly Logo"
        width={114}
        height={24}
        className="h-20 w-auto hidden dark:block"
        data-ai-hint="logo company"
      />
    </>
);


function RegisterForm() {
  const { user, signUpWithEmailAndPassword, loading } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Founder' }
  });
  
  const selectedRole = watch('role');

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
      await signUpWithEmailAndPassword(data.email, data.password, data.name, 'India', data.role, refId || undefined, data.referralCode);
      localStorage.removeItem('referralId');
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
      <Card className="w-full max-w-xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Get started with JuriFly today.</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              
              {selectedRole === 'Founder' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50 animate-in fade-in-50">
                   <div className="space-y-1">
                      <Label htmlFor="founderDetails.companyName">Startup/Company Name (optional)</Label>
                      <Input id="founderDetails.companyName" {...register("founderDetails.companyName")} />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="founderDetails.complianceHeadache">Biggest compliance/legal headache? (optional)</Label>
                      <Textarea id="founderDetails.complianceHeadache" {...register("founderDetails.complianceHeadache")} placeholder="e.g., Managing TDS, understanding contracts..." />
                  </div>
                  <div className="space-y-2">
                      <Label>Do you already have a CA?</Label>
                      <Controller
                          name="founderDetails.hasCA"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                               <Label className="flex items-center gap-2 font-normal"><RadioGroupItem value="yes" /> Yes</Label>
                               <Label className="flex items-center gap-2 font-normal"><RadioGroupItem value="no" /> No</Label>
                            </RadioGroup>
                          )}
                      />
                  </div>
                </div>
              )}
              
              {selectedRole === 'CA' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50 animate-in fade-in-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="caDetails.firmName">Firm Name / Independent</Label>
                            <Input id="caDetails.firmName" {...register("caDetails.firmName")} />
                            {errors.caDetails?.firmName && <p className="text-sm text-destructive">{errors.caDetails.firmName.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="caDetails.experience">Years of Experience</Label>
                            <Input id="caDetails.experience" type="number" {...register("caDetails.experience")} />
                            {errors.caDetails?.experience && <p className="text-sm text-destructive">{errors.caDetails.experience.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label>Services You Offer</Label>
                        <Controller
                            name="caDetails.services"
                            control={control}
                            render={({ field }) => (
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select primary service..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Income Tax Filings">Income Tax Filings</SelectItem>
                                    <SelectItem value="GST Filings & Compliance">GST Filings & Compliance</SelectItem>
                                    <SelectItem value="Company Secretarial & ROC">Company Secretarial & ROC</SelectItem>
                                    <SelectItem value="Audit & Assurance">Audit & Assurance</SelectItem>
                                    <SelectItem value="Fundraising & Valuation">Fundraising & Valuation</SelectItem>
                                </SelectContent>
                               </Select>
                            )}
                        />
                         {errors.caDetails?.services && <p className="text-sm text-destructive">{errors.caDetails.services.message}</p>}
                    </div>
                     <div className="space-y-2">
                      <Label>Do you have clients you want to onboard?</Label>
                       <Controller
                          name="caDetails.hasClients"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                               <Label className="flex items-center gap-2 font-normal"><RadioGroupItem value="yes" /> Yes</Label>
                               <Label className="flex items-center gap-2 font-normal"><RadioGroupItem value="no" /> Not yet</Label>
                            </RadioGroup>
                          )}
                      />
                  </div>
                </div>
              )}

               <div className="space-y-1">
                  <Label htmlFor="referralCode" className="flex items-center gap-2">
                      Referral Code <span className="text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input id="referralCode" placeholder="Enter code if you have one" {...register("referralCode")} />
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
            <div className="w-full">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/40 p-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
