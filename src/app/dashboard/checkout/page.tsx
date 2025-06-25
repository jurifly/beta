"use client"
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { Loader2, CheckCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const planDetails = {
  founder: { monthly: 199, yearly: 999 },
  pro: { monthly: 799, yearly: 7990 },
  enterprise: { monthly: 2999, yearly: 29990 },
};


export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [checkoutItem, setCheckoutItem] = useState<{
    type: 'plan' | 'credits';
    name: string;
    amount: number;
    plan?: keyof typeof planDetails;
    cycle?: 'monthly' | 'yearly';
    credits?: number;
  } | null>(null);

  const [transactionDocId, setTransactionDocId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);


  useEffect(() => {
    const planParam = searchParams.get('plan') as keyof typeof planDetails;
    const cycleParam = searchParams.get('cycle') as 'monthly' | 'yearly';
    const creditsParam = searchParams.get('credits');
    const priceParam = searchParams.get('price');

    if (planParam && cycleParam && planDetails[planParam]) {
        const newAmount = planDetails[planParam][cycleParam];
        setCheckoutItem({
            type: 'plan',
            name: `${planParam.charAt(0).toUpperCase() + planParam.slice(1)} Plan (${cycleParam})`,
            amount: newAmount,
            plan: planParam,
            cycle: cycleParam,
        });
    } else if (creditsParam && priceParam) {
        setCheckoutItem({
            type: 'credits',
            name: `${creditsParam} Credits Pack`,
            amount: Number(priceParam),
            credits: Number(creditsParam),
        });
    } else {
        toast({ variant: "destructive", title: "Invalid Request", description: "Redirecting back to billing." });
        router.replace('/dashboard/billing');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (user && userProfile && checkoutItem && !transactionDocId) {
      const createTransaction = async () => {
        try {
          const docRef = await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            userName: userProfile.name,
            ...checkoutItem,
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
  }, [user, userProfile, checkoutItem, transactionDocId, toast]);
  
  const handleUpiSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const transactionId = formData.get('transactionId') as string;

    if (!transactionId || !transactionDocId) {
        toast({ variant: "destructive", title: "Error", description: "Missing transaction details." });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const transactionRef = doc(db, 'transactions', transactionDocId);
        await updateDoc(transactionRef, {
            upiTransactionId: transactionId,
            status: 'pending_verification',
        });
        toast({
            title: "Submission Successful!",
            description: "Your purchase will be verified and applied to your account shortly."
        });
        setIsSubmitted(true);
    } catch (error: any) {
        console.error('Error saving transaction ID:', error);
        toast({ variant: "destructive", title: "Submission Failed", description: error.message || 'An unexpected error occurred.' });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (!userProfile || !checkoutItem) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg font-medium">Preparing your checkout...</p>
      </div>
    );
  }

  const upiId = "your-upi-id@okhdfcbank"; // Replace with your actual UPI ID
  const upiLink = `upi://pay?pa=${upiId}&pn=Clausey&am=${checkoutItem.amount}&cu=INR&tn=Payment for ${checkoutItem.name}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="flex items-center justify-center min-h-full bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>Scan the QR code with any UPI app to pay</CardDescription>
          <p className="text-3xl font-bold pt-2">₹{checkoutItem.amount}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {transactionDocId ? (
            <>
              <div className="flex items-center justify-center">
                <Image src={qrCodeUrl} alt="UPI QR Code" width={250} height={250} />
              </div>
              
              <div className="flex items-center justify-center text-sm text-muted-foreground before:flex-1 before:border-t before:mr-4 after:flex-1 after:border-t after:ml-4">OR</div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="w-full">
                    <a href={upiLink}>Pay with UPI App</a>
                </Button>
                 <Button variant="secondary" className="w-full" onClick={() => { navigator.clipboard.writeText(upiId); toast({title: "Copied!", description: "UPI ID copied to clipboard."}) }}>
                    Copy UPI ID
                </Button>
              </div>

              <div className="border-t pt-6">
                {isSubmitted ? (
                  <Alert className="border-green-500/50 text-green-700 [&>svg]:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription>
                      Your plan will be activated within 24 hours after verification. You can now return to your dashboard.
                      <Button variant="link" onClick={() => router.push('/dashboard')} className="block p-0 h-auto text-green-700">Go to Dashboard</Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="transactionId">Enter UPI Transaction ID</Label>
                      <Input id="transactionId" name="transactionId" required placeholder="e.g., 202401011234567890"/>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        Submit for Verification
                    </Button>
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
