
"use client";

import { Briefcase, Building, LogOut, Settings, User as UserIcon, Check, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import type { UserProfile, UserRole } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, updateUserProfile, signOut, isDevMode, setDevMode } = useAuth();
  
  const handleLogout = async () => {
    if (signOut) {
        router.push("/landing");
        await signOut();
    }
  };

  const handleCompanyChange = (companyId: string) => {
    if (userProfile && companyId !== userProfile.activeCompanyId) {
      const activeCompany = userProfile.companies.find(c => c.id === companyId);
      updateUserProfile({ activeCompanyId: companyId }).then(() => {
        toast({
            title: "Company Switched",
            description: `Dashboard updated to ${activeCompany?.name}.`,
        });
        window.location.reload();
      });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    if (userProfile && role !== userProfile.role) {
      updateUserProfile({ role }).then(() => {
        toast({
            title: "Role Switched",
            description: `You are now viewing the app as a ${role}.`,
        });
        window.location.reload();
      });
    }
  };

  if (!user || !userProfile) {
    return null;
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);
  const canShowActiveCompany = userProfile.role === 'Founder' || userProfile.role === 'Enterprise' || userProfile.role === 'CA' || userProfile.role === 'Legal Advisor';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-3 flex items-center gap-2 interactive-lift">
          <Avatar className="h-8 w-8">
             <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
          {canShowActiveCompany && activeCompany ? (
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight">{activeCompany.name}</p>
              <p className="text-xs text-muted-foreground">{activeCompany.type}</p>
            </div>
          ) : (
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground">{userProfile.role}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              {userProfile.name}
              {userProfile.plan !== 'Starter' && <Badge variant="secondary" className="border-violet-500/30 py-0 px-2 text-violet-500">{userProfile.plan}</Badge>}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        {canShowActiveCompany && userProfile.companies.length > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={userProfile.activeCompanyId} onValueChange={handleCompanyChange}>
                    {userProfile.companies.map(company => (
                        <DropdownMenuRadioItem key={company.id} value={company.id}>
                            {company.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Add/Edit Companies</span>
                 </DropdownMenuItem>
            </>
        )}
        
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Developer Tools</DropdownMenuLabel>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
            <Label htmlFor="dev-mode-switch" className="font-normal cursor-pointer">
                Enable Role Switch
            </Label>
            <Switch
                id="dev-mode-switch"
                checked={isDevMode}
                onCheckedChange={setDevMode}
            />
          </DropdownMenuItem>
           <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!isDevMode}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Switch Role</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                 <DropdownMenuRadioGroup value={userProfile.role} onValueChange={handleRoleChange as (value: string) => void}>
                    <DropdownMenuRadioItem value="Founder">Founder</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="CA">Chartered Accountant</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Legal Advisor">Legal Advisor</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Enterprise">Enterprise</DropdownMenuRadioItem>
                 </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
