’import { cn } from "@/lib/utils";

interface JsonDiffViewerProps {
    oldData: any;
    newData: any;
    className?: string;
}

export function JsonDiffViewer({ oldData, newData, className }: JsonDiffViewerProps) {
    const oldJson = JSON.stringify(oldData, null, 2);
    const newJson = JSON.stringify(newData, null, 2);

    return (
        <div className={cn("grid grid-cols-2 gap-4 h-full", className)}>
            <div className="flex flex-col h-full border rounded-md overflow-hidden">
                <div className="bg-red-100/50 dark:bg-red-900/20 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 border-b">
                    Original / Previous
                </div>
                <div className="h-full bg-zinc-50 dark:bg-zinc-950 overflow-auto">
                    <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                        {oldJson}
                    </pre>
                </div>
            </div>
            <div className="flex flex-col h-full border rounded-md overflow-hidden">
                <div className="bg-green-100/50 dark:bg-green-900/20 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400 border-b">
                    Effective / New
                </div>
                <div className="h-full bg-zinc-50 dark:bg-zinc-950 overflow-auto">
                    <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
                        {newJson}
                    </pre>
                </div>
            </div>
        </div>
    );
}
ﬁ *cascade08ﬁ·*cascade08·è *cascade08èù*cascade08ùŸ *cascade08Ÿ‹*cascade08‹´
 *cascade08´
Æ
*cascade08Æ
‹
 *cascade08‹
Í
*cascade08Í
† *cascade08†£*cascade08£’ *cascade082Nfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/JsonDiffViewer.tsx