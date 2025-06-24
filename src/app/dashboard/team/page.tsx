"use client"
import { useState } from "react";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, Search, Activity, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal";

export default function TeamPage() {
    const { userProfile } = useAuth();
    const isEnterprise = userProfile?.plan === 'Enterprise' || userProfile?.plan === 'Enterprise Pro';
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    if (!userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) {
        return <UpgradePrompt
            title="Unlock Team Management"
            description="Collaborate with your team, assign roles, and manage compliance together. This is a CA Pro / Enterprise feature."
            icon={<Users className="w-12 h-12 text-primary/20" />}
        />;
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
                     <Card className="interactive-lift">
                        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    {isEnterprise ? "Manage your entire organization." : "Manage roles and permissions for your team."}
                                </CardDescription>
                            </div>
                            <div className="flex w-full sm:w-auto gap-2">
                               <TabsList className="w-full sm:w-auto">
                                <TabsTrigger value="members" className="interactive-lift"><Users className="mr-2 h-4 w-4"/>Members</TabsTrigger>
                                <TabsTrigger value="activity" className="interactive-lift"><Activity className="mr-2 h-4 w-4"/>Activity</TabsTrigger>
                               </TabsList>
                                <Button className="w-full sm:w-auto interactive-lift" onClick={() => setInviteModalOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <TabsContent value="members" className="m-0">
                               <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                    <Users className="w-16 h-16 text-primary/20"/>
                                    <p className="font-semibold text-lg">No Team Members</p>
                                    <p className="text-sm max-w-sm">Invite a member to get started with collaboration.</p>
                                </div>
                           </TabsContent>
                           <TabsContent value="activity" className="m-0">
                               <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
                                    <Activity className="w-16 h-16 text-primary/20"/>
                                    <p className="font-semibold text-lg">No Recent Activity</p>
                                    <p className="text-sm max-w-sm">Team member actions will appear here.</p>
                                </div>
                           </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </>
    )
}
