
"use client"

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { initiateTransaction, verifyPayment } from './actions';
import type { Transaction } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [upiId, setUpiId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    const purchaseDetails = useMemo(() => {
        const plan = searchParams.get('plan');
        const cycle = searchParams.get('cycle');
        const credits = searchParams.get('credits');
        const amount = searchParams.get('amount');
        const name = searchParams.get('name');

        if (plan && amount) {
            return { type: 'plan' as const, name: `${plan} Plan`, amount: Number(amount), plan, cycle };
        }
        if (credits && amount && name) {
            return { type: 'credits' as const, name: name, amount: Number(amount), credits: Number(credits) };
        }
        return null;
    }, [searchParams]);

    useEffect(() => {
        if (!purchaseDetails || !user) return;

        const startTransaction = async () => {
            try {
                const newTransaction = await initiateTransaction({
                    userId: user.uid,
                    type: purchaseDetails.type,
                    name: purchaseDetails.name,
                    amount: purchaseDetails.amount,
                    plan: purchaseDetails.plan,
                    cycle: purchaseDetails.cycle as any,
                    credits: purchaseDetails.credits,
                });
                setTransaction(newTransaction);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not initiate transaction. Please try again.' });
                router.push('/dashboard/billing');
            }
        };

        startTransaction();
    }, [purchaseDetails, user, toast, router]);
    
    const handleVerify = async () => {
        if (!transaction || !upiId) {
            toast({ variant: 'destructive', title: 'Missing Info', description: 'Please enter a transaction ID.' });
            return;
        }
        setIsVerifying(true);
        try {
            const result = await verifyPayment(transaction.id!, upiId);
            if(result.success) {
                toast({ title: "Payment Successful!", description: result.message });
                router.push('/dashboard');
            } else {
                toast({ variant: 'destructive', title: 'Verification Failed', description: result.message });
            }
        } catch(e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
            setIsVerifying(false);
        }
    };

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
    
    if (!transaction) {
         return (
            <div className="flex h-full w-full items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=successteam@icici&pn=Clausey&am=${transaction.amount}&cu=INR&tn=Clausey%20Purchase%20${transaction.id}`;
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="mr-2"/>Back to Billing</Button>
                <h1 className="text-3xl font-bold font-headline">Complete Your Purchase</h1>
                <p className="text-muted-foreground">You are purchasing: <strong>{transaction.name}</strong> for <strong>₹{transaction.amount}</strong></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="interactive-lift">
                    <CardHeader><CardTitle>1. Make Payment</CardTitle><CardDescription>Scan the QR code with any UPI app.</CardDescription></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <Image src={qrCodeUrl} alt="UPI QR Code" width={250} height={250} data-ai-hint="qr code"/>
                        <p className="text-sm mt-4 text-muted-foreground">Or pay to UPI ID: <strong>successteam@icici</strong></p>
                    </CardContent>
                </Card>
                 <Card className="interactive-lift">
                    <CardHeader><CardTitle>2. Verify Payment</CardTitle><CardDescription>Enter the UPI Transaction ID from your payment app to confirm.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="upiId">UPI Transaction ID</Label>
                            <Input id="upiId" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. 4182... or T2024..."/>
                        </div>
                        <Alert>
                            <ShieldCheck className="h-4 w-4" />
                            <AlertTitle>This is a simulated payment</AlertTitle>
                            <AlertDescription>
                                Enter any 12-digit number (e.g., `123456789012`) to simulate a successful payment.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleVerify} disabled={isVerifying || !upiId} className="w-full">
                            {isVerifying && <Loader2 className="mr-2 animate-spin"/>}
                            Verify & Complete Purchase
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
