'use client';

import { useAuth } from '@/hooks/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import type { Company } from '@/lib/types';

interface SettingsFormProps {
  onAddCompanyClick: () => void;
  onEditCompanyClick: (company: Company) => void;
}

export default function SettingsForm({ onAddCompanyClick, onEditCompanyClick }: SettingsFormProps) {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={userProfile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={userProfile.email} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>Manage the companies associated with your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userProfile.companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.type}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onEditCompanyClick(company)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" onClick={onAddCompanyClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Company
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
