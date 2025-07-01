
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
import React from "react";
import type { BoardMeeting } from "@/lib/types";

const meetingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date." }),
  agenda: z.string().min(10, "Please provide a brief agenda."),
  meetingLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type FormData = z.infer<typeof meetingSchema>;

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onScheduleMeeting: (meeting: Omit<BoardMeeting, 'id' | 'actionItems' | 'minutes'>) => void;
}

export function ScheduleMeetingModal({ isOpen, onOpenChange, onScheduleMeeting }: ScheduleMeetingModalProps) {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: { title: "", date: "", agenda: "", meetingLink: "" },
  });

  const onSubmit = async (data: FormData) => {
    onScheduleMeeting(data);
    toast({
      title: "Meeting Scheduled!",
      description: `The meeting "${data.title}" has been added to your calendar.`,
    });
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <DialogDescription>
            Set up a new board meeting and define its initial agenda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q3 2024 Board Meeting"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Meeting Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
            <Input
              id="meetingLink"
              placeholder="e.g., https://meet.google.com/..."
              {...register("meetingLink")}
            />
            {errors.meetingLink && <p className="text-sm text-destructive">{errors.meetingLink.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda">Key Agenda Items (one per line)</Label>
            <Textarea
              id="agenda"
              placeholder="Q3 Financial Review..."
              className="min-h-[100px]"
              {...register("agenda")}
            />
            {errors.agenda && <p className="text-sm text-destructive">{errors.agenda.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
