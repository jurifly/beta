
"use client";

import Link from "next/link";
import React from "react";
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
  User,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Briefcase,
  BookUser,
  CheckCircle,
  Calculator,
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
import { BetaBanner } from "./beta-banner";
import { useToast } from "@/hooks/use-toast";
import { FeatureLockedModal } from "@/components/dashboard/feature-locked-modal";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";


export type Language = 'en' | 'hi' | 'es' | 'zh' | 'fr' | 'de' | 'pt' | 'ja';
export type Translations = Record<string, Record<Language, string>>;

const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '简体中文' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
];

export const translations: Translations = {
    // Nav Items
    dashboard: { en: "Dashboard", hi: "डैशबोर्ड", es: "Panel", zh: "仪表板", fr: "Tableau de bord", de: "Dashboard", pt: "Painel", ja: "ダッシュボード" },
    advisorHub: { en: "Advisor Hub", hi: "सलाहकार हब", es: "Centro de Asesores", zh: "顾问中心", fr: "Pôle Conseiller", de: "Berater-Hub", pt: "Hub de Consultores", ja: "アドバイザーハブ" },
    aiToolkit: { en: "AI Toolkit", hi: "AI टूलकिट", es: "Herramientas de IA", zh: "AI工具箱", fr: "Outils d'IA", de: "KI-Werkzeugkasten", pt: "Kit de Ferramentas de IA", ja: "AIツールキット" },
    launchPad: { en: "Launch Pad", hi: "लॉन्च पैड", es: "Plataforma de Lanzamiento", zh: "启动台", fr: "Rampe de Lancement", de: "Startrampe", pt: "Plataforma de Lançamento", ja: "ローンチパッド" },
    capTable: { en: "Cap Table", hi: "कैप टेबल", es: "Tabla de Capitalización", zh: "股权结构表", fr: "Table de Capitalisation", de: "Kapitalisierungstabelle", pt: "Tabela de Capitalização", ja: "キャップテーブル" },
    financials: { en: "Financials", hi: "वित्तीय", es: "Finanzas", zh: "财务", fr: "Finances", de: "Finanzen", pt: "Finanças", ja: "財務" },
    docVault: { en: "Doc Vault", hi: "दस्तावेज़ वॉल्ट", es: "Bóveda de Documentos", zh: "文档保险库", fr: "Coffre-fort de Documents", de: "Dokumententresor", pt: "Cofre de Documentos", ja: "ドキュメント保管庫" },
    portfolioAnalytics: { en: "Portfolio Analytics", hi: "पोर्टफोलियो एनालिटिक्स", es: "Análisis de Cartera", zh: "投资组合分析", fr: "Analyse de Portefeuille", de: "Portfolio-Analyse", pt: "Análise de Portfólio", ja: "ポートフォリオ分析" },
    community: { en: "Community", hi: "समुदाय", es: "Comunidad", zh: "社区", fr: "Communauté", de: "Gemeinschaft", pt: "Comunidade", ja: "コミュニティ" },
    clients: { en: "Clients", hi: "क्लाइंट", es: "Clientes", zh: "客户", fr: "Clients", de: "Kunden", pt: "Clientes", ja: "クライアント" },
    team: { en: "Team", hi: "टीम", es: "Equipo", zh: "团队", fr: "Équipe", de: "Team", pt: "Equipe", ja: "チーム" },
    clauseLibrary: { en: "Clause Library", hi: "क्लॉज लाइब्रेरी", es: "Biblioteca de Cláusulas", zh: "条款库", fr: "Bibliothèque de Clauses", de: "Klauselbibliothek", pt: "Biblioteca de Cláusulas", ja: "条項ライブラリ" },
    workflows: { en: "Workflows", hi: "वर्कफ़्लो", es: "Flujos de Trabajo", zh: "工作流", fr: "Flux de Travail", de: "Arbeitsabläufe", pt: "Fluxos de Trabalho", ja: "ワークフロー" },
    reportCenter: { en: "Report Center", hi: "रिपोर्ट केंद्र", es: "Centro de Informes", zh: "报告中心", fr: "Centre de Rapports", de: "Berichtszentrum", pt: "Central de Relatórios", ja: "レポートセンター" },
    reconciliation: { en: "Reconciliation", hi: "समाधान", es: "Conciliación", zh: "对账", fr: "Rapprochement", de: "Abstimmung", pt: "Conciliação", ja: "照合" },
    settings: { en: "Settings", hi: "सेटिंग्स", es: "Configuración", zh: "设置", fr: "Paramètres", de: "Einstellungen", pt: "Configurações", ja: "設定" },
    help: { en: "Help & FAQ", hi: "मदद और FAQ", es: "Ayuda y Preguntas", zh: "帮助与常见问题", fr: "Aide & FAQ", de: "Hilfe & FAQ", pt: "ヘルプ & FAQ", ja: "ヘルプ & FAQ" },
    analytics: { en: "Analytics", hi: "एनालिटिक्स", es: "Análisis", zh: "分析", fr: "Analytique", de: "Analytik", pt: "Análises", ja: "分析" },
    playbook: { en: "Playbook", hi: "प्लेबुक", es: "Manual", zh: "手册", fr: "Guide", de: "Spielbuch", pt: "Manual", ja: "プレイブック" },
    teamManagement: { en: "Team Management", hi: "टीम प्रबंधन", es: "Gestión de Equipo", zh: "团队管理", fr: "Gestion d'Équipe", de: "Team-Management", pt: "Gestão de Equipe", ja: "チーム管理" },
    clientManagement: { en: "Client Management", hi: "क्लाइंट प्रबंधन", es: "Gestión de Clientes", zh: "客户管理", fr: "Gestion des Clients", de: "Kundenverwaltung", pt: "Gestão de Clientes", ja: "クライアント管理" },
    aiPracticeSuite: { en: "AI Practice Suite", hi: "AI प्रैक्टिस सुइट", es: "Suite de Práctica de IA", zh: "AI实践套件", fr: "Suite Pratique IA", de: "KI-Praxis-Suite", pt: "Suíte de Prática de IA", ja: "AI実務スイート" },
    aiCounselTools: { en: "AI Counsel Tools", hi: "AI काउंसिल टूल्स", es: "Herramientas de Asesoría de IA", zh: "AI法律顾问工具", fr: "Outils de Conseil IA", de: "KI-Rechtsberatungstools", pt: "Ferramentas de Aconselhamento de IA", ja: "AIカウンセルツール" },
    aiComplianceSuite: { en: "AI Compliance Suite", hi: "AI अनुपालन सुइट", es: "Suite de Cumplimiento de IA", zh: "AI合规套件", fr: "Suite de Conformité IA", de: "KI-Compliance-Suite", pt: "Suíte de Conformidade de IA", ja: "AIコンプライアンススイート" },
    invitations: { en: "Invitations", hi: "निमंत्रण", es: "Invitaciones", zh: "邀请", fr: "Invitations", de: "Einladungen", pt: "Convites", ja: "招待状" },
    taxesCalculation: { en: "Taxes & Calculation", hi: "कर और गणना", es: "Impuestos y Cálculo", zh: "税务与计算", fr: "Taxes & Calcul", de: "Steuern & Berechnung", pt: "Impostos & Cálculo", ja: "税金と計算" },

    // Global UI
    beta: { en: "Beta", hi: "बीटा", es: "Beta", zh: "测试版", fr: "Bêta", de: "Beta", pt: "Beta", ja: "ベータ" },
    more: { en: "More", hi: "अन्य", es: "Más", zh: "更多", fr: "Plus", de: "Mehr", pt: "Mais", ja: "その他" },
    moreOptions: { en: "More Options", hi: "अन्य विकल्प", es: "Más Opciones", zh: "更多选项", fr: "Plus d'Options", de: "Weitere Optionen", pt: "Mais Opções", ja: "その他のオプション" },
    notifications: { en: "Notifications", hi: "सूचनाएं", es: "Notificaciones", zh: "通知", fr: "Notifications", de: "Benachrichtigungen", pt: "Notificações", ja: "通知" },
    markAllAsRead: { en: "Mark all as read", hi: "सभी को पढ़ा हुआ चिह्नित करें", es: "Marcar todo como leído", zh: "全部标记为已读", fr: "Tout marquer comme lu", de: "Alle als gelesen markieren", pt: "Marcar tudo como lido", ja: "すべて既読にする" },
    youAreCaughtUp: { en: "You're all caught up!", hi: "आप पूरी तरह से अपडेट हैं!", es: "¡Estás al día!", zh: "您已处理所有通知！", fr: "Vous êtes à jour !", de: "Du bist auf dem Laufenden!", pt: "Você está em dia!", ja: "すべて完了しました！" },
    unlimitedCredits: { en: "Unlimited Credits", hi: "असीमित क्रेडिट", es: "Créditos Ilimitados", zh: "无限信用", fr: "Crédits Illimités", de: "Unbegrenzte Kredite", pt: "Créditos Ilimitados", ja: "無制限クレジット" },
    creditsLeft: { en: "credits left", hi: "क्रेडिट शेष", es: "créditos restantes", zh: "剩余信用", fr: "crédits restants", de: "Kredite übrig", pt: "créditos restantes", ja: "クレジット残り" },
    goTo: { en: "Go to", hi: "पर जाएँ", es: "Ir a", zh: "前往", fr: "Aller à", de: "Gehe zu", pt: "Ir para", ja: "移動" },
    
    // Dashboard Page
    welcome: { en: "Welcome", hi: "स्वागत है", es: "Bienvenido", zh: "欢迎", fr: "Bienvenue", de: "Willkommen", pt: "Bem-vindo", ja: "ようこそ" },
    workspaceOverview: { en: "Here's an overview of your workspace", hi: "यहाँ आपके कार्यक्षेत्र का अवलोकन है", es: "Aquí tienes un resumen de tu espacio de trabajo", zh: "这是您的工作区概览", fr: "Voici un aperçu de votre espace de travail", de: "Hier ist eine Übersicht über Ihren Arbeitsbereich", pt: "Aqui está uma visão geral do seu espaço de trabalho", ja: "ワークスペースの概要です" },
    for: { en: "for", hi: "के लिए", es: "para", zh: "为", fr: "pour", de: "für", pt: "para", ja: "の" },
    addClient: { en: "Add Client", hi: "क्लाइंट जोड़ें", es: "Añadir Cliente", zh: "添加客户", fr: "Ajouter un Client", de: "Kunde hinzufügen", pt: "Adicionar Cliente", ja: "クライアントを追加" },
    addCompany: { en: "Add Company", hi: "कंपनी जोड़ें", es: "Añadir Empresa", zh: "添加公司", fr: "Ajouter une Entreprise", de: "Unternehmen hinzufügen", pt: "Adicionar Empresa", ja: "会社を追加" },
    welcomeWorkspace: { en: "Welcome to your workspace!", hi: "आपके कार्यक्षेत्र में स्वागत है!", es: "¡Bienvenido a tu espacio de trabajo!", zh: "欢迎来到您的工作区！", fr: "Bienvenue dans votre espace de travail !", de: "Willkommen in deinem Arbeitsbereich!", pt: "Bem-vindo ao seu espaço de trabalho!", ja: "ワークスペースへようこそ！" },
    addCompanyPrompt: { en: "Add your first company to create a compliance calendar and access AI tools.", hi: "अनुपालन कैलेंडर बनाने और AI टूल तक पहुंचने के लिए अपनी पहली कंपनी जोड़ें।", es: "Añade tu primera empresa para crear un calendario de cumplimiento y acceder a las herramientas de IA.", zh: "添加您的第一家公司以创建合规日历并访问AI工具。", fr: "Ajoutez votre première entreprise pour créer un calendrier de conformité et accéder aux outils d'IA.", de: "Fügen Sie Ihr erstes Unternehmen hinzu, um einen Compliance-Kalender zu erstellen und auf KI-Tools zuzugreifen.", pt: "Adicione sua primeira empresa para criar um calendário de conformidade e acessar as ferramentas de IA.", ja: "最初の会社を追加して、コンプライアンスカレンダーを作成し、AIツールにアクセスします。" },
    welcomeAdvisor: { en: "Welcome, Advisor!", hi: "स्वागत है, सलाहकार!", es: "¡Bienvenido, Asesor!", zh: "欢迎，顾问！", fr: "Bienvenue, Conseiller !", de: "Willkommen, Berater!", pt: "Bem-vindo, Consultor!", ja: "ようこそ、アドバイザー！" },
    addFirstClientPrompt: { en: "Add your first client company to get started, or accept a pending invitation.", hi: "शुरू करने के लिए अपनी पहली क्लाइंट कंपनी जोड़ें, या एक लंबित निमंत्रण स्वीकार करें।", es: "Añade tu primera empresa cliente para empezar, o acepta una invitación pendiente.", zh: "添加您的第一个客户公司以开始，或接受待定的邀请。", fr: "Ajoutez votre première entreprise cliente pour commencer, ou acceptez une invitation en attente.", de: "Fügen Sie Ihr erstes Kundenunternehmen hinzu, um loszulegen, oder nehmen Sie eine ausstehende Einladung an.", pt: "Adicione sua primeira empresa cliente para começar ou aceite um convite pendente.", ja: "最初のクライアント会社を追加して開始するか、保留中の招待を承認してください。" },
    viewInvitations: { en: "View Invitations", hi: "निमंत्रण देखें", es: "Ver Invitaciones", zh: "查看邀请", fr: "Voir les Invitations", de: "Einladungen anzeigen", pt: "Ver Convites", ja: "招待状を見る" },
    hygieneScore: { en: "Legal Hygiene Score", hi: "कानूनी स्वच्छता स्कोर", es: "Puntuación de Higiene Legal", zh: "法律卫生评分", fr: "Score d'Hygiène Juridique", de: "Rechtshygiene-Score", pt: "Pontuação de Higiene Jurídica", ja: "リーガルハイジーンスコア" },
    upcomingFilings: { en: "Upcoming Filings", hi: "आगामी फाइलिंग", es: "Próximas Presentaciones", zh: "即将提交", fr: "Dépôts à Venir", de: "Anstehende Einreichungen", pt: "Próximos Registros", ja: "今後の提出書類" },
    inNext30Days: { en: "In next 30 days", hi: "अगले 30 दिनों में", es: "En los próximos 30 días", zh: "未来30天内", fr: "Dans les 30 prochains jours", de: "In den nächsten 30 Tagen", pt: "Nos próximos 30 dias", ja: "今後30日以内" },
    equityIssued: { en: "Equity Issued", hi: "इक्विटी जारी", es: "Capital Emitido", zh: "已发行股权", fr: "Capitaux Propres Émis", de: "Ausgegebenes Eigenkapital", pt: "Capital Emitido", ja: "発行済み株式" },
    alerts: { en: "Alerts", hi: "अलर्ट", es: "Alertas", zh: "警报", fr: "Alertes", de: "Warnungen", pt: "Alertas", ja: "アラート" },
    overdueTasks: { en: "Overdue tasks", hi: "अतिदेय कार्य", es: "Tareas atrasadas", zh: "逾期任务", fr: "Tâches en retard", de: "Überfällige Aufgaben", pt: "Tarefas atrasadas", ja: "期限切れのタスク" },
    noOverdueTasks: { en: "No overdue tasks", hi: "कोई अतिदेय कार्य नहीं", es: "No hay tareas atrasadas", zh: "无逾期任务", fr: "Aucune tâche en retard", de: "Keine überfälligen Aufgaben", pt: "Nenhuma tarefa atrasada", ja: "期限切れのタスクはありません" },
    proactiveAISuggestions: { en: "Proactive AI Suggestions", hi: "सक्रिय AI सुझाव", es: "Sugerencias Proactivas de IA", zh: "主动式AI建议", fr: "Suggestions Proactives de l'IA", de: "Proaktive KI-Vorschläge", pt: "Sugestões Proativas de IA", ja: "プロアクティブAI提案" },
    timelyAdvice: { en: "Timely advice from our AI to help you stay ahead.", hi: "हमारे AI से समय पर सलाह ताकि आप आगे रहें।", es: "Consejos oportunos de nuestra IA para ayudarte a mantenerte a la vanguardia.", zh: "我们AI的及时建议，助您保持领先。", fr: "Conseils opportuns de notre IA pour vous aider à garder une longueur d'avance.", de: "Rechtzeitige Ratschläge von unserer KI, um Ihnen zu helfen, immer einen Schritt voraus zu sein.", pt: "Conselhos oportunos da nossa IA para ajudá-lo a se manter à frente.", ja: "AIからのタイムリーなアドバイスで、一歩先を行きましょう。" },
    noSpecialInsights: { en: "No special insights at the moment. You're all set!", hi: "फिलहाल कोई विशेष अंतर्दृष्टि नहीं है। आप पूरी तरह से तैयार हैं!", es: "No hay ideas especiales en este momento. ¡Estás listo!", zh: "目前没有特别的见解。一切就绪！", fr: "Pas d'aperçus spéciaux pour le moment. Vous êtes prêt !", de: "Im Moment keine besonderen Einblicke. Alles bestens!", pt: "Nenhuma visão especial no momento. Está tudo pronto!", ja: "現在、特別なインサイトはありません。準備は万端です！" },
    complianceChecklist: { en: "Compliance Checklist", hi: "अनुपालन चेकलिस्ट", es: "Lista de Verificación de Cumplimiento", zh: "合规清单", fr: "Liste de Contrôle de Conformité", de: "Compliance-Checkliste", pt: "Lista de Verificação de Conformidade", ja: "コンプライアンスチェックリスト" },
    keyComplianceItems: { en: "Key compliance items for your company, grouped by month.", hi: "आपकी कंपनी के लिए महीने के अनुसार समूहित प्रमुख अनुपालन आइटम।", es: "Elementos clave de cumplimiento para su empresa, agrupados por mes.", zh: "贵公司的关键合规项，按月分组。", fr: "Éléments clés de conformité pour votre entreprise, groupés par mois.", de: "Wichtige Compliance-Elemente für Ihr Unternehmen, nach Monat gruppiert.", pt: "Itens chave de conformidade para sua empresa, agrupados por mês.", ja: "あなたの会社の主要なコンプライアンス項目を月ごとにグループ化しました。" },
    completeAllTasksFor: { en: "Complete all past tasks for", hi: "के लिए सभी पिछले कार्यों को पूरा करें", es: "Completar todas las tareas pasadas para", zh: "完成所有过去的任务", fr: "Terminer toutes les tâches passées pour", de: "Alle vergangenen Aufgaben für", pt: "Concluir todas as tarefas passadas para", ja: "の過去のタスクをすべて完了する" },
    currentMonth: { en: "Current Month", hi: "चालू माह", es: "Mes Actual", zh: "本月", fr: "Mois en Cours", de: "Aktueller Monat", pt: "Mês Atual", ja: "今月" },
    aboutThisTask: { en: "About this task:", hi: "इस कार्य के बारे में:", es: "Acerca de esta tarea:", zh: "关于此任务：", fr: "À propos de cette tâche :", de: "Über diese Aufgabe:", pt: "Sobre esta tarefa:", ja: "このタスクについて：" },
    penaltyForNonCompliance: { en: "Penalty for non-compliance:", hi: "गैर-अनुपालन के लिए जुर्माना:", es: "Penalización por incumplimiento:", zh: "不合规的处罚：", fr: "Pénalité pour non-conformité :", de: "Strafe bei Nichteinhaltung:", pt: "Penalidade por não conformidade:", ja: "不遵守の場合の罰則：" },
    due: { en: "Due", hi: "देय", es: "Vence", zh: "到期", fr: "Échéance", de: "Fällig", pt: "Vence", ja: "期限" },
    overdue: { en: "Overdue", hi: "अतिदेय", es: "Vencido", zh: "逾期", fr: "En retard", de: "Überfällig", pt: "Atrasado", ja: "期限切れ" },
    noItemsForYear: { en: "No items for", hi: "के लिए कोई आइटम नहीं", es: "No hay elementos para", zh: "没有项目", fr: "Aucun élément pour", de: "Keine Einträge für", pt: "Nenhum item para", ja: "のアイテムはありません" },
    selectAnotherYear: { en: "Select another year or check back later.", hi: "दूसरा वर्ष चुनें या बाद में जांचें।", es: "Seleccione otro año o vuelva a consultar más tarde.", zh: "选择另一年或稍后再查看。", fr: "Sélectionnez une autre année ou revenez plus tard.", de: "Wählen Sie ein anderes Jahr oder schauen Sie später wieder vorbei.", pt: "Selecione outro ano ou verifique mais tarde.", ja: "別の年を選択するか、後でもう一度確認してください。" },
    totalClients: { en: "Total Clients", hi: "कुल क्लाइंट", es: "Total de Clientes", zh: "客户总数", fr: "Total des Clients", de: "Kunden insgesamt", pt: "Total de Clientes", ja: "総クライアント数" },
    clientsAtRisk: { en: "Clients at Risk", hi: "जोखिम में क्लाइंट", es: "Clientes en Riesgo", zh: "风险客户", fr: "Clients à Risque", de: "Gefährdete Kunden", pt: "Clientes em Risco", ja: "リスクのあるクライアント" },
    clientsWithLowHealth: { en: "Clients with low health scores", hi: "कम स्वास्थ्य स्कोर वाले क्लाइंट", es: "Clientes con bajas puntuaciones de salud", zh: "健康评分低的客户", fr: "Clients avec de faibles scores de santé", de: "Kunden mit niedrigen Gesundheitswerten", pt: "Clientes com baixas pontuações de saúde", ja: "健全性スコアが低いクライアント" },
    portfolioAnalytics: { en: "Portfolio Analytics", hi: "पोर्टफोलियो एनालिटिक्स", es: "Análisis de Cartera", zh: "投资组合分析", fr: "Analyse de Portefeuille", de: "Portfolio-Analyse", pt: "Análise de Portfólio", ja: "ポートフォリオ分析" },
    view: { en: "View", hi: "देखें", es: "Ver", zh: "查看", fr: "Voir", de: "Ansehen", pt: "Ver", ja: "表示" },
    deepDive: { en: "Deep dive into client health", hi: "क्लाइंट स्वास्थ्य में गहराई से देखें", es: "Análisis profundo de la salud del cliente", zh: "深入了解客户健康状况", fr: "Plongez dans la santé des clients", de: "Tiefer Einblick in die Kundengesundheit", pt: "Análise aprofundada da saúde do cliente", ja: "クライアントの健全性を深掘り" },
    timelyAdvicePractice: { en: "Timely advice to help you manage your practice.", hi: "आपकी प्रैक्टिस को प्रबंधित करने में मदद करने के लिए समय पर सलाह।", es: "Consejos oportunos para ayudarte a gestionar tu práctica.", zh: "及时建议，助您管理业务。", fr: "Conseils opportuns pour vous aider à gérer votre cabinet.", de: "Rechtzeitiger Rat zur Verwaltung Ihrer Praxis.", pt: "Conselhos oportunos para ajudar a gerir sua prática.", ja: "実務管理に役立つタイムリーなアドバイス。" },
    portfolioDeadlines: { en: "Portfolio Deadlines", hi: "पोर्टफोलियो की समय-सीमा", es: "Fechas Límite de la Cartera", zh: "投资组合截止日期", fr: "Échéances du Portefeuille", de: "Portfolio-Fristen", pt: "Prazos do Portfólio", ja: "ポートフォリオの締め切り" },
    upcomingKeyDates: { en: "Upcoming key dates across all your clients.", hi: "आपके सभी क्लाइंट्स के लिए आगामी महत्वपूर्ण तिथियां।", es: "Próximas fechas clave para todos sus clientes.", zh: "所有客户的即将到来的关键日期。", fr: "Prochaines dates clés pour tous vos clients.", de: "Anstehende wichtige Termine für alle Ihre Kunden.", pt: "Próximas datas importantes para todos os seus clientes.", ja: "全クライアントの今後の主要な日程。" },
    noUpcomingDeadlines: { en: "No upcoming deadlines.", hi: "कोई आगामी समय-सीमा नहीं।", es: "No hay plazos próximos.", zh: "没有即将到来的截止日期。", fr: "Aucune échéance à venir.", de: "Keine anstehenden Fristen.", pt: "Nenhum prazo próximo.", ja: "今後の締め切りはありません。" },
    recentActivity: { en: "Recent Activity", hi: "हाल की गतिविधि", es: "Actividad Reciente", zh: "最近活动", fr: "Activité Récente", de: "Letzte Aktivitäten", pt: "Atividade Recente", ja: "最近のアクティビティ" },
    latestActions: { en: "The latest actions from your portfolio.", hi: "आपके पोर्टफोलियो से नवीनतम कार्रवाइयां।", es: "Las últimas acciones de su cartera.", zh: "您投资组合的最新动态。", fr: "Les dernières actions de votre portefeuille.", de: "Die neuesten Aktionen aus Ihrem Portfolio.", pt: "As últimas ações do seu portfólio.", ja: "ポートフォリオの最新アクション。" },
    noRecentActivity: { en: "No recent activity.", hi: "कोई हाल की गतिविधि नहीं।", es: "No hay actividad reciente.", zh: "没有最近的活动。", fr: "Aucune activité récente.", de: "Keine kürzlichen Aktivitäten.", pt: "Nenhuma atividade recente.", ja: "最近のアクティビティはありません。" },
    aiDocAnalyzer: { en: "AI Document Analyzer", hi: "AI दस्तावेज़ विश्लेषक", es: "Analizador de Documentos IA", zh: "AI文档分析器", fr: "Analyseur de Documents IA", de: "KI-Dokumentenanalysator", pt: "Analisador de Documentos IA", ja: "AIドキュメントアナライザー" },
    aiDocAnalyzerDesc: { en: "Instantly upload a contract to identify risks, find missing clauses, and get redline suggestions.", hi: "जोखिमों की पहचान करने, गुम क्लॉज़ खोजने, और रेडलाइन सुझाव प्राप्त करने के लिए तुरंत एक अनुबंध अपलोड करें।", es: "Cargue un contrato al instante para identificar riesgos, encontrar cláusulas faltantes y obtener sugerencias de revisión.", zh: "立即上传合同以识别风险、查找缺失条款并获取红线建议。", fr: "Téléchargez instantanément un contrat pour identifier les risques, trouver les clauses manquantes et obtenir des suggestions de révision.", de: "Laden Sie sofort einen Vertrag hoch, um Risiken zu identifizieren, fehlende Klauseln zu finden und Redline-Vorschläge zu erhalten.", pt: "Carregue um contrato instantaneamente para identificar riscos, encontrar cláusulas ausentes e obter sugestões de revisão.", ja: "契約書を即座にアップロードして、リスクの特定、不足している条項の発見、修正提案の取得を行います。" },
    activeMatters: { en: "Active Matters", hi: "सक्रिय मामले", es: "Asuntos Activos", zh: "活跃事项", fr: "Dossiers Actifs", de: "Aktive Angelegenheiten", pt: "Assuntos Ativos", ja: "進行中の案件" },
    acrossAllClients: { en: "Across all clients", hi: "सभी क्लाइंट्स में", es: "En todos los clientes", zh: "所有客户", fr: "Tous clients confondus", de: "Über alle Kunden hinweg", pt: "Em todos os clientes", ja: "全クライアント" },
    contractsAnalyzed: { en: "Contracts Analyzed", hi: "विश्लेषित अनुबंध", es: "Contratos Analizados", zh: "已分析合同", fr: "Contrats Analysés", de: "Analysierte Verträge", pt: "Contratos Analisados", ja: "分析済み契約書" },
    thisMonth: { en: "This month", hi: "इस महीने", es: "Este mes", zh: "本月", fr: "Ce mois-ci", de: "Diesen Monat", pt: "Este mês", ja: "今月" },
    pendingRedlines: { en: "Pending Redlines", hi: "लंबित रेडलाइन", es: "Revisiones Pendientes", zh: "待处理的红线", fr: "Révisions en Attente", de: "Ausstehende Redlines", pt: "Revisões Pendentes", ja: "保留中の修正" },
    awaitingReview: { en: "Awaiting your review", hi: "आपकी समीक्षा की प्रतीक्षा में", es: "Esperando su revisión", zh: "等待您的审核", fr: "En attente de votre relecture", de: "Wartet auf Ihre Überprüfung", pt: "Aguardando sua revisão", ja: "レビュー待ち" },
    legalResearch: { en: "Legal Research", hi: "कानूनी अनुसंधान", es: "Investigación Legal", zh: "法律研究", fr: "Recherche Juridique", de: "Rechtsrecherche", pt: "Pesquisa Jurídica", ja: "リーガルリサーチ" },
    queriesThisMonth: { en: "Queries this month", hi: "इस महीने की पूछताछ", es: "Consultas este mes", zh: "本月查询", fr: "Requêtes ce mois-ci", de: "Anfragen diesen Monat", pt: "Consultas este mês", ja: "今月のクエリ" },
    managedEntities: { en: "Managed Entities", hi: "प्रबंधित इकाइयाँ", es: "Entidades Gestionadas", zh: "受管实体", fr: "Entités Gérées", de: "Verwaltete Einheiten", pt: "Entidades Gerenciadas", ja: "管理エンティティ" },
    acrossOrganization: { en: "Across the organization", hi: "संगठन भर में", es: "En toda la organización", zh: "整个组织", fr: "Dans toute l'organisation", de: "In der gesamten Organisation", pt: "Em toda a organização", ja: "組織全体" },
    overallRiskScore: { en: "Overall Risk Score", hi: "समग्र जोखिम स्कोर", es: "Puntuación de Riesgo General", zh: "总体风险评分", fr: "Score de Risque Global", de: "Gesamtrisikobewertung", pt: "Pontuação de Risco Geral", ja: "総合リスクスコア" },
    connectDataSources: { en: "Connect data sources", hi: "डेटा स्रोत कनेक्ट करें", es: "Conectar fuentes de datos", zh: "连接数据源", fr: "Connecter les sources de données", de: "Datenquellen verbinden", pt: "Conectar fontes de dados", ja: "データソースを接続" },
    pendingApprovals: { en: "Pending Approvals", hi: "लंबित अनुमोदन", es: "Aprobaciones Pendientes", zh: "待审批", fr: "Approbations en Attente", de: "Ausstehende Genehmigungen", pt: "Aprovações Pendentes", ja: "保留中の承認" },
    inYourWorkflows: { en: "In your workflows", hi: "आपके वर्कफ़्लो में", es: "En sus flujos de trabajo", zh: "在您的工作流中", fr: "Dans vos flux de travail", de: "In Ihren Workflows", pt: "Nos seus fluxos de trabalho", ja: "ワークフロー内" },
    dataroomReadiness: { en: "Dataroom Readiness", hi: "डेटा रूम तैयारी", es: "Preparación de Dataroom", zh: "数据室准备情况", fr: "Préparation de la Dataroom", de: "Dataroom-Bereitschaft", pt: "Prontidão do Dataroom", ja: "データルーム準備" },
    forUpcomingMA: { en: "For upcoming M&A", hi: "आगामी M&A के लिए", es: "Para futuras fusiones y adquisiciones", zh: "为即将到来的并购", fr: "Pour les futures fusions et acquisitions", de: "Für bevorstehende M&A", pt: "Para futuras fusões e aquisições", ja: "今後のM&Aのために" },
    aiAuditAssistant: { en: "AI Audit Assistant", hi: "AI ऑडिट सहायक", es: "Asistente de Auditoría IA", zh: "AI审计助手", fr: "Assistant d'Audit IA", de: "KI-Audit-Assistent", pt: "Assistente de Auditoria IA", ja: "AI監査アシスタント" },
    aiAuditAssistantDesc: { en: "Prepare for SOC2, ISO, or internal audits by validating your documents against compliance checklists.", hi: "अनुपालन चेकलिस्ट के खिलाफ अपने दस्तावेज़ों को मान्य करके SOC2, ISO, या आंतरिक ऑडिट की तैयारी करें।", es: "Prepárese para auditorías SOC2, ISO o internas validando sus documentos contra listas de verificación de cumplimiento.", zh: "通过对照合规清单验证您的文档，为SOC2、ISO或内部审计做准备。", fr: "Préparez-vous aux audits SOC2, ISO ou internes en validant vos documents par rapport aux listes de contrôle de conformité.", de: "Bereiten Sie sich auf SOC2-, ISO- oder interne Audits vor, indem Sie Ihre Dokumente anhand von Compliance-Checklisten validieren.", pt: "Prepare-se para auditorias SOC2, ISO ou internas, validando seus documentos em listas de verificação de conformidade.", ja: "コンプライアンスチェックリストに対してドキュメントを検証し、SOC2、ISO、または内部監査の準備をします。" },
    workflowAutomation: { en: "Workflow Automation", hi: "वर्कफ़्लो ऑटोमेशन", es: "Automatización de Flujos de Trabajo", zh: "工作流自动化", fr: "Automatisation des Flux de Travail", de: "Workflow-Automatisierung", pt: "Automação de Fluxos de Trabalho", ja: "ワークフロー自動化" },
    workflowAutomationDesc: { en: "Create powerful automations to streamline compliance processes and approvals.", hi: "अनुपालन प्रक्रियाओं और अनुमोदनों को सुव्यवस्थित करने के लिए शक्तिशाली ऑटोमेशन बनाएं।", es: "Cree potentes automatizaciones para agilizar los procesos de cumplimiento и las aprobaciones.", zh: "创建强大的自动化以简化合规流程和审批。", fr: "Créez de puissantes automatisations pour rationaliser les processus de conformité et les approbations.", de: "Erstellen Sie leistungsstarke Automatisierungen, um Compliance-Prozesse und Genehmigungen zu optimieren.", pt: "Crie automações poderosas para agilizar os processos de conformidade e as aprovações.", ja: "コンプライアンスプロセスと承認を合理化するための強力な自動化を作成します。" },
    toastComplianceUpdatedTitle: { en: "Compliance Updated", hi: "अनुपालन अपडेट किया गया", es: "Cumplimiento Actualizado", zh: "合规性已更新", fr: "Conformité Mise à Jour", de: "Compliance aktualisiert", pt: "Conformidade Atualizada", ja: "コンプライアンス更新済み" },
    toastComplianceUpdatedDesc: { en: "All past tasks for", hi: "के लिए सभी पिछले कार्य", es: "Todas las tareas pasadas para", zh: "所有过去的任务", fr: "Toutes les tâches passées pour", de: "Alle vergangenen Aufgaben für", pt: "Todas as tarefas passadas para", ja: "のすべての過去のタスク" },
};

type NavItemConfig = {
    [key: string]: {
        href: string;
        translationKey: keyof typeof translations;
        icon: React.ElementType;
        locked?: boolean;
        label?: string; // For overrides
    }
}

const navItemConfig: NavItemConfig = {
  dashboard: { href: "/dashboard", translationKey: "dashboard", icon: LayoutDashboard },
  caConnect: { href: "/dashboard/ca-connect", translationKey: "advisorHub", icon: Users },
  aiToolkit: { href: "/dashboard/ai-toolkit", translationKey: "aiToolkit", icon: Sparkles },
  launchPad: { href: "/dashboard/business-setup", translationKey: "launchPad", icon: Network },
  capTable: { href: "/dashboard/cap-table", translationKey: "capTable", icon: PieChart },
  financials: { href: "/dashboard/financials", translationKey: "financials", icon: Receipt },
  documents: { href: "/dashboard/documents", translationKey: "docVault", icon: Archive },
  portfolioAnalytics: { href: "/dashboard/analytics", translationKey: "portfolioAnalytics", icon: LineChart },
  community: { href: "/dashboard/community", translationKey: "community", icon: MessageSquare, locked: true },
  clients: { href: "/dashboard/clients", translationKey: "clients", icon: FolderKanban },
  team: { href: "/dashboard/team", translationKey: "team", icon: Users, locked: true },
  clauseLibrary: { href: "/dashboard/clause-library", translationKey: "clauseLibrary", icon: Library },
  workflows: { href: "/dashboard/ai-toolkit?tab=workflows", translationKey: "workflows", icon: Workflow, locked: true },
  reportCenter: { href: "/dashboard/report-center", translationKey: "reportCenter", icon: FileText, locked: true },
  reconciliation: { href: "/dashboard/ai-toolkit?tab=reconciliation", translationKey: "reconciliation", icon: Scale, locked: true },
  settings: { href: "/dashboard/settings", translationKey: "settings", icon: Settings },
  help: { href: "/dashboard/help", translationKey: "help", icon: LifeBuoy },
  invitations: { href: "/dashboard/invitations", translationKey: "invitations", icon: Mail },
  taxesAndCalc: { href: "/dashboard/financials", translationKey: "taxesCalculation", icon: Calculator },
} as const;


type ThemedNavItem = (typeof navItemConfig)[keyof typeof navItemConfig] & {
    color?: string;
    label_override_key?: keyof typeof translations;
}

const founderNavItems: ThemedNavItem[] = [
  { ...navItemConfig.dashboard },
  { ...navItemConfig.aiToolkit },
  { ...navItemConfig.capTable },
  { ...navItemConfig.financials },
  { ...navItemConfig.launchPad },
  { ...navItemConfig.reportCenter, locked: true },
  { ...navItemConfig.portfolioAnalytics, label_override_key: "analytics" },
  { ...navItemConfig.caConnect },
  { ...navItemConfig.documents },
  { ...navItemConfig.clauseLibrary, locked: true },
  { ...navItemConfig.community, locked: true },
  { ...navItemConfig.team, label_override_key: "teamManagement", locked: true },
];

const caNavItems: ThemedNavItem[] = [
  { ...navItemConfig.dashboard },
  { ...navItemConfig.clients, label_override_key: "clientManagement", icon: Briefcase },
  { ...navItemConfig.team, label_override_key: "teamManagement", locked: true },
  { ...navItemConfig.aiToolkit, label_override_key: "aiPracticeSuite" },
  { ...navItemConfig.invitations },
  { ...navItemConfig.taxesAndCalc },
  { ...navItemConfig.portfolioAnalytics },
  { ...navItemConfig.launchPad },
  { ...navItemConfig.reportCenter },
  { ...navItemConfig.caConnect, locked: true },
  { ...navItemConfig.workflows, label_override_key: "workflows", locked: true },
  { ...navItemConfig.reconciliation, locked: true },
  { ...navItemConfig.documents },
  { ...navItemConfig.clauseLibrary, locked: false },
];

const legalAdvisorNavItems: ThemedNavItem[] = [
  navItemConfig.dashboard,
  navItemConfig.clients,
  { ...navItemConfig.aiToolkit, label_override_key: "aiCounselTools" },
  navItemConfig.clauseLibrary,
  { ...navItemConfig.invitations },
  { ...navItemConfig.caConnect, locked: true },
  navItemConfig.portfolioAnalytics,
];

const enterpriseNavItems: ThemedNavItem[] = [
  navItemConfig.dashboard,
  { ...navItemConfig.team, label_override_key: "teamManagement", locked: false }, // Unlocked for Enterprise
  navItemConfig.clients,
  navItemConfig.portfolioAnalytics,
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
        CheckCircle: <CheckCircle className="h-5 w-5 text-green-500" />,
        Default: <Bell className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[iconName || 'Default'] || icons.Default;
}

const getBottomNavItems = (role: UserRole): ThemedNavItem[] => {
  // Define a static order/priority for the bottom nav
  const priorityOrder = [
    "/dashboard",
    "/dashboard/clients",
    "/dashboard/ai-toolkit",
    "/dashboard/cap-table",
    "/dashboard/financials",
    "/dashboard/ca-connect",
    "/dashboard/invitations",
    "/dashboard/clause-library",
    "/dashboard/learn"
  ];

  // Filter and sort the role's items based on priority
  return getSidebarNavItems(role)
    .filter(item => priorityOrder.includes(item.href))
    .sort((a, b) => priorityOrder.indexOf(a.href) - priorityOrder.indexOf(b.href))
    .slice(0, 4);
};

const MoreMenuSheet = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => {
    const { userProfile } = useAuth();
    if (!userProfile) return null;

    const bottomItemsHrefs = getBottomNavItems(userProfile.role).map(item => item.href);

    // Items for the 'More' menu are those that are in the role's nav list but not in the bottom bar
    const menuItems = getSidebarNavItems(userProfile.role).filter(item => 
        !bottomItemsHrefs.includes(item.href)
    );
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="inline-flex flex-col items-center justify-center px-1 text-center text-muted-foreground group">
                    <MoreHorizontal className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-medium">{translations['more'][lang]}</span>
                </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-3/4 rounded-t-lg">
                <SheetHeader>
                    <SheetTitle>{translations['moreOptions'][lang]}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                    <nav className="flex flex-col gap-1 p-4">
                        {menuItems.map(item => {
                            const label = translations[item.label_override_key || item.translationKey][lang];
                            return (
                             <SheetTrigger asChild key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{label}</span>
                                        {item.locked && (
                                            <Lock className="ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </SheetTrigger>
                        )})}
                        <SheetTrigger asChild>
                            <Link href="/dashboard/settings" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-4">
                                    <Settings className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{translations.settings[lang]}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </SheetTrigger>
                         <SheetTrigger asChild>
                            <Link href="/dashboard/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-4">
                                    <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{translations.help[lang]}</span>
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


const BottomNavBar = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => {
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
                    
                    const label = translations[item.label_override_key || item.translationKey][lang];

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "inline-flex flex-col items-center justify-center px-1 text-center group",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
                <MoreMenuSheet lang={lang} setLang={setLang} />
            </div>
        </div>
    );
};


function AppShell({ children }: { children: ReactNode }) {
  const { userProfile, notifications, markNotificationAsRead, markAllNotificationsAsRead, isDevMode } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('claari-lang') as Language;
      if (savedLang && languages.some(l => l.code === savedLang)) {
        setLang(savedLang);
      }
    } catch (error) {
      console.error('Could not access localStorage for language settings.', error);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const newLang = langCode as Language;
    setLang(newLang);
    try {
      localStorage.setItem('claari-lang', newLang);
    } catch (error) {
      console.error('Could not access localStorage for language settings.', error);
    }
  };

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
  
  // Pass language to children
  const childrenWithLang = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        return React.cloneElement(child, { lang: lang, translations: translations } as any);
    }
    return child;
  });

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
            <DesktopSidebar navItems={navItems} userProfile={userProfile} onLockedFeatureClick={setLockedFeature} lang={lang} />
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
                            <Logo />
                            <span>Claari</span>
                            </Link>
                        </div>
                        <ScrollArea className="flex-1">
                            <nav className="grid gap-2 text-lg font-medium p-4">
                            {navItems.map((item) => {
                                const isActive = item.href === '/dashboard' 
                                ? usePathname() === item.href 
                                : usePathname().startsWith(item.href);
                                const isLocked = item.locked && !isPro && !isDevMode;
                                const label = translations[item.label_override_key || item.translationKey][lang];

                                return (
                                    <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            setLockedFeature(label);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        isActive && "bg-muted text-primary",
                                        isLocked && "cursor-not-allowed"
                                    )}
                                    >
                                    <item.icon className="h-4 w-4" />
                                    {label}
                                    {isLocked && <Lock className="ml-auto h-4 w-4" />}
                                    </Link>
                                );
                                })}
                            </nav>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
                <div className="w-full flex-1">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary font-headline md:hidden">
                        <Logo />
                        <span>Claari</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center gap-2 md:gap-4 justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                            <Globe className="mr-2 h-4 w-4" />
                            {languages.find(l => l.code === lang)?.name || 'Language'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={lang} onValueChange={handleLanguageChange}>
                            {languages.map(l => (
                                <DropdownMenuRadioItem key={l.code} value={l.code}>{l.name}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/dashboard/settings?tab=subscription" className="hidden md:flex items-center gap-2 text-sm font-medium border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors interactive-lift">
                    <Bolt className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{isDevMode ? translations.unlimitedCredits[lang] : `${totalCreditsRemaining} ${translations.creditsLeft[lang]}`}</span>
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
                            <span className="font-semibold">{translations['notifications'][lang]}</span>
                            {unreadCount > 0 && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={markAllNotificationsAsRead}>
                                {translations['markAllAsRead'][lang]}
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
                                {translations['youAreCaughtUp'][lang]}
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
                {childrenWithLang}
            </main>
            <BottomNavBar lang={lang} setLang={handleLanguageChange}/>
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);


  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

const DesktopSidebar = ({ navItems, userProfile, onLockedFeatureClick, lang }: { navItems: ThemedNavItem[], userProfile: UserProfile, onLockedFeatureClick: (feature: string) => void, lang: Language }) => {
    const pathname = usePathname();
    const { isDevMode } = useAuth();
    const isPro = planHierarchy[userProfile.plan] > 0;
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: ThemedNavItem) => {
        const label = translations[item.label_override_key || item.translationKey][lang];
        if (item.locked && !isPro && !isDevMode) {
            e.preventDefault();
            onLockedFeatureClick(label);
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
                 <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{translations.beta[lang]}</Badge>
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
                const label = translations[item.label_override_key || item.translationKey][lang];

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
                      {label}
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
                       <p className="font-semibold">{translations.settings[lang]}</p>
                    </div>
                     <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
               <Link href="/dashboard/help">
                <div className="flex items-center gap-3 rounded-lg p-2 text-sm font-medium text-card-foreground/80 transition-all hover:bg-muted">
                    <LifeBuoy className="h-5 w-5" />
                    <div className="flex-1">
                       <p className="font-semibold">{translations.help[lang]}</p>
                    </div>
                     <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
          </div>
        </div>
      </div>
    );
};
