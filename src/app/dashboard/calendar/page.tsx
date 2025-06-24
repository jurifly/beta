'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

type LegendProps = {
    color: string;
    label: string;
};

const CalendarLegendItem = ({ color, label }: LegendProps) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span className={cn('h-2 w-2 rounded-full', color)} />
    <span>{label}</span>
  </div>
);

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { userProfile } = useAuth();
  const activeCompany = userProfile?.companies.find(c => c.id === userProfile.activeCompanyId);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Compliance Calendar</h1>
          <p className="text-muted-foreground">
            Never miss a deadline. All your compliance dates, in one place.
          </p>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0">
        <Card className="xl:col-span-3 flex flex-col interactive-lift">
          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="flex items-center justify-between border-t mt-4 pt-4 px-2 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                    <CalendarLegendItem color="bg-destructive" label="Overdue" />
                    <CalendarLegendItem color="bg-amber-500" label="Upcoming" />
                    <CalendarLegendItem color="bg-green-500" label="Completed" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                  Go to Today
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 interactive-lift">
          <CardHeader>
            <CardTitle>Deadlines & Tasks</CardTitle>
            <CardDescription>A summary of all your key dates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto bg-transparent p-0 gap-2">
                <TabsTrigger value="upcoming" className="py-2 flex items-center justify-center gap-1.5 bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md interactive-lift">
                  <Bell className="h-4 w-4" />
                  Upcoming
                  <span className="font-semibold ml-1">0</span>
                </TabsTrigger>
                <TabsTrigger value="overdue" className="py-2 flex items-center justify-center gap-1.5 bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md interactive-lift">
                  <AlertTriangle className="h-4 w-4" />
                  Overdue
                  <span className="font-semibold ml-1 text-destructive data-[state=active]:text-primary-foreground">0</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="py-2 flex items-center justify-center gap-1.5 bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md interactive-lift">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </TabsTrigger>
              </TabsList>
              <div className="border rounded-lg mt-4 min-h-[200px] flex items-center justify-center">
                <TabsContent value="upcoming" className="mt-0">
                  <div className="text-center text-muted-foreground p-8">
                      <p className="font-medium">No deadlines here. All clear!</p>
                  </div>
                </TabsContent>
                <TabsContent value="overdue" className="mt-0">
                  <div className="text-center text-muted-foreground p-8">
                      <p className="font-medium">No deadlines here. All clear!</p>
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-0">
                  <div className="text-center text-muted-foreground p-8">
                      <p className="font-medium">No completed tasks to show.</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
