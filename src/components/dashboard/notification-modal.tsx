
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppNotification } from "@/lib/types";
import { AlertTriangle, Bell, FileClock, RadioTower, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notification: AppNotification | null;
}

const getIconConfig = (iconName: string | undefined) => {
    const iconMap: { [key: string]: { icon: React.ReactNode, className: string } } = {
        AlertTriangle: { icon: <AlertTriangle className="h-6 w-6 text-destructive" />, className: "bg-destructive/10 border-destructive/20" },
        RadioTower: { icon: <RadioTower className="h-6 w-6 text-primary" />, className: "bg-primary/10 border-primary/20" },
        FileClock: { icon: <FileClock className="h-6 w-6 text-yellow-500" />, className: "bg-yellow-500/10 border-yellow-500/20" },
        CheckCircle: { icon: <CheckCircle className="h-6 w-6 text-green-500" />, className: "bg-green-500/10 border-green-500/20" },
        Default: { icon: <Bell className="h-6 w-6 text-muted-foreground" />, className: "bg-muted border-muted-foreground/20" },
    };
    return iconMap[iconName || 'Default'] || iconMap.Default;
}

export function NotificationModal({ isOpen, onOpenChange, notification }: NotificationModalProps) {
    if (!notification) return null;

    const { icon, className } = getIconConfig(notification.icon);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-muted mt-1">
                    {icon}
                </div>
                <div className="flex-1">
                    <DialogTitle>{notification.title}</DialogTitle>
                    <DialogDescription>
                        {format(new Date(notification.createdAt), "PPPp")}
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className={cn("px-6 py-4 border-y text-sm", className)}>
            <p className="text-foreground">{notification.description}</p>
        </div>
        <DialogFooter className="p-6 pt-4">
           {notification.link ? (
               <Button asChild className="w-full">
                   <Link href={notification.link} onClick={() => onOpenChange(false)}>Take Action</Link>
               </Button>
           ) : (
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="w-full">
                    Close
                </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
