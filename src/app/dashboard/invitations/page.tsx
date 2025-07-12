
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import type { Invite } from "@/lib/types";

export default function InvitationsPage() {
    const { userProfile, updateUserProfile } = useAuth();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile?.role === 'Founder') {
            const founderInvites = userProfile.invites || [];
            setInvites(founderInvites.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        } else {
             router.push('/dashboard/ca-connect');
        }
    }, [userProfile, router]);
    
    const handleRevoke = async (inviteId: string) => {
        if (!userProfile) return;
        const updatedInvites = invites.filter(i => i.id !== inviteId);
        await updateUserProfile({ invites: updatedInvites });
        // Here you would also update the invite document in Firestore to 'revoked'
        toast({title: 'Invite Revoked', description: 'The invitation has been cancelled.'})
    }

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (userProfile?.role !== 'Founder') {
        return null;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Sent Invitations</h1>
                <p className="text-muted-foreground">Track the status of invitations sent to your advisors.</p>
            </div>
            
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Invite History ({invites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {invites.length > 0 ? (
                        <div className="space-y-4">
                            {invites.map(invite => (
                                <Card key={invite.id} className="interactive-lift">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-primary"/>
                                                <p className="font-semibold text-lg">{invite.caEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                               {invite.status === 'pending' ? <Clock className="w-4 h-4 text-amber-500" /> : <CheckCircle className="w-4 h-4 text-green-500" /> }
                                                <span>Status: <span className="capitalize">{invite.status}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <p className="text-xs text-muted-foreground flex-1 sm:flex-initial">
                                                {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                            </p>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleRevoke(invite.id)}
                                                disabled={invite.status !== 'pending'}
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                            <Mail className="w-16 h-16 text-primary/20"/>
                            <p className="font-semibold text-lg">No Invitations Sent</p>
                            <p className="text-sm max-w-sm">Go to the Advisor Hub to invite your CA or financial advisor.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
