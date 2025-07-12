
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Loader2, Send } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormData = z.infer<typeof inviteSchema>;

interface InviteAdvisorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function InviteAdvisorModal({ isOpen, onOpenChange }: InviteAdvisorModalProps) {
  const { toast } = useToast();
  const { userProfile, sendCaInvite } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
  });
  
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

  const onSubmit = async (data: FormData) => {
    if (!activeCompany) {
        toast({ variant: 'destructive', title: 'No active company', description: 'Please add a company before inviting an advisor.' });
        return;
    }

    const result = await sendCaInvite(data.email, activeCompany.id, activeCompany.name);
    
    if (result.success) {
        toast({ title: "Invite Sent!", description: result.message });
        onOpenChange(false);
    } else {
        toast({ variant: 'destructive', title: 'Failed to Send Invite', description: result.message });
    }
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Your Advisor</DialogTitle>
          <DialogDescription>
            Enter your advisor's email address to send them a collaboration invite.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Advisor's Email Address</Label>
            <Input
              id="email"
              placeholder="e.g., advisor@ca-firm.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
