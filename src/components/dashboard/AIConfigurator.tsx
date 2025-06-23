'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getDashboardSuggestions, type State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const initialState: State = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending} aria-disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Suggestions
    </Button>
  );
}

export default function AIConfigurator() {
  const [state, formAction] = useFormState(getDashboardSuggestions, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.data) {
        toast({
          title: "Success!",
          description: state.message,
        })
      } else if (state.errors && Object.keys(state.errors).length > 0) {
        // Validation errors are handled inline
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: state.message,
        })
      }
    }
  }, [state, toast]);

  return (
    <div className="py-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessGoal">Your Business Goal</Label>
          <Textarea
            id="businessGoal"
            name="businessGoal"
            placeholder="e.g., Increase user retention by 20% in the next quarter."
            rows={4}
            required
            aria-describedby="goal-error"
          />
          {state.errors?.businessGoal &&
            <p id="goal-error" className="text-sm font-medium text-destructive">
              {state.errors.businessGoal[0]}
            </p>
          }
        </div>
        <SubmitButton />
      </form>

      {state.data && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-500">
            <h3 className="text-lg font-semibold">Suggested Key Metrics</h3>
            <Card>
              <CardContent className="p-4">
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {state.data.keyMetrics.map((metric, index) => (
                    <li key={index}>{metric}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <h3 className="text-lg font-semibold mt-4">Dashboard Configuration (JSON)</h3>
            <Card>
                <CardContent className="p-2">
                    <pre className="text-xs whitespace-pre-wrap break-all bg-muted p-4 rounded-md">
                        <code>
                            {JSON.stringify(JSON.parse(state.data.dashboardConfiguration), null, 2)}
                        </code>
                    </pre>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
