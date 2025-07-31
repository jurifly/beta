
"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateForumThreads, type ForumGeneratorOutput } from "@/ai/flows/forum-generator-flow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

type ForumThread = ForumGeneratorOutput["threads"][0];

export default function CommunityPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { deductCredits } = useAuth();

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      if (!await deductCredits(1)) {
        setIsLoading(false);
        setThreads([]);
        return;
      }
      try {
        const response = await generateForumThreads();
        setThreads(response.threads);
      } catch (error) {
        console.error("Failed to generate forum threads:", error);
        toast({
          variant: "destructive",
          title: "Failed to load forum",
          description: "Could not fetch dynamic content for the community forum.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [toast, deductCredits]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-[var(--feature-color,hsl(var(--primary)))]/10 border border-[var(--feature-color,hsl(var(--primary)))]/20">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--feature-color,hsl(var(--primary)))]">Founder & Expert Community</h2>
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
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                             <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                             <div className="text-center w-12">
                                <Skeleton className="h-6 w-full mb-1" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {threads.map(thread => (
                        <Link href="#" key={thread.id}>
                            <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted transition-colors cursor-pointer interactive-lift">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback>{thread.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
            )}
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground">
        <p>Forum content is generated by AI for demonstration purposes.</p>
      </div>
    </div>
  );
}
