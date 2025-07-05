
"use client"

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { saveUpiTransaction } from './actions';
import type { UserPlan } from '@/lib/types';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    
    const [upiId, setUpiId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const purchaseDetails = useMemo(() => {
        const type = searchParams.get('type');
        const plan = searchParams.get('plan');
        const cycle = searchParams.get('cycle');
        const amountStr = searchParams.get('amount');
        const name = searchParams.get('name');
        const creditsStr = searchParams.get('credits');
    
        if (amountStr && !isNaN(parseFloat(amountStr))) {
            const amount = parseFloat(amountStr);
            if (type === 'credit_pack' && name && creditsStr && !isNaN(parseInt(creditsStr))) {
                const credits = parseInt(creditsStr, 10);
                return { type: 'credit_pack' as const, name, amount, credits };
            }
            if (type === 'plan' && plan && name && cycle) {
                return { type: 'plan' as const, name, amount, plan: plan as UserPlan, cycle: cycle as 'monthly' | 'yearly' };
            }
        }
        return null;
    }, [searchParams]);

    const handleVerify = async () => {
        if (!purchaseDetails || !user || !userProfile) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process payment. User not found.' });
            return;
        }
        if (!upiId) {
            toast({ variant: 'destructive', title: 'Missing Info', description: 'Please enter your UPI transaction ID.' });
            return;
        }
        setIsVerifying(true);
        try {
            const baseData = {
                userId: user.uid,
                userEmail: userProfile.email,
                upiTransactionId: upiId,
                name: purchaseDetails.name,
                amount: purchaseDetails.amount,
            };
    
            let transactionData;
    
            if (purchaseDetails.type === 'plan') {
                transactionData = {
                    ...baseData,
                    type: 'plan' as const,
                    plan: purchaseDetails.plan,
                    cycle: purchaseDetails.cycle,
                };
            } else {
                transactionData = {
                    ...baseData,
                    type: 'credit_pack' as const,
                    credits: purchaseDetails.credits,
                };
            }
            
            const result = await saveUpiTransaction(transactionData);
            if(result.success) {
                toast({ title: "Submission Received!", description: result.message });
                setIsSubmitted(true);
            } else {
                toast({ variant: 'destructive', title: 'Submission Failed', description: result.message });
            }
        } catch(e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
            setIsVerifying(false);
        }
    };
    
    if (isSubmitted) {
        return (
             <div className="flex h-full w-full items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4"/>
                        <CardTitle>Verification Submitted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Thank you! Our team will verify your payment and activate your purchase within 24 hours. You can now return to your dashboard.</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => router.push('/dashboard')} className="w-full">Go to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!userProfile) {
        return (
           <div className="flex h-full w-full items-center justify-center p-4">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
       )
    }

    if (!purchaseDetails) {
        return (
            <div className="flex h-full w-full items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader><CardTitle>Invalid Purchase</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">No item selected. Please go back to the billing page.</p></CardContent>
                    <CardFooter><Button onClick={() => router.push('/dashboard/billing')} className="w-full">Go to Billing</Button></CardFooter>
                </Card>
            </div>
        )
    }

    const amountString = purchaseDetails.amount.toFixed(2);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=alex.varghese@superyes&pn=LexIQ&am=${amountString}&cu=INR&tn=LexIQ%20Purchase`;
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="mr-2"/>Back to Billing</Button>
                <h1 className="text-3xl font-bold font-headline">Complete Your Purchase</h1>
                <p className="text-muted-foreground">You are purchasing: <strong>{purchaseDetails.name}</strong> for <strong>₹{purchaseDetails.amount}</strong></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="interactive-lift">
                    <CardHeader><CardTitle>1. Make Payment</CardTitle><CardDescription>Scan the QR code with any UPI app.</CardDescription></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <Image src={qrCodeUrl} alt="UPI QR Code" width={250} height={250} data-ai-hint="qr code"/>
                        <p className="text-sm mt-4 text-muted-foreground">Or pay to UPI ID: <strong>alex.varghese@superyes</strong></p>
                    </CardContent>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader><CardTitle>2. Submit for Verification</CardTitle><CardDescription>Enter the UPI Transaction ID from your payment app to confirm.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="upiId">UPI Transaction ID</Label>
                            <Input id="upiId" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. 4182... or T2024..."/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleVerify} disabled={isVerifying || !upiId} className="w-full">
                            {isVerifying && <Loader2 className="mr-2 animate-spin"/>}
                            Submit for Verification
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
