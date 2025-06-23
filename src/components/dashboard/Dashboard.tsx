'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal, DollarSign, Users, CreditCard, Activity, Sparkles } from 'lucide-react';
import AIConfigurator from './AIConfigurator';
import MetricCard from './MetricCard';
import RecentSales from './RecentSales';
import SalesChart from './SalesChart';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">DashMate</h1>
        <div className="ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Configure
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>AI-Powered Configuration</SheetTitle>
                <SheetDescription>
                  Describe your business goal, and we&apos;ll suggest an optimal dashboard configuration and key metrics to track.
                </SheetDescription>
              </SheetHeader>
              <AIConfigurator />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value="$45,231.89"
            change="+20.1% from last month"
            icon={DollarSign}
          />
          <MetricCard
            title="Subscriptions"
            value="+2350"
            change="+180.1% from last month"
            icon={Users}
          />
          <MetricCard
            title="Sales"
            value="+12,234"
            change="+19% from last month"
            icon={CreditCard}
          />
          <MetricCard
            title="Active Now"
            value="+573"
            change="+201 since last hour"
            icon={Activity}
          />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>An overview of your recent sales performance.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
