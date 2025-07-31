
"use client"

import { useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Loader2, ThumbsUp, ThumbsDown, Send, Palette, MessageCircle, Bug, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth"
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils"

const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a category."),
  sentiment: z.enum(['positive', 'negative']).optional(),
  message: z.string().min(10, "Feedback must be at least 10 characters long."),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const feedbackCategories = [
    { id: 'bug-report', label: 'Bug Report', icon: Bug },
    { id: 'feature-request', label: 'Feature Request', icon: Lightbulb },
    { id: 'ui-ux', label: 'UI/UX Feedback', icon: Palette },
    { id: 'general', label: 'General Comment', icon: MessageCircle },
]

export default function FeedbackForm() {
  const { user, addFeedback } = useAuth();
  const { toast } = useToast();
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    watch
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "",
      sentiment: undefined,
      message: ""
    }
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to submit feedback.'
        });
        return;
    }
    await addFeedback(data.category, data.message, data.sentiment);
    toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve."
    });
    reset();
  };

  return (
     <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="interactive-lift">
            <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <CardDescription>Tell us what you love, what's not working, or what features you'd like to see next.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-3">
                    <Label>1. What's this about?</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {feedbackCategories.map((cat) => (
                                    <Button 
                                        key={cat.id} 
                                        type="button" 
                                        variant="outline" 
                                        className={cn("flex-col h-20 gap-1", field.value === cat.id && "border-primary ring-2 ring-primary/50")}
                                        onClick={() => field.onChange(cat.id)}
                                    >
                                        <cat.icon className="w-5 h-5"/>
                                        {cat.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    />
                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                
                {selectedCategory === 'ui-ux' && (
                    <div className="space-y-3 animate-in fade-in-50">
                        <Label>2. How did it feel?</Label>
                         <Controller
                            name="sentiment"
                            control={control}
                            render={({ field }) => (
                                <div className="grid grid-cols-2 gap-2">
                                     <Button 
                                        type="button" 
                                        variant="outline" 
                                        className={cn("h-16", field.value === 'positive' && "border-green-500 bg-green-500/10 text-green-700")}
                                        onClick={() => field.onChange('positive')}
                                    >
                                        <ThumbsUp className="w-5 h-5 mr-2"/> I liked it
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className={cn("h-16", field.value === 'negative' && "border-red-500 bg-red-500/10 text-red-700")}
                                        onClick={() => field.onChange('negative')}
                                    >
                                        <ThumbsDown className="w-5 h-5 mr-2"/> Needs improvement
                                    </Button>
                                </div>
                            )}
                        />
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="message">
                        {selectedCategory === 'ui-ux' ? '3. Your message' : '2. Your message'}
                    </Label>
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                    Submit Feedback
                </Button>
            </CardFooter>
        </Card>
    </form>
  )
}
