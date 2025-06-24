
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const mockThreads = [
  { id: 1, title: "How to handle TDS on foreign payments for SaaS subscriptions?", author: "Rohan S.", replies: 5, tag: "Taxation" },
  { id: 2, title: "Best practices for drafting a Founders' Agreement?", author: "Priya K.", replies: 12, tag: "Legal" },
  { id: 3, title: "What are the key compliance deadlines for a Pvt Ltd in Q3?", author: "Ankit J.", replies: 8, tag: "Compliance" },
  { id: 4, title: "Looking for a good CA in Bangalore for a seed-stage startup.", author: "Sneha M.", replies: 15, tag: "Networking" },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Founder & Expert Community</h2>
        <p className="text-muted-foreground">
          Ask questions, share knowledge, and connect with fellow founders and professionals.
        </p>
      </div>

      <Card className="interactive-lift">
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Forum Topics</CardTitle>
                <CardDescription>
                    Browse ongoing discussions or start a new one.
                </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
                <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search discussions..." className="pl-10" />
                </div>
                <Button className="w-full sm:w-auto interactive-lift">
                    <PlusCircle className="mr-2 h-4 w-4" /> New Post
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {mockThreads.map(thread => (
                    <Link href="#" key={thread.id}>
                        <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted transition-colors cursor-pointer interactive-lift">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{thread.author.slice(0,2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">{thread.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Posted by {thread.author}
                                        <Badge variant="outline" className="ml-2">{thread.tag}</Badge>
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">{thread.replies}</p>
                                <p className="text-xs text-muted-foreground">Replies</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground">
        <p>This is a mock UI for demonstration purposes.</p>
      </div>
    </div>
  );
}
