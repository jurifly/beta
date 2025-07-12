
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserRole } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z.object({
  name: z.string().min(2, "नाम आवश्यक है"),
  email: z.string().email("अमान्य ईमेल पता"),
  password: z.string().min(6, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"),
  legalRegion: z.string({ required_error: "कृपया एक क्षेत्र चुनें।" }).min(1, "कृपया एक क्षेत्र चुनें।"),
  role: z.enum(["Founder", "CA", "Legal Advisor", "Enterprise"], { required_error: "कृपया एक भूमिका चुनें।" }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const legalRegions = [
    { value: 'India', label: 'भारत' },
    { value: 'USA', label: 'संयुक्त राज्य अमेरिका' },
    { value: 'UK', label: 'यूनाइटेड किंगडम' },
    { value: 'Singapore', label: 'सिंगापुर' },
    { value: 'Australia', label: 'ऑस्ट्रेलिया' },
    { value: 'Canada', label: 'कनाडा' },
]

const betaRoles: { id: UserRole, label: string }[] = [
    { id: "Founder", label: "संस्थापक" },
    { id: "CA", label: "चार्टर्ड एकाउंटेंट" },
];

const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 mx-auto text-primary mb-2"
  >
    <path
      d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
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
      await signUpWithEmailAndPassword(data.email, data.password, data.name, data.legalRegion, data.role, refId || undefined);
      localStorage.removeItem('referralId'); // Clear after use
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "पंजीकरण विफल",
            description: error.message || "एक अज्ञात त्रुटि हुई।",
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
          <CardTitle className="text-2xl font-headline">खाता बनाएं</CardTitle>
          <CardDescription>आज ही Claari के साथ शुरुआत करें।</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>मैं एक...</Label>
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
              <Label htmlFor="name">पूरा नाम</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
             <div className="space-y-1">
              <Label htmlFor="email">ईमेल</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">पासवर्ड</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
             <div className="space-y-1">
              <Label>कानूनी क्षेत्र</Label>
                <Controller
                    name="legalRegion"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="अपना देश चुनें..." />
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
             <div className="items-top flex space-x-2">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    मैं 
                    <Link href="/dashboard/settings?tab=policies" target="_blank" className="underline text-primary"> सेवा की शर्तों </Link> 
                    और 
                    <Link href="/dashboard/settings?tab=policies" target="_blank" className="underline text-primary"> गोपनीयता नीति</Link> से सहमत हूं।
                  </label>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !agreedToTerms}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              खाता बनाएं
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            पहले से ही खाता है?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              लॉग इन करें
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
