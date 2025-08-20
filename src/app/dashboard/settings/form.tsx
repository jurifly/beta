
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Company, UserProfile, UserRole } from "@/lib/types";
import { Loader2, Save, PlusCircle, Building, Info, KeyRound, MapPin, Calendar, Briefcase, User as UserIcon, Edit, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").or(z.literal('')),
  role: z.enum(["Founder", "CA", "Legal Advisor", "Enterprise"]),
  legalRegion: z.string().min(1, "Legal region is required."),
});

type FormData = z.infer<typeof formSchema>;

const roles: { id: UserRole, label: string, description: string }[] = [
    { id: "Founder", label: "Founder", description: "Startup/SMB owner handling their company’s compliance and legal obligations" },
    { id: "CA", label: "Chartered Accountant", description: "Financial or legal advisor helping multiple clients with filings" },
    { id: "Legal Advisor", label: "Legal Advisor", description: "Lawyer or legal professional providing advisory services." },
    { id: "Enterprise", label: "Enterprise", description: "Large organization managing multiple entities and complex compliance." },
];

const legalRegions = [
    { value: 'India', label: 'India' },
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Canada', label: 'Canada' },
]

export default function SettingsForm({ onAddCompanyClick, onEditCompanyClick }: { onAddCompanyClick: () => void; onEditCompanyClick: (company: Company) => void }) {
  const { user, userProfile, updateUserProfile, isDevMode } = useAuth();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: userProfile?.name || "",
        phone: userProfile?.phone || "",
        role: userProfile?.role || "Founder",
        legalRegion: userProfile?.legalRegion || "India",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateUserProfile(data);
      toast({
        title: "Success!",
        description: "Your settings have been updated.",
      });
      if (data.role !== userProfile?.role || data.legalRegion !== userProfile?.legalRegion) {
        toast({
            title: "Settings updated",
            description: "Some navigation items or AI features may have changed. Please refresh to see them.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!userProfile) {
    return (
        <Card className="w-full max-w-4xl">
            <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
            <CardContent className="p-6 h-96 flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </CardContent>
        </Card>
    );
  }

  const activeCompany = Array.isArray(userProfile.companies)
    ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId)
    : null;

  const addButtonText = (userProfile.role === 'CA' || userProfile.role === 'Legal Advisor') ? 'Add New Client' : 'Add New Company';

  return (
    <div className="space-y-6">
      <Card className="interactive-lift">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal details and preferences.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="md:col-span-2">
                            <Input id="name" {...field} />
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                    </div>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                <Label htmlFor="email">Email</Label>
                <div className="md:col-span-2">
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                </div>
            </div>
            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="md:col-span-2">
                            <Input id="phone" type="tel" {...field} />
                            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>
                )}
            />
            <Separator />
            <Controller
                name="role"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2 md:gap-4">
                        <div>
                            <Label>Your Role</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                            Your role is currently locked. To change it for testing, use the "Developer Tools" in the user profile menu.
                            </p>
                        </div>
                        <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                            className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
                            disabled={!isDevMode}
                        >
                            {roles.map((role) => (
                                <TooltipProvider key={role.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Label htmlFor={`role-${role.id}`} className="flex items-start flex-col justify-center space-y-1 rounded-md border-2 border-muted bg-popover p-4 font-semibold hover:bg-accent hover:text-accent-foreground has-[input:checked]:border-primary has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-70">
                                                <RadioGroupItem value={role.id} id={`role-${role.id}`} disabled={!isDevMode} className="sr-only"/>
                                                <span>{role.label}</span>
                                                <span className="font-normal text-xs text-muted-foreground">{role.description}</span>
                                            </Label>
                                        </TooltipTrigger>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </RadioGroup>
                    </div>
                )}
            />
            <Controller
                name="legalRegion"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2 md:gap-4">
                        <div className="space-y-1">
                            <Label>Legal Region</Label>
                            <p className="text-xs text-muted-foreground">This sets the context for all AI and compliance features.</p>
                        </div>
                        <div className="md:col-span-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {legalRegions.map(region => (
                                        <SelectItem key={region.value} value={region.value}>
                                            <div className="flex items-center gap-2">
                                            <span>{region.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.legalRegion && <p className="text-sm text-destructive">{errors.legalRegion.message}</p>}
                        </div>
                    </div>
                )}
            />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </CardFooter>
        </form>
      </Card>
      
      <Card className="interactive-lift">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
                <CardTitle>Workspaces</CardTitle>
                <CardDescription>
                  Manage your companies or clients here.
                </CardDescription>
            </div>
            <Button variant="outline" type="button" onClick={onAddCompanyClick}>
                <PlusCircle className="mr-2 h-4 w-4"/>{addButtonText}
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile.companies.length > 0 ? (
             <div className="space-y-4">
                {userProfile.companies.map(company => (
                    <div key={company.id} className="p-4 border rounded-lg flex items-center justify-between interactive-lift">
                        <div>
                            <p className="font-semibold">{company.name}</p>
                            <p className="text-sm text-muted-foreground">{company.type} - {company.legalRegion}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {company.id === userProfile.activeCompanyId && <Badge>Active</Badge>}
                           <Button variant="ghost" size="icon" onClick={() => onEditCompanyClick(company)}>
                             <Edit className="h-4 w-4" />
                             <span className="sr-only">Edit Company</span>
                           </Button>
                        </div>
                    </div>
                ))}
             </div>
          ) : (
             <div className="text-center text-sm text-muted-foreground py-10 border rounded-lg border-dashed">
                <p>No companies added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
