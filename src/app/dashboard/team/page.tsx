
"use client"
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, Search, Activity, Loader2, Shield, Eye, Edit, Trash2, Mail, Send, Workflow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember, Invite } from '@/lib/types';


const mockRoles = [
    { name: 'Admin', description: 'Full access to all features, including billing and team management.', permissions: 12, icon: Shield },
    { name: 'Member', description: 'Can view and edit documents, and use AI tools. Cannot manage team or billing.', permissions: 7, icon: Edit },
    { name: 'Viewer', description: 'Can only view documents and data. Cannot make any changes.', permissions: 3, icon: Eye },
];

export default function TeamPage() {
    const { userProfile, revokeTeamInvite, removeTeamMember } = useAuth();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const { toast } = useToast();

    const teamMembers = useMemo(() => userProfile?.teamMembers || [], [userProfile]);
    const pendingInvites = useMemo(() => (userProfile?.invites || []).filter(inv => inv.type === 'team_invite'), [userProfile]);
    const activityLog = useMemo(() => userProfile?.activityLog || [], [userProfile]);

    const handleRevokeInvite = async (inviteId: string) => {
        const result = await revokeTeamInvite(inviteId);
        if (result.success) {
            toast({ title: "Invite Revoked", description: "The invitation has been successfully revoked." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.message });
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (memberId === userProfile?.uid) {
            toast({ variant: 'destructive', title: "Action not allowed", description: "You cannot remove yourself from the workspace." });
            return;
        }
        if (window.confirm("Are you sure you want to remove this team member?")) {
            const result = await removeTeamMember(memberId);
            if (result.success) {
                toast({ title: "Member Removed", description: "The team member has been removed from the workspace." });
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.message });
            }
        }
    };

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <InviteMemberModal isOpen={isInviteModalOpen} onOpenChange={setInviteModalOpen} />
            <div className="space-y-6">
                <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Team Workspace</h2>
                    <p className="text-muted-foreground">
                        Invite and manage your team members, assign roles, and track activity.
                    </p>
                </div>
                <Tabs defaultValue="members">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                       <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
                        <TabsTrigger value="members" className="interactive-lift"><Users className="mr-2 h-4 w-4"/>Members ({teamMembers.length})</TabsTrigger>
                        <TabsTrigger value="invitations" className="interactive-lift"><Mail className="mr-2 h-4 w-4"/>Invitations ({pendingInvites.length})</TabsTrigger>
                        <TabsTrigger value="roles" className="interactive-lift"><Shield className="mr-2 h-4 w-4"/>Roles</TabsTrigger>
                        <TabsTrigger value="activity" className="interactive-lift"><Activity className="mr-2 h-4 w-4"/>Activity</TabsTrigger>
                       </TabsList>
                        <Button className="w-full sm:w-auto interactive-lift" onClick={() => setInviteModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </div>
                   <TabsContent value="members" className="mt-6">
                       <Card>
                           <CardHeader><CardTitle>Team Members</CardTitle><CardDescription>Manage who has access to your workspace.</CardDescription></CardHeader>
                           <CardContent>
                               <Table>
                                   <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                   <TableBody>
                                    {teamMembers.length > 0 ? teamMembers.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar><AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} disabled={member.id === userProfile.uid}>
                                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No team members yet.</TableCell></TableRow>
                                    )}
                                   </TableBody>
                               </Table>
                           </CardContent>
                       </Card>
                   </TabsContent>
                   <TabsContent value="invitations" className="mt-6">
                       <Card>
                           <CardHeader><CardTitle>Pending Invitations</CardTitle><CardDescription>These people have been invited but have not yet joined.</CardDescription></CardHeader>
                           <CardContent>
                               <Table>
                                   <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Invited</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                   <TableBody>
                                       {pendingInvites.length > 0 ? pendingInvites.map(invite => (
                                           <TableRow key={invite.id}>
                                               <TableCell className="font-medium">{invite.caEmail}</TableCell>
                                               <TableCell><Badge variant="secondary">{invite.role}</Badge></TableCell>
                                               <TableCell>{formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</TableCell>
                                               <TableCell className="text-right space-x-2">
                                                   <Button variant="ghost" size="sm" onClick={() => toast({ title: "Invite Resent", description: `An invitation has been resent to ${invite.caEmail}`})}><Send className="mr-2"/> Resend</Button>
                                                   <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevokeInvite(invite.id)}><Trash2 className="mr-2"/>Revoke</Button>
                                               </TableCell>
                                           </TableRow>
                                       )) : (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">No pending invitations.</TableCell></TableRow>
                                       )}
                                   </TableBody>
                               </Table>
                           </CardContent>
                       </Card>
                   </TabsContent>
                   <TabsContent value="roles" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center"><div><CardTitle>Access Roles</CardTitle><CardDescription>Define permissions for your team members.</CardDescription></div><Button variant="outline" disabled><PlusCircle className="mr-2"/>New Role</Button></CardHeader>
                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockRoles.map(role => (
                                    <Card key={role.name}>
                                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><role.icon className="w-5 h-5"/>{role.name}</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">{role.description}</p></CardContent>
                                        <CardFooter><p className="text-xs text-muted-foreground">{role.permissions} Permissions</p></CardFooter>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                   </TabsContent>
                   <TabsContent value="activity" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Activity Log</CardTitle><CardDescription>An audit trail of all actions taken in your workspace.</CardDescription></CardHeader>
                            <CardContent>
                                {activityLog.length > 0 ? (
                                <div className="space-y-4">
                                {activityLog.map(log => (
                                    <div key={log.id} className="flex items-center gap-4">
                                        <Avatar><AvatarFallback>{log.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="text-sm"><span className="font-medium">{log.userName}</span> {log.action.toLowerCase()}.</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                ) : (
                                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md bg-muted/40">
                                        <Activity className="mx-auto w-12 h-12 text-primary/20 mb-4"/>
                                        <p className="font-semibold">No activity yet</p>
                                        <p className="text-sm">Team actions will be logged here.</p>
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
