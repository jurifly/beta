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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import type { Clause } from "@/lib/types";
import React from "react";

const clauseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  category: z.string().min(2, "Category is required."),
  content: z.string().min(10, "Clause content must be at least 10 characters."),
});

type FormData = z.infer<typeof clauseSchema>;

interface AddClauseModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClauseAdded: (clause: Omit<Clause, 'id'>) => void;
}

export function AddClauseModal({ isOpen, onOpenChange, onClauseAdded }: AddClauseModalProps) {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(clauseSchema),
  });

  const onSubmit = async (data: FormData) => {
    onClauseAdded(data);
    toast({
      title: "Clause Added!",
      description: `The clause "${data.title}" has been added to your library.`,
    });
    onOpenChange(false);
    reset();
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Clause</DialogTitle>
          <DialogDescription>
            Create a reusable legal clause to use in your document templates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 pt-4">
            <Label htmlFor="title">Clause Title</Label>
            <Input
              id="title"
              placeholder="e.g., Confidentiality"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., General, Intellectual Property"
              {...register("category")}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Clause Content</Label>
            <Textarea
              id="content"
              placeholder="Enter the full text of the clause..."
              className="min-h-[150px]"
              {...register("content")}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Clause
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
