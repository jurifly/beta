
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import React, { useEffect } from "react";
import type { ClientMatter } from "@/lib/types";

const matterSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  status: z.enum(['Active', 'Closed', 'On Hold']),
});

type FormData = z.infer<typeof matterSchema>;

interface AddMatterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (matter: Omit<ClientMatter, 'id' | 'lastActivity'> & { id?: string }) => void;
  matterToEdit?: ClientMatter | null;
}

export function AddMatterModal({ isOpen, onOpenChange, onSave, matterToEdit }: AddMatterModalProps) {
  const isEditMode = !!matterToEdit;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<FormData>({
    resolver: zodResolver(matterSchema),
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditMode && matterToEdit) {
            reset(matterToEdit);
        } else {
            reset({ title: "", status: 'Active' });
        }
    }
  }, [isOpen, matterToEdit, isEditMode, reset]);

  const onSubmit = async (data: FormData) => {
    onSave({ ...data, id: matterToEdit?.id });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Matter' : 'Create New Matter'}</DialogTitle>
          <DialogDescription>
            Track a specific project or engagement for your client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Matter Title</Label>
            <Input
              id="title"
              placeholder="e.g., FY2024 Statutory Audit"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create Matter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
