
"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Building, Check, Info, KeyRound, Loader2, Save, Sparkles, Bot, User, FileText, Banknote } from "lucide-react";
import type { Company, UserProfile } from "@/lib/types";
import { useAuth } from "@/hooks/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { fetchCompanyDetailsFromCIN } from "@/app/dashboard/settings/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InviteClientModal } from "./invite-client-modal";

const companyTypes = [
    { id: "pvt_ltd", name: "Private Limited Company" },
    { id: "llp", name: "Limited Liability Partnership" },
    { id: "opc", name: "One Person Company" },
    { id: "sole_prop", name: "Sole Proprietorship" },
    { id: "partnership", name: "Partnership Firm" },
    { id: "llc", name: "Limited Liability Company (LLC)" },
    { id: "c_corp", name: "C Corporation" },
    { id: "s_corp", name: "S Corporation" },
    { id: "listed_co", name: "Listed Company (Manual)" },
];

const companySchema = z.object({
  name: z.string().min(2, "Company name is required."),
  type: z.string().min(1, "Please select a company type."),
  legalRegion: z.string().min(1, "Legal region is required."),
  cin: z.string().optional(),
  pan: z.string().length(10, "PAN/Tax ID must be 10 characters.").or(z.string().min(1, "PAN/Tax ID is required.")).optional().or(z.literal('')),
  gstin: z.string().length(15, "GSTIN/VAT ID must be 15 characters.").optional().or(z.literal('')),
  incorporationDate: z.string().min(1, "Incorporation date is required.").optional().or(z.literal('')),
  sector: z.string().min(1, "Industry / Sector is required.").optional().or(z.literal('')),
  location: z.string().min(1, "Location is required.").optional().or(z.literal('')),
}).refine((data) => {
    if (data.type === 'Listed Company (Manual)') return true;
    const cinRequiredTypes = ["Private Limited Company", "One Person Company", "Limited Liability Partnership"];
    if (data.legalRegion === 'India' && cinRequiredTypes.includes(data.type)) {
        return data.cin && data.cin.length === 21;
    }
    return true;
}, {
    message: "A 21-character CIN is required for this company type in India.",
    path: ["cin"],
});

type FormData = z.infer<typeof companySchema>;

const legalRegions = [
    { value: 'India', label: 'India' },
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Canada', label: 'Canada' },
]

const STEPS = [
  { id: 1, name: "Company Details", icon: Building },
  { id: 2, name: "Identification", icon: KeyRound },
  { id: 3, name: "Profile", icon: User },
];

interface AddCompanyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  companyToEdit?: Company | null;
  deductCredits: (amount: number) => Promise<boolean>;
}

export function AddCompanyModal({ isOpen, onOpenChange, companyToEdit, deductCredits }: AddCompanyModalProps) {
  const [step, setStep] = useState(1);
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const isEditMode = !!companyToEdit;
  const [isFetching, startFetchingTransition] = useTransition();
  const [isInviteClientModalOpen, setInviteClientModalOpen] = useState(false);


  const { control, handleSubmit, trigger, formState: { errors, isSubmitting }, reset, getValues, setValue } = useForm<FormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "", type: "", cin: "", pan: "", gstin: "", legalRegion: userProfile?.legalRegion || 'India',
      incorporationDate: "", sector: "", location: "",
    }
  });
  
  const cinValue = useWatch({ control, name: 'cin' });
  const selectedCompanyType = useWatch({ control, name: 'type' });
  const selectedRegion = useWatch({ control, name: 'legalRegion' });
  
  const isCA = userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor';

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && companyToEdit) {
        reset(companyToEdit);
      } else {
        reset({
          name: "", type: "", cin: "", pan: "", gstin: "", legalRegion: userProfile?.legalRegion || 'India',
          incorporationDate: "", sector: "", location: "",
        });
      }
      setStep(1);
    }
  }, [isOpen, companyToEdit, isEditMode, reset, userProfile]);


  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[];
    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'type', 'legalRegion'];
        break;
      case 2:
        fieldsToValidate = ['pan', 'gstin', 'cin'];
        break;
      case 3:
        fieldsToValidate = ['incorporationDate', 'sector', 'location'];
        break;
      default:
        fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step < STEPS.length) {
        setStep(step + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: FormData) => {
    if (!userProfile) return;
    
    // For listed companies, some fields are optional, so we provide defaults.
    const finalData = {
        ...data,
        pan: data.pan || 'N/A',
        incorporationDate: data.incorporationDate || new Date().toISOString().split('T')[0],
        sector: data.sector || 'N/A',
        location: data.location || 'N/A',
    };

    let updatedCompanies: Company[];
    let activeCompanyId = userProfile.activeCompanyId;
    
    const companyData: Company = {
        id: companyToEdit?.id || Date.now().toString(),
        ...finalData,
    };

    if (isEditMode && companyToEdit) {
      updatedCompanies = userProfile.companies.map(c => 
        c.id === companyToEdit.id ? companyData : c
      );
    } else {
      const existingCompanies = Array.isArray(userProfile.companies) ? userProfile.companies : [];
      updatedCompanies = [...existingCompanies, companyData];
      activeCompanyId = companyData.id;
    }
    
    await updateUserProfile({
        companies: updatedCompanies,
        activeCompanyId: activeCompanyId,
    });
    
    toast({
      title: isEditMode ? "Company Updated!" : (isCA ? "Client Added!" : "Company Added!"),
      description: `${data.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
    });
    onOpenChange(false);
  };
  
  const handleFetch = async () => {
    toast({
        title: "Coming Soon!",
        description: "The AI-powered CIN fetch feature is currently under development.",
    });
  };

  const progressValue = (step / STEPS.length) * 100;
  
  const panLabel = selectedRegion === 'India' ? 'Company PAN' : 'Tax ID / EIN';
  const gstinLabel = selectedRegion === 'India' ? 'GSTIN (Optional)' : 'VAT ID (Optional)';
  
  const isListedManual = selectedCompanyType === 'Listed Company (Manual)';
  const totalSteps = isListedManual ? 1 : STEPS.length;

  const currentStepInfo = STEPS[step - 1];
  const StepIcon = currentStepInfo.icon;

  const renderFormContent = () => {
    if(isEditMode) {
      // A simplified form for editing
      return (
        <div className="space-y-6">
          <Controller name="name" control={control} render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="name">{isCA ? "Client's Legal Name" : "Company Legal Name"}</Label>
              <Input id="name" placeholder="e.g., Acme Innovations Pvt. Ltd." {...field} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          )}/>
          <Controller name="sector" control={control} render={({ field }) => (
            <div className="space-y-2">
                <Label htmlFor="sector">Industry / Sector</Label>
                <Input id="sector" placeholder="e.g. Fintech, SaaS, Healthcare" {...field} />
                {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
            </div>
          )}/>
            <Controller name="location" control={control} render={({ field }) => (
            <div className="space-y-2">
                <Label htmlFor="location">Registered Office (City, State/Country)</Label>
                <Input id="location" placeholder="e.g. Mumbai, Maharashtra" {...field} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
          )}/>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <Controller name="name" control={control} render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="name">{isCA ? "Client's Legal Name" : "Company Legal Name"}</Label>
                <Input id="name" placeholder="e.g., Acme Innovations Pvt. Ltd." {...field} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
            )}/>
            <Controller name="type" control={control} render={({ field }) => (
              <div className="space-y-3">
                <Label>What is the type of the company?</Label>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companyTypes.filter(type => isCA ? true : type.name !== 'Listed Company (Manual)').map((type) => (
                    <Label key={type.id} htmlFor={type.id} className="flex items-start space-x-3 border rounded-md p-3 hover:bg-muted has-[input:checked]:border-primary has-[input:checked]:bg-primary/10 transition-colors cursor-pointer text-sm font-medium">
                      <RadioGroupItem value={type.name} id={type.id} className="mt-0.5 shrink-0" />
                      <span className="flex-1">{type.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            )} />
            <Controller name="legalRegion" control={control} render={({ field }) => (
              <div className="space-y-2">
                <Label>Legal Region</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger><SelectContent>{legalRegions.map(region => <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>)}</SelectContent></Select>
                {errors.legalRegion && <p className="text-sm text-destructive">{errors.legalRegion.message}</p>}
              </div>
            )} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {selectedRegion === 'India' && <Controller name="cin" control={control} render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="cin" className="flex items-center gap-2">CIN (Corporate Identification Number)</Label>
                <Input id="cin" {...field} disabled={!["Private Limited Company", "One Person Company", "Limited Liability Partnership"].includes(selectedCompanyType)} />
                {errors.cin && <p className="text-sm text-destructive">{errors.cin.message}</p>}
              </div>
            )}/>}
            <Controller name="pan" control={control} render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="pan">{panLabel}</Label>
                <Input id="pan" {...field} />
                {errors.pan && <p className="text-sm text-destructive">{errors.pan.message}</p>}
              </div>
            )}/>
            <Controller name="gstin" control={control} render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="gstin" className="flex items-center gap-2">{gstinLabel}</Label>
                <Input id="gstin" {...field} />
                {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
              </div>
            )}/>
          </div>
        );
      case 3:
         return (
          <div className="space-y-6">
               <Controller name="incorporationDate" control={control} render={({ field }) => (
                  <div className="space-y-2">
                      <Label htmlFor="incorporationDate">Date of Incorporation</Label>
                      <Input id="incorporationDate" type="date" {...field} />
                      {errors.incorporationDate && <p className="text-sm text-destructive">{errors.incorporationDate.message}</p>}
                  </div>
              )}/>
              <Controller name="sector" control={control} render={({ field }) => (
                  <div className="space-y-2">
                      <Label htmlFor="sector">Industry / Sector</Label>
                      <Input id="sector" placeholder="e.g. Fintech, SaaS, Healthcare" {...field} />
                       {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
                  </div>
              )}/>
               <Controller name="location" control={control} render={({ field }) => (
                  <div className="space-y-2">
                      <Label htmlFor="location">Registered Office (City, State/Country)</Label>
                      <Input id="location" placeholder="e.g. Mumbai, Maharashtra" {...field} />
                      {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                  </div>
              )}/>
          </div>
        );
      default:
        return <div>Review Your Information</div>;
    }
  }

  return (
    <>
      <InviteClientModal isOpen={isInviteClientModalOpen} onOpenChange={setInviteClientModalOpen} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh] p-0">
          {!isEditMode && (
            <>
              <div className="p-6">
                <Progress value={progressValue} className="h-2" />
              </div>
              <div className="p-6 pt-0 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-3">
                  <StepIcon className="w-6 h-6 text-primary"/>
                </div>
                <DialogTitle className="font-headline text-xl">
                  Step {step} of {totalSteps}: {currentStepInfo.name}
                </DialogTitle>
              </div>
            </>
          )}
          {isEditMode && (
            <DialogHeader className="p-6">
              <DialogTitle>Edit Company Details</DialogTitle>
              <DialogDescription>Make changes to the company's profile information.</DialogDescription>
            </DialogHeader>
          )}
          
          <div className="flex-1 overflow-y-auto px-6">
            {renderFormContent()}
          </div>
          
          <DialogFooter className="p-6 border-t flex items-center justify-between">
            {!isEditMode && <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>Back</Button>}
            
            {isEditMode ? (
                <div className="w-full flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                </div>
            ) : step < totalSteps ? (
                <Button type="button" onClick={nextStep}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
            ) : (
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Finish
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

