
"use client";

import { Briefcase, Building, CreditCard, LogOut, Settings, User as UserIcon, Check, Bolt, Sparkles } from "lucide-react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, updateUserProfile, signOut, isDevMode, setDevMode } = useAuth();
  const [openCompanySwitcher, setOpenCompanySwitcher] = useState(false);

  const handleLogout = async () => {
    if (signOut) {
        await signOut();
        router.push("/login");
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
  const canShowActiveCompany = userProfile.role === 'Founder' || userProfile.role === 'Enterprise';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-3 flex items-center gap-2 interactive-lift">
          <Avatar className="h-8 w-8">
             <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
          {canShowActiveCompany && activeCompany && (
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight">{activeCompany.name}</p>
              <p className="text-xs text-muted-foreground">{activeCompany.type}</p>
            </div>
          )}
           {!canShowActiveCompany && (
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
        <DropdownMenuSeparator />
        {userProfile.plan === 'Starter' && (
            <>
                <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <span>Upgrade to Pro</span>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
            </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {canShowActiveCompany && (
            <>
                <DropdownMenuSub open={openCompanySwitcher} onOpenChange={setOpenCompanySwitcher}>
                    <DropdownMenuSubTrigger>
                        <Building className="mr-2 h-4 w-4" />
                        <span>Switch Company</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="p-0">
                        <Command>
                            <CommandInput placeholder="Search company..." autoFocus={true} />
                            <CommandList>
                            <CommandEmpty>No company found.</CommandEmpty>
                            <CommandGroup>
                                {userProfile.companies.map(company => (
                                <CommandItem
                                    key={company.id}
                                    value={company.name}
                                    onSelect={() => {
                                    handleCompanyChange(company.id);
                                    setOpenCompanySwitcher(false);
                                    }}
                                >
                                    {company.name}
                                    {company.id === userProfile.activeCompanyId && <Check className="ml-auto h-4 w-4" />}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </Command>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
            </>
        )}
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
