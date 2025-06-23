"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Building,
  Calendar,
  CreditCard,
  FileScan,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  LineChart,
  Loader2,
  Lock,
  FolderKanban,
  Library,
  RadioTower,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { useAuth } from "@/hooks/auth";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const navItemConfig = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, premium: false },
  aiCopilot: { href: "/dashboard/ai-copilot", label: "AI Assistant", icon: Sparkles, premium: false },
  documents: { href: "/dashboard/documents", label: "Documents", icon: FileText, premium: false },
  calendar: { href: "/dashboard/calendar", label: "Calendar", icon: Calendar, premium: true },
  contractAnalyzer: { href: "/dashboard/contract-analyzer", label: "Analyzer", icon: FileScan, premium: true },
  dueDiligence: { href: "/dashboard/due-diligence", label: "Audit", icon: GanttChartSquare, premium: false, requiredPlan: 'Pro' },
  analytics: { href: "/dashboard/analytics", label: "Insights", icon: LineChart, premium: true },
  clients: { href: "/dashboard/clients", label: "Clients", icon: FolderKanban, premium: true, requiredPlan: 'Pro' },
  regulationWatcher: { href: "/dashboard/regulation-watcher", label: "Watcher", icon: RadioTower, premium: true },
  team: { href: "/dashboard/team", label: "Team", icon: Users, premium: true, requiredPlan: 'CA Pro' },
  clauseLibrary: { href: "/dashboard/clause-library", label: "Clause Library", icon: Library, premium: true, requiredPlan: 'Pro' },
  billing: { href: "/dashboard/billing", label: "Billing", icon: CreditCard, premium: false },
  integrations: { href: "/dashboard/integrations", label: "Automations", icon: Zap, premium: true, requiredPlan: 'Enterprise' },
  settings: { href: "/dashboard/settings", label: "Settings", icon: Settings, premium: false },
} as const;

type NavItem = typeof navItemConfig[keyof typeof navItemConfig];

const founderNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.aiCopilot,
  navItemConfig.documents,
  navItemConfig.calendar,
  navItemConfig.contractAnalyzer,
  navItemConfig.dueDiligence,
  navItemConfig.analytics,
];

const caNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.clients,
  navItemConfig.aiCopilot,
  navItemConfig.documents,
  navItemConfig.calendar,
  navItemConfig.regulationWatcher,
  navItemConfig.dueDiligence,
  navItemConfig.analytics,
  navItemConfig.team,
];

const legalAdvisorNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.clients,
  navItemConfig.aiCopilot,
  navItemConfig.contractAnalyzer,
  navItemConfig.documents,
  navItemConfig.dueDiligence,
  navItemConfig.clauseLibrary,
  navItemConfig.regulationWatcher,
  navItemConfig.analytics,
  navItemConfig.team,
];

const enterpriseNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.aiCopilot,
  navItemConfig.analytics,
  navItemConfig.documents,
  navItemConfig.calendar,
  navItemConfig.dueDiligence,
  navItemConfig.regulationWatcher,
  navItemConfig.integrations,
  navItemConfig.team,
  navItemConfig.clients,
];

const getNavItems = (role: UserProfile['role']) => {
    switch (role) {
        case 'CA':
            return caNavItems;
        case 'Legal Advisor':
            return legalAdvisorNavItems;
        case 'Enterprise':
            return enterpriseNavItems;
        case 'Founder':
        default:
            return founderNavItems;
    }
}

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<{id: number, title: string, description: string, icon: React.ReactNode, read: boolean}[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = getNavItems(userProfile.role);
  const bottomNavItems = [navItemConfig.billing, navItemConfig.settings];
  const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);

  const unreadCount = notifications.filter(n => !n.read).length;
  const handleMarkAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const handleNotificationClick = (id: number) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex h-14 shrink-0 items-center border-b px-4 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
             <span className="group-data-[state=collapsed]:hidden">DashMate</span>
          </Link>
        </div>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
               const isLocked = (item.premium && userProfile.plan === 'Free') ||
                               (item.requiredPlan === 'Pro' && userProfile.plan === 'Free') ||
                               (item.requiredPlan === 'CA Pro' && !['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) ||
                               (item.requiredPlan === 'Enterprise' && !['Enterprise', 'Enterprise Pro'].includes(userProfile.plan));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                    <Link href={isLocked ? '#' : item.href} className="interactive-lift" onClick={(e) => isLocked && e.preventDefault()}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                       {isLocked && <Lock className="h-4 w-4 ml-auto group-data-[state=collapsed]:hidden" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
         <div className="mt-auto p-2">
            <SidebarMenu>
                 {bottomNavItems.map(item => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                          <Link href={item.href} className="interactive-lift">
                            <item.icon className="h-5 w-5" />
                            <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sticky top-0 z-30 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {activeCompany && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="w-4 h-4" />
                <span>{activeCompany.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative shrink-0">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                          </span>
                      )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[90vw] max-w-sm md:w-[380px] p-0">
                    <DropdownMenuLabel className="flex items-center justify-between p-3 border-b">
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                        )}
                    </DropdownMenuLabel>
                    <ScrollArea className="h-[300px]">
                        {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <DropdownMenuItem
                            key={notification.id}
                            className={cn("flex items-start gap-3 p-3 cursor-pointer rounded-none border-b", !notification.read && "bg-primary/5")}
                            onClick={() => handleNotificationClick(notification.id)} >
                            <div className="flex-1">
                                <p className={cn("font-medium leading-tight", !notification.read ? "text-primary" : "text-card-foreground")}>{notification.title}</p>
                                <p className={cn("text-xs font-normal", !notification.read ? "text-foreground/80" : "text-muted-foreground")}>{notification.description}</p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 self-start"></div>}
                            </DropdownMenuItem>
                        ))
                        ) : (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            You're all caught up!
                        </div>
                        )}
                    </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserNav />
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 bg-muted/40 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
