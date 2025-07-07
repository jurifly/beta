
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Bolt,
  Building,
  CreditCard,
  FileClock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Library,
  LineChart,
  Loader2,
  Lock,
  Menu,
  MessageSquare,
  Network,
  RadioTower,
  Scale,
  Settings,
  Sparkles,
  Users,
  Zap,
  Archive,
  Globe,
  LifeBuoy,
  PenSquare,
  PieChart,
  Workflow,
  Gavel,
  ClipboardCheck,
  Flame,
  Receipt,
  Mail,
  BookLock,
  BookOpenCheck,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { useAuth } from "@/hooks/auth";
import type { UserProfile, UserPlan, AppNotification } from "@/lib/types";
import { planHierarchy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NotificationModal } from "@/components/dashboard/notification-modal";
import { BetaBanner } from "@/components/dashboard/beta-banner";
import { useToast } from "@/hooks/use-toast";

const navItemConfig = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  caConnect: { href: "/dashboard/ca-connect", label: "Compliance Hub", icon: ClipboardCheck },
  aiToolkit: { href: "/dashboard/ai-toolkit", label: "AI Toolkit", icon: Sparkles },
  launchPad: { href: "/dashboard/business-setup", label: "Launch Pad", icon: Network },
  learn: { href: "/dashboard/learn", label: "Learn Hub", icon: BookOpenCheck },
  capTable: { href: "/dashboard/cap-table", label: "Cap Table", icon: PieChart },
  financials: { href: "/dashboard/financials", label: "Financials", icon: Receipt },
  documents: { href: "/dashboard/documents", label: "Document Vault", icon: Archive },
  analytics: { href: "/dashboard/analytics", label: "Portfolio Analytics", icon: LineChart },
  community: { href: "/dashboard/community", label: "Community", icon: MessageSquare },
  clients: { href: "/dashboard/clients", label: "Clients", icon: FolderKanban },
  team: { href: "/dashboard/team", label: "Team", icon: Users },
  clauseLibrary: { href: "/dashboard/clause-library", label: "Clause Library", icon: Library },
  workflows: { href: "/dashboard/ai-toolkit?tab=workflows", label: "Workflows", icon: Workflow },
  invitations: { href: "/dashboard/invitations", label: "Invitations", icon: Mail },
  reportCenter: { href: "/dashboard/report-center", label: "Report Center", icon: FileText },
  billing: { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  settings: { href: "/dashboard/settings", label: "Settings", icon: Settings },
  help: { href: "/dashboard/help", label: "Help and Support", icon: LifeBuoy },
  feedback: { href: "/dashboard/feedback", label: "Feedback", icon: PenSquare },
  policies: { href: "/dashboard/legal-policies", label: "Policies", icon: BookLock },
} as const;

type NavItemKey = keyof typeof navItemConfig;
type NavItem = (typeof navItemConfig)[NavItemKey];

const founderNavItems: NavItem[] = [
  navItemConfig.dashboard,
  { ...navItemConfig.caConnect, label: "CA Connect" },
  { ...navItemConfig.aiToolkit },
  { ...navItemConfig.launchPad },
  navItemConfig.learn,
  { ...navItemConfig.capTable },
  { ...navItemConfig.financials },
  { ...navItemConfig.documents },
  { ...navItemConfig.analytics, label: "Analytics" },
  { ...navItemConfig.community },
];

const caNavItems: NavItem[] = [
  { ...navItemConfig.dashboard },
  { ...navItemConfig.clients, label: "Client Management" },
  navItemConfig.invitations,
  { ...navItemConfig.aiToolkit, label: "AI Practice Suite" },
  navItemConfig.learn,
  navItemConfig.financials,
  navItemConfig.documents,
  { ...navItemConfig.caConnect },
  navItemConfig.reportCenter,
  navItemConfig.team,
  navItemConfig.clauseLibrary,
];

const legalAdvisorNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.clients,
  { ...navItemConfig.aiToolkit, label: "AI Counsel Tools" },
  navItemConfig.learn,
  navItemConfig.documents,
  navItemConfig.clauseLibrary,
  navItemConfig.analytics,
  navItemConfig.team,
];

const enterpriseNavItems: NavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.team,
  navItemConfig.clients,
  navItemConfig.documents,
  { ...navItemConfig.caConnect, label: "Compliance Hub" },
  navItemConfig.analytics,
  { ...navItemConfig.aiToolkit, label: "AI Compliance Suite" },
  navItemConfig.workflows,
  navItemConfig.clauseLibrary,
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

const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
        AlertTriangle: <AlertTriangle className="h-5 w-5 text-destructive" />,
        RadioTower: <RadioTower className="h-5 w-5 text-primary" />,
        FileClock: <FileClock className="h-5 w-5 text-green-500" />,
        Default: <Bell className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[iconName] || icons.Default;
}

function DashboardApp({ children }: { children: React.ReactNode }) {
  const { userProfile, notifications, markNotificationAsRead, markAllNotificationsAsRead, isDevMode } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: AppNotification) => {
     setSelectedNotification(notification);
     if (!notification.read) {
         markNotificationAsRead(notification.id);
     }
  }

  if (!userProfile) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const navItems = getNavItems(userProfile.role);
  const activeCompany = userProfile.companies.find(c => c.id === userProfile.activeCompanyId);

  const bonusCredits = userProfile.creditBalance ?? 0;
  const creditsUsed = userProfile.dailyCreditsUsed ?? 0;
  const creditLimit = userProfile.dailyCreditLimit ?? 0;
  const dailyRemaining = Math.max(0, creditLimit - creditsUsed);
  const totalCreditsRemaining = bonusCredits + dailyRemaining;

  const isPro = planHierarchy[userProfile.plan] > 0;
  const canShowActiveCompany = userProfile.role === 'Founder' || userProfile.role === 'Enterprise';

  return (
      <>
        <NotificationModal 
            isOpen={!!selectedNotification} 
            onOpenChange={() => setSelectedNotification(null)}
            notification={selectedNotification}
        />
        <div className="flex h-screen w-full">
            <DesktopSidebar navItems={navItems} userProfile={userProfile} />
            <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <MobileSheetNav navItems={navItems} userProfile={userProfile} />
                <div className="flex-1">
                <div className="flex items-center gap-2 font-bold font-headline text-primary md:hidden">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        {isPro && <Flame className="h-6 w-6 text-accent" />}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        <span>LexIQ</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                  {canShowActiveCompany && activeCompany && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="w-4 h-4"/>
                          <span>{activeCompany.name}</span>
                      </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4">
                      <Globe className="w-4 h-4"/>
                      <span>{userProfile.legalRegion}</span>
                  </div>
                </div>

                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                <Link href="/dashboard/billing" className="hidden md:flex items-center gap-2 text-sm font-medium border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors interactive-lift">
                    <Bolt className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{isDevMode ? 'Unlimited Credits' : `${totalCreditsRemaining} Credits Left`}</span>
                </Link>
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative shrink-0 interactive-lift">
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
                            <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={markAllNotificationsAsRead}>
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
                                onClick={() => handleNotificationClick(notification)}
                                >
                                {getIcon(notification.icon)}
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
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-8 md:pb-6 overflow-y-auto">
                <BetaBanner />
                {children}
            </main>
            </div>
        </div>
    </>
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
      router.replace("/login");
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

const DesktopSidebar = ({ navItems, userProfile }: { navItems: NavItem[], userProfile: UserProfile }) => {
    const pathname = usePathname();
    const { toast } = useToast();

    const bottomNavItems = [navItemConfig.settings, navItemConfig.billing, navItemConfig.help, navItemConfig.feedback, navItemConfig.policies];
    const isPro = planHierarchy[userProfile.plan] > 0;

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href === '/dashboard/community') {
            e.preventDefault();
            toast({
                title: "Coming Soon!",
                description: "The community forum is under development and will be launched soon.",
            });
        }
    };

    return (
      <div className="hidden w-[280px] shrink-0 border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary">
              {isPro && <Flame className="h-6 w-6 text-accent" />}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              <span className="flex items-center">
                LexIQ
                 <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">BETA</Badge>
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className={cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-card-foreground/70 transition-all hover:text-primary hover:bg-muted interactive-lift",
                              isActive && "bg-muted text-primary font-semibold"
                          )}
                        >
                          <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          {item.label}
                        </Link>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="border-t pt-4 grid items-start px-2 text-sm font-medium lg:px-0">
               {bottomNavItems.map((item) => (
                    <TooltipProvider key={item.href} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Link
                              href={item.href}
                              className={cn(
                                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-card-foreground/70 transition-all hover:text-primary hover:bg-muted interactive-lift",
                                  pathname.startsWith(item.href) && "bg-muted text-primary font-semibold"
                              )}
                            >
                              <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                              {item.label}
                            </Link>
                          </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                 )
               )}
            </div>
          </div>
        </div>
      </div>
    )
}

const MobileSheetNav = ({ navItems, userProfile }: { navItems: NavItem[], userProfile: UserProfile }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href === '/dashboard/community') {
            e.preventDefault();
            toast({
                title: "Coming Soon!",
                description: "The community forum is under development and will be launched soon.",
            });
            return;
      }
      setIsOpen(false);
    }
    
    const bottomNavItems = [navItemConfig.settings, navItemConfig.billing, navItemConfig.help, navItemConfig.feedback, navItemConfig.policies];
    const isPro = planHierarchy[userProfile.plan] > 0;

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
           <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
           <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary" onClick={(e) => handleLinkClick(e, '/dashboard')}>
                {isPro && <Flame className="h-6 w-6 text-accent" />}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                <span className="flex items-center">
                  LexIQ
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">BETA</Badge>
                </span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid gap-2 text-lg font-medium p-4">
              {navItems.map(item => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("group flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-transform active:scale-95 interactive-lift",
                            isActive && "bg-muted text-primary"
                        )}
                        onClick={(e) => handleLinkClick(e, item.href)}
                    >
                        <item.icon className="h-5 w-5 transition-transform" />
                        <span className="flex-1">{item.label}</span>
                    </Link>
                )
              })}
              <div className="pt-4 mt-4 border-t">
                {bottomNavItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("group flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-transform active:scale-95 interactive-lift",
                            pathname.startsWith(item.href) && "bg-muted text-primary"
                        )}
                        onClick={(e) => handleLinkClick(e, item.href)}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
              </div>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
}
