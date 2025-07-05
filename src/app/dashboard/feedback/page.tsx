
"use client"

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a category."),
  message: z.string().min(10, "Feedback must be at least 10 characters long."),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
        category: "",
        message: "",
    }
  });

  const onSubmit = async (data: FeedbackFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for helping us improve. We've received your feedback.",
    });
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full pt-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Share Your Feedback</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              We're constantly improving. Tell us what you love, what's not working, or what features you'd like to see next.
            </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mt-8">
            <Card className="interactive-lift">
            <CardContent className="pt-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="bug-report">Bug Report</SelectItem>
                            <SelectItem value="feature-request">Feature Request</SelectItem>
                            <SelectItem value="ui-ux-feedback">UI/UX Feedback</SelectItem>
                            <SelectItem value="general-comment">General Comment</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="message">Your Feedback</Label>
                <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                    <Textarea
                        id="message"
                        placeholder="Tell us what you think..."
                        className="min-h-[150px]"
                        {...field}
                    />
                    )}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Feedback
                </Button>
            </CardFooter>
            </Card>
        </form>
    </div>
  )
}
