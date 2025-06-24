
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
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
  Menu,
  RadioTower,
  Settings,
  Sparkles,
  Users,
  Zap,
  FolderKanban,
  Library,
  ChevronDown,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { useAuth } from "@/hooks/auth";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  integrations: { href: "/dashboard/integrations", label: "Integrations", icon: Zap, premium: true, requiredPlan: 'Enterprise' },
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
  navItemConfig.integrations,
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

function DashboardApp({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<{id: number, title: string, description: string, icon: React.ReactNode, read: boolean}[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
     setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }

  // The parent `DashboardLayout` handles the loading and auth checks.
  // We can assume userProfile is available here.
  if (!userProfile) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const navItems = getNavItems(userProfile.role);
  const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
        <DesktopSidebar navItems={navItems} />
        <div className="flex flex-col">
           <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <MobileSheetNav navItems={navItems} />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-bold font-headline text-primary md:hidden">
                  <Link href="/dashboard" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                      <span className="sr-only">LexIQ.AI</span>
                  </Link>
              </div>

              {activeCompany && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4"/>
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
                      <span className="sr-only">Notifications</span>
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
                            className={cn(
                                "flex items-start gap-3 p-3 cursor-pointer rounded-none border-b",
                                !notification.read && "bg-primary/5"
                            )}
                            onClick={() => handleNotificationClick(notification.id)}
                            >
                            {notification.icon}
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
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20 md:pb-6 overflow-y-auto">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/onboarding");
    }
  }, [user, loading, router]);


  if (loading || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <DashboardApp>{children}</DashboardApp>;
}

const DesktopSidebar = ({ navItems }: { navItems: NavItem[] }) => {
    const pathname = usePathname();
    const { userProfile } = useAuth();

    if (!userProfile) return null;

    const bottomNavItems = [navItemConfig.billing, navItemConfig.settings];

    return (
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              <span className="flex items-center">
                LexIQ.AI
                 {userProfile.plan !== 'Free' && (
                    <Badge variant="outline" className="ml-2 border-accent/30 bg-accent/10 text-accent dark:text-accent">
                      <span className="mr-1.5">🔥</span>
                      {userProfile.plan.replace(' Pro', '')}
                    </Badge>
                  )}
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              {navItems.map((item) => {
                const isLocked = (item.premium && userProfile.plan === 'Free') ||
                                 (item.requiredPlan === 'Pro' && userProfile.plan === 'Free') ||
                                 (item.requiredPlan === 'CA Pro' && !['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) ||
                                 (item.requiredPlan === 'Enterprise' && !['Enterprise', 'Enterprise Pro'].includes(userProfile.plan));
                
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={isLocked ? '#' : item.href}
                          className={cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-card-foreground/70 transition-all hover:text-primary hover:bg-muted interactive-lift",
                              pathname === item.href && "bg-muted text-primary font-semibold",
                              isLocked && "text-muted-foreground/50 hover:text-muted-foreground/50 cursor-not-allowed hover:transform-none hover:shadow-none"
                          )}
                          onClick={(e) => isLocked && e.preventDefault()}
                        >
                          <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          {item.label}
                          {isLocked && <Lock className="h-3 w-3 ml-auto text-amber-500"/>}
                        </Link>
                      </TooltipTrigger>
                      {isLocked && (
                        <TooltipContent side="right">
                          <p>Upgrade to {item.requiredPlan || 'Pro'} to unlock</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="border-t pt-4 grid items-start px-2 text-sm font-medium lg:px-0">
               {bottomNavItems.map((item) => {
                 const isLocked = (item.premium && userProfile.plan === 'Free') ||
                                  (item.requiredPlan === 'Pro' && userProfile.plan === 'Free') ||
                                  (item.requiredPlan === 'CA Pro' && !['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) ||
                                  (item.requiredPlan === 'Enterprise' && !['Enterprise', 'Enterprise Pro'].includes(userProfile.plan));
                 return (
                    <TooltipProvider key={item.href} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Link
                              href={isLocked ? '#' : item.href}
                              className={cn(
                                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-card-foreground/70 transition-all hover:text-primary hover:bg-muted interactive-lift",
                                  pathname === item.href && "bg-muted text-primary font-semibold",
                                  isLocked && "text-muted-foreground/50 hover:text-muted-foreground/50 cursor-not-allowed hover:transform-none hover:shadow-none"
                              )}
                              onClick={(e) => isLocked && e.preventDefault()}
                            >
                              <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                              {item.label}
                              {isLocked && <Lock className="h-3 w-3 ml-auto text-amber-500"/>}
                            </Link>
                          </TooltipTrigger>
                          {isLocked && (
                          <TooltipContent side="right">
                              <p>Upgrade to {item.requiredPlan || 'Pro'} to unlock</p>
                          </TooltipContent>
                          )}
                      </Tooltip>
                    </TooltipProvider>
                 )
               })}
            </div>
          </div>
        </div>
      </div>
    )
}

const MobileSheetNav = ({ navItems }: { navItems: NavItem[] }) => {
    const pathname = usePathname();
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!userProfile) return null;

    const handleLinkClick = () => {
      setIsOpen(false);
    }
    
    const bottomNavItems = [navItemConfig.billing, navItemConfig.settings];


    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-full max-w-[300px]">
           <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary" onClick={handleLinkClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                <span className="flex items-center">
                  LexIQ.AI
                   {userProfile.plan !== 'Free' && (
                    <Badge variant="outline" className="ml-2 border-accent/30 bg-accent/10 text-accent dark:text-accent">
                      <span className="mr-1.5">🔥</span>
                      {userProfile.plan.replace(' Pro', '')}
                    </Badge>
                  )}
                </span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid gap-2 text-lg font-medium p-4">
              {navItems.map(item => {
                const isLocked = (item.premium && userProfile.plan === 'Free') ||
                                 (item.requiredPlan === 'Pro' && userProfile.plan === 'Free') ||
                                 (item.requiredPlan === 'CA Pro' && !['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) ||
                                 (item.requiredPlan === 'Enterprise' && !['Enterprise', 'Enterprise Pro'].includes(userProfile.plan));
                return (
                    <Link
                        key={item.href}
                        href={isLocked ? '#' : item.href}
                        className={cn("group flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-transform active:scale-95 interactive-lift",
                            pathname === item.href && "bg-muted text-primary",
                            isLocked && "opacity-60 cursor-not-allowed active:transform-none"
                        )}
                        onClick={(e) => {
                          if (isLocked) e.preventDefault();
                          else handleLinkClick();
                        }}
                    >
                        <item.icon className="h-5 w-5 transition-transform" />
                        {item.label}
                        {isLocked && <Lock className="h-4 w-4 ml-auto text-amber-500" />}
                    </Link>
                )
              })}
              <div className="pt-4 mt-4 border-t">
                {bottomNavItems.map(item => {
                    const isLocked = (item.premium && userProfile.plan === 'Free') ||
                                     (item.requiredPlan === 'Pro' && userProfile.plan === 'Free') ||
                                     (item.requiredPlan === 'CA Pro' && !['CA Pro', 'Enterprise', 'Enterprise Pro'].includes(userProfile.plan)) ||
                                     (item.requiredPlan === 'Enterprise' && !['Enterprise', 'Enterprise Pro'].includes(userProfile.plan));
                    return (
                        <Link
                            key={item.href}
                            href={isLocked ? '#' : item.href}
                            className={cn("group flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-transform active:scale-95 interactive-lift",
                                pathname === item.href && "bg-muted text-primary",
                                isLocked && "opacity-60 cursor-not-allowed active:transform-none"
                            )}
                            onClick={(e) => {
                                if (isLocked) e.preventDefault();
                                else handleLinkClick();
                            }}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                            {isLocked && <Lock className="h-4 w-4 ml-auto text-amber-500" />}
                        </Link>
                    )
                })}
              </div>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
}

const MobileBottomNav = () => {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  
  if (!userProfile) return null;

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/ai-copilot", icon: Sparkles, label: "Assistant" },
    { href: "/dashboard/documents", icon: FileText, label: "Docs" },
    { href: "/dashboard/analytics", icon: LineChart, label: "Insights" },
    { href: "/dashboard/settings", icon: Settings, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
      <div className="grid h-full grid-cols-5">
        {navItems.map(item => {
           return (
             <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center relative h-full">
              <div className={cn("flex flex-col items-center justify-center gap-1 p-2 rounded-md w-full h-full relative transition-transform active:scale-90", 
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium break-all">{item.label}</span>
                {pathname === item.href && (
                  <div className="absolute top-0.5 h-1 w-8 rounded-full bg-primary" />
                )}
              </div>
             </Link>
           )
        })}
      </div>
    </div>
  )
}

    