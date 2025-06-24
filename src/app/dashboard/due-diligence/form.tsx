"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, UploadCloud } from "lucide-react";

export default function DueDiligenceForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Diligence Checklist Generator</CardTitle>
        <CardDescription>Select an audit type and upload your documents to generate a compliance checklist.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="audit-type">Audit Type</Label>
                 <Select>
                    <SelectTrigger id="audit-type">
                        <SelectValue placeholder="Select an audit type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="soc2">SOC 2</SelectItem>
                        <SelectItem value="iso27001">ISO 27001</SelectItem>
                        <SelectItem value="financial">Financial Due Diligence</SelectItem>
                        <SelectItem value="legal">Legal Due Diligence</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Upload Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="font-medium">Click or drag files to upload</p>
                    <p className="text-sm text-muted-foreground">Securely upload your dataroom files for analysis.</p>
                </div>
            </div>
        </div>
        <div className="pt-6 border-t">
            <Button className="w-full md:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Checklist with AI
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
