
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, Search, Loader2, Award, Star, ShieldCheck, FileText, BarChart, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const mockAdvisors = [
  { id: 1, name: 'Anjali Sharma', location: 'Mumbai, MH', avatar: 'AS', specialties: ['Startup Specialist', 'FEMA Expert'], bio: 'Ex-Big 4 CA with 10+ years of experience helping startups scale from seed to Series C.', reviews: 45, rating: 4.9 },
  { id: 2, name: 'Vikram Singh', location: 'Bengaluru, KA', avatar: 'VS', specialties: ['GST Guru', 'E-commerce'], bio: 'Specializing in GST compliance and tax optimization for D2C brands and tech companies.', reviews: 32, rating: 4.8 },
  { id: 3, name: 'Priya Mehta', location: 'Delhi, DL', avatar: 'PM', specialties: ['Verified', 'Tax Audits'], bio: 'Expert in handling tax audits, assessments, and litigation for SMBs and funded startups.', reviews: 28, rating: 4.9 },
  { id: 4, name: 'Rohan Desai', location: 'Pune, MH', avatar: 'RD', specialties: ['Startup Specialist', 'Valuations'], bio: 'Certified valuation expert helping early-stage companies with 409A valuations and fundraising.', reviews: 19, rating: 5.0 },
  { id: 5, name: 'Sneha Reddy', location: 'Hyderabad, TS', avatar: 'SR', specialties: ['GST Guru', 'Verified'], bio: 'Focused on providing end-to-end GST and income tax solutions for the IT/ITES sector.', reviews: 41, rating: 4.7 },
  { id: 6, name: 'Amit Kumar', location: 'Chennai, TN', avatar: 'AK', specialties: ['FEMA Expert', 'Manufacturing'], bio: 'Advising manufacturing units on cross-border transactions, FDI, and ODI compliance.', reviews: 15, rating: 4.8 },
];

const specialties = ['Startup Specialist', 'GST Guru', 'FEMA Expert', 'Valuations', 'E-commerce', 'Tax Audits', 'Manufacturing'];

const SpecialtyBadge = ({ name }: { name: string }) => {
    let icon = <Award className="w-3 h-3"/>;
    if (name === 'Startup Specialist') icon = <Star className="w-3 h-3"/>;
    if (name === 'GST Guru') icon = <FileText className="w-3 h-3"/>;
    if (name === 'FEMA Expert') icon = <BarChart className="w-3 h-3"/>;
    if (name === 'Verified') icon = <ShieldCheck className="w-3 h-3 text-green-500"/>;

    return (
        <Badge variant="secondary" className="font-normal gap-1 items-center">
            {icon}
            {name}
        </Badge>
    );
};

export default function CaMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setSelectedSpecialties(prev => 
        checked ? [...prev, specialty] : prev.filter(s => s !== specialty)
    );
  };

  const filteredAdvisors = mockAdvisors.filter(advisor => {
    const nameMatch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const bioMatch = advisor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const specialtyMatch = selectedSpecialties.length === 0 || selectedSpecialties.every(s => advisor.specialties.includes(s));
    return (nameMatch || bioMatch) && specialtyMatch;
  });
  
  const handleConnect = () => {
      toast({
          title: "Feature Coming Soon!",
          description: "One-click connection with advisors is on its way."
      })
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">Find Your Expert</h1>
                <p className="text-muted-foreground">Browse and connect with our network of verified professionals.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1 space-y-4">
                <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name..." 
                                className="pl-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Specialties</Label>
                            <div className="space-y-2">
                                {specialties.map(spec => (
                                    <div key={spec} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={spec}
                                            onCheckedChange={(checked) => handleSpecialtyChange(spec, !!checked)}
                                        />
                                        <Label htmlFor={spec} className="text-sm font-normal">{spec}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader>
                        <CardTitle>Can't Find an Expert?</CardTitle>
                        <CardDescription>Post a job and let advisors come to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button variant="outline" className="w-full" disabled>Post a Job (Coming Soon)</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{filteredAdvisors.length} expert(s) found</p>
                    <Button variant="outline" disabled>
                        <MessageSquare className="mr-2"/> Ask a CA (Coming Soon)
                    </Button>
                </div>
                {filteredAdvisors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAdvisors.map(advisor => (
                             <Card key={advisor.id} className="interactive-lift flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarFallback className="text-xl">{advisor.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle>{advisor.name}</CardTitle>
                                            <CardDescription>{advisor.location}</CardDescription>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                                <span className="text-sm font-bold">{advisor.rating}</span>
                                                <span className="text-xs text-muted-foreground">({advisor.reviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                       {advisor.specialties.map(spec => <SpecialtyBadge key={spec} name={spec} />)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{advisor.bio}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={handleConnect}>View Profile & Connect</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex items-center justify-center min-h-[400px]">
                        <CardContent className="text-center">
                            <p className="font-semibold">No experts match your criteria.</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>
  )
}
