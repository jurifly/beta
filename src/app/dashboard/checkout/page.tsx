
"use client"

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import Image from 'next/image';
import { saveUpiTransaction } from './actions';
import type { UserPlan } from '@/lib/types';

export default function CheckoutPage() {
    const router = useRouter();
    
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <CardTitle>Payment System Unavailable</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Our payment system is currently under maintenance. Please check back later. All existing subscriptions are unaffected.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard')} className="w-full">Go to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
