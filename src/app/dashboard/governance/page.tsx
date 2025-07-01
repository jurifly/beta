
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Sparkles, FileText, List, Download, Send, Trash2, Edit, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateAgenda, generateMinutes } from './actions';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import ReactMarkdown from 'react-markdown';
import type { GovernanceActionItem, BoardMeeting } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScheduleMeetingModal } from '@/components/dashboard/schedule-meeting-modal';


const mockMeetings: BoardMeeting[] = [
    {
      id: 'meeting1',
      title: 'Q2 2024 Board Meeting',
      date: '2024-07-25',
      agenda: 'Q2 Financial Review, Product Roadmap Update, Q3 Hiring Plan',
      minutes: 'Minutes for Q2 meeting...',
      actionItems: [
        { id: 'item1', task: 'Finalize Q3 budget', assignee: 'CFO', dueDate: '2024-08-10', completed: false },
        { id: 'item2', task: 'Send updated product mockups to board', assignee: 'CPO', dueDate: '2024-08-05', completed: true },
      ]
    }
];

export default function GovernancePage() {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState({ agenda: false, minutes: false });
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetings, setMeetings] = useState<BoardMeeting[]>(mockMeetings);
  const [isModalOpen, setModalOpen] = useState(false);

  if (!userProfile) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  
  const handleScheduleMeeting = (data: Omit<BoardMeeting, 'id' | 'actionItems' | 'minutes'>) => {
    const newMeeting: BoardMeeting = {
        id: `meeting-${Date.now()}`,
        ...data,
        actionItems: [],
    };
    setMeetings(prev => [newMeeting, ...prev]);
  };

  const handleToggleActionItem = (meetingId: string, actionItemId: string) => {
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => {
        if (meeting.id === meetingId) {
          const updatedActionItems = meeting.actionItems.map(item => {
            if (item.id === actionItemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          return { ...meeting, actionItems: updatedActionItems };
        }
        return meeting;
      })
    );
  };

  return (
    <>
      <ScheduleMeetingModal 
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onScheduleMeeting={handleScheduleMeeting}
      />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Governance Hub</h2>
          <p className="text-muted-foreground">Manage board meetings, generate minutes, and track action items with AI.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
               <TabsList>
                  <TabsTrigger value="meetings">Board Meetings</TabsTrigger>
                  <TabsTrigger value="generator">AI Tools</TabsTrigger>
               </TabsList>
               {activeTab === 'meetings' && <Button onClick={() => setModalOpen(true)}><Plus className="mr-2"/>Schedule Meeting</Button>}
            </div>
            <TabsContent value="meetings" className="mt-6">
              <Card>
                  <CardHeader><CardTitle>Upcoming & Past Meetings</CardTitle></CardHeader>
                  <CardContent>
                      {meetings.length > 0 ? meetings.map(meeting => (
                          <Card key={meeting.id} className="mb-4">
                              <CardHeader>
                                  <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                        <CardDescription>Date: {format(new Date(meeting.date), 'PPP')}</CardDescription>
                                      </div>
                                      <div className="flex gap-2">
                                          <Button variant="outline" size="sm" disabled>View Minutes</Button>
                                          <Button variant="outline" size="sm" disabled>View Agenda</Button>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <h4 className="font-semibold text-sm mb-2">Action Items</h4>
                                  <div className="space-y-2">
                                      {meeting.actionItems.map(item => (
                                          <div key={item.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/50">
                                              <Checkbox 
                                                checked={item.completed} 
                                                onCheckedChange={() => handleToggleActionItem(meeting.id, item.id)}
                                              />
                                              <div className="flex-1">
                                                  <p className="text-sm font-medium">{item.task}</p>
                                                  <p className="text-xs text-muted-foreground">Assignee: {item.assignee} | Due: {format(new Date(item.dueDate), 'PPP')}</p>
                                              </div>
                                              <Badge variant={item.completed ? "secondary" : "outline"}>{item.completed ? "Done" : "Pending"}</Badge>
                                          </div>
                                      ))}
                                  </div>
                              </CardContent>
                          </Card>
                      )) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md">
                            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="font-semibold">No Meetings Scheduled</p>
                            <p className="text-sm">Click "Schedule Meeting" to get started.</p>
                        </div>
                      )}
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="generator" className="mt-6 grid md:grid-cols-2 gap-6 items-start">
               <AgendaGenerator legalRegion={userProfile.legalRegion} />
               <MinutesGenerator legalRegion={userProfile.legalRegion} />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}


function AgendaGenerator({ legalRegion }: { legalRegion: string }) {
    const [topics, setTopics] = useState('');
    const [meetingType, setMeetingType] = useState('Quarterly Board Meeting');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topics.trim()) {
            toast({ variant: 'destructive', title: 'Missing Topics', description: 'Please enter at least one topic for the agenda.' });
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const topicList = topics.split('\n').filter(t => t.trim() !== '');
            const response = await generateAgenda({ meetingType, topics: topicList, legalRegion });
            
            let agendaText = `# ${response.title}\n\n`;
            response.agenda.forEach(item => {
                agendaText += `## ${item.topic} (${item.time_allocated})\n`;
                agendaText += `**Presenter:** ${item.presenter}\n\n`;
                agendaText += `${item.description}\n\n`;
            });
            setResult(agendaText);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Agenda Generator</CardTitle>
                <CardDescription>Create a professional meeting agenda in seconds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="meetingType">Meeting Type</Label>
                    <Input id="meetingType" value={meetingType} onChange={e => setMeetingType(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="topics">Key Topics (one per line)</Label>
                    <Textarea id="topics" value={topics} onChange={e => setTopics(e.target.value)} placeholder="Q2 Financial Review&#10;New Product Launch Plan&#10;ESOP Pool Top-up" className="min-h-[120px]" />
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />} Generate Agenda
                </Button>
            </CardContent>
            {result && (
                <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                    <h3 className="font-semibold">Generated Agenda:</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none w-full h-64 overflow-y-auto p-4 border rounded-md bg-muted/50">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

function MinutesGenerator({ legalRegion }: { legalRegion: string }) {
    const [notes, setNotes] = useState('');
    const [attendees, setAttendees] = useState('');
    const [agenda, setAgenda] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!notes.trim() || !agenda.trim() || !attendees.trim()) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide agenda, attendees, and notes.' });
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const attendeeList = attendees.split(',').map(a => a.trim());
            const response = await generateMinutes({ agenda, attendees: attendeeList, notes, legalRegion });
            setResult(response.minutes);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Minutes Generator</CardTitle>
                <CardDescription>Convert your raw notes into formal meeting minutes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="agenda">Meeting Agenda</Label>
                    <Textarea id="agenda" value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="Paste the meeting agenda here..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="attendees">Attendees (comma-separated)</Label>
                    <Input id="attendees" value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="e.g. John Doe, Jane Smith" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Raw Notes & Decisions</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="- John presented Q2 figs, profit up 10%...&#10;- Jane demoed new feature, board approved launch for Aug 1st..." className="min-h-[120px]" />
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />} Generate Minutes
                </Button>
            </CardContent>
            {result && (
                <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                    <h3 className="font-semibold">Generated Minutes:</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none w-full h-64 overflow-y-auto p-4 border rounded-md bg-muted/50">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
