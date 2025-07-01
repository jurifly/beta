
"use client"
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, Search, Activity, Loader2, Shield, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal";
import { formatDistanceToNow } from "date-fns";

const mockMembers = [
    { id: '1', name: 'Alia Bhatt', email: 'alia@example.com', role: 'Admin', avatar: 'AB' },
    { id: '2', name: 'Ranbir Kapoor', email: 'ranbir@example.com', role: 'Member', avatar: 'RK' },
    { id: '3', name: 'Deepika Padukone', email: 'deepika@example.com', role: 'Member', avatar: 'DP' },
    { id: '4', name: 'Ranveer Singh', email: 'ranveer@example.com', role: 'Billing', avatar: 'RS' },
];

const mockRoles = [
    { name: 'Admin', description: 'Full access to all features, including billing and team management.', permissions: 12, icon: Shield },
    { name: 'Member', description: 'Can view and edit documents, but cannot manage billing or team members.', permissions: 7, icon: Edit },
    { name: 'Viewer', description: 'Can only view documents and data. Cannot make any changes.', permissions: 3, icon: Eye },
];

const mockActivity = [
    { id: '1', user: 'Alia Bhatt', action: 'Invited ranbir@example.com', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '2', user: 'Ranbir Kapoor', action: 'Uploaded "Series A SHA.pdf"', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: '3', user: 'Alia Bhatt', action: 'Changed the role of Deepika Padukone to "Member"', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

export default function TeamPage() {
    const { userProfile } = useAuth();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <InviteMemberModal isOpen={isInviteModalOpen} onOpenChange={setInviteModalOpen} />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Workspace</h2>
                    <p className="text-muted-foreground">
                        Invite and manage your team members, assign roles, and track activity.
                    </p>
                </div>
                <Tabs defaultValue="members">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                       <TabsList>
                        <TabsTrigger value="members" className="interactive-lift"><Users className="mr-2 h-4 w-4"/>Members</TabsTrigger>
                        <TabsTrigger value="roles" className="interactive-lift"><Shield className="mr-2 h-4 w-4"/>Roles</TabsTrigger>
                        <TabsTrigger value="activity" className="interactive-lift"><Activity className="mr-2 h-4 w-4"/>Activity</TabsTrigger>
                       </TabsList>
                        <Button className="w-full sm:w-auto interactive-lift" onClick={() => setInviteModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </div>
                   <TabsContent value="members" className="mt-6">
                       <Card>
                           <CardHeader><CardTitle>Team Members ({mockMembers.length})</CardTitle><CardDescription>Manage who has access to your workspace.</CardDescription></CardHeader>
                           <CardContent>
                               <Table>
                                   <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                   <TableBody>
                                       {mockMembers.map(member => (
                                           <TableRow key={member.id}>
                                               <TableCell className="flex items-center gap-3"><Avatar><AvatarFallback>{member.avatar}</AvatarFallback></Avatar><div><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></div></TableCell>
                                               <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                               <TableCell className="text-right"><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive"/></Button></TableCell>
                                           </TableRow>
                                       ))}
                                   </TableBody>
                               </Table>
                           </CardContent>
                       </Card>
                   </TabsContent>
                   <TabsContent value="roles" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center"><div><CardTitle>Access Roles</CardTitle><CardDescription>Define permissions for your team members.</CardDescription></div><Button variant="outline"><PlusCircle className="mr-2"/>New Role</Button></CardHeader>
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
                                <div className="space-y-4">
                                {mockActivity.map(log => (
                                    <div key={log.id} className="flex items-center gap-4">
                                        <Avatar><AvatarFallback>{log.user.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="text-sm"><span className="font-medium">{log.user}</span> {log.action.toLowerCase()}.</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>
                   </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
