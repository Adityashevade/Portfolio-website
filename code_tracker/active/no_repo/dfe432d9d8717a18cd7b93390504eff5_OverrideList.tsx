¸import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Eye, FileDiff, Download, Upload, Trash2, ArrowUpDown, ShieldCheck, ShieldOff, ListFilter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "use-debounce";

import { useState, useRef, useMemo } from "react";
import { OverrideForm } from "./OverrideForm";
import { VulnerabilitySearch } from "@/components/VulnerabilitySearch";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { JsonDiffViewer } from "@/components/shared/JsonDiffViewer";
import { DataTable } from "@/components/shared/DataTable";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";

export function OverrideList() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [diffId, setDiffId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [debouncedSearch] = useDebounce(search, 500);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const { data, isLoading, error } = useQuery<{ items: any[], total: number }>({
        queryKey: ["overrides", debouncedSearch, statusFilter],
        queryFn: async () => {
            const params: any = {};
            if (debouncedSearch) params.vulnerability_id = debouncedSearch;
            if (statusFilter !== "all") params.status = statusFilter;

            const res = await api.get("/overrides", { params });
            return res.data;
        },
    });

    const handleExport = async () => {
        try {
            const res = await api.get("/overrides/export");
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `overrides-export-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            alert("Export failed: " + (e.message || "Unknown error"));
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            await api.post("/overrides/import", json);
            alert("Import successful!");
            queryClient.invalidateQueries({ queryKey: ["overrides"] });
        } catch (e: any) {
            alert("Import failed: " + (e.message || "Unknown error"));
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };


    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.all(ids.map(id => api.delete(`/overrides/${id}`)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overrides"] });
            setRowSelection({});
        }
    })

    const diffQuery = useQuery({
        queryKey: ["diff", diffId],
        queryFn: async () => {
            const override = data?.items?.find((o: any) => o.id === diffId);
            if (!override) return null;
            const res = await api.get(`/vulnerabilities/${override.vulnerability_id}/diff`);
            return res.data;
        },
        enabled: !!diffId && !!data,
    });

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "vulnerability_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Vulnerability ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className="font-medium cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105"
                    onClick={() => navigator.clipboard.writeText(row.getValue("vulnerability_id"))}
                    title="Click to copy ID"
                >
                    {row.getValue("vulnerability_id")}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset cursor-pointer transition-transform hover:scale-105 ${status === 'active'
                            ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20'
                            }`}
                    >
                        {status}
                    </span>
                )
            }
        },
        {
            accessorKey: "created_by",
            header: "Created By",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("created_by")}</div>
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) => <div className="text-muted-foreground">{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const override = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="View Details" asChild>
                            <Link to={`/overrides/${override.id}`}>
                                <Eye className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            title="View Diff"
                            onClick={() => setDiffId(override.id)}
                        >
                            <FileDiff className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ], []); // Removed revertMutation.isPending dep

    const selectedIds = useMemo(() => {
        if (!data?.items) return [];
        return Object.keys(rowSelection)
            .filter(key => (rowSelection as any)[key])
            .map(key => data?.items?.[parseInt(key)]?.id)
            .filter(Boolean);
    }, [rowSelection, data]);


    // Bulk delete handler
    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} overrides?`)) {
            bulkDeleteMutation.mutate(selectedIds);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Vulnerability Overrides</h2>
                    <p className="text-muted-foreground mt-1 text-lg">Manage and audit security vulnerability data corrections.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImport}
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        title="Import Overrides"
                    >
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import
                    </Button>
                    <Button variant="outline" onClick={handleExport} title="Export Overrides">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Override
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-none sm:w-[90%] overflow-y-auto">
                            <OverrideForm onSuccess={() => setIsSheetOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border shadow-sm backdrop-blur-sm relative z-10">
                <div className="flex-1 max-w-sm">
                    <VulnerabilitySearch
                        value={search}
                        onQueryChange={(val) => setSearch(val)}
                        onSelect={(vuln) => setSearch(vuln.id)}
                    />
                </div>
                <div className="w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <ListFilter className="h-4 w-4" />
                                    <span>All Status</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    <span>Active</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                    <ShieldOff className="h-4 w-4 text-zinc-500" />
                                    <span>Inactive</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {
                isLoading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                        Error loading overrides: {error.message}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card/50 backdrop-blur-sm shadow-sm relative z-0">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                {data?.items?.length || 0} overrides found
                            </div>
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleteMutation.isPending}
                                >
                                    {bulkDeleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Delete Selected ({selectedIds.length})
                                </Button>
                            )}
                        </div>
                        <DataTable
                            columns={columns}
                            data={data?.items || []}
                            rowSelection={rowSelection}
                            onRowSelectionChange={setRowSelection}
                        />
                    </div>
                )
            }

            <Dialog open={!!diffId} onOpenChange={(open) => !open && setDiffId(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Override Difference</DialogTitle>
                        <DialogDescription>
                            Comparing original database value with the override.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 mt-4">
                        {diffQuery.isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : diffQuery.error ? (
                            <div className="text-destructive p-4">
                                Error loading diff: {diffQuery.error.message}
                            </div>
                        ) : diffQuery.data ? (
                            <JsonDiffViewer
                                oldData={diffQuery.data.raw}
                                newData={diffQuery.data.effective}
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
3 *cascade083P*cascade08Pˆ *cascade08ˆ*cascade08— *cascade08—©*cascade08©¾*cascade08¾Í *cascade08ÍØ*cascade08Øâ *cascade08â¥ *cascade08¥×*cascade08×à *cascade08ààà *cascade08š *cascade08šÊÊî *cascade08îğ *cascade08ğ *cascade08‰*cascade08‰’*cascade08’Ô *cascade08Ôú *cascade08úÊ*cascade08ÊÓ *cascade08ÓÕ*cascade08ÕÖ *cascade08ÖÜ*cascade08Üå *cascade08åé*cascade08éê *cascade08êë*cascade08ëí *cascade08íî*cascade08îï *cascade08ïğ*cascade08ğñ *cascade08ñû*cascade08ûı *cascade08ı	*cascade08	‚	 *cascade08‚	„	*cascade08„	‡	 *cascade08‡	ˆ	*cascade08ˆ		 *cascade08	”	*cascade08”	•	 *cascade08•	–	*cascade08–	—	 *cascade08—	™	*cascade08™	š	 *cascade08š		*cascade08	µ	*cascade08µ	¸	 *cascade08¸	º	*cascade08º	½	 *cascade08½	Á	*cascade08Á	Â	 *cascade08Â	Ä	*cascade08Ä	Æ	 *cascade08Æ	Ê	*cascade08Ê	Ì	 *cascade08Ì	Î	*cascade08Î	Ï	 *cascade08Ï	Ô	*cascade08Ô	Ù	 *cascade08Ù	ù	 *cascade08ù	µ
*cascade08µ
Á
 *cascade08Á
ö
 *cascade08ö
ì*cascade08ì– *cascade08–˜*cascade08˜¤ *cascade08¤Ê *cascade08Êş *cascade08ş‘*cascade08‘š *cascade08š¤ *cascade08¤É *cascade08Éê*cascade08êŒ *cascade08Œ«*cascade08«á *cascade08áœ*cascade08œ¼ *cascade08¼È*cascade08Èó *cascade08ó *cascade08Ñ *cascade08ÑÑÑ£ *cascade08£¯ *cascade08¯°*cascade08°± *cascade08±¶*cascade08¶· *cascade08·Á*cascade08ÁÇ *cascade08ÇÈ*cascade08ÈÉ *cascade08ÉÏ*cascade08ÏÛ *cascade08ÛÜ*cascade08Üİ *cascade08İà*cascade08àá *cascade08áã*cascade08ãî *cascade08îû*cascade08ûƒ *cascade08ƒ„ *cascade08„›*cascade08›œ *cascade08œ¢*cascade08¢£ *cascade08£§*cascade08§¨ *cascade08¨©*cascade08©ª *cascade08ª«*cascade08«¬ *cascade08¬®*cascade08®° *cascade08°±*cascade08±² *cascade08²µ*cascade08µ¶ *cascade08¶·*cascade08·¸ *cascade08¸Á*cascade08ÁÂ *cascade08ÂÃ*cascade08ÃÆ *cascade08ÆÇ*cascade08ÇË *cascade08ËĞ*cascade08ĞÚ *cascade08ÚŞ*cascade08Şâ *cascade08âä*cascade08äæ *cascade08æç*cascade08çè *cascade08èì*cascade08ìí *cascade08íı*cascade08ış *cascade08şƒ*cascade08ƒ† *cascade08†‡*cascade08‡ˆ *cascade08ˆŒ*cascade08Œ *cascade08*cascade08 *cascade08—*cascade08—™ *cascade08™Ÿ*cascade08Ÿ  *cascade08 ¥*cascade08¥¦ *cascade08¦¨*cascade08¨© *cascade08©¯*cascade08¯° *cascade08°²*cascade08²º *cascade08ºÆ*cascade08ÆÇ *cascade08Ç×*cascade08×Ø *cascade08ØÛ*cascade08ÛÜ *cascade08Ü *cascade08 …  *cascade08… Ò *cascade08Ò Ó  *cascade08Ó ß *cascade08ß ¶" *cascade08¶"Â"Â"à" *cascade08à"è"è"ƒ# *cascade08ƒ#‘# *cascade08‘#•#•#š#*cascade08š#›# *cascade08›#¡#*cascade08¡#¢# *cascade08¢#¥#*cascade08¥#¦# *cascade08¦#®#*cascade08®#°# *cascade08°#À#*cascade08À#Â# *cascade08Â#Æ#*cascade08Æ#Ì# *cascade08Ì#Ğ#Ğ#Ñ#*cascade08Ñ#Ó# *cascade08Ó#×#×#à# *cascade08à#â#*cascade08â#æ# *cascade08æ#ç#*cascade08ç#ë# *cascade08ë#ì#*cascade08ì#î# *cascade08î#ï#ï#ú# *cascade08ú#ü#*cascade08ü#€$ *cascade08€$$*cascade08$‚$ *cascade08‚$„$*cascade08„$…$ *cascade08…$†$*cascade08†$‡$ *cascade08‡$‰$*cascade08‰$‹$ *cascade08‹$$*cascade08$$ *cascade08$$*cascade08$‘$ *cascade08‘$’$*cascade08’$”$ *cascade08”$˜$˜$œ$ *cascade08œ$¤$¤$§$*cascade08§$¨$ *cascade08¨$«$*cascade08«$¬$ *cascade08¬$­$*cascade08­$³$ *cascade08³$»$»$Ã$ *cascade08Ã$É$*cascade08É$Ê$ *cascade08Ê$Ï$*cascade08Ï$Ğ$ *cascade08Ğ$Ö$*cascade08Ö$×$ *cascade08×$Û$*cascade08Û$Ü$ *cascade08Ü$İ$*cascade08İ$Ş$ *cascade08Ş$ß$*cascade08ß$à$ *cascade08à$ã$*cascade08ã$ä$ *cascade08ä$å$*cascade08å$é$ *cascade08é$ì$*cascade08ì$í$ *cascade08í$ñ$*cascade08ñ$ò$ *cascade08ò$õ$*cascade08õ$ö$ *cascade08ö$ù$*cascade08ù$ú$ *cascade08ú$ƒ%*cascade08ƒ%„% *cascade08„%‡%*cascade08‡%ˆ% *cascade08ˆ%Œ%*cascade08Œ%% *cascade08%% *cascade08%•%*cascade08•%–% *cascade08–%™%*cascade08™%›% *cascade08›%œ%*cascade08œ%% *cascade08%¢%*cascade08¢%¤% *cascade08¤%¥% *cascade08¥%§%*cascade08§%µ% *cascade08µ%¹%¹%¼%*cascade08¼%¾% *cascade08¾%Å%*cascade08Å%Æ% *cascade08Æ%É%*cascade08É%Ì% *cascade08Ì%Ó%*cascade08Ó%Ô% *cascade08Ô%Ø%*cascade08Ø%Ù% *cascade08Ù%İ%*cascade08İ%ß% *cascade08ß%ë%*cascade08ë%ì% *cascade08ì%ï%*cascade08ï%ğ% *cascade08ğ%ü%*cascade08ü%ı% *cascade08ı%ÿ%*cascade08ÿ%€& *cascade08€&&*cascade08&„& *cascade08„&‡&‡&& *cascade08&&&š&*cascade08š&›& *cascade08›&¯&*cascade08¯&µ& *cascade08µ&Á&Á&Ã&*cascade08Ã&Å& *cascade08Å&É&É&Î& *cascade08Î&Ñ& *cascade08Ñ&Ó&*cascade08Ó&Õ& *cascade08Õ&Ö&Ö&Ş& *cascade08Ş&á&á&â& *cascade08â&ã&*cascade08ã&å& *cascade08å&æ&*cascade08æ&ç& *cascade08ç&ê&*cascade08ê&ë& *cascade08ë&í&*cascade08í&î& *cascade08î&ò&*cascade08ò&ó& *cascade08ó&õ&*cascade08õ&÷& *cascade08÷&ù&ù&…' *cascade08…'‡'‡'ˆ' *cascade08ˆ''*cascade08'’' *cascade08’'–'–'¦' *cascade08¦'§'*cascade08§'¨' *cascade08¨'©'*cascade08©'ª' *cascade08ª'«'*cascade08«'¬' *cascade08¬'­'*cascade08­'®' *cascade08®'µ'*cascade08µ'¶' *cascade08¶'¹'*cascade08¹'º' *cascade08º'½'*cascade08½'¾' *cascade08¾'Ø'*cascade08Ø'Û' *cascade08Û'á'*cascade08á'â' *cascade08â'ä'*cascade08ä'ç' *cascade08ç'ì'*cascade08ì'í' *cascade08í'ï'*cascade08ï'ğ' *cascade08ğ'ô'*cascade08ô'÷' *cascade08÷'ù'*cascade08ù'û' *cascade08û'ü'*cascade08ü'ÿ' *cascade08ÿ'€(*cascade08€(( *cascade08(ƒ( *cascade08ƒ(„(*cascade08„(‡( *cascade08‡((*cascade08(( *cascade08(‘(*cascade08‘(£( *cascade08£(§(§(¨( *cascade08¨(­(*cascade08­(®( *cascade08®(¯(*cascade08¯(°( *cascade08°(±(*cascade08±(³( *cascade08³(´(*cascade08´(µ( *cascade08µ(¶( *cascade08¶(¼( *cascade08¼(¾(*cascade08¾(À( *cascade08À(Â(Â(Î( *cascade08Î(Ğ(Ğ(Ô( *cascade08Ô(Ø(Ø(Û( *cascade08Û(ä(*cascade08ä(í( *cascade08í(î(*cascade08î(ï( *cascade08ï(ô(*cascade08ô(ö( *cascade08ö(ÿ(*cascade08ÿ(€) *cascade08€))*cascade08)‚) *cascade08‚)ƒ)*cascade08ƒ)„) *cascade08„)…)*cascade08…)“) *cascade08“)©)*cascade08©)­) *cascade08­)±)±)³)*cascade08³)µ) *cascade08µ)¶)¶)½) *cascade08½)À)*cascade08À)Ì) *cascade08Ì)Ø)*cascade08Ø)Ù) *cascade08Ù)å)*cascade08å)ç) *cascade08ç)è)*cascade08è)é) *cascade08é)ê)*cascade08ê)ë) *cascade08ë)ì)*cascade08ì)î) *cascade08î)ò)ò)ú) *cascade08ú)**cascade08*‚* *cascade08‚*„**cascade08„*…* *cascade08…*‹**cascade08‹*Œ* *cascade08Œ*•**cascade08•** *cascade08*¥**cascade08¥*§* *cascade08§*ª**cascade08ª*«* *cascade08«*­**cascade08­*Ã* *cascade08Ã*É**cascade08É*Ì* *cascade08Ì*Í*Í*á* *cascade08á*ä*ä*å**cascade08å*æ* *cascade08æ*ê**cascade08ê*í* *cascade08í*ğ**cascade08ğ*ñ* *cascade08ñ*ò**cascade08ò*õ* *cascade08õ*ù*ù*+ *cascade08+¡+*cascade08¡+¢+ *cascade08¢+¦+*cascade08¦+§+ *cascade08§+¨+*cascade08¨+©+ *cascade08©+®+*cascade08®+¯+ *cascade08¯+³+*cascade08³+´+ *cascade08´+¹+*cascade08¹+º+ *cascade08º+»+*cascade08»+¼+ *cascade08¼+¾+*cascade08¾+Á+ *cascade08Á+Ğ+*cascade08Ğ+Ó+ *cascade08Ó+×+×+ê+ *cascade08ê+ë+*cascade08ë+û+ *cascade08û+ÿ+ÿ+,*cascade08,‚, *cascade08‚,ƒ,*cascade08ƒ,‡, *cascade08‡,ˆ,*cascade08ˆ,‰, *cascade08‰,‹,*cascade08‹,, *cascade08,,*cascade08,, *cascade08,’,*cascade08’,¨, *cascade08¨,¬,¬,­, *cascade08­,´,*cascade08´,Å, *cascade08Å,Æ,*cascade08Æ,Ö, *cascade08Ö,Ú,Ú,ê, *cascade08ê,ğ,*cascade08ğ,ñ, *cascade08ñ,ó,*cascade08ó,…- *cascade08…-ˆ-*cascade08ˆ-Œ-Œ-–-*cascade08–-˜- *cascade08˜-œ-œ-¤- *cascade08¤-¬-*cascade08¬-¯- *cascade08¯-°-*cascade08°-±- *cascade08±-²-*cascade08²-·- *cascade08·-Ê-*cascade08Ê-Ë- *cascade08Ë-Í-*cascade08Í-Î- *cascade08Î-é-é-ê- *cascade08ê-÷-*cascade08÷-Œ.*cascade08Œ.. *cascade08.. *cascade08.•.*cascade08•.–. *cascade08–.š.*cascade08š.›. *cascade08›.¡.*cascade08¡.¢. *cascade08¢.¤.*cascade08¤.³. *cascade08³.Â.*cascade08Â.È. *cascade08È.Ì.*cascade08Ì.Î. *cascade08Î.Ò.*cascade08Ò.å. *cascade08å.è.*cascade08è.é. *cascade08é.ì.*cascade08ì.í. *cascade08í.î.*cascade08î.ï. *cascade08ï.ò.*cascade08ò.ó. *cascade08ó.õ.*cascade08õ.ö. *cascade08ö.÷.*cascade08÷.ø. *cascade08ø.€/*cascade08€// *cascade08/¤/*cascade08¤/¥/ *cascade08¥/½0*cascade08½0¾0 *cascade08¾0¿0*cascade08¿0À0 *cascade08À0Â0*cascade08Â0Ã0 *cascade08Ã0Ä0*cascade08Ä0Å0 *cascade08Å0Ç0*cascade08Ç0È0 *cascade08È0É0*cascade08É0Ê0 *cascade08Ê0Ë0*cascade08Ë0Í0 *cascade08Í0Ğ0*cascade08Ğ0Ò0 *cascade08Ò0Ú0*cascade08Ú0İ0 *cascade08İ0ß0 *cascade08ß0ñ0*cascade08ñ0ó0 *cascade08ó0õ0*cascade08õ0ö0 *cascade08ö0ø0*cascade08ø0ù0 *cascade08ù0ˆ1*cascade08ˆ1‰1*cascade08‰1‹1 *cascade08‹111“1 *cascade08“1—1*cascade08—1Ÿ1 *cascade08Ÿ1¢1*cascade08¢1©1 *cascade08©1ª1ª1²1*cascade08²1³1 *cascade08³1´1*cascade08´1¶1 *cascade08¶1½1*cascade08½1¾1 *cascade08¾1Æ1*cascade08Æ1È1 *cascade08È1Ô1*cascade08Ô1Ø1 *cascade08Ø1Ù1*cascade08Ù1Ú1 *cascade08Ú1İ1*cascade08İ1Ş1 *cascade08Ş1à1*cascade08à1â1 *cascade08â1å1*cascade08å1è1 *cascade08è1í1*cascade08í1ò1 *cascade08ò1ó1*cascade08ó1ô1 *cascade08ô1ö1*cascade08ö1÷1 *cascade08÷1ù1*cascade08ù1ú1 *cascade08ú1ü1*cascade08ü1ı1 *cascade08ı1€2*cascade08€22 *cascade082‚2*cascade08‚2ƒ2 *cascade08ƒ2…2*cascade08…2—2 *cascade08—2œ2*cascade08œ22 *cascade082£2*cascade08£2¤2 *cascade08¤2¥2*cascade08¥2¦2 *cascade08¦2É2*cascade08É2Ê2 *cascade08Ê2Î2Î2Ù2*cascade08Ù2Ú2 *cascade08Ú2Û2*cascade08Û2Ü2 *cascade08Ü2á2*cascade08á2ã2 *cascade08ã2ç2ç2ø2 *cascade08ø2û2*cascade08û2ş2 *cascade08ş2€3€33 *cascade083’3’3”3*cascade08”3•3 *cascade08•33*cascade083¡3 *cascade08¡3¢3*cascade08¢3£3 *cascade08£3§3*cascade08§3¨3 *cascade08¨3«3*cascade08«3¬3 *cascade08¬3¯3*cascade08¯3°3 *cascade08°3µ3*cascade08µ3·3 *cascade08·3º3*cascade08º3»3 *cascade08»3¼3*cascade08¼3½3 *cascade08½3¾3*cascade08¾3¿3 *cascade08¿3Ï3*cascade08Ï3Ğ3 *cascade08Ğ3×3*cascade08×3Ø3 *cascade08Ø3î3*cascade08î3ï3 *cascade08ï3õ3*cascade08õ3÷3 *cascade08÷3û3*cascade08û3ü3 *cascade08ü3ş3 *cascade08ş3²4*cascade08²4³4 *cascade08³4µ4 *cascade08µ4·4*cascade08·4¸4 *cascade08¸4¹4*cascade08¹4º4 *cascade08º4Â4*cascade08Â4Ã4 *cascade08Ã4Å4*cascade08Å4Æ4 *cascade08Æ4Ç4*cascade08Ç4É4 *cascade08É4Í4Í4Î4*cascade08Î4Ş4 *cascade08Ş4á4*cascade08á4í4*cascade08í4ï4 *cascade08ï4ø4*cascade08ø4ù4 *cascade08ù4‡5*cascade08‡5‰5 *cascade08‰5Š5*cascade08Š5‹5 *cascade08‹5Œ5*cascade08Œ55 *cascade0855*cascade0855 *cascade085™5*cascade08™5›5 *cascade08›5Ÿ5*cascade08Ÿ5³5 *cascade08³5·5·5¸5*cascade08¸5¹5 *cascade08¹5»5*cascade08»5¼5 *cascade08¼5½5 *cascade08½5¾5*cascade08¾5¿5 *cascade08¿5Å5*cascade08Å5Æ5 *cascade08Æ5Ç5*cascade08Ç5È5 *cascade08È5Ê5 *cascade08Ê5Ì5*cascade08Ì5Í5 *cascade08Í5Ï5*cascade08Ï5Ñ5 *cascade08Ñ5Ò5*cascade08Ò5Ó5 *cascade08Ó5Ö5*cascade08Ö5Ø5 *cascade08Ø5ß5*cascade08ß5á5 *cascade08á5æ5*cascade08æ5ç5 *cascade08ç5è5*cascade08è5ê5 *cascade08ê5ë5ë5û5 *cascade08û5ÿ5 *cascade08ÿ56 *cascade086‹6*cascade08‹66 *cascade086‘6*cascade08‘6”6”6›6*cascade08›6œ6 *cascade08œ6Ÿ6 *cascade08Ÿ6¢6 *cascade08¢6¦6¦6©6*cascade08©6º6 *cascade08º6Ç6*cascade08Ç6Î6 *cascade08Î6Ï6*cascade08Ï6Ğ6 *cascade08Ğ6ß6*cascade08ß6ñ6 *cascade08ñ6ô6*cascade08ô6ø6 *cascade08ø6ü6*cascade08ü6€7€77*cascade087ƒ7 *cascade08ƒ7„7„7†7*cascade08†7‹7 *cascade08‹77*cascade087—7 *cascade08—7š7*cascade08š7œ7 *cascade08œ77 *cascade087Ÿ7*cascade08Ÿ7¢7¢7©7*cascade08©7ª7 *cascade08ª7­7*cascade08­7®7 *cascade08®7¯7*cascade08¯7°7 *cascade08°7µ7*cascade08µ7¶7 *cascade08¶7À7*cascade08À7Â7 *cascade08Â7Æ7Æ7Ê7*cascade08Ê7Î7 *cascade08Î7Õ7*cascade08Õ7Ö7 *cascade08Ö7å7*cascade08å7ï7 *cascade08ï7ğ7 *cascade08ğ7ò7*cascade08ò7ó7 *cascade08ó7û7*cascade08û7ü7 *cascade08ü7ˆ8*cascade08ˆ8”8 *cascade08”8–8*cascade08–8—8 *cascade08—8˜8*cascade08˜8™8 *cascade08™88*cascade088Ÿ8 *cascade08Ÿ8 8*cascade08 8¡8 *cascade08¡8¢8*cascade08¢8£8 *cascade08£8¤8*cascade08¤8¥8 *cascade08¥8­8*cascade08­8®8 *cascade08®8¯8 *cascade08¯8´8*cascade08´8µ8 *cascade08µ8¶8*cascade08¶8·8 *cascade08·8¾8*cascade08¾8¿8 *cascade08¿8Ä8*cascade08Ä8Å8 *cascade08Å8Ì8*cascade08Ì8Ï8 *cascade08Ï8Ó8Ó8Ô8*cascade08Ô8Õ8 *cascade08Õ8Ö8 *cascade08Ö8×8 *cascade08×8Û8*cascade08Û8ã8 *cascade08ã8æ8*cascade08æ8ï8 *cascade08ï8ò8*cascade08ò8ó8 *cascade08ó8õ8*cascade08õ8ö8 *cascade08ö8ù8*cascade08ù8ú8 *cascade08ú8ş8*cascade08ş8ÿ8 *cascade08ÿ8€9*cascade08€99 *cascade089ƒ9*cascade08ƒ9„9 *cascade08„9…9*cascade08…9†9 *cascade08†9Š9*cascade08Š9‹9 *cascade08‹9Œ9*cascade08Œ99 *cascade089’9*cascade08’9š9 *cascade08š9¡9*cascade08¡9¢9 *cascade08¢9ª9*cascade08ª9«9 *cascade08«9±9*cascade08±9¹9 *cascade08¹9½9*cascade08½9Â9*cascade08Â9Ã9 *cascade08Ã9Å9*cascade08Å9Æ9 *cascade08Æ9É9*cascade08
É9Ê9 Ê9Ì9*cascade08
Ì9Í9 Í9Ï9*cascade08
Ï9Ğ9 Ğ9Ô9*cascade08
Ô9Õ9 Õ9İ9*cascade08İ9Ş9 *cascade08Ş9á9*cascade08á9â9 *cascade08â9ã9*cascade08ã9ä9 *cascade08ä9ç9*cascade08ç9é9 *cascade08é9í9*cascade08í9ï9 *cascade08ï9ù9*cascade08ù9û9 *cascade08û9ü9 *cascade08ü9ÿ9*cascade08ÿ9€: *cascade08€::*cascade08:‚: *cascade08‚:†:*cascade08†:‡: *cascade08‡:Œ:*cascade08Œ:: *cascade08:‘:*cascade08‘:’: *cascade08’:“:*cascade08“:”: *cascade08”:˜:*cascade08˜:™: *cascade08™:£:*cascade08£:¥: *cascade08¥:·:*cascade08·:¸: *cascade08¸:Â: *cascade08Â:Æ:*cascade08Æ:Ë: *cascade08Ë:Î: *cascade08Î:Ñ:*cascade08Ñ:Õ: *cascade08Õ:Ù:*cascade08Ù:İ:İ:ã:*cascade08ã:è: *cascade08è:ë:*cascade08ë:í: *cascade08í:ñ:ñ:ô:*cascade08ô:ù: *cascade08ù:ş:*cascade08ş:ÿ: *cascade08ÿ:;*cascade08;‚; *cascade08‚;…;*cascade08…;†; *cascade08†;ˆ;*cascade08ˆ;‰; *cascade08‰;‹;*cascade08‹;Œ; *cascade08Œ;;*cascade08;; *cascade08;Ÿ;*cascade08Ÿ;¡;*cascade08¡;£; *cascade08£;¤;*cascade08¤;®; *cascade08®;¯;*cascade08¯;±; *cascade08±;¶;*cascade08¶;·; *cascade08·;¸;*cascade08¸;¹; *cascade08¹;º;*cascade08º;»; *cascade08»;½;*cascade08½;Ï; *cascade08Ï;İ;*cascade08İ;å; *cascade08å;é;*cascade08é;í;í;î; *cascade08î;ú;*cascade08ú;û; *cascade08û;ÿ;*cascade08ÿ;€< *cascade08€<ƒ<*cascade08ƒ<…< *cascade08…<†<*cascade08†<‡< *cascade08‡<ˆ<*cascade08ˆ<‰< *cascade08‰<<*cascade08<< *cascade08<‘<*cascade08‘<’< *cascade08’<•<*cascade08•<˜< *cascade08˜<š<*cascade08š<œ<*cascade08œ<¬< *cascade08¬<®< *cascade08®<°<*cascade08°<·<*cascade08
·<¸< ¸<Ç<*cascade08
Ç<È< È<Ó<*cascade08
Ó<Ô< Ô<ß<*cascade08
ß<à< à<á<*cascade08á<ä< *cascade08ä<ï<*cascade08ï<ó< *cascade08ó<ö<ö<ú<*cascade08ú<= *cascade08==== *cascade08=œ=*cascade08œ=£= *cascade08£=¤= *cascade08¤=¦=*cascade08¦=§= *cascade08§=©=*cascade08©=ª= *cascade08ª=®=*cascade08®=¯= *cascade08¯=²=*cascade08²=³= *cascade08³=µ=*cascade08µ=¸= *cascade08¸=¹=*cascade08¹=É= *cascade08É=Ì=*cascade08Ì=Ğ=Ğ=Ø= *cascade08Ø=õ=*cascade08õ=ù= *cascade08ù=ı=*cascade08ı=„>„>> *cascade08>‘>‘>“> *cascade08“>”>*cascade08”>•> *cascade08•>—>*cascade08—>š> *cascade08š>>>¦> *cascade08¦>ª>ª>³> *cascade08³>¶>*cascade08¶>·> *cascade08·>¹>*cascade08¹>º> *cascade08º>½>*cascade08½>Ö> *cascade08Ö>ä>*cascade08ä>ù> *cascade08ù>ÿ>*cascade08ÿ>€? *cascade08€?‡?*cascade08‡?ˆ? *cascade08ˆ?‰?*cascade08‰?£? *cascade08£?ª?*cascade08ª?­? *cascade08­?®?*cascade08®?¯? *cascade08¯?°?*cascade08°?Ì? *cascade08Ì?Ó?*cascade08Ó?Ö? *cascade08Ö?Ù?*cascade08Ù?Ú? *cascade08Ú?á?*cascade08á?ã? *cascade08ã?ç?*cascade08ç?‚@ *cascade08‚@†@*cascade08†@‘@ *cascade08‘@—@*cascade08—@˜@ *cascade08˜@š@*cascade08š@›@ *cascade08›@œ@*cascade08œ@@ *cascade08@Ÿ@*cascade08Ÿ@¡@ *cascade08¡@£@*cascade08£@¿@ *cascade08¿@À@*cascade08À@ß@ *cascade08ß@à@*cascade08à@á@ *cascade08á@ä@*cascade08ä@å@ *cascade08å@ç@*cascade08ç@õ@ *cascade08õ@ú@*cascade08ú@û@ *cascade08û@ı@*cascade08ı@”A *cascade08”A˜A*cascade08˜A™A *cascade08™A›A*cascade08›A·A *cascade08·A¸A *cascade08¸A¹A *cascade08¹AºA *cascade08ºA¼A*cascade08¼A½A *cascade08½AÏA *cascade08ÏAÑA*cascade08ÑAÓA *cascade08ÓA×A×AßA *cascade08ßAàA *cascade08àAáA*cascade08áAãA *cascade08ãAäAäAëA *cascade08ëAìA *cascade08ìAíA*cascade08íAóA *cascade08óAõA*cascade08õAöA *cascade08öAúA*cascade08úAûA *cascade08ûAüA*cascade08üAıA *cascade08ıAşA *cascade08şAÿA *cascade08ÿA€B *cascade08€BB *cascade08B‚B *cascade08‚B„B*cascade08„B…B *cascade08…B†B*cascade08†BB *cascade08
BŸB ŸB¢B *cascade08¢B¤B*cascade08¤B¦B *cascade08¦B©B©BªB *cascade08ªB¯B*cascade08¯B°B *cascade08°B»B*cascade08»B¼B *cascade08¼B½B*cascade08½B¾B *cascade08¾BÈB*cascade08ÈBÉB *cascade08ÉBËB*cascade08ËBÌB *cascade08ÌBÏB*cascade08ÏB×B *cascade08×BÙB*cascade08ÙBÚB *cascade08ÚBèB*cascade08èBéB *cascade08éBïB*cascade08ïBğB *cascade08ğBõB*cascade08õBüB *cascade08üBıBıB˜C*cascade08˜C™C *cascade08™CC*cascade08CŸC *cascade08ŸC£C£C«C *cascade08«C¶C*cascade08¶C·C *cascade08·C¹C*cascade08¹CºC *cascade08ºCÇC*cascade08ÇCÈC *cascade08ÈC×C*cascade08×CãC *cascade08ãCåC*cascade08åCæC *cascade08æCéC*cascade08éCêC *cascade08êCìC*cascade08ìCíC *cascade08íCîC*cascade08îCïC *cascade08ïCñC*cascade08ñCòC *cascade08òCóC *cascade08óCôC*cascade08ôCöC *cascade08öCøC *cascade08øCúC *cascade08úCüC*cascade08üCşC *cascade08şCÿC *cascade08ÿCƒD*cascade08ƒD„D *cascade08„DD*cascade08DD *cascade08DD*cascade08DD *cascade08D±D*cascade08±DµD *cascade08µD·D*cascade08·D¸D *cascade08¸DÆD*cascade08ÆDÇD *cascade08ÇDÔD*cascade08ÔDÖD *cascade08
ÖDØD ØDÚD*cascade08
ÚDÛD ÛDßD*cascade08
ßDàD àDäD*cascade08äDåD *cascade08åDèD*cascade08èDêD *cascade08êDìD*cascade08ìDğD *cascade08ğDñDñDôD *cascade08ôDùD*cascade08ùDúD *cascade08úDŠE*cascade08ŠE‹E *cascade08‹EŒE*cascade08ŒEE *cascade08EE*cascade08EE *cascade08E’E*cascade08’E“E *cascade08“E–E*cascade08–EE *cascade08E E*cascade08 E¡E *cascade08¡E®E*cascade08®E¯E *cascade08¯E²E*cascade08²E³E *cascade08³E·E*cascade08
·E¸E ¸E»E*cascade08
»E¼E ¼EÀE*cascade08
ÀEÁE ÁEÃE*cascade08
ÃEÄE ÄEÅE *cascade08ÅEÈE*cascade08ÈEÉE *cascade08ÉEÒE*cascade08ÒEÔE *cascade08ÔE×E*cascade08×EÙE *cascade08ÙEáE*cascade08áEéE *cascade08éEíE*cascade08íEïE *cascade08ïEğE*cascade08ğEşE *cascade08şEŒF*cascade08ŒF‘F *cascade08‘F“F*cascade08“F”F *cascade08”F¥F*cascade08¥F§F *cascade08§FªFªF¯F *cascade08¯F²F*cascade08²F¶F *cascade08¶F¸F *cascade08¸F¼F *cascade08¼FÀF *cascade08ÀFÊF*cascade08ÊFËF *cascade08ËFÏFÏFÒF*cascade08ÒFÔF *cascade08ÔFÖF*cascade08ÖFâF *cascade08âFãF*cascade08ãFäF *cascade08äFçF*cascade08çFèF *cascade08èFëF*cascade08ëFíF *cascade08íFîF*cascade08îFïF *cascade08ïFõF*cascade08õFöF *cascade08öFûF*cascade08ûFıF *cascade08ıFÿF*cascade08ÿF€G *cascade08€G‹G*cascade08‹GG *cascade08G‘G‘G›G *cascade08›GŸG*cascade08ŸG G *cascade08 G¯G*cascade08¯G°G *cascade08°G¼G*cascade08¼G½G *cascade08½GĞG*cascade08ĞGŞG *cascade08ŞGàGàGáG *cascade08áGìG*cascade08ìGğGğGûG *cascade08ûGşG*cascade08şGÿG *cascade08ÿG’H*cascade08’H“H *cascade08“HœH*cascade08œHH *cascade08H«H*cascade08«H¬H *cascade08¬H­H *cascade08­H¯H*cascade08¯H±H *cascade08±H³H *cascade08³H´H *cascade08´HµH *cascade08µH¶H*cascade08¶H·H *cascade08·H¹H*cascade08¹HºH *cascade08ºH»H*cascade08»HÊH *cascade08ÊHËH *cascade08ËHÛH*cascade08ÛHëH *cascade08ëHòH*cascade08òHüH *cascade08üHşH*cascade08şHI *cascade08I‚I*cascade08‚IƒI *cascade08ƒI„I*cascade08„I†I *cascade08†IŠI*cascade08ŠI‹I *cascade08‹II*cascade08I“I *cascade08“I•I*cascade08•I–I *cascade08–I—I*cascade08—II *cascade08I§I*cascade08§I¨I *cascade08¨I©I*cascade08©I¬I *cascade08¬I¯I*cascade08¯I°I *cascade08°I±I*cascade08±I´I *cascade08´I¸I*cascade08¸I¹I *cascade08¹IºI*cascade08ºI¼I *cascade08¼I¿I*cascade08¿IÁI *cascade08ÁIÅI*cascade08ÅIÆI *cascade08ÆIÉI*cascade08ÉIÊI *cascade08ÊIËI*cascade08ËIÎI *cascade08ÎIÓI*cascade08ÓIÖI *cascade08ÖIŞI*cascade08ŞIğI *cascade08ğIøI*cascade08øIˆJ *cascade08ˆJŒJ*cascade08ŒJJ *cascade08JœJ*cascade08œJJ *cascade08J¦J*cascade08¦J¬J *cascade08¬J°J°J·J*cascade08·J¸J *cascade08¸J¹J *cascade08¹JºJ *cascade08ºJ»J*cascade08»J½J *cascade08½JÀJ*cascade08ÀJÂJ *cascade08ÂJÄJÄJÚJ *cascade08ÚJçJ*cascade08çJKK¡K *cascade08¡K£K£K¤K *cascade08¤K¥K*cascade08¥K¨K *cascade08¨K­K*cascade08­K®K *cascade08®K±K*cascade08±K²K *cascade08²K¹K*cascade08¹KÓK *cascade08ÓKçK *cascade08çKÿK *cascade08ÿK–L*cascade08–L˜L *cascade08˜L™L™L¬L *cascade08¬L°L*cascade08°LÁL *cascade08ÁLÄLÄLËL *cascade08ËLäLäLöL *cascade08öLMM˜M *cascade08˜M™M *cascade08™M¤M¤M¥M *cascade08¥M×M×MØM *cascade08ØMÜMÜMŞM *cascade08ŞMåMåMæM *cascade08æMçM *cascade08çMéM *cascade08éMìMìMíM *cascade08íM†N†NN *cascade08NNN–N *cascade08–NN *cascade08NŸN *cascade08ŸNµNµN¶N *cascade08¶N¸N *cascade08¸N¼N¼NĞN *cascade08ĞNßNßNàN *cascade08àNáNáNâN *cascade08âNüNüNıN *cascade08ıNOO‚O *cascade08‚O–O–OšO *cascade08šO›O *cascade08›OªO*cascade08ªO«O *cascade08«O®O*cascade08®O¯O *cascade08¯O³O*cascade08³O¶O *cascade08¶O·O·OÑO *cascade08ÑOÓOÓOÙO *cascade08ÙOİO *cascade08İOâOâOíO *cascade08íOøO*cascade08øO‰P *cascade08‰PŒPŒPP *cascade08PP*cascade08PP *cascade08P“P*cascade08“P”P *cascade08”P•P*cascade08•P–P *cascade08–P˜P*cascade08˜P™P *cascade08™P›P*cascade08›PP *cascade08P P*cascade08 P£P *cascade08£PªP*cascade08ªP«P *cascade08«P¯P *cascade08¯P±P±P²P *cascade08²P´P *cascade08´PµP *cascade08µP·P·P¸P *cascade08¸PºP *cascade08ºPÁP *cascade08ÁPÂP *cascade08ÂPÃP*cascade08ÃPÄP *cascade08ÄPÆPÆPÇP *cascade08ÇPÈP *cascade08ÈPÌP*cascade08ÌPÓP *cascade08ÓPÕP*cascade08ÕPğP *cascade08ğPñP *cascade08ñPòPòPóP *cascade08óPôP *cascade08ôPõP*cascade08õPøP *cascade08øPùP *cascade08ùPûP*cascade08ûPüP *cascade08üP‚Q*cascade08‚QƒQ *cascade08ƒQ‰Q*cascade08‰QŠQ *cascade08ŠQ‹Q*cascade08‹QŒQ *cascade08ŒQQ*cascade08QQ *cascade08Q‘Q*cascade08‘Q’Q *cascade08’Q”Q*cascade08”Q•Q *cascade08
•Q–Q –Q˜Q˜QQ *cascade08Q°Q *cascade08°Q¹Q*cascade08¹QºQ *cascade08ºQÔQ*cascade08ÔQÕQ *cascade08ÕQ×Q*cascade08×QÙQ *cascade08ÙQÚQ*cascade08ÚQÛQ *cascade08ÛQŞQ*cascade08ŞQßQ *cascade08ßQâQ*cascade08âQåQ *cascade08åQçQ*cascade08çQèQ *cascade08èQëQ*cascade08ëQìQ *cascade08ìQóQ*cascade08óQôQ *cascade08ôQöQ*cascade08öQ÷Q *cascade08÷QûQ*cascade08ûQüQ *cascade08üQ€R*cascade08€RR *cascade08R‚R*cascade08‚RƒR *cascade08ƒR†R*cascade08†RˆR *cascade08ˆR‰R*cascade08‰R¤R *cascade08¤R¨R*cascade08¨R©R *cascade08©R·R*cascade08·R»R *cascade08»R¿R¿RØR *cascade08ØRÚR*cascade08ÚRÛR *cascade08ÛRŞR*cascade08ŞRêR *cascade08êRûR*cascade08ûRüR *cascade08üR…S*cascade08…S†S *cascade08†SˆS*cascade08ˆS‰S *cascade08‰SS*cascade08SS *cascade08SS*cascade08S‘S *cascade08‘SS*cascade08S S *cascade08 S¤S*cascade08¤S¨S *cascade08¨S¬S¬SÉS *cascade08ÉSÍS*cascade08ÍSİS *cascade08İSåS*cascade08åSæS *cascade08æSèS*cascade08èS‹T *cascade08‹TŒT*cascade08ŒTT *cascade08TT*cascade08T‘T *cascade08‘T’T *cascade08’T”T*cascade08”T•T *cascade08•T—T*cascade08—T˜T *cascade08˜T™T*cascade08™TšT *cascade08šTœT *cascade08œTŸT *cascade08ŸT¹T *cascade08¹T½T*cascade08½T¿T *cascade08¿TÀT*cascade08ÀTÃT *cascade08ÃTÆTÆTÛT *cascade08ÛTìT*cascade08ìTƒU *cascade08ƒU„U„U…U *cascade08…UˆU*cascade08ˆU‰U *cascade08‰U‘U*cascade08‘UU *cascade08U¤U*cascade08¤U¥U*cascade08¥U¦U *cascade08¦U°U *cascade08°UµUµU¶U *cascade08¶UÀU*cascade08ÀUÁU *cascade08ÁUÅU*cascade08ÅUÉU *cascade08ÉUÍUÍUæU *cascade08æUòU *cascade08òUõU *cascade08õU÷U*cascade08÷UøU *cascade08øUüU*cascade08üUˆV *cascade08ˆV‹V*cascade08‹VV *cascade08V˜V*cascade08˜VšV *cascade08šVV*cascade08V·V *cascade08·VÈV*cascade08ÈVÔV *cascade08ÔVÚVÚVÜV *cascade08ÜVæV*cascade08æVöV *cascade08öVşV*cascade08şVŠW *cascade08ŠW”W*cascade08”WW *cascade08W W W¡W *cascade08¡W¢W*cascade08¢W£W *cascade08£W¤W*cascade08¤W¬W *cascade08¬W­W *cascade08­W°W *cascade08°WÔW*cascade08ÔW×W *cascade08×WøW*cascade08øWùW *cascade08ùWıW*cascade08ıWşW *cascade08şW€X*cascade08€XX *cascade08X‘X *cascade08‘XŸXŸX X *cascade08 X£X *cascade08£X§X§X³X *cascade08³X·X*cascade08·X¸X *cascade08¸XÉX*cascade08ÉXÊX *cascade08ÊXÖX*cascade08ÖXëX *cascade08ëXñX*cascade08ñXòX *cascade08òXöX*cascade08öX÷X *cascade08÷XøX*cascade08øXşXşX€Y *cascade08€YYY˜Y *cascade08˜Y›Y*cascade08›YœY *cascade08œY¦Y*cascade08¦Y¨Y *cascade08¨Y¬Y¬YÀY *cascade08ÀYÂY *cascade08ÂYÇYÇYĞY *cascade08ĞYÓYÓYéY *cascade08éYZ *cascade08Z‡Z‡ZˆZ *cascade08ˆZZZZ *cascade08Z•Z•Z–Z *cascade08–Z—Z *cascade08—ZšZšZ›Z *cascade08›ZœZœZZ *cascade08Z Z Z¡Z *cascade08¡Z¢Z¢Z£Z *cascade08£Z¥Z¥Z¦Z *cascade08¦Z¨Z¨Z¾Z *cascade08¾ZÂZ*cascade08ÂZÒZ *cascade08ÒZŞZ*cascade08ŞZæZ *cascade08æZêZêZìZ*cascade08ìZíZ *cascade08íZ÷Z*cascade08÷ZúZ *cascade08úZƒ[*cascade08ƒ[„[ *cascade08„[…[*cascade08…[‡[ *cascade08‡[ˆ[ˆ[›[ *cascade08›[¢[*cascade08¢[£[ *cascade08£[·[*cascade08·[¸[ *cascade08¸[Ú[*cascade08Ú[ï[ *cascade08ï[ò[ò[ô[*cascade08ô[õ[ *cascade08õ[ö[*cascade08ö[÷[ *cascade08÷[ş[*cascade08ş[\ *cascade08\‰\*cascade08‰\Š\ *cascade08Š\”\*cascade08”\•\ *cascade08•\˜\*cascade08˜\š\ *cascade08š\›\*cascade08›\\ *cascade08\¡\¡\¹\ *cascade08¹\Å\*cascade08Å\Æ\ *cascade08Æ\é\*cascade08é\ü\ *cascade08ü\…]*cascade08…]‡] *cascade08‡]‰] *cascade08‰]Š]*cascade08Š]Œ] *cascade08Œ]]*cascade08]] *cascade08]‘]*cascade08‘]“] *cascade08“]—]—]] *cascade08]] *cascade08]«] *cascade08«]À]*cascade08À]Ø] *cascade08Ø]Û]*cascade08Û]Ü] *cascade08Ü]İ]*cascade08İ]Ş] *cascade08Ş]ã]*cascade08ã]ä] *cascade08ä]é]*cascade08é]ê] *cascade08ê]ï]*cascade08ï]ğ] *cascade08ğ]…_ *cascade08…_…_*cascade08…_¯_ *cascade08¯_²_*cascade08²_³_ *cascade08³_¹_ *cascade08¹_¹_¹_»_ *cascade08»_ˆ`*cascade08ˆ`“` *cascade08“`•` *cascade08•`±` *cascade08±`¼`*cascade08¼`½` *cascade08½`Ì` *cascade08Ì`Üa *cascade08Üaëaëa›b *cascade08›b£b *cascade08£bğb*cascade08ğbıb *cascade08ıbˆc *cascade08ˆcc*cascade08c”c”c•c *cascade08•c™c *cascade08™cŸc*cascade08Ÿc c *cascade08 c¡c*cascade08¡c¢c *cascade08¢c¤c*cascade08¤c¥c *cascade08¥c¬c*cascade08¬c°c°c±c *cascade08±c³c³c¶c *cascade08¶cƒd *cascade08ƒdƒd*cascade08ƒd¨d *cascade08¨d«d*cascade08«d¬d *cascade08¬d±d*cascade08±dÄd *cascade08ÄdÒdÒd‚e *cascade08‚e†e†e‡e *cascade08‡e‰e‰eŠe *cascade08Še×e*cascade08×eÚe*cascade08ÚeÛe *cascade08Ûeäe*cascade08äeşe *cascade08şef*cascade08f f *cascade08 f¤f¤f§f*cascade08§f¨f *cascade08¨f©f*cascade08©fªf *cascade08ªf«f*cascade08«f¬f *cascade08¬f­f*cascade08­f¯f *cascade08¯f²f²f¿f *cascade08¿fÇf *cascade08Çfêfêfìf *cascade08ìfüf *cascade08üfümümn*cascade08nn *cascade08n‘n*cascade08‘n’n *cascade08’n“n*cascade08“n”n *cascade08”nšn*cascade08šn›n›n«n *cascade08«n¬n¬n¯n *cascade08¯nºnºnÁn *cascade08ÁnÃn *cascade08ÃnÏnÏnÓnÓnçn *cascade08çnşn*cascade08şn–o *cascade08–o¢o¢o«o*cascade08«o­o *cascade08­o´o´oÌo *cascade08ÌoÑoÑoío*cascade08íoùoùop *cascade08p‘p‘p›p *cascade08›p p*cascade08 p¡p *cascade08¡p¢p*cascade08¢p¤p *cascade08¤p¥p*cascade08¥pºp *cascade08ºp¾p¾pÒp *cascade08ÒpÚpÚpİp *cascade08İpépép‚q *cascade08‚q‡q*cascade08‡qˆq *cascade08ˆq‰q*cascade08‰q‹q *cascade08‹qŒq*cascade08Œq¡q *cascade08¡q£q *cascade08£qµq *cascade08µq»q*cascade08»q¾q *cascade08¾q¿q*cascade08¿qÌq *cascade08ÌqÎq *cascade08ÎqÖq *cascade08ÖqØq*cascade08ØqÙq *cascade08ÙqÜq*cascade08Üqèq *cascade08èqîq*cascade08îqñq *cascade08ñqòq*cascade08òq÷q *cascade08÷qøq *cascade08øqùq*cascade08ùqûq *cascade08ûqüqüq„r*cascade08„r”r *cascade08”rŸrŸrÇr*cascade08ÇrÒrÒrâr *cascade08ârærærçrçrïr *cascade08ïròr *cascade08òrşrşr‚s‚sšs *cascade08šsss«s *cascade08«s¬s¬s­s*cascade08­s®s *cascade08®s¯s*cascade08¯s²s²s³s *cascade08³s´s *cascade08´sµs *cascade08µs¶s *cascade08¶s·s *cascade08·s¸s *cascade08¸s¹s *cascade08¹sºs *cascade08ºs¾s¾sÊs *cascade08ÊsÖs*cascade08Ösês *cascade08êsòsòsós*cascade08ósôs *cascade08ôsõs*cascade08õsös *cascade08ös÷s*cascade08÷søs *cascade08øsùs *cascade08ùsûs*cascade08ûsıs *cascade08ıs€t*cascade08€tt *cascade08tƒt*cascade08ƒt…t *cascade08…tŒtŒt t *cascade08 t¡t¡t£t*cascade08£t¤t *cascade08¤t§t*cascade08§t¨t *cascade08¨t²t*cascade08²t³t *cascade08³tµt*cascade08µt¶t *cascade08¶t¹t*cascade08¹t»t *cascade08»tÃtÃtÇtÇt×t *cascade08×tñt*cascade08ñt„u *cascade08„uˆu
ˆuu u’u*cascade08’u“u *cascade08“u”u *cascade08”ušu*cascade08šuu *cascade08u¤u*cascade08¤u±u *cascade08±u²u *cascade08²u³u*cascade08³u´u *cascade08´u¶u*cascade08¶uÄu *cascade08ÄuÈuÈuĞuĞuÔu *cascade08ÔuÚuÚuİuİuåu *cascade08åuæuæuèuèuíu *cascade08íuğu *cascade08ğu’v’v”v *cascade08”v˜v˜vøv *cascade08øvüvüvºw *cascade08ºw¼w¼wÌw *cascade08ÌwÎwÎwŞw *cascade08Şwâwâwƒx *cascade08ƒx…x…x‡x *cascade08‡xˆxˆx‰x *cascade08‰x‹x‹xx *cascade08x–x–xºx *cascade08ºx¾x¾xÓx *cascade08ÓxÔxÔxìx *cascade08ìxïxïx†y *cascade08†yˆyˆy‹y *cascade08‹yŒyŒyy *cascade08yyy–y *cascade08–yšyšy¹y *cascade08¹y½y½yãy *cascade08ãyçyçyúy *cascade08úyûyûy‹z *cascade08‹zzzÉz *cascade08ÉzÍzÍzçz *cascade08çzëzëzÚ{ *cascade08Ú{Ş{Ş{±| *cascade08±|µ|µ|½| *cascade08½|Á|Á|†} *cascade08†}Š}Š}²} *cascade08²}¶}¶}~ *cascade08~„~„~œ~ *cascade08œ~~~¥~ *cascade08¥~©~©~í~ *cascade08í~ñ~ñ~‚ *cascade08‚……¡ *cascade08¡¢¢¼ *cascade08¼½*cascade08½À *cascade08ÀÄÄœ€ *cascade08
œ€ € €¤€ *cascade08
¤€¦€¦€º€ *cascade08
º€¼€¼€Ç€ *cascade08
Ç€Ë€Ë€ï€ *cascade08
ï€ó€ó€… *cascade08
…†† *cascade08
‘‘™ *cascade08™œ *cascade08
œŸŸ£ *cascade08
£¤¤© *cascade08
©ªª­ *cascade08
­±±¸ *cascade082Jfile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideList.tsx