
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Monitor, Search, Loader2, Building2, KeyRound, Calendar, Briefcase, MapPin, AlertTriangle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CompanyDetailsOutput } from "@/ai/flows/company-details-flow";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useAuth } from "@/hooks/auth";
import { fetchCompanyDetailsFromCIN } from "./actions";

const manualInputSchema = z.object({
  name: z.string().min(2, "Company name is required."),
  pan: z.string().length(10, "PAN must be 10 characters.").refine(val => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), "Invalid PAN format."),
  incorporationDate: z.string().min(1, "Incorporation date is required."),
  sector: z.string().min(2, "Industry/Sector is required."),
  location: z.string().min(2, "Location is required."),
});

type ManualInputData = z.infer<typeof manualInputSchema>;


export default function McaTrackerPage() {
  const [cin, setCin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsOutput | null>(null);
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ManualInputData>({
    resolver: zodResolver(manualInputSchema),
  });

  const handleSearch = async () => {
    if (cin.length !== 21) {
        toast({
            variant: "destructive",
            title: "Invalid CIN",
            description: "Please enter a valid 21-digit CIN."
        });
        return;
    }
    if (!await deductCredits(1)) return;

    setIsLoading(true);
    setCompanyDetails(null);
    try {
        const details = await fetchCompanyDetailsFromCIN(cin);
        setCompanyDetails(details);
        toast({
            title: "Success!",
            description: "Company details fetched successfully."
        });
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Search Failed",
            description: e.message || "Could not fetch company details."
        });
    } finally {
        setIsLoading(false);
    }
  };

  const onManualSubmit = (data: ManualInputData) => {
    setIsLoading(true);
    setCompanyDetails(null);
    setTimeout(() => {
        setCompanyDetails(data);
        setIsLoading(false);
    }, 500);
  };

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (userProfile.plan === 'Starter' || userProfile.plan === 'Free') {
    return <UpgradePrompt 
      title="Unlock MCA Tracker"
      description="Get real-time (mocked) company details directly from the MCA portal using just a CIN. This is a Founder plan feature."
      icon={<Monitor className="w-12 h-12 text-primary/20"/>}
    />;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">MCA Company Tracker</h2>
            <p className="text-muted-foreground">
              Fetch live company details using a Corporate Identification Number (CIN). Costs 1 credit per search.
            </p>
        </div>

        <Card className="interactive-lift">
          <CardHeader>
              <CardTitle>Find Company Information</CardTitle>
              <CardDescription>Fetch details using a CIN, or enter them manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                  <Button variant={mode === 'search' ? 'default' : 'outline'} onClick={() => setMode('search')} className="interactive-lift">
                      <Search className="mr-2 h-4 w-4"/> Search by CIN
                  </Button>
                  <Button variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')} className="interactive-lift">
                      <Edit className="mr-2 h-4 w-4"/> Manual Input
                  </Button>
              </div>
              
              {mode === 'search' && (
                  <div className="pt-4 border-t animate-in fade-in-50">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <div className="w-full space-y-2">
                              <Label htmlFor="cin-input">Enter 21-Digit CIN</Label>
                              <Input 
                                  id="cin-input"
                                  placeholder="e.g., U72200KA2022PTC123456"
                                  value={cin}
                                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                                  maxLength={21}
                              />
                          </div>
                          <Button onClick={handleSearch} disabled={isLoading || cin.length !== 21} className="w-full sm:w-auto">
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                              Search
                          </Button>
                      </div>
                  </div>
              )}

              {mode === 'manual' && (
                  <form onSubmit={handleSubmit(onManualSubmit)} className="pt-4 border-t space-y-4 animate-in fade-in-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="manual-name">Company Name</Label>
                              <Input id="manual-name" {...register("name")} />
                              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="manual-pan">Company PAN</Label>
                              <Input id="manual-pan" {...register("pan")} maxLength={10} />
                              {errors.pan && <p className="text-sm text-destructive">{errors.pan.message}</p>}
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="manual-inc-date">Incorporation Date</Label>
                              <Input id="manual-inc-date" type="date" {...register("incorporationDate")} />
                              {errors.incorporationDate && <p className="text-sm text-destructive">{errors.incorporationDate.message}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="manual-sector">Industry / Sector</Label>
                              <Input id="manual-sector" placeholder="e.g., Fintech" {...register("sector")} />
                              {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="manual-location">Registered Office (City, State)</Label>
                          <Input id="manual-location" placeholder="e.g., Mumbai, Maharashtra" {...register("location")} />
                          {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                      </div>

                      <Button type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                          Show Details
                      </Button>
                  </form>
              )}
          </CardContent>
        </Card>
        
        {isLoading && (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="font-semibold text-lg text-foreground">Fetching data...</p>
          </div>
        )}

        {companyDetails && !isLoading && (
          <Card className="interactive-lift animate-in fade-in-50 duration-500">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Building2 className="text-primary"/> {companyDetails.name}</CardTitle>
                  {cin && mode === 'search' && <CardDescription>Corporate Identification Number: {cin}</CardDescription>}
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-start gap-3">
                      <KeyRound className="w-5 h-5 text-muted-foreground mt-1"/>
                      <div>
                          <p className="font-medium">Company PAN</p>
                          <p className="text-muted-foreground">{companyDetails.pan}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-1"/>
                      <div>
                          <p className="font-medium">Incorporation Date</p>
                          <p className="text-muted-foreground">{companyDetails.incorporationDate}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground mt-1"/>
                      <div>
                          <p className="font-medium">Industry / Sector</p>
                          <p className="text-muted-foreground">{companyDetails.sector}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-1"/>
                      <div>
                          <p className="font-medium">Registered Office</p>
                          <p className="text-muted-foreground">{companyDetails.location}</p>
                      </div>
                  </div>
              </CardContent>
              <CardFooter>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500"/>
                      {mode === 'search' 
                        ? 'This is mock data generated by AI for demonstration purposes.'
                        : 'This is manually entered data.'
                      }
                  </p>
              </CardFooter>
          </Card>
        )}

        {!companyDetails && !isLoading && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
              <Monitor className="w-16 h-16 text-primary/20"/>
              <p className="font-semibold text-lg">Company details will appear here</p>
              <p className="text-sm max-w-sm">Enter company information above to see details.</p>
          </div>
        )}

      </div>
    </>
  );
}

    