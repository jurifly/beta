
"use client"
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { Loader2, CheckCircle, RefreshCw, KeyRound } from 'lucide-react';
import type { UserPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState } from 'react';
import { saveTransactionId } from './actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const planDetails = {
  founder: { monthly: 199, yearly: 999 },
  pro: { monthly: 799, yearly: 7990 },
  enterprise: { monthly: 2999, yearly: 29990 },
};

const initialFormState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useActionState(saveTransactionId, initialFormState);
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
      Submit for Verification
    </Button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [plan, setPlan] = useState<keyof typeof planDetails | null>(null);
  const [cycle, setCycle] = useState<'monthly' | 'yearly' | null>(null);
  const [amount, setAmount] = useState(0);
  const [transactionDocId, setTransactionDocId] = useState<string | null>(null);

  const [state, formAction] = useActionState(saveTransactionId, initialFormState);

  useEffect(() => {
    const planParam = searchParams.get('plan') as keyof typeof planDetails;
    const cycleParam = searchParams.get('cycle') as 'monthly' | 'yearly';
    
    if (planParam && cycleParam && planDetails[planParam]) {
        setPlan(planParam);
        setCycle(cycleParam);
        const newAmount = planDetails[planParam][cycleParam];
        setAmount(newAmount);
    } else {
        toast({ variant: "destructive", title: "Invalid Plan", description: "Redirecting back to billing." });
        router.replace('/dashboard/billing');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (user && plan && cycle && amount > 0 && !transactionDocId) {
      const createTransaction = async () => {
        try {
          const docRef = await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            plan,
            cycle,
            amount,
            status: 'initiated',
            createdAt: new Date().toISOString(),
          });
          setTransactionDocId(docRef.id);
        } catch (error) {
          console.error("Error creating transaction:", error);
          toast({ variant: "destructive", title: "Checkout Error", description: "Could not initiate the transaction." });
        }
      };
      createTransaction();
    }
  }, [user, plan, cycle, amount, transactionDocId, toast]);

  if (!userProfile || !plan || !cycle) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg font-medium">Preparing your checkout...</p>
      </div>
    );
  }

  const upiId = "your-upi-id@okhdfcbank"; // Replace with your actual UPI ID
  const upiLink = `upi://pay?pa=${upiId}&pn=LexiQA&am=${amount}&cu=INR&tn=Payment for ${plan}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="flex items-center justify-center min-h-full bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Scan the QR code with any UPI app to pay</CardDescription>
          <p className="text-3xl font-bold pt-2">₹{amount}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {transactionDocId ? (
            <>
              <div className="flex items-center justify-center">
                <Image src={qrCodeUrl} alt="UPI QR Code" width={250} height={250} />
              </div>
              
              <div className="flex items-center justify-center text-sm text-muted-foreground before:flex-1 before:border-t before:mr-4 after:flex-1 after:border-t after:ml-4">OR</div>

              <Button asChild variant="outline" className="w-full">
                <a href={upiLink}>Pay with UPI App</a>
              </Button>
              
              <div className="border-t pt-6">
                {state.success ? (
                  <Alert className="border-green-500/50 text-green-700 [&>svg]:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Submission Successful!</AlertTitle>
                    <AlertDescription>
                      {state.message} Your plan will be activated within 24 hours after verification.
                      <Button variant="link" onClick={() => router.push('/dashboard')} className="block p-0 h-auto text-green-700">Go to Dashboard</Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form action={formAction} className="space-y-4">
                    <input type="hidden" name="transactionDocId" value={transactionDocId} />
                    <div className="space-y-1">
                      <Label htmlFor="transactionId">Enter UPI Transaction ID</Label>
                      <Input id="transactionId" name="transactionId" required placeholder="e.g., 202401011234567890"/>
                    </div>
                    {state.message && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
                    <SubmitButton />
                  </form>
                )}
              </div>
            </>
          ) : (
             <div className="flex flex-col h-full w-full items-center justify-center gap-4 p-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Generating secure transaction...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
