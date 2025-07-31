
"use client";

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

interface InviteClientModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function InviteClientModal({ isOpen, onOpenChange }: InviteClientModalProps) {
  const { toast } = useToast();
  const { sendClientInvite } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
  });
  
  const onSubmit = async (data: FormData) => {
    const result = await sendClientInvite(data.email);
    
    if (result.success) {
      toast({
        title: "Invite Sent!",
        description: `An invitation to join has been sent to ${data.email}.`,
      });
      onOpenChange(false);
      reset();
    } else {
        toast({
            variant: 'destructive',
            title: 'Failed to Send',
            description: result.message
        })
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a New Client</DialogTitle>
          <DialogDescription>
            Enter your client's email to invite them to the platform. They will be prompted to set up their company profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Client's Email Address</Label>
            <Input
              id="email"
              placeholder="e.g., founder@startup.com"
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
