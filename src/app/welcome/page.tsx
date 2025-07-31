

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const onboardingSchema = z.object({
  role: z.enum(["Founder", "CA"], {
    required_error: "Please select a role to continue.",
  }),
  companyName: z.string().optional(),
  biggestHeadache: z.string().optional(),
  hasCA: z.enum(["yes", "no", "not-sure"]).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const roles: { id: UserRole, label: string, description: string, disabled?: boolean }[] = [
    { id: "Founder", label: "Founder", description: "Startup/SMB owner handling their company’s compliance and legal obligations" },
    { id: "CA", label: "Chartered Accountant", description: "Financial or legal advisor helping multiple clients with filings" },
];

export default function WelcomePage() {
  const { userProfile, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
      return;
    }
    
    try {
      await updateUserProfile({ 
        role: data.role,
        // Also save the new optional fields
        onboardingCompleted: true 
      });
      toast({ title: 'Profile Updated!', description: 'Welcome to Jurifly!' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Jurifly!</CardTitle>
            <CardDescription>Just one more step. To personalize your experience, please tell us who you are.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Controller
                name="role"
                control={control}
                render={({ field }) => (
                    <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {roles.map((role) => (
                          <Label key={role.id} htmlFor={`role-${role.id}`} className={cn("flex items-start flex-col justify-center space-y-1 rounded-md border-2 border-muted bg-popover p-4 font-semibold hover:bg-accent hover:text-accent-foreground has-[input:checked]:border-primary transition-colors", role.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
                              <RadioGroupItem value={role.id} id={`role-${role.id}`} className="sr-only" disabled={role.disabled}/>
                              <span className="flex items-center gap-2">{role.label} {role.disabled && <Badge variant="outline">Coming Soon</Badge>}</span>
                               <span className="font-normal text-xs text-muted-foreground">{role.description}</span>
                          </Label>
                        ))}
                    </RadioGroup>
                )}
            />
            {errors.role && <p className="mt-2 text-sm text-destructive">{errors.role.message}</p>}
            <p className="text-center text-xs text-muted-foreground pt-2">
                More roles like Legal Advisor and Enterprise are coming soon!
            </p>

            <div className="space-y-2">
              <Label htmlFor="companyName">Startup/Company Name (optional)</Label>
              <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" placeholder="e.g. Acme Inc." {...field} />} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biggestHeadache">Biggest compliance/legal headache? (optional)</Label>
              <Controller name="biggestHeadache" control={control} render={({ field }) => <Textarea id="biggestHeadache" placeholder="e.g., Managing TDS, understanding contracts..." {...field} />} />
            </div>

            <div className="space-y-2">
              <Label>Do you already have a CA?</Label>
               <Controller
                name="hasCA"
                control={control}
                render={({ field }) => (
                    <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        className="flex items-center gap-4"
                    >
                      <Label htmlFor="hasCA-yes" className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="yes" id="hasCA-yes"/>Yes</Label>
                      <Label htmlFor="hasCA-no" className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="no" id="hasCA-no"/>No</Label>
                       <Label htmlFor="hasCA-not-sure" className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="not-sure" id="hasCA-not-sure"/>Not sure</Label>
                    </RadioGroup>
                )}
            />
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue to Dashboard'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
