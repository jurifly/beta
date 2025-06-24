
"use client";

import { useState } from "react";
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
import { Monitor, Search, Loader2, Building2, KeyRound, Calendar, Briefcase, MapPin, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyDetailsFromCIN } from "@/app/dashboard/settings/actions";
import type { CompanyDetailsOutput } from "@/ai/flows/company-details-flow";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useAuth } from "@/hooks/auth";

export default function McaTrackerPage() {
  const [cin, setCin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsOutput | null>(null);
  const { toast } = useToast();
  const { userProfile, deductCredits } = useAuth();

  const handleSearch = async () => {
    if (cin.length !== 21) {
      toast({
        variant: "destructive",
        title: "Invalid CIN",
        description: "Please enter a valid 21-character CIN.",
      });
      return;
    }
    
    if (!await deductCredits(1)) return;

    setIsLoading(true);
    setCompanyDetails(null);
    try {
      const details = await fetchCompanyDetailsFromCIN(cin);
      setCompanyDetails(details);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold tracking-tight">MCA Company Tracker</h2>
          <p className="text-muted-foreground">
            Fetch live company details using a Corporate Identification Number (CIN). Costs 1 credit per search.
          </p>
      </div>

      <Card className="interactive-lift">
        <CardHeader>
            <CardTitle>Search Company by CIN</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center gap-4 flex-1">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="font-semibold text-lg text-foreground">Fetching data from MCA...</p>
        </div>
      )}

      {companyDetails && (
        <Card className="interactive-lift animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="text-primary"/> {companyDetails.name}</CardTitle>
                <CardDescription>Corporate Identification Number: {cin}</CardDescription>
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
                    This is mock data generated by AI for demonstration purposes.
                </p>
            </CardFooter>
        </Card>
      )}

      {!companyDetails && !isLoading && (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
            <Monitor className="w-16 h-16 text-primary/20"/>
            <p className="font-semibold text-lg">Company details will appear here</p>
            <p className="text-sm max-w-sm">Enter a valid CIN above to fetch company information.</p>
        </div>
      )}

    </div>
  );
}
