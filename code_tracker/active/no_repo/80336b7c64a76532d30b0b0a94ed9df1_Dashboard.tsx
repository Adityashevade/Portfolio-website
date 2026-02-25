°iimport { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Shield, Activity, ArrowRight, Copy, History, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Dashboard() {
    // Parallel data fetching for stats
    const overridesQuery = useQuery({
        queryKey: ["overrides", "stats"],
        queryFn: async () => {
            const res = await api.get("/overrides");
            return res.data; // Assuming standard paginated response with 'items' or 'total'
        }
    });

    const aliasesQuery = useQuery({
        queryKey: ["aliases", "stats"],
        queryFn: async () => {
            const res = await api.get("/aliases");
            return res.data;
        }
    });

    const auditQuery = useQuery({
        queryKey: ["audit", "recent"],
        queryFn: async () => {
            const res = await api.get("/audit?limit=5"); // Fetch small batch for recent actitivy
            return res.data;
        }
    });

    // Helper to calculate stats safely
    const stats = {
        overrides: overridesQuery.data?.total || overridesQuery.data?.items?.length || 0,
        aliases: aliasesQuery.data?.total || aliasesQuery.data?.items?.length || 0,
        auditCount: auditQuery.data?.total || 0,
        recentActivity: auditQuery.data?.items?.slice(0, 5) || []
    };

    const isLoading = overridesQuery.isLoading || aliasesQuery.isLoading || auditQuery.isLoading;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            {/* Top Row: KPIs (Kaleido Style) */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-4"
            >
                {/* Stats Card: Total Overrides */}
                <motion.div variants={item}>
                    <div className="kaleido-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-24 h-24 text-primary" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Total Overrides</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
                            {isLoading ? <Skeleton className="h-8 w-16 bg-muted" /> : stats.overrides}
                        </div>
                        <div className="text-xs text-primary font-medium flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Active Corrections
                        </div>
                    </div>
                </motion.div>

                {/* Stats Card: Aliases */}
                <motion.div variants={item}>
                    <div className="kaleido-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Copy className="w-24 h-24 text-purple-400 dark:text-purple-400" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Copy className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Package Aliases</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
                            {isLoading ? <Skeleton className="h-8 w-16 bg-muted" /> : stats.aliases}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Mapped Identities
                        </div>
                    </div>
                </motion.div>

                {/* Stats Card: Audit Events */}
                <motion.div variants={item}>
                    <div className="kaleido-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <History className="w-24 h-24 text-pink-400 dark:text-pink-400" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                <History className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Audit Events</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
                            {isLoading ? <Skeleton className="h-8 w-16 bg-muted" /> : stats.auditCount}
                        </div>
                        <div className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                            System Actions
                        </div>
                    </div>
                </motion.div>

                {/* Stats Card: System Status */}
                <motion.div variants={item}>
                    <div className="kaleido-card p-6 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">System Health</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                            99.9%
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                            All Systems Operational
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content Area: Charts & Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Chart Area (Placeholder for visual match) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 kaleido-card p-6 min-h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold text-foreground">Vulnerability Trend (Last 100 Blocks)</h3>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-accent text-xs text-muted-foreground hover:bg-accent/80 cursor-pointer transition-colors">Day</div>
                            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium cursor-pointer">Week</div>
                            <div className="px-3 py-1 rounded-full bg-accent text-xs text-muted-foreground hover:bg-accent/80 cursor-pointer transition-colors">Month</div>
                        </div>
                    </div>

                    {/* Visual Bar Chart Placeholder */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4 opacity-80 custom-cursor-area">
                        {Array.from({ length: 24 }).map((_, i) => {
                            const height = Math.floor(Math.random() * 80) + 20;
                            const isActive = i === 18;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className={`w-full rounded-t-sm ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-muted hover:bg-muted-foreground/20'}`}
                                />
                            )
                        })}
                    </div>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="kaleido-card p-0 flex flex-col"
                >
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Latest Activity
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 h-[350px]">
                        <div className="p-2">
                            {isLoading ? (
                                <div className="space-y-3 p-4">
                                    <Skeleton className="h-10 w-full bg-muted" />
                                    <Skeleton className="h-10 w-full bg-muted" />
                                    <Skeleton className="h-10 w-full bg-muted" />
                                </div>
                            ) : stats.recentActivity.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-sm">No activity recorded.</div>
                            ) : (
                                stats.recentActivity.map((entry: any, i: number) => (
                                    <div key={i} className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/20 transition-colors">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-foreground truncate">{entry.action}</span>
                                                <span className="text-xs text-muted-foreground truncate">{entry.actor}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground/60 whitespace-nowrap bg-muted px-2 py-1 rounded">
                                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-border mt-auto bg-muted/20">
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground" asChild>
                            <Link className="flex items-center justify-center gap-2" to="/audit">
                                View Logic Logs <ArrowRight className="w-3 h-3" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
ÁE *cascade08ÁEÔE*cascade08ÔE°i *cascade082Gfile:///C:/SCOUTNEW/scout_db/frontend/src/pages/Dashboard/Dashboard.tsx