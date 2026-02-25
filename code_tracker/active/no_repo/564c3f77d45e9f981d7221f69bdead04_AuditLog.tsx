¡E
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpDown, ChevronDown, ChevronRight, ListFilter, PlusCircle, Edit2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { JsonDiffViewer } from "@/components/shared/JsonDiffViewer";

type AuditEntry = {
    id: string;
    action: "created" | "updated" | "reverted";
    actor: string;
    vulnerability_id: string;
    timestamp: string;
    override_id: string;
    previous_state: any;
    new_state: any;
}

const columns: ColumnDef<AuditEntry>[] = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
            return row.getCanExpand() ? (
                <button
                    {...{
                        onClick: row.getToggleExpandedHandler(),
                        style: { cursor: 'pointer' },
                        className: "p-1 hover:bg-muted rounded-full transition-colors"
                    }}
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>
            ) : null;
        },
    },
    {
        accessorKey: "timestamp",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const ts = row.getValue("timestamp");
            try {
                if (!ts) return <div className="text-muted-foreground">-</div>;
                const d = new Date(ts as string);
                if (isNaN(d.getTime())) return <div className="text-muted-foreground">-</div>;
                return <div className="text-muted-foreground whitespace-nowrap">{d.toLocaleString()}</div>;
            } catch (e) {
                return <div className="text-muted-foreground text-red-500">Invalid Date</div>;
            }
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
            const action = row.getValue("action") as string;
            if (!action) return <Badge variant="outline">Unknown</Badge>;
            return (
                <Badge variant={action === "reverted" ? "destructive" : "default"}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "vulnerability_id",
        header: "Vulnerability ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("vulnerability_id")}</div>,
    },
    {
        accessorKey: "actor",
        header: "Actor",
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("actor")}</div>,
    },
    {
        accessorKey: "override_id",
        header: "Override ID",
        cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue("override_id")}</div>,
    },
];

export function AuditLog() {
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["audit", actionFilter],
        queryFn: async () => {
            // Mock support for pagination/filtering would go here
            // Backend usually handles limits, but using mock data logic
            const params: any = {};
            if (actionFilter !== "all") params.action = actionFilter;
            const res = await api.get("/audit", { params });
            return res.data;
        },
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
                Error loading audit log: {error.message}
            </div>
        );
    }

    let items = Array.isArray(data) ? data : data?.items || [];

    if (search) {
        const lowerSearch = search.toLowerCase();
        items = items.filter((item: AuditEntry) =>
            item.actor.toLowerCase().includes(lowerSearch) ||
            item.vulnerability_id.toLowerCase().includes(lowerSearch)
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Audit Log</h2>
                    <p className="text-muted-foreground mt-1 text-lg">Global audit trail of all override actions.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border shadow-sm backdrop-blur-sm">
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Search actor or vulnerability..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="w-[200px]">
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <ListFilter className="h-4 w-4" />
                                    <span>All Actions</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="created">
                                <div className="flex items-center gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Created</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="updated">
                                <div className="flex items-center gap-2">
                                    <Edit2 className="h-4 w-4" />
                                    <span>Updated</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="reverted">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    <span>Reverted</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm transition-smooth hover:shadow-md">
                <DataTable
                    columns={columns}
                    data={items}
                    renderSubComponent={({ row }) => (
                        <div className="p-4 bg-muted/30">
                            <div className="bg-card border rounded-md p-4 shadow-inner">
                                <h4 className="text-sm font-semibold mb-2">State Changes</h4>
                                <JsonDiffViewer oldData={row.original.previous_state} newData={row.original.new_state} />
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
ú *cascade08ú°*cascade08°å *cascade08åô*cascade08ô¥*cascade08¥ﬁ*cascade08ﬁ˜ *cascade08˜Ä *cascade08Ä∆*cascade08∆˚ *cascade08˚Ç*cascade08Çá *cascade08áé*cascade08éì *cascade08ìõ*cascade08õÑ *cascade08Ñ≥*cascade08≥Î *cascade08ÎÔ*cascade08Ô¢ *cascade08¢Ä*cascade08ÄÅ *cascade08Åä*cascade08äì *cascade08ì¿*cascade08¿¡ *cascade08¡Ü*cascade08Ü§ *cascade08§ç*cascade08ç≤ *cascade08≤≈*cascade08≈∆ *cascade08∆Œ*cascade08Œ– *cascade08–ÿ*cascade08ÿ· *cascade08·È*cascade08ÈÍ *cascade08Íååê *cascade08ê´*cascade08´¨ *cascade08¨∂*cascade08∂∑ *cascade08∑∏*cascade08∏π *cascade08π≈*cascade08≈∆ *cascade08∆„„‰ *cascade08‰Í*cascade08ÍÎ *cascade08ÎÙ*cascade08Ùˆ *cascade08ˆ˚*cascade08˚¸ *cascade08¸˝*cascade08˝˛ *cascade08˛û*cascade08û† *cascade08†£*cascade08£¥ *cascade08¥ª*cascade08ª—*cascade08—Ü *cascade08Ü—*cascade08—á *cascade08áè*cascade08èÀ *cascade08Àı*cascade08ıê *cascade08êÛ*cascade08Ûª *cascade08ªù*cascade08ùÒ *cascade08Ò© *cascade08©ø*cascade08øÎ *cascade08Îù *cascade08ùâ  *cascade08â ó!ó!Ì! *cascade08Ì!Ó! *cascade08Ó!û" *cascade08û"†" *cascade08†"›"*cascade08›"–& *cascade08–&“&*cascade08“&¢' *cascade08¢'§' *cascade08§'›' *cascade08›'ﬂ'*cascade08ﬂ'‡' *cascade08‡'·'*cascade08·'Â' *cascade08Â'Á'*cascade08Á'Ë' *cascade08Ë'È'*cascade08È'â( *cascade08â(ç(*cascade08ç(¨( *cascade08¨(≠( *cascade08≠(”( *cascade08”(‘(*cascade08‘(õ) *cascade08õ)ù) *cascade08ù)ï+ *cascade08ï+ó+*cascade08ó+ù+ *cascade08ù+û+*cascade08û+ü+ *cascade08ü+°+*cascade08°+¢+ *cascade08¢+£+*cascade08£+Â0 *cascade08Â0Á0*cascade08Á0ÿ3 *cascade08ÿ3Ì4 *cascade08Ì4Ì4*cascade08Ì4ó5 *cascade08ó5§5 *cascade08§5Ò5*cascade08Ò5≠6 *cascade08≠6¥6*cascade08¥6∂6 *cascade08∂6ı7 *cascade08ı7˛7 *cascade08˛7À8*cascade08À8á9 *cascade08á9é9*cascade08é9ê9 *cascade08ê9 : *cascade08 :”: *cascade08”:†;*cascade08†;‹; *cascade08‹;‰;*cascade08‰;Ê; *cascade08Ê;≥< *cascade08≥<≥<*cascade08≥<§= *cascade08§=¨= *cascade08¨=˘=*cascade08˘=∞@ *cascade08∞@≈@*cascade08≈@◊@ *cascade08◊@Ï@*cascade08Ï@˘@ *cascade08˘@çE*cascade08çE£E *cascade08£E¡E *cascade082Bfile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Audit/AuditLog.tsx