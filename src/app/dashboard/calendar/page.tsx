
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Calendar as CalendarIcon,
  Receipt,
  ClipboardCheck,
  Save,
  ListX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { format, startOfToday, formatDistanceToNowStrict } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type EventType = "Corporate Filing" | "Tax Filing" | "Other Task" | "Custom";

type Event = {
  id: string;
  date: Date;
  title: string;
  type: EventType;
  status: "overdue" | "upcoming" | "completed";
}

const addTaskSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    type: z.string().min(1, "Please select a type."),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

const AddTaskModal = ({ isOpen, onOpenChange, onAddTask }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onAddTask: (data: AddTaskFormData) => void }) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AddTaskFormData>({
        resolver: zodResolver(addTaskSchema),
        defaultValues: { title: '', date: '', type: 'Custom' }
    });

    const onSubmit = (data: AddTaskFormData) => {
        onAddTask(data);
        reset();
    };
    
    useEffect(() => {
        if (!isOpen) reset();
    }, [isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a Custom Task</DialogTitle>
                    <DialogDescription>Add a new event or deadline to your compliance calendar.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" {...control.register("title")} placeholder="e.g., Board Meeting" />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Due Date</Label>
                            <Input id="date" type="date" {...control.register("date")} />
                            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                        </div>
                        <div className="space-y-2">
                             <Label>Type</Label>
                             <Controller name="type" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                        <SelectItem value="Corporate Filing">Corporate Filing</SelectItem>
                                        <SelectItem value="Tax Filing">Tax Filing</SelectItem>
                                        <SelectItem value="Other Task">Other Task</SelectItem>
                                    </SelectContent>
                                </Select>
                             )} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const EventIcon = ({ type }: { type: EventType }) => {
    switch (type) {
        case 'Corporate Filing': return <Briefcase className="h-4 w-4" />;
        case 'Tax Filing': return <Receipt className="h-4 w-4" />;
        case 'Other Task': return <ClipboardCheck className="h-4 w-4" />;
        default: return <CalendarIcon className="h-4 w-4" />;
    }
}

const statusConfig = {
    overdue: { color: "border-red-500/50 bg-red-500/10 text-red-500", label: "Overdue", icon: <AlertTriangle className="h-3 w-3" /> },
    upcoming: { color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500", label: "Upcoming", icon: <Clock className="h-3 w-3" /> },
    completed: { color: "border-green-500/50 bg-green-500/10 text-green-500", label: "Completed", icon: <CheckCircle className="h-3 w-3" /> },
};


const EventItem = ({ event, onToggleComplete }: { event: Event; onToggleComplete: (id: string, completed: boolean) => void }) => {
  const { status, title, date, type } = event;
  const config = statusConfig[status];
  const distance = formatDistanceToNowStrict(date, { addSuffix: true });

  return (
    <Card className={cn("interactive-lift transition-all", config.color)}>
      <CardContent className="p-4 flex items-start gap-4">
        <Checkbox 
            id={`task-${event.id}`}
            checked={status === 'completed'}
            onCheckedChange={(checked) => onToggleComplete(event.id, !!checked)}
            className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <label htmlFor={`task-${event.id}`} className={cn("font-semibold cursor-pointer", status === 'completed' && 'line-through text-muted-foreground')}>
            {title}
          </label>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" /> Due {format(date, 'do MMM, yyyy')}</span>
            <span className="flex items-center gap-1.5"><EventIcon type={type}/> {type}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <Badge variant="outline" className={cn("whitespace-nowrap", config.color)}>
            {config.icon}
            {config.label}
          </Badge>
          {status !== 'completed' && <p className="text-xs text-muted-foreground">{distance}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ tab }: { tab: string }) => {
  const messages = {
    upcoming: { title: "All clear!", description: "You have no upcoming deadlines."},
    overdue: { title: "Great work!", description: "You have no overdue tasks."},
    completed: { title: "Nothing completed yet.", description: "Completed tasks will appear here."},
    all: { title: "No tasks found.", description: "Add a custom task or check back later."},
  }
  const message = messages[tab] || messages.all;
  return (
    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md h-full flex flex-col items-center justify-center gap-4 bg-muted/40 flex-1">
        <ListX className="w-16 h-16 text-primary/20"/>
        <p className="font-semibold text-lg">{message.title}</p>
        <p className="text-sm max-w-sm">{message.description}</p>
    </div>
  )
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const { userProfile } = useAuth();
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFilings = async () => {
        if (!activeCompany) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
          const response = await generateFilings({
            companyType: activeCompany.type,
            incorporationDate: activeCompany.incorporationDate,
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            legalRegion: activeCompany.legalRegion,
          });
          const generatedEvents = response.filings.map((filing, i) => ({
            id: `ai-${activeCompany.id}-${i}`,
            date: new Date(filing.date + 'T00:00:00'),
            title: filing.title,
            type: filing.type as EventType,
            status: filing.status,
          }));
          setEvents(generatedEvents);
        } catch (error) {
            console.error("Failed to fetch AI-generated filings:", error);
            toast({ title: "Could not fetch filings", variant: "destructive" });
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchFilings();
  }, [activeCompany, toast]);

  const handleMarkComplete = (eventId: string, completed: boolean) => {
    setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
            if (completed) return { ...e, status: 'completed' };
            const isOverdue = e.date < startOfToday();
            return { ...e, status: isOverdue ? 'overdue' : 'upcoming' };
        }
        return e;
    }));
  };
  
  const handleAddTask = (data: AddTaskFormData) => {
      const newTask: Event = {
          id: `custom-${Date.now()}`,
          title: data.title,
          date: new Date(data.date + 'T00:00:00'),
          type: data.type as EventType,
          status: new Date(data.date) < startOfToday() ? 'overdue' : 'upcoming',
      };
      setEvents(prev => [...prev, newTask]);
      setModalOpen(false);
      toast({ title: 'Task Added', description: `${data.title} has been added to your calendar.`});
  };

  const { upcomingEvents, overdueEvents, completedEvents, allEvents } = useMemo(() => {
    const upcoming = events.filter(e => e.status === 'upcoming').sort((a,b) => a.date.getTime() - b.date.getTime());
    const overdue = events.filter(e => e.status === 'overdue').sort((a,b) => a.date.getTime() - b.date.getTime());
    const completed = events.filter(e => e.status === 'completed').sort((a,b) => b.date.getTime() - a.date.getTime());
    const all = [...events].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        return a.date.getTime() - b.date.getTime();
    });

    return { upcomingEvents: upcoming, overdueEvents: overdue, completedEvents: completed, allEvents: all };
  }, [events]);

  const tabs = [
    { value: 'upcoming', label: 'Upcoming', data: upcomingEvents },
    { value: 'overdue', label: 'Overdue', data: overdueEvents },
    { value: 'completed', label: 'Completed', data: completedEvents },
    { value: 'all', label: 'All', data: allEvents },
  ];

  return (
    <>
      <AddTaskModal isOpen={isModalOpen} onOpenChange={setModalOpen} onAddTask={handleAddTask} />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Compliance Calendar</h1>
            <p className="text-muted-foreground">Never miss a deadline. All your compliance dates, in one place.</p>
          </div>
          <div className='flex items-center gap-2'>
              <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4"/>Add Task</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex gap-2 items-center interactive-lift">
                        {tab.label} <Badge variant={activeTab === tab.value ? 'default' : 'secondary'} className="px-2">{tab.data.length}</Badge>
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                ) : tab.data.length > 0 ? (
                  <div className="space-y-4">
                    {tab.data.map(event => (
                      <EventItem key={event.id} event={event} onToggleComplete={handleMarkComplete} />
                    ))}
                  </div>
                ) : (
                  <EmptyState tab={tab.value} />
                )}
              </TabsContent>
            ))}
        </Tabs>
      </div>
    </>
  );
}
