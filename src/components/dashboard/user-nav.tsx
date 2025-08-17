

"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import Link from 'next/link';

export function UserNav() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    if (signOut) {
        router.push("/landing");
        await signOut();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="interactive-lift">
            <UserIcon className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
      </Link>
      <Button variant="ghost" size="icon" onClick={handleLogout} className="interactive-lift">
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Log out</span>
      </Button>
    </div>
  );
}
