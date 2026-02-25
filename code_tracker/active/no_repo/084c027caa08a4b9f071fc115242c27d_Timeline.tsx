¾
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, History, User } from 'lucide-react';

interface TimelineStepProps {
    title: string;
    description?: string;
    date: string;
    actor: string;
    status?: "completed" | "current" | "pending";
    isLast?: boolean;
    icon?: React.ReactNode;
}

export function TimelineStep({ title, description, date, actor, status = "completed", isLast, icon }: TimelineStepProps) {
    return (
        <div className="relative flex gap-6 pb-8 last:pb-0">
            {!isLast && (
                <div className="absolute left-3.5 top-8 bottom-0 w-px bg-border" />
            )}

            <div className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm",
                status === "completed" && "bg-primary text-primary-foreground border-primary",
                status === "current" && "border-primary text-primary ring-2 ring-primary/20",
                status === "pending" && "text-muted-foreground"
            )}>
                {icon ? icon : (status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />)}
            </div>

            <div className="flex-1 pt-0.5 space-y-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(date).toLocaleString()}
                    </div>
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-normal gap-1 pl-1">
                        <User className="h-3 w-3" />
                        {actor}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export function Timeline({ items }: { items: any[] }) {
    if (!items?.length) return <div className="text-center text-muted-foreground py-8">No history available</div>;

    return (
        <div className="space-y-0 p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
            {items.map((item, index) => (
                <TimelineStep
                    key={item.id}
                    title={item.action}
                    description={`Action performed on ${item.vulnerability_id}`}
                    date={item.timestamp}
                    actor={item.actor}
                    isLast={index === items.length - 1}
                    status="completed"
                    icon={item.action === "REVERTED" ? <History className="h-4 w-4" /> : undefined}
                />
            ))}
        </div>
    );
}
¾*cascade082Hfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/Timeline.tsx