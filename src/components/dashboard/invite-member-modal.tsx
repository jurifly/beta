"use client";

import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/auth";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.string().min(1, "Please select a role for the team member."),
});

type FormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function InviteMemberModal({ isOpen, onOpenChange }: InviteMemberModalProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "",
    }
  });

  const onSubmit = async (data: FormData) => {
    // In a real app, you would have an API call here to send the invite
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Invite Sent!",
      description: `${data.email} has been invited to join as a ${data.role}.`,
    });
    onOpenChange(false);
    reset();
  };

  const availableRoles = () => {
    if (userProfile?.role === 'CA') {
        return ['Viewer', 'Editor'];
    }
    if (userProfile?.plan.includes('Enterprise')) {
        return ['Admin', 'Member', 'Billing'];
    }
    // Default roles for CA Pro
    return ['Manager', 'Associate'];
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Team Member</DialogTitle>
          <DialogDescription>
            Enter the email address and assign a role to the new team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 pt-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="name@company.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles().map(role => (
                       <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
