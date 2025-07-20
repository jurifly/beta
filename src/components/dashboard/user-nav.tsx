
"use client";

import { LogOut } from "lucide-react";
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
import { SupporterBadge } from "./supporter-badge";

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
  
  const handleRoleChange = async (role: UserRole) => {
    if (userProfile && role !== userProfile.role) {
      await updateUserProfile({ role });
      toast({
        title: "Role Switched",
        description: `You are now viewing the app as a ${role}. Page will now reload.`,
      });
      // Use a timeout to allow the toast to be seen before reload
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleDevModeToggle = (enabled: boolean) => {
      setDevMode(enabled);
  };


  if (!user || !userProfile) {
    return null;
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  const activeCompany = Array.isArray(userProfile.companies)
    ? userProfile.companies.find(c => c.id === userProfile.activeCompanyId)
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full interactive-lift p-0">
          <Avatar className="h-9 w-9">
             <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
             {userProfile.supporter ? (
              <SupporterBadge username={userProfile.name} />
            ) : (
               <p className="text-sm font-medium leading-none flex items-center gap-2">
                {userProfile.name}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <p>Plan: <span className="font-semibold text-foreground">{userProfile.plan}</span></p>
          {activeCompany && <p>Active: <span className="font-semibold text-foreground truncate">{activeCompany.name}</span></p>}
        </div>
        
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
                onCheckedChange={handleDevModeToggle}
            />
          </DropdownMenuItem>
           <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!isDevMode}>
              <span>Switch Role</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                 <DropdownMenuRadioGroup value={userProfile.role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
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
