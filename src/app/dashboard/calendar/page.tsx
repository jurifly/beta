
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AlertTriangle,
  Briefcase,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  Receipt,
  ClipboardCheck,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { format, startOfToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { generateFilings } from '@/ai/flows/filing-generator-flow';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    overdue: { color: "bg-red-500", label: "Overdue" },
    upcoming: { color: "bg-yellow-500", label: "Upcoming" },
    completed: { color: "bg-green-500", label: "Completed" },
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const { userProfile } = useAuth();
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<string[]>(['overdue', 'upcoming']);

  const handleFilterChange = (status: string, checked: boolean) => {
    setFilters(prev => checked ? [...prev, status] : prev.filter(s => s !== status));
  };
  
  const filteredEvents = useMemo(() => events.filter(e => filters.includes(e.status)), [events, filters]);

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
            // Revert status based on date if unchecking
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

  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    return filteredEvents
        .filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .sort((a,b) => (a.status === 'overdue' ? -1 : 1));
  }, [date, filteredEvents]);
  
  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    return events
        .filter(event => event.status === 'upcoming' && event.date >= today)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);
  }, [events]);

  return (
    <>
      <AddTaskModal isOpen={isModalOpen} onOpenChange={setModalOpen} onAddTask={handleAddTask} />
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Compliance Calendar</h1>
            <p className="text-muted-foreground">Never miss a deadline. All your compliance dates, in one place.</p>
          </div>
          <div className='flex items-center gap-2'>
              <Button variant="outline" onClick={() => toast({title: "Feature coming soon!"})}>Sync Calendar</Button>
              <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4"/>Add Task</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          <Card className="lg:col-span-2 flex flex-col interactive-lift">
            <CardContent className="p-2 sm:p-4 flex-1 flex items-center justify-center">
              <Calendar
                  mode="single" selected={date} onSelect={setDate}
                  className="rounded-md [&:first-child]:border-0"
                  modifiers={{ ...Object.fromEntries(Object.keys(statusConfig).map(status => [status, filteredEvents.filter(e => e.status === status).map(e => e.date)]))}}
                  modifiersClassNames={{ ...Object.fromEntries(Object.keys(statusConfig).map(status => [status, `day-${status}`])) }}
              />
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                    {Object.entries(statusConfig).map(([status, {color, label}]) => (
                        <div key={status} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={cn('h-2 w-2 rounded-full', color)} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>Today</Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-1 interactive-lift flex flex-col">
            <CardHeader>
              <CardTitle>Agenda</CardTitle>
              <CardDescription>Tasks and deadlines overview.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="day" className="flex flex-col flex-1">
                    <div className="flex items-start justify-between">
                        <TabsList className="grid grid-cols-2 w-[200px]">
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        </TabsList>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><Filter className="mr-2 h-4 w-4"/>Filter</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className="p-2 space-y-2">
                                {Object.entries(statusConfig).map(([key, { label }]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox id={`filter-${key}`} checked={filters.includes(key)} onCheckedChange={(checked) => handleFilterChange(key, !!checked)} />
                                        <Label htmlFor={`filter-${key}`}>{label}</Label>
                                    </div>
                                ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <TabsContent value="day" className="flex-1 overflow-y-auto mt-4 pr-2 -mr-4">
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{format(date || new Date(), 'EEEE, do MMMM')}</h4>
                      {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> ) 
                      : selectedDayEvents.length > 0 ? (
                          <div className="space-y-3">
                              {selectedDayEvents.map(event => (
                                  <div key={event.id} className="flex items-start gap-3 p-3 text-sm border rounded-lg bg-background">
                                      <Checkbox id={event.id} className="mt-1" checked={event.status === 'completed'} onCheckedChange={checked => handleMarkComplete(event.id, !!checked)} />
                                      <div className="flex-1 grid gap-1.5">
                                          <label htmlFor={event.id} className={cn("font-medium", event.status==='completed' && 'line-through text-muted-foreground')}>{event.title}</label>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><EventIcon type={event.type} /> {event.type}</div>
                                      </div>
                                      <Badge variant={event.status === 'completed' ? 'secondary' : 'outline'} className={cn(
                                        event.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-transparent",
                                        event.status === 'overdue' && "border-destructive text-destructive"
                                      )}>{statusConfig[event.status].label}</Badge>
                                  </div>
                              ))}
                          </div>
                      ) : ( <div className="text-center text-muted-foreground p-8 h-full flex flex-col items-center justify-center"><p>All clear for today!</p></div> )}
                    </TabsContent>
                    <TabsContent value="upcoming" className="flex-1 overflow-y-auto mt-4 pr-2 -mr-4">
                       <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Next 5 Upcoming Events</h4>
                        {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> ) 
                        : upcomingEvents.length > 0 ? (
                           <div className="space-y-3">
                               {upcomingEvents.map(event => (
                                   <div key={event.id} className="flex items-start gap-3 p-3 text-sm border rounded-lg bg-background">
                                       <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", statusConfig[event.status].color)}/>
                                       <div className="flex-1 grid gap-1.5">
                                           <p className="font-medium">{event.title}</p>
                                           <div className="flex items-center gap-2 text-xs text-muted-foreground"><EventIcon type={event.type} /> {format(event.date, 'do MMM, yyyy')}</div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                        ) : ( <div className="text-center text-muted-foreground p-8 h-full flex flex-col items-center justify-center"><p>No upcoming events.</p></div> )}
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Add custom day styles for calendar
const style = document.createElement('style');
style.innerHTML = `
  .day-overdue:not([aria-selected]) .rdp-button::after,
  .day-upcoming:not([aria-selected]) .rdp-button::after,
  .day-completed:not([aria-selected]) .rdp-button::after {
    content: ''; position: absolute; width: 6px; height: 6px; border-radius: 9999px; bottom: 4px; left: 50%; transform: translateX(-50%);
  }
  .day-completed:not([aria-selected]) .rdp-button::after { background-color: ${statusConfig.completed.color}; }
  .day-upcoming:not([aria-selected]) .rdp-button::after { background-color: ${statusConfig.upcoming.color}; }
  .day-overdue:not([aria-selected]) .rdp-button::after { background-color: ${statusConfig.overdue.color}; }
`;
document.head.appendChild(style);

    