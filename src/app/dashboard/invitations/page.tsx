
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Building, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function InvitationsPage() {
    const { userProfile, getPendingInvites, acceptInvite } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile?.role === 'CA') {
            getPendingInvites().then(setInvites).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [userProfile, getPendingInvites]);
    
    const handleAccept = async (inviteId: string) => {
        setAcceptingId(inviteId);
        try {
            await acceptInvite(inviteId);
            setInvites(prev => prev.filter(i => i.id !== inviteId));
            toast({ title: 'Connection Successful!', description: 'You can now manage the new client.' });
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setAcceptingId(null);
        }
    }

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (userProfile?.role !== 'CA') {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="text-center">
                    <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
                    <CardContent><p>This page is only available for CA accounts.</p></CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Client Invitations</h1>
                <p className="text-muted-foreground">Accept invitations from founders to manage their companies.</p>
            </div>
            
            <Card className="interactive-lift">
                <CardHeader>
                    <CardTitle>Pending Invites ({invites.length})</CardTitle>
                    <CardDescription>Invitations from founders waiting for your approval.</CardDescription>
                </CardHeader>
                <CardContent>
                    {invites.length > 0 ? (
                        <div className="space-y-4">
                            {invites.map(invite => (
                                <Card key={invite.id} className="interactive-lift">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Building className="w-5 h-5 text-primary"/>
                                                <p className="font-semibold text-lg">{invite.companyName}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <User className="w-4 h-4"/>
                                                <span>Invited by: {invite.founderName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <p className="text-xs text-muted-foreground flex-1 sm:flex-initial">
                                                {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                            </p>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleAccept(invite.id)} 
                                                disabled={!!acceptingId}
                                                className="w-full sm:w-auto"
                                            >
                                                {acceptingId === invite.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                Accept
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                            <Mail className="w-16 h-16 text-primary/20"/>
                            <p className="font-semibold text-lg">No Pending Invitations</p>
                            <p className="text-sm max-w-sm">When a founder invites you to manage their company, it will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
