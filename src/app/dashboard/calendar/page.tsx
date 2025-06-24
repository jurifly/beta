
'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  Download,
  FileText,
  Copy,
  Loader2,
  Plus,
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
import { useAuth } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { generateFilings } from '@/ai/flows/filing-generator-flow';

type LegendProps = {
    color: string;
    label: string;
};

type Event = {
  date: Date;
  title: string;
  type: "ROC Filing" | "ITR Filing" | "GST Filing" | "Task";
  status: "overdue" | "upcoming" | "completed";
}

const CalendarLegendItem = ({ color, label }: LegendProps) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span className={cn('h-2 w-2 rounded-full', color)} />
    <span>{label}</span>
  </div>
);

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const { userProfile } = useAuth();
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFilings = async () => {
        if (!activeCompany) {
          setIsLoading(false);
          return;
        };
        setIsLoading(true);

        try {
          const currentDate = format(new Date(), 'yyyy-MM-dd');
          const response = await generateFilings({
            companyType: activeCompany.type,
            incorporationDate: activeCompany.incorporationDate,
            currentDate: currentDate,
          });
          
          const generatedEvents = response.filings.map(filing => ({
            ...filing,
            // Add T00:00:00 to avoid timezone issues where the date might shift
            date: new Date(filing.date + 'T00:00:00'),
          }));

          setEvents(generatedEvents);

        } catch (error) {
            console.error("Failed to fetch AI-generated filings:", error);
            toast({
                title: "Could not fetch filings",
                description: "There was an error generating compliance dates with AI. Please try again later.",
                variant: "destructive"
            });
            setEvents([]); // Clear events on error
        } finally {
            setIsLoading(false);
        }
    };

    fetchFilings();
  }, [activeCompany, toast]);

  const handleCalendarSync = () => {
    toast({
        title: "Feature Coming Soon!",
        description: "Calendar sync with Google & Outlook is under development.",
    })
  }

  const selectedDayEvents = events.filter(event => format(event.date, 'yyyy-MM-dd') === format(date || new Date(), 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Compliance Calendar</h1>
          <p className="text-muted-foreground">
            Never miss a deadline. All your compliance dates, in one place.
          </p>
        </div>
        <div className='flex items-center gap-2'>
            <Button variant="outline" onClick={handleCalendarSync}>Sync Calendar</Button>
            {activeCompany && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[220px] justify-between interactive-lift">
                    {activeCompany.name}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[220px]">
                  {userProfile?.companies.map(company => (
                    <DropdownMenuItem key={company.id}>
                      {company.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0">
        <Card className="xl:col-span-3 flex flex-col interactive-lift">
          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                    overdue: events.filter(e => e.status === 'overdue').map(e => e.date),
                    upcoming: events.filter(e => e.status === 'upcoming').map(e => e.date),
                    completed: events.filter(e => e.status === 'completed').map(e => e.date),
                }}
                modifiersClassNames={{
                    overdue: 'day-overdue',
                    upcoming: 'day-upcoming',
                    completed: 'day-completed',
                }}
            />
            <div className="flex items-center justify-between border-t mt-4 pt-4 px-2 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                    <CalendarLegendItem color="bg-destructive" label="Overdue" />
                    <CalendarLegendItem color="bg-yellow-500" label="Upcoming" />
                    <CalendarLegendItem color="bg-green-500" label="Completed" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                  Go to Today
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 interactive-lift flex flex-col">
          <CardHeader>
            <CardTitle>Deadlines & Tasks for {format(date || new Date(), 'do MMMM')}</CardTitle>
            <CardDescription>A summary of events for the selected day.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                {selectedDayEvents.map(event => (
                    <div key={event.title} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className={cn("mt-1 w-3 h-3 rounded-full shrink-0", 
                            event.status === 'overdue' && "bg-destructive",
                            event.status === 'upcoming' && "bg-yellow-500",
                            event.status === 'completed' && "bg-green-500"
                        )} />
                        <div className="flex-1">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.type}</p>
                        </div>
                         <Badge variant={event.status === 'completed' ? 'secondary' : 'outline'} className={cn(event.status === 'completed' ? "bg-green-100 text-green-800" : event.status === 'overdue' ? "border-destructive text-destructive" : "")}>{event.status}</Badge>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 h-full flex flex-col items-center justify-center">
                  <p className="font-medium">No deadlines for this day. All clear!</p>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => toast({title: "Feature coming soon!"})}>
                <Plus className="mr-2 h-4 w-4"/>
                Add New Task
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
