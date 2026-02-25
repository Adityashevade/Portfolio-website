˝çimport { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Eye, RotateCcw, FileDiff, Download, Upload, Trash2, ArrowUpDown, ShieldCheck, ListFilter } from "lucide-react";
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
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
import { type ColumnDef } from "@tanstack/react-table";

export function OverrideList() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [diffId, setDiffId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [debouncedSearch] = useDebounce(search, 500);

    const [rowSelection, setRowSelection] = useState({});

    const { data, isLoading, error } = useQuery({
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

    const revertMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/overrides/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overrides"] });
        },
    });

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
                        {override.status === 'active' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Revert Override"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => {
                                    if (confirm("Are you sure you want to revert this override?")) {
                                        revertMutation.mutate(override.id);
                                    }
                                }}
                                disabled={revertMutation.isPending}
                            >
                                {revertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [revertMutation.isPending]); // Add deps if needed

    const selectedIds = useMemo(() => {
        if (!data?.items) return [];
        return Object.keys(rowSelection)
            .filter(key => (rowSelection as any)[key])
            .map(key => data.items[parseInt(key)]?.id)
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
                            <SheetHeader className="mb-6">
                                <SheetTitle>Create New Override</SheetTitle>
                                <SheetDescription>
                                    Define specific overrides for vulnerability data.
                                </SheetDescription>
                            </SheetHeader>
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
                                    <RotateCcw className="h-4 w-4 text-zinc-500" />
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
                            setRowSelection={setRowSelection}
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
                                oldData={diffQuery.data.original}
                                newData={diffQuery.data.effective}
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
‹ *cascade08‹••ç  *cascade08ç ç *cascade08ç èP *cascade08èPèP*cascade08èP∂T *cascade08∂TﬁT*cascade08ﬁTöV *cascade08öV≥V*cascade08≥V≈V *cascade08≈VﬁV*cascade08ﬁVËV *cascade08ËVÛV*cascade08ÛVÙV *cascade08ÙV¶W*cascade08¶WßW *cascade08ßW´W*cascade08´W≠W *cascade08≠W¥W*cascade08¥W∏W *cascade08∏WªW*cascade08ªWºW *cascade08ºW’W*cascade08’W›W *cascade08›WﬂW*cascade08ﬂWÓW *cascade08ÓWÑX*cascade08ÑXüX *cascade08üXÆXÆXØX *cascade08ØX∞X∞X±X *cascade08±XÀXÀXÃX *cascade08ÃX–X–X—X *cascade08—XÂX*cascade08ÂXÖY *cascade08ÖYÜY*cascade08ÜY†Y *cascade08†Y¢Y*cascade08¢Y˛Y *cascade08˛YÄZ*cascade08ÄZÑZ *cascade08ÑZÜZ*cascade08ÜZìZ *cascade08ìZïZ*cascade08ïZ¿Z *cascade08¿Z¡Z*cascade08¡ZÂZ *cascade08ÂZÁZ*cascade08ÁZ÷d *cascade08÷d‰d*cascade08‰dΩe *cascade08Ωe√e*cascade08√eáf *cascade08áfåf*cascade08åfïf *cascade08ïfòf*cascade08òf∆f *cascade08∆fÃf*cascade08ÃfÕf *cascade08Õf”f*cascade08”f‘f *cascade08‘f⁄f*cascade08⁄f€f *cascade08€fﬁf*cascade08ﬁf·f *cascade08·fÂf*cascade08ÂfÊf *cascade08ÊfÁf*cascade08ÁfËf *cascade08ËfÍf*cascade08ÍfÎf *cascade08ÎfÌf*cascade08Ìf˛k *cascade08˛k˛k*cascade08˛k°n *cascade08°n∞n*cascade08∞nÒo *cascade08Òoıo*cascade08ıoˆo *cascade08ˆo¯o*cascade08¯oâq *cascade08âqóq*cascade08óq«q *cascade08«qÀq*cascade08ÀqÃq *cascade08ÃqŒq*cascade08Œqòs *cascade08òs¢s*cascade08¢sØs *cascade08ØsÍs*cascade08ÍsÎs *cascade08ÎsÒs*cascade08ÒsÚs *cascade08Úsıs*cascade08ıs˜s *cascade08˜sˇs*cascade08ˇsÅt *cascade08ÅtÇt*cascade08ÇtÉt *cascade08ÉtÖt*cascade08Ötát *cascade08átèt*cascade08ètêt *cascade08êtït*cascade08ïtñt *cascade08ñtÆt*cascade08ÆtØt *cascade08Øt¥t*cascade08¥tÀt *cascade08ÀtÃt*cascade08Ãtœt *cascade08œt–t*cascade08–t›t *cascade08›tÍt*cascade08ÍtÓt *cascade08Ótùu*cascade08ùu†u *cascade08†u§u*cascade08§u•u *cascade08•u√u*cascade08√uœu *cascade08œu”u*cascade08”u‘u *cascade08‘u⁄u*cascade08⁄u€u *cascade08€u›u*cascade08›uﬁu *cascade08ﬁu‡u*cascade08‡u·u *cascade08·uÔu*cascade08Ôuu *cascade08uÙu*cascade08Ùuıu *cascade08ıuáv*cascade08ávàv *cascade08àvöv*cascade08övõv *cascade08õvûv*cascade08ûvπv *cascade08πvøv*cascade08øv¿v *cascade08¿v∆v*cascade08∆v«v *cascade08«v…v*cascade08…v v *cascade08 vŒv*cascade08Œvœv *cascade08œv—v*cascade08—v‘v *cascade08‘vÿv*cascade08ÿvŸv *cascade08Ÿv⁄v*cascade08⁄v€v *cascade08€vﬁv*cascade08ﬁvﬂv *cascade08ﬂv‡v*cascade08‡v˘v *cascade08˘v¸v*cascade08¸vêw *cascade08êwîw*cascade08îw¬w *cascade08¬w√w*cascade08√wÚw *cascade08Úwˆw*cascade08ˆw˜w *cascade08˜w∞x*cascade08∞x±x *cascade08±xæx*cascade08æxøx *cascade08øx¿x*cascade08¿x¡x *cascade08¡x∆x*cascade08∆x«x *cascade08«xÃx*cascade08ÃxÕx *cascade08Õx‘x*cascade08‘x’x *cascade08’x€x*cascade08€x‹x *cascade08‹xåy*cascade08åyçy *cascade08çyêy*cascade08êyëy *cascade08ëy®y*cascade08®y©y *cascade08©y≠y*cascade08≠yÆy *cascade08ÆyÁy*cascade08ÁyÍy *cascade08Íy”z*cascade08”z‘z *cascade08‘zÑ{*cascade08Ñ{Ö{ *cascade08Ö{¨{*cascade08¨{≠{ *cascade08≠{∂{*cascade08∂{∑{ *cascade08∑{π{*cascade08π{∫{ *cascade08∫{Ì{*cascade08Ì{Ó{ *cascade08Ó{ü|*cascade08ü|°| *cascade08°|¢|*cascade08¢|£| *cascade08£||*cascade08|Ò| *cascade08Ò|É~*cascade08É~Ö~ *cascade08Ö~ä~*cascade08ä~ã~ *cascade08ã~ì~*cascade08ì~î~ *cascade08î~ñ~*cascade08ñ~ó~ *cascade08ó~æ~*cascade08æ~–~ *cascade08–~èÄ*cascade08èÄõÄ *cascade08õÄ£Ä*cascade08£Ä Ä *cascade08 ÄÃÄ*cascade08ÃÄ‡Ä *cascade08‡ÄÊÄ*cascade08ÊÄÄÅ *cascade08ÄÅàÅ*cascade08àÅÕÅ *cascade08ÕÅÿÅ*cascade08ÿÅ¯Å *cascade08¯Å˛Å*cascade08˛ÅéÇ *cascade08éÇêÇ*cascade08êÇîÇ *cascade08îÇúÇ*cascade08úÇ∞Ç *cascade08∞Ç“Ç*cascade08“Ç√Ñ *cascade08√Ñ≈Ñ*cascade08≈Ñ«Ñ *cascade08«Ñ»Ñ*cascade08»Ñ…Ñ *cascade08…ÑÀÑ*cascade08ÀÑ–Ñ *cascade08–Ñ÷Ñ*cascade08÷Ñ∆Ö *cascade08∆Ö»Ö*cascade08»ÖÀÖ *cascade08ÀÖÃÖ*cascade08ÃÖÕÖ *cascade08ÕÖ–Ö*cascade08–Ö÷Ö *cascade08÷Ö⁄Ö*cascade08⁄ÖÓç *cascade08ÓçÔç*cascade08Ôç˝ç *cascade082Jfile:///C:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideList.tsx