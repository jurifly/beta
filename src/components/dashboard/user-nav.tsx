

"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";

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
    <Button variant="ghost" size="icon" onClick={handleLogout} className="interactive-lift">
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Log out</span>
    </Button>
  );
}
