
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode, useMemo } from "react";
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
  User,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Briefcase,
  BookUser,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { useAuth } from "@/hooks/auth";
import type { UserProfile, UserPlan, AppNotification, UserRole } from "@/lib/types";
import { planHierarchy } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { NotificationModal } from "@/components/dashboard/notification-modal";
import { BetaBanner } from "@/components/dashboard/beta-banner";
import { useToast } from "@/hooks/use-toast";
import { FeatureLockedModal } from "@/components/dashboard/feature-locked-modal";
import { formatDistanceToNow } from "date-fns";

type NavItemConfig = {
    [key: string]: {
        href: string;
        label: string;
        icon: React.ElementType;
        locked?: boolean;
    }
}

const navItemConfig: NavItemConfig = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  caConnect: { href: "/dashboard/ca-connect", label: "Advisor Hub", icon: Users, locked: true },
  aiToolkit: { href: "/dashboard/ai-toolkit", label: "AI Toolkit", icon: Sparkles },
  launchPad: { href: "/dashboard/business-setup", label: "Launch Pad", icon: Network },
  playbook: { href: "/dashboard/learn", label: "The Playbook", icon: BookOpenCheck },
  capTable: { href: "/dashboard/cap-table", label: "Cap Table", icon: PieChart },
  financials: { href: "/dashboard/financials", label: "Financials", icon: Receipt },
  documents: { href: "/dashboard/documents", label: "Document Vault", icon: Archive },
  analytics: { href: "/dashboard/analytics", label: "Portfolio Analytics", icon: LineChart },
  community: { href: "/dashboard/community", label: "Community", icon: MessageSquare, locked: true },
  clients: { href: "/dashboard/clients", label: "Clients", icon: FolderKanban },
  team: { href: "/dashboard/team", label: "Team", icon: Users, locked: true },
  clauseLibrary: { href: "/dashboard/clause-library", label: "Clause Library", icon: Library },
  workflows: { href: "/dashboard/ai-toolkit?tab=workflows", label: "Workflows", icon: Workflow, locked: true },
  invitations: { href: "/dashboard/invitations", label: "Invitations", icon: Mail, locked: true },
  reportCenter: { href: "/dashboard/report-center", label: "Report Center", icon: FileText, locked: true },
  reconciliation: { href: "/dashboard/ai-toolkit?tab=reconciliation", label: "Reconciliation", icon: Scale, locked: true },
  settings: { href: "/dashboard/settings", label: "Settings", icon: Settings },
  help: { href: "/dashboard/help", label: "Help & FAQ", icon: LifeBuoy },
} as const;


type ThemedNavItem = (typeof navItemConfig)[keyof typeof navItemConfig] & {
    color?: string;
}

const founderNavItems: ThemedNavItem[] = [
  { ...navItemConfig.dashboard },
  { ...navItemConfig.aiToolkit },
  { ...navItemConfig.capTable },
  { ...navItemConfig.financials },
  { ...navItemConfig.launchPad },
  { ...navItemConfig.reportCenter, locked: true },
  { ...navItemConfig.analytics, label: "Analytics" },
  { ...navItemConfig.playbook },
  { ...navItemConfig.caConnect, locked: true },
  { ...navItemConfig.documents },
  { ...navItemConfig.community },
  { ...navItemConfig.team, label: "Team Management", locked: true },
];

const caNavItems: ThemedNavItem[] = [
  { ...navItemConfig.dashboard },
  { ...navItemConfig.clients, label: "Client Management", icon: Briefcase },
  { ...navItemConfig.team, label: "Team Management", locked: true },
  { ...navItemConfig.aiToolkit, label: "AI Practice Suite" },
  { ...navItemConfig.analytics },
  { ...navItemConfig.caConnect, label: 'Advisor Hub', icon: Users },
  { ...navItemConfig.launchPad },
  { ...navItemConfig.reportCenter, locked: true },
  { ...navItemConfig.workflows, label: "Workflows", locked: true },
  { ...navItemConfig.reconciliation, locked: true },
  { ...navItemConfig.documents },
  { ...navItemConfig.clauseLibrary, locked: true },
  { ...navItemConfig.playbook },
];

const legalAdvisorNavItems: ThemedNavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.clients,
  { ...navItemConfig.aiToolkit, label: "AI Counsel Tools" },
  navItemConfig.clauseLibrary,
  navItemConfig.analytics,
  navItemConfig.playbook,
];

const enterpriseNavItems: ThemedNavItem[] = [
  navItemConfig.dashboard,
  { ...navItemConfig.team, label: "Team Management", locked: false }, // Unlocked for Enterprise
  navItemConfig.clients,
  navItemConfig.caConnect,
  navItemConfig.analytics,
  navItemConfig.documents,
];

const getSidebarNavItems = (role: UserRole) => {
    switch (role) {
        case 'CA': return caNavItems;
        case 'Legal Advisor': return legalAdvisorNavItems;
        case 'Enterprise': return enterpriseNavItems;
        case 'Founder': default: return founderNavItems;
    }
}

const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
  >
    <path
      d="M16.5 6.5C14.0858 4.08579 10.9142 4.08579 8.5 6.5C6.08579 8.91421 6.08579 12.0858 8.5 14.5C9.42358 15.4236 10.4914 16.0357 11.6667 16.3333M16.5 17.5C14.0858 19.9142 10.9142 19.9142 8.5 17.5C6.08579 15.0858 6.08579 11.9142 8.5 9.5C9.42358 8.57642 10.4914 7.96429 11.6667 7.66667"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);


const getIcon = (iconName?: string) => {
    const icons: { [key: string]: React.ReactNode } = {
        AlertTriangle: <AlertTriangle className="h-5 w-5 text-destructive" />,
        RadioTower: <RadioTower className="h-5 w-5 text-primary" />,
        FileClock: <FileClock className="h-5 w-5 text-green-500" />,
        Default: <Bell className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[iconName || 'Default'] || icons.Default;
}

const getBottomNavItems = (role: UserRole): ThemedNavItem[] => {
  switch (role) {
    case 'CA':
      return [
        navItemConfig.dashboard,
        navItemConfig.clients,
        { ...navItemConfig.aiToolkit, label: "AI Suite" },
        navItemConfig.caConnect,
      ];
    case 'Legal Advisor':
      return [
        navItemConfig.dashboard,
        navItemConfig.clients,
        { ...navItemConfig.aiToolkit, label: "AI Tools" },
        navItemConfig.clauseLibrary,
      ];
    case 'Enterprise':
      return [
        navItemConfig.dashboard,
        {...navItemConfig.team, locked: false},
        navItemConfig.caConnect,
        navItemConfig.analytics,
      ];
    case 'Founder':
    default:
      return [
        navItemConfig.dashboard,
        navItemConfig.financials,
        navItemConfig.aiToolkit,
        navItemConfig.capTable,
      ];
  }
};

const MoreMenuSheet = () => {
    const { userProfile } = useAuth();
    if (!userProfile) return null;

    const mainItemsHrefs = getSidebarNavItems(userProfile.role).map(item => item.href);
    const bottomItemsHrefs = getBottomNavItems(userProfile.role).map(item => item.href);

    const allNavItems = { ...navItemConfig };
    const menuItems = Object.values(allNavItems).filter(item => 
        !mainItemsHrefs.includes(item.href) && 
        !bottomItemsHrefs.includes(item.href) &&
        item.href !== '/dashboard/settings' &&
        item.href !== '/dashboard/help'
    );
    
    // Custom logic to add analytics for founder
    if (userProfile.role === 'Founder' && !menuItems.some(i => i.href === '/dashboard/analytics')) {
        menuItems.push({ ...navItemConfig.analytics, label: 'Analytics' });
    }
     // Custom logic to add docs for CA
    if (userProfile.role === 'CA' && !menuItems.some(i => i.href === '/dashboard/documents')) {
        menuItems.push(navItemConfig.documents);
    }
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="inline-flex flex-col items-center justify-center px-1 text-center text-muted-foreground group">
                    <MoreHorizontal className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-3/4 rounded-t-lg">
                <SheetHeader>
                    <SheetTitle>More Options</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                    <nav className="flex flex-col gap-1 p-4">
                        {menuItems.map(item => (
                             <SheetTrigger asChild key={item.label}>
                                <Link
                                    href={item.href}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{item.label}</span>
                                        {item.locked && (
                                            <Lock className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </SheetTrigger>
                        ))}
                         <SheetTrigger asChild>
                            <Link href="/dashboard/settings" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted mt-4 border-t">
                                <div className="flex items-center gap-4">
                                    <Settings className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">Settings</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </SheetTrigger>
                         <SheetTrigger asChild>
                            <Link href="/dashboard/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-4">
                                    <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">Help &amp; FAQ</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </SheetTrigger>
                    </nav>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};


const BottomNavBar = () => {
    const pathname = usePathname();
    const { userProfile } = useAuth();
    if (!userProfile) return null;

    const bottomNavItems = getBottomNavItems(userProfile.role);

    return (
        <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-card border-t md:hidden">
            <div className="grid h-full grid-cols-5 mx-auto">
                {bottomNavItems.map(item => {
                    const isActive = (item.href === '/dashboard' && pathname === item.href) ||
                                     (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "inline-flex flex-col items-center justify-center px-1 text-center group",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
                <MoreMenuSheet />
            </div>
        </div>
    );
};


function DashboardApp({ children }: { children: React.ReactNode }) {
  const { userProfile, notifications, markNotificationAsRead, markAllNotificationsAsRead, isDevMode } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const pathname = usePathname();

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
  
  const navItems = getSidebarNavItems(userProfile.role);

  const bonusCredits = userProfile.creditBalance ?? 0;
  const dailyCreditsUsed = userProfile.dailyCreditsUsed ?? 0;
  const creditLimit = userProfile.dailyCreditLimit ?? 0;
  const dailyRemaining = Math.max(0, creditLimit - dailyCreditsUsed);
  const totalCreditsRemaining = bonusCredits + dailyRemaining;

  const isPro = planHierarchy[userProfile.plan] > 0;

  return (
      <>
        <FeatureLockedModal
            featureName={lockedFeature}
            onOpenChange={() => setLockedFeature(null)}
        />
        <NotificationModal 
            isOpen={!!selectedNotification} 
            onOpenChange={() => setSelectedNotification(null)}
            notification={selectedNotification}
        />
        <div className="flex h-screen w-full">
            <DesktopSidebar navItems={navItems} userProfile={userProfile} onLockedFeatureClick={setLockedFeature} />
            <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0">
                         <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary">
                            {isPro && <Flame className="h-6 w-6 text-accent" />}
                            <Logo />
                            <span className="flex items-center">
                                Claari
                                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">BETA</Badge>
                            </span>
                            </Link>
                        </div>
                        <ScrollArea className="flex-1">
                            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                            {navItems.map((item) => {
                                const isActive = item.href === '/dashboard' 
                                ? pathname === item.href 
                                : pathname.startsWith(item.href);
                                const isLocked = item.locked && !isPro && !isDevMode;

                                return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            onLockedFeatureClick(item.label);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        isActive && "bg-muted text-primary",
                                        isLocked && "cursor-not-allowed"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                    {isLocked && <Lock className="ml-auto h-4 w-4 opacity-50" />}
                                </Link>
                                )
                            })}
                            </nav>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
                <div className="flex-1">
                <div className="flex items-center gap-2 font-bold font-headline text-primary md:hidden">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        {isPro && <Flame className="h-6 w-6 text-accent" />}
                        <Logo />
                        <span>Claari</span>
                    </Link>
                </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                            <Globe className="mr-2 h-4 w-4" />
                            English
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value="en">
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="hi" disabled>Hindi (coming soon)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/dashboard/settings?tab=subscription" className="hidden md:flex items-center gap-2 text-sm font-medium border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors interactive-lift">
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
                                    className="flex items-start gap-3 p-3 cursor-pointer rounded-none border-b"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="p-2 bg-muted rounded-full">
                                        {getIcon(notification.icon)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium text-sm leading-tight text-foreground">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 self-start"></div>}
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
            <main 
                className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20 md:pb-6 overflow-y-auto"
            >
                <BetaBanner />
                {children}
            </main>
            <BottomNavBar />
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
  const pathname = usePathname();

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

const DesktopSidebar = ({ navItems, userProfile, onLockedFeatureClick }: { navItems: ThemedNavItem[], userProfile: UserProfile, onLockedFeatureClick: (feature: string) => void }) => {
    const pathname = usePathname();
    const { isDevMode } = useAuth();
    const isPro = planHierarchy[userProfile.plan] > 0;
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: ThemedNavItem) => {
        if (item.locked && !isPro && !isDevMode) {
            e.preventDefault();
            onLockedFeatureClick(item.label);
        }
    };

    return (
      <div className="hidden w-[280px] shrink-0 border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-primary">
              {isPro && <Flame className="h-6 w-6 text-accent" />}
              <Logo />
              <span className="flex items-center">
                Claari
                 <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">BETA</Badge>
              </span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                const isLocked = item.locked && !isPro && !isDevMode;

                return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item)}
                      className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-card-foreground/70 transition-all relative interactive-lift hover:bg-muted",
                          isActive && "text-primary font-semibold bg-muted",
                          isLocked && "cursor-not-allowed"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                      {item.label}
                      {isLocked && (
                        <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                      )}
                    </Link>
                )
              })}
            </nav>
          </ScrollArea>
           <div className="mt-auto p-4 border-t">
              <Link href="/dashboard/settings">
                <div className="flex items-center gap-3 rounded-lg p-2 text-sm font-medium text-card-foreground/80 transition-all hover:bg-muted">
                    <Settings className="h-5 w-5" />
                    <div className="flex-1">
                       <p className="font-semibold">Settings</p>
                    </div>
                     <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
               <Link href="/dashboard/help">
                <div className="flex items-center gap-3 rounded-lg p-2 text-sm font-medium text-card-foreground/80 transition-all hover:bg-muted">
                    <LifeBuoy className="h-5 w-5" />
                    <div className="flex-1">
                       <p className="font-semibold">Help & FAQ</p>
                    </div>
                     <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
          </div>
        </div>
      </div>
    );
};
