
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
import { AlertTriangle, Bell, FileClock, RadioTower } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface NotificationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notification: AppNotification | null;
}

const getIcon = (iconName: string | undefined) => {
    const icons: { [key: string]: React.ReactNode } = {
        AlertTriangle: <AlertTriangle className="h-6 w-6 text-destructive" />,
        RadioTower: <RadioTower className="h-6 w-6 text-primary" />,
        FileClock: <FileClock className="h-6 w-6 text-green-500" />,
        Default: <Bell className="h-6 w-6 text-muted-foreground" />,
    };
    return icons[iconName || 'Default'] || icons.Default;
}

export function NotificationModal({ isOpen, onOpenChange, notification }: NotificationModalProps) {
    if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-4">
          <div className="p-3 bg-muted rounded-full">
            {getIcon(notification.icon)}
          </div>
          <div>
            <DialogTitle>{notification.title}</DialogTitle>
            <DialogDescription>
                Received {format(new Date(notification.createdAt), "do MMM, yyyy 'at' hh:mm a")}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4">
            <p className="text-sm text-foreground">
                {notification.description}
            </p>
        </div>
        <DialogFooter className="sm:justify-start">
           {notification.link ? (
               <Button asChild>
                   <Link href={notification.link}>Take Action</Link>
               </Button>
           ) : (
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                    Close
                </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
