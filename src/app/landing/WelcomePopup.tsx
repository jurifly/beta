
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Heart, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";

const WELCOME_POPUP_DISMISSED_KEY = 'welcomePopupDismissed';

export function WelcomePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const dismissed = localStorage.getItem(WELCOME_POPUP_DISMISSED_KEY);
        
        // Show popup after a delay if not logged in and not dismissed
        const timer = setTimeout(() => {
            if (!user && dismissed !== 'true') {
                setIsOpen(true);
            }
        }, 3000); // 3-second delay

        return () => clearTimeout(timer);
    }, [user]);

    const handleDismiss = () => {
        localStorage.setItem(WELCOME_POPUP_DISMISSED_KEY, 'true');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center">
                         <div className="p-3 bg-primary/10 rounded-full mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-headline">Welcome to Jurifly!</DialogTitle>
                    <DialogDescription className="text-center">
                        It looks like you're new here. We're an AI-powered co-pilot for startup founders and CAs in India.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                    <Button asChild size="lg">
                        <Link href="/register">Get Started for Free</Link>
                    </Button>
                    <Button variant="ghost" size="lg" onClick={handleDismiss}>
                        Continue Browsing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
