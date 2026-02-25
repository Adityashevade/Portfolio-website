∫6import { Link, useLocation, Outlet } from "react-router-dom";
import { Copy, History, Shield, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { PageTransition } from "@/components/shared/PageTransition";
import { Notifications } from "@/components/shared/Notifications";

// ...

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Overrides", href: "/overrides", icon: Shield },
    { label: "Audit Log", href: "/audit", icon: History },
    { label: "Aliases", href: "/aliases", icon: Copy },
];



import { CustomCursor } from "./ui/custom-cursor";

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary">
            <CustomCursor />
            {/* Kaleido Sidebar: Expanding Drawer Design */}
            <aside className="fixed inset-y-0 left-0 z-50 w-16 hover:w-64 flex flex-col py-4 gap-4 bg-card/95 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out group overflow-hidden shadow-2xl">
                {/* Logo Area */}
                <div className="h-14 flex items-center px-3 mb-2 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)] shrink-0 transition-transform group-hover:scale-105">
                        <Shield className="w-5 h-5 text-primary fill-primary/20" />
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <span className="text-lg font-bold tracking-tight text-foreground">Scout DB</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-1 px-2 w-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "relative flex items-center h-10 rounded-lg px-2.5 transition-all duration-200 overflow-hidden whitespace-nowrap",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />

                                <span className={cn(
                                    "ml-3 text-sm font-medium transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 delay-75",
                                    isActive ? "text-primary" : "text-foreground"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full shadow-sm" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Status / User */}
                <div className="px-2 flex flex-col gap-2">
                    <div className="flex justify-center w-full">
                        <ModeToggle />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer whitespace-nowrap overflow-hidden">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border/50 shrink-0">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
                        </div>
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                            <span className="text-sm font-medium text-foreground">Admin User</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 pl-16 relative transition-all duration-300">
                {/* Header: Transparent & Minimal */}
                <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
                            {NAV_ITEMS.find(item => location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href)))?.label || "Mission Control"}
                        </h1>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        {/* Environment Pill */}
                        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/50 border border-border text-[10px] font-medium text-muted-foreground/70 tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            ONLINE
                        </div>
                        <Notifications />
                    </div>
                </header>

                <div className="p-6 max-w-[1600px] mx-auto space-y-6 min-h-[calc(100vh-4rem)]">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
π *cascade08πÔ*cascade08Ô¡ *cascade08¡ﬂ*cascade08ﬂÜ	 *cascade08Ü	á	*cascade08á	à	 *cascade08à	ä	*cascade08ä	Ø	 *cascade08Ø	≥	*cascade08≥	¥	 *cascade08¥	µ	*cascade08µ	Ω *cascade08Ωø*cascade08øå *cascade08åè*cascade08èê *cascade08êí*cascade08íú *cascade08ú£*cascade08£Ñ *cascade08ÑÜ*cascade08ÜË! *cascade08Ë!Î!*cascade08Î!Ï! *cascade08Ï!Ó!*cascade08Ó!! *cascade08!Ò!*cascade08Ò!ï# *cascade08ï#ô#*cascade08ô#ö# *cascade08ö#õ#*cascade08õ#ú# *cascade08ú#ù#*cascade08ù#ﬂ) *cascade08ﬂ)„)*cascade08„)‰) *cascade08‰)Â)*cascade08Â)á0 *cascade08á0ä0*cascade08ä0ã0 *cascade08ã0ç0*cascade08ç0è0 *cascade08è0ê0*cascade08ê0ü0 *cascade08ü0£0*cascade08£0§0 *cascade08§0•0*cascade08•0∫6 *cascade082?file:///C:/SCOUTNEW/scout_db/frontend/src/components/Layout.tsx