
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Clock, CheckCircle, Send, Trash2, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import type { Invite } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteClientModal } from "@/components/dashboard/invite-client-modal";

const SentInviteCard = ({ invite, onRevoke }: { invite: Invite, onRevoke: (id: string) => void }) => (
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
                    onClick={() => onRevoke(invite.id)}
                    disabled={invite.status !== 'pending'}
                >
                    Revoke
                </Button>
            </div>
        </CardContent>
    </Card>
);

const ReceivedInviteCard = ({ invite, onAccept, isAccepting }: { invite: Invite, onAccept: (id: string) => void, isAccepting: boolean }) => (
    <Card key={invite.id} className="interactive-lift">
        <CardContent className="p-4 flex items-center justify-between">
            <div>
                <p className="font-semibold">{invite.companyName}</p>
                <p className="text-sm text-muted-foreground">Invited by: {invite.founderName}</p>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</p>
                <Button size="sm" onClick={() => onAccept(invite.id)} disabled={isAccepting}>
                    {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Accept
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default function InvitationsPage() {
    const { userProfile, updateUserProfile, getPendingInvites, acceptInvite } = useAuth();
    const [sentInvites, setSentInvites] = useState<Invite[]>([]);
    const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [isInviteClientModalOpen, setInviteClientModalOpen] = useState(false);
    const { toast } = useToast();

    const isAdvisor = useMemo(() => userProfile?.role === 'CA' || userProfile?.role === 'Legal Advisor', [userProfile]);

    useEffect(() => {
        const fetchInvites = async () => {
            if (!userProfile) return;
            setLoading(true);

            // Founders see invites they've sent
            if (userProfile.role === 'Founder') {
                const founderInvites = userProfile.invites || [];
                setSentInvites(founderInvites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }

            // Advisors see invites they've received
            if (isAdvisor) {
                const pendingInvites = await getPendingInvites();
                setReceivedInvites(pendingInvites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
            setLoading(false);
        };
        fetchInvites();
    }, [userProfile, isAdvisor, getPendingInvites]);
    
    const handleRevoke = async (inviteId: string) => {
        if (!userProfile) return;
        const updatedInvites = sentInvites.filter(i => i.id !== inviteId);
        await updateUserProfile({ invites: updatedInvites });
        toast({title: 'Invite Revoked', description: 'The invitation has been cancelled.'})
    };

    const handleAccept = async (inviteId: string) => {
        setAcceptingId(inviteId);
        try {
            await acceptInvite(inviteId);
            setReceivedInvites(prev => prev.filter(i => i.id !== inviteId));
            toast({ title: 'Connection Successful!', description: 'You can now manage the new client.' });
        } catch(e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setAcceptingId(null);
        }
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    
    return (
        <>
        <InviteClientModal isOpen={isInviteClientModalOpen} onOpenChange={setInviteClientModalOpen} />
        <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                <h1 className="text-3xl font-bold tracking-tight font-headline text-[var(--feature-color,hsl(var(--primary)))]">Invitations</h1>
                <p className="text-muted-foreground">Manage your sent and received collaboration invitations.</p>
            </div>
            
            <Tabs defaultValue={isAdvisor ? "received" : "sent"}>
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="received">Received ({receivedInvites.length})</TabsTrigger>
                    <TabsTrigger value="sent">Sent ({sentInvites.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="received" className="mt-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Received Invitations</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {loading ? <Loader2 className="animate-spin mx-auto"/> : receivedInvites.length > 0 ? (
                                <div className="space-y-4">
                                {receivedInvites.map(invite => (
                                    <ReceivedInviteCard 
                                        key={invite.id}
                                        invite={invite}
                                        onAccept={handleAccept}
                                        isAccepting={acceptingId === invite.id}
                                    />
                                ))}
                                </div>
                            ) : <p className="text-center text-sm text-muted-foreground p-4">No pending invitations.</p>}
                        </CardContent>
                     </Card>
                </TabsContent>
                <TabsContent value="sent" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Sent Invitations</CardTitle>
                             {isAdvisor && <Button variant="outline" onClick={() => setInviteClientModalOpen(true)}><UserPlus className="mr-2 h-4 w-4"/>Invite a Client</Button>}
                        </CardHeader>
                         <CardContent>
                             {loading ? <Loader2 className="animate-spin mx-auto"/> : sentInvites.length > 0 ? (
                                <div className="space-y-4">
                                    {sentInvites.map(invite => (
                                       <SentInviteCard key={invite.id} invite={invite} onRevoke={handleRevoke} />
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
                </TabsContent>
            </Tabs>
        </div>
        </>
    )
}
