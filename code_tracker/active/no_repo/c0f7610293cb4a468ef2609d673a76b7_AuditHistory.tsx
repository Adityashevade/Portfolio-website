‘
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Timeline } from "@/components/shared/Timeline";

export function AuditHistory() {
    const { id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["audit", "override", id],
        queryFn: async () => {
            const res = await api.get(`/overrides/${id}/history`);
            return res.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                Error loading audit history: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Override History</h2>
                <p className="text-muted-foreground">Timeline of changes for override <span className="font-mono text-primary">{id}</span></p>
            </div>

            <Timeline items={data || []} />
        </div>
    );
}
° *cascade08°²*cascade08²¶ *cascade08¶·*cascade08·¸ *cascade08¸¹*cascade08¹¼ *cascade08¼½*cascade08½É *cascade08ÉË*cascade08ËÕ *cascade08ÕÖ*cascade08Ö× *cascade08×Ù*cascade08ÙÜ *cascade08ÜÝ*cascade08Ýß *cascade08ßà*cascade08àÉ *cascade08Éé*cascade08é¿	 *cascade08¿	‰
*cascade08‰
Ø
 *cascade08Ø
Ý
*cascade08Ý
Þ
 *cascade08Þ
ê
*cascade08ê
ù
 *cascade08ù
¢*cascade08¢¨ *cascade08¨¯*cascade08¯Ç *cascade08ÇÉ*cascade08É× *cascade08×Ú*cascade08ÚÛ *cascade08ÛÝ*cascade08Ýß *cascade08ßâ*cascade08â‘ *cascade082Ffile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Audit/AuditHistory.tsx