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
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [openCompanySwitcher, setOpenCompanySwitcher] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/onboarding");
    } catch (error) {
       console.error("Logout failed", error);
       // still redirect even if firebase signOut fails in mock env
       router.push("/onboarding");
    }
  };

  const handleRoleChange = (role: string) => {
    if (userProfile && role !== userProfile.role) {
      updateUserProfile({ role: role as UserRole }).then(() => {
        toast({
            title: "Role Changed",
            description: `You are now viewing as a ${role}. The page will reload to reflect changes.`,
        });
        setTimeout(() => {
            window.location.reload();
        }, 1500);
      });
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

  if (!user || !userProfile) {
    return null;
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-3 flex items-center gap-2 interactive-lift">
          <Avatar className="h-8 w-8">
             <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
          {activeCompany && (
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight">{activeCompany.name}</p>
              <p className="text-xs text-muted-foreground">{activeCompany.type}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              {userProfile.name}
              {userProfile.plan !== 'Free' && <Badge variant="secondary" className="border-violet-500/30 py-0 px-2 text-violet-500">{userProfile.plan}</Badge>}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <Bolt className="mr-2 h-4 w-4" />
            <span>Credits: {userProfile.credits}</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Switch Role</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={userProfile.role}
                onValueChange={handleRoleChange}
              >
                <DropdownMenuRadioItem value="Founder">
                  Founder
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="CA">
                  Chartered Accountant
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Legal Advisor">
                  Legal Advisor
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Enterprise">
                  Enterprise
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
