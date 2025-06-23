'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LayoutGrid,
  Sparkles,
  FileText,
  CalendarDays,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  CreditCard,
  Settings,
  Flame,
  ChevronDown,
  Bell,
  Sun,
  Plus,
  ArrowRight,
  Shield,
  File,
  AlertTriangle,
  GanttChartSquare
} from 'lucide-react';
import MetricCard from './MetricCard';
import SalesChart from './SalesChart';

const AppSidebar = () => (
  <Sidebar>
    <SidebarHeader>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-lg font-semibold">LexIQ.AI</span>
        <Badge variant="accent" className="ml-auto flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Enterprise
        </Badge>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive>
            <LayoutGrid />
            Dashboard
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Sparkles />
            AI Assistant
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <FileText />
            Documents
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <CalendarDays />
            Calendar
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <BarChart3 />
            Analyzer
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <ClipboardCheck />
            Audit
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <TrendingUp />
            Insights
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <CreditCard />
            Billing
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Settings />
            Settings
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
);

const DashboardHeader = () => (
  <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b md:px-6">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold">
          <Avatar className="w-6 h-6">
            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="company logo" />
            <AvatarFallback>E</AvatarFallback>
          </Avatar>
          Example Private Limited Company
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Example Private Limited Company</DropdownMenuItem>
        <DropdownMenuItem>Another Company Inc.</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Settings className="w-4 h-4" />
        <span>Credits: 99999999999942</span>
      </div>
      <Button variant="ghost" size="icon">
        <Bell className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon">
        <Sun className="w-5 h-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarFallback>HB</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Example Private Limited Company</DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal text-muted-foreground -mt-2">Private Limited Company</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
);

export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Welcome, HECKERRR!</h1>
                <p className="text-muted-foreground">Here's your Founder overview for Example Private Limited Company.</p>
              </div>
              <Button>
                <Plus className="mr-2" />
                Add Company
              </Button>
            </div>

            <Card className="mb-8 bg-primary/5 border-primary/20">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Your AI Legal Assistant</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground">Not sure what you need to do this month? Ask our AI for a personalized compliance checklist.</p>
                </div>
                <Button>
                  Ask AI
                  <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
              <MetricCard title="Risk Score" icon={Shield}>
                <div className="text-3xl font-bold text-green-600">N/A</div>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </MetricCard>
              <MetricCard title="Upcoming Filings" icon={CalendarDays}>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">In next 30 days</p>
              </MetricCard>
              <MetricCard title="Docs Generated" icon={File}>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </MetricCard>
              <MetricCard title="Alerts" icon={AlertTriangle}>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No overdue tasks</p>
              </MetricCard>
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Compliance Activity</CardTitle>
                  <CardDescription>Your legal and compliance actions over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GanttChartSquare />
                    <CardTitle>Compliance Checklist</CardTitle>
                  </div>
                  <CardDescription>Key compliance items for your company.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                  <p>No items yet. Connect your company data to get started.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
