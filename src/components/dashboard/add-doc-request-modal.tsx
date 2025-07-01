
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
import { Loader2, Send } from "lucide-react";
import React from "react";
import type { DocumentRequest } from "@/lib/types";

const docRequestSchema = z.object({
  title: z.string().min(3, "Document name must be at least 3 characters."),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid due date." }),
});

type FormData = z.infer<typeof docRequestSchema>;

interface AddDocRequestModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddRequest: (request: Omit<DocumentRequest, 'id' | 'status'>) => void;
}

export function AddDocRequestModal({ isOpen, onOpenChange, onAddRequest }: AddDocRequestModalProps) {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(docRequestSchema),
    defaultValues: { title: "", dueDate: "" },
  });

  const onSubmit = async (data: FormData) => {
    onAddRequest(data);
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Document</DialogTitle>
          <DialogDescription>
            Send a formal request for a document from your client. They will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Name</Label>
            <Input
              id="title"
              placeholder="e.g., Signed Shareholder's Agreement"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
