
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
import { ArrowRight, Building, Check, Info, KeyRound, Loader2, Save, Sparkles, Bot } from "lucide-react";
import type { Company, UserProfile } from "@/lib/types";
import { useAuth } from "@/hooks/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { fetchCompanyDetailsFromCIN } from "@/app/dashboard/settings/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const companyTypes = [
    { id: "pvt_ltd", name: "Private Limited Company" },
    { id: "llp", name: "Limited Liability Partnership" },
    { id: "opc", name: "One Person Company" },
    { id: "sole_prop", name: "Sole Proprietorship" },
    { id: "partnership", name: "Partnership Firm" },
    { id: "llc", name: "Limited Liability Company (LLC)" },
    { id: "c_corp", name: "C Corporation" },
    { id: "s_corp", name: "S Corporation" },
];

const companySchema = z.object({
  name: z.string().min(2, "Company name is required."),
  type: z.string().min(1, "Please select a company type."),
  legalRegion: z.string().min(1, "Legal region is required."),
  cin: z.string().optional(),
  pan: z.string().length(10, "PAN/Tax ID must be 10 characters.").or(z.string().min(1, "PAN/Tax ID is required.")),
  gstin: z.string().length(15, "GSTIN/VAT ID must be 15 characters.").optional().or(z.literal('')),
  incorporationDate: z.string().min(1, "Incorporation date is required."),
  sector: z.string().min(1, "Industry / Sector is required."),
  location: z.string().min(1, "Location is required."),
}).refine((data) => {
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
    { value: 'Other', label: 'Other' },
]

const STEPS = [
  { id: 1, name: "Company Details", fields: ["type", "name", "legalRegion"] as const },
  { id: 2, name: "Identification", fields: ["cin", "pan", "gstin"] as const },
  { id: 3, name: "Profile", fields: ["incorporationDate", "sector", "location"] as const },
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
    const fieldsToValidate = STEPS.find(s => s.id === step)?.fields;
    if (fieldsToValidate) {
        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(step + 1);
        }
    }
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: FormData) => {
    if (!userProfile) return;

    let updatedCompanies: Company[];
    let activeCompanyId = userProfile.activeCompanyId;

    if (isEditMode && companyToEdit) {
      updatedCompanies = userProfile.companies.map(c => 
        c.id === companyToEdit.id ? { ...c, ...data } : c
      );
    } else {
      const newCompany: Company = {
        id: Date.now().toString(),
        ...data
      };
      updatedCompanies = [...userProfile.companies, newCompany];
      activeCompanyId = newCompany.id;
    }
    
    await updateUserProfile({
        companies: updatedCompanies,
        activeCompanyId: activeCompanyId,
    });
    
    toast({
      title: isEditMode ? "Company Updated!" : "Company Added!",
      description: `${data.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
    });
    onOpenChange(false);
  };
  
  const handleFetch = async () => {
    const cin = getValues("cin");
    const legalRegion = getValues("legalRegion");
    if (!cin || cin.length !== 21) {
      toast({
        variant: "destructive",
        title: "Invalid CIN",
        description: "Please enter a valid 21-character CIN.",
      });
      return;
    }

    if (!await deductCredits(1)) return;

    startFetchingTransition(async () => {
      try {
        toast({ title: "Fetching Company Details...", description: "Our AI is on the job." });
        const details = await fetchCompanyDetailsFromCIN(cin, legalRegion);
        setValue("name", details.name, { shouldValidate: true });
        setValue("pan", details.pan, { shouldValidate: true });
        setValue("incorporationDate", details.incorporationDate, { shouldValidate: true });
        setValue("sector", details.sector, { shouldValidate: true });
        setValue("location", details.location, { shouldValidate: true });
        toast({ title: "Details Filled!", description: "Company details have been auto-filled." });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Fetch Failed",
          description: error.message,
        });
      }
    });
  };

  const progressValue = (step / STEPS.length) * 100;
  
  const panLabel = selectedRegion === 'India' ? 'Company PAN' : 'Tax ID / EIN';
  const gstinLabel = selectedRegion === 'India' ? 'GSTIN (Optional)' : 'VAT ID (Optional)';


  const renderAddForm = () => (
    <>
      {step === 1 && (
        <div className="space-y-6">
          <Controller name="name" control={control} render={({ field }) => (
              <div className="space-y-2">
                  <Label htmlFor="name">Company Legal Name</Label>
                  <Input id="name" placeholder="e.g., Acme Innovations Pvt. Ltd." {...field} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
          )}/>
          <Controller name="type" control={control} render={({ field }) => (
            <div className="space-y-3">
              <Label>What is the type of your company?</Label>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companyTypes.map((type) => (
                      <Label key={type.id} htmlFor={type.id} className="flex items-start space-x-3 border rounded-md p-3 hover:bg-muted has-[input:checked]:border-primary has-[input:checked]:bg-primary/10 transition-colors cursor-pointer text-sm font-medium">
                          <RadioGroupItem value={type.name} id={type.id} className="mt-0.5 shrink-0" />
                          <span className="flex-1">{type.name}</span>
                      </Label>
                  ))}
              </RadioGroup>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
          )} />
          <Controller
                name="legalRegion"
                control={control}
                render={({ field }) => (
                <div className="space-y-2">
                    <Label>Legal Region</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger>
                        <SelectContent>{legalRegions.map(region => <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.legalRegion && <p className="text-sm text-destructive">{errors.legalRegion.message}</p>}
                </div>
              )}
          />
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
           {selectedRegion === 'India' && <Controller name="cin" control={control} render={({ field }) => (
              <div className="space-y-2">
                  <Label htmlFor="cin" className="flex items-center gap-2">
                    CIN (Corporate Identification Number)
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild><button type="button"><Info className="w-4 h-4 text-muted-foreground"/></button></TooltipTrigger>
                          <TooltipContent>A 21-digit alphanumeric code issued by the ROC.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input id="cin" {...field} disabled={!["Private Limited Company", "One Person Company", "Limited Liability Partnership"].includes(selectedCompanyType)} />
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button type="button" variant="outline" size="icon" onClick={handleFetch} disabled={!cinValue || cinValue.length !== 21 || isFetching}>
                                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles />}
                                  <span className="sr-only">Fetch Details with AI</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Auto-fill with AI (1 credit)</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> Enter a valid CIN and let our AI auto-fill the details for you.</p>
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
                  <Label htmlFor="gstin" className="flex items-center gap-2">
                    {gstinLabel}
                  </Label>
                  <Input id="gstin" {...field} />
                  {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
              </div>
           )}/>
        </div>
      )}

      {step === 3 && (
          <div className="space-y-4">
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
      )}
    </>
  );

  const renderEditForm = () => (
    <div className="space-y-4">
      <Controller name="name" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="name">Company Legal Name</Label>
          <Input id="name" {...field} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
      )}/>
      <Controller name="type" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label>Company Type</Label>
          <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
            {companyTypes.map(type => (
              <Label key={type.id} htmlFor={`edit-${type.id}`} className="p-2 border rounded-md has-[:checked]:border-primary text-sm">
                <RadioGroupItem value={type.name} id={`edit-${type.id}`} className="sr-only"/>
                {type.name}
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}/>
      <Controller name="legalRegion" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label>Legal Region</Label>
          <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{legalRegions.map(region => <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}/>
      {selectedRegion === 'India' && <Controller name="cin" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="cin">CIN</Label>
          <Input id="cin" {...field} />
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
          <Label htmlFor="gstin">{gstinLabel}</Label>
          <Input id="gstin" {...field} />
          {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
        </div>
      )}/>
      <Controller name="incorporationDate" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="incorporationDate">Date of Incorporation</Label>
          <Input id="incorporationDate" type="date" {...field} />
        </div>
      )}/>
      <Controller name="sector" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="sector">Industry / Sector</Label>
          <Input id="sector" {...field} />
        </div>
      )}/>
      <Controller name="location" control={control} render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="location">Location (City, State)</Label>
          <Input id="location" {...field} />
        </div>
      )}/>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? "Edit Company Information" : "Add a New Company"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update your company's details." : "Let's get your company's legal information set up."}
          </DialogDescription>
        </DialogHeader>
        
        {!isEditMode && <Progress value={progressValue} className="w-full h-2" />}
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pr-2 -mr-4 pl-1">
          <div className="space-y-6 py-4 pr-4">
            {isEditMode ? renderEditForm() : renderAddForm()}
          </div>
        </form>
        
        <DialogFooter className="pt-4 border-t">
          {isEditMode ? (
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          ) : (
            <>
              {step > 1 && <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>}
              <div className="flex-1"></div>
              {step < STEPS.length ? (
                  <Button type="button" onClick={nextStep} className="w-full sm:w-auto">Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
              ) : (
                  <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Add Company
                  </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
