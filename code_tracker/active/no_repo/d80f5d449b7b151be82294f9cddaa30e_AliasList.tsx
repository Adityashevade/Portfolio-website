¨
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, ArrowUpDown, Trash2, Download, Upload, Pencil, ExternalLink, Globe, Box, Terminal, Feather, FileCode } from "lucide-react";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AliasForm } from "./AliasForm";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type Alias = {
    id: string;
    ecosystem: string;
    canonical_name: string;
    aliases: string[];
    bidirectional: boolean;
    created_by: string;
    reason?: string;
    ticket_reference?: string;
}

function LookupTester() {
    const [ecosystem, setEcosystem] = useState("npm");
    const [pkg, setPkg] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        if (!pkg) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await api.get(`/aliases/lookup/${ecosystem}/${pkg}`);
            setResult(res.data);
            toast.success("Lookup successful");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Lookup failed");
            toast.error("Lookup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Package Lookup Tester
                </CardTitle>
                <CardDescription>Verify how a package name resolves using existing aliases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                    <div className="space-y-2 w-32">
                        <Label>Ecosystem</Label>
                        <Select value={ecosystem} onValueChange={setEcosystem}>
                            <SelectTrigger className="bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="npm">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4" />
                                        <span>npm</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pypi">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        <span>pypi</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="maven">
                                    <div className="flex items-center gap-2">
                                        <Feather className="h-4 w-4" />
                                        <span>maven</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="go">
                                    <div className="flex items-center gap-2">
                                        <FileCode className="h-4 w-4" />
                                        <span>go</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="cargo">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4" />
                                        <span>cargo</span>
                                    </div>
                                </SelectItem>                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label>Package Name</Label>
                        <Input
                            value={pkg}
                            onChange={(e) => setPkg(e.target.value)}
                            placeholder="e.g. log4j"
                            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                            className="bg-background"
                        />
                    </div>
                    <Button onClick={handleLookup} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lookup"}
                    </Button>
                </div>

                {error && <div className="text-destructive text-sm bg-destructive/10 p-2 rounded border border-destructive/20">{error}</div>}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-md border p-4 bg-muted/50 space-y-2"
                    >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Canonical Name</span>
                                <span className="font-mono text-base font-bold text-primary">{result.canonical_name}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Alias ID</span>
                                <span className="font-mono text-xs text-muted-foreground">{result.alias_id || "None (Direct Match)"}</span>
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block mb-2 text-xs uppercase tracking-wider">Expanded Packages</span>
                            <div className="flex flex-wrap gap-2">
                                {result.expanded_packages?.map((p: string) => (
                                    <Badge key={p} variant="outline" className="font-mono bg-background">
                                        {p}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}

export function AliasList() {
    const [search, setSearch] = useState("");
    const [ecoFilter, setEcoFilter] = useState("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editAlias, setEditAlias] = useState<Alias | null>(null);

    // Import/Export state
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["aliases"],
        queryFn: async () => {
            const res = await api.get("/aliases");
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/aliases/${id}`);
        },
        onSuccess: () => {
            toast.success("Alias deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["aliases"] });
        },
        onError: () => {
            toast.error("Failed to delete alias");
        }
    });

    const handleExport = async () => {
        try {
            const res = await api.get("/aliases?limit=10000");
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aliases-export-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Export started");
        } catch (e: any) {
            toast.error("Export failed: " + (e.message || "Unknown error"));
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const payload = Array.isArray(json) ? { aliases: json } : json;

            await api.post("/aliases/import", payload);
            toast.success("Import successful!");
            queryClient.invalidateQueries({ queryKey: ["aliases"] });
        } catch (e: any) {
            toast.error("Import failed: " + (e.message || "Unknown error"));
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleEdit = (alias: Alias) => {
        setEditAlias(alias);
        setIsSheetOpen(true);
    };

    const columns: ColumnDef<Alias>[] = [
        {
            accessorKey: "ecosystem",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ecosystem
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <Badge variant="outline">{row.getValue("ecosystem")}</Badge>,
        },
        {
            accessorKey: "canonical_name",
            header: "Canonical Name",
            cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("canonical_name")}</div>
        },
        {
            accessorKey: "aliases",
            header: "Aliases",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {(row.getValue("aliases") as string[]).map((alias) => (
                        <Badge
                            key={alias}
                            variant="secondary"
                            className="text-xs font-mono cursor-pointer transition-transform hover:scale-110 hover:bg-secondary/80"
                            onClick={() => {
                                navigator.clipboard.writeText(alias);
                                toast.success("Copied to clipboard");
                            }}
                            title="Click to copy"
                        >
                            {alias}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "bidirectional",
            header: "Bidirectional",
            cell: ({ row }) => (
                <Badge variant={row.getValue("bidirectional") ? "default" : "secondary"}>
                    {row.getValue("bidirectional") ? "Yes" : "No"}
                </Badge>
            ),
        },
        {
            accessorKey: "ticket_reference",
            header: "Ticket",
            cell: ({ row }) => {
                const ticket = row.getValue("ticket_reference") as string;
                if (!ticket) return null;
                return (
                    <a href={ticket} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View Ticket</span>
                    </a>
                )
            }
        },
        {
            accessorKey: "created_by",
            header: "Created By",
            cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.getValue("created_by")}</div>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const alias = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Edit Alias" onClick={() => handleEdit(alias)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Alias" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(alias.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }
    ];

    if (isLoading) return (
        <div className="flex justify-center p-8 h-96 items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
            Error loading aliases: {error.message}
        </div>
    );

    let items: Alias[] = Array.isArray(data) ? data : data?.items || [];

    if (ecoFilter !== "all") {
        items = items.filter(i => i.ecosystem === ecoFilter);
    }

    if (search) {
        const lower = search.toLowerCase();
        items = items.filter(i => i.canonical_name.toLowerCase().includes(lower));
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Package Aliases</h2>
                    <p className="text-muted-foreground mt-1 text-lg">Manage and unify equivalent package names.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleImport}
                    />
                    <Button variant="outline" onClick={handleExport} title="Export Aliases">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting} title="Import Aliases">
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={(open) => {
                        setIsSheetOpen(open);
                        if (!open) setEditAlias(null);
                    }}>
                        <SheetTrigger asChild>
                            <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={() => setEditAlias(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Alias
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-none sm:w-1/2 overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editAlias ? "Edit Alias" : "Create New Alias"}</SheetTitle>
                                <SheetDescription>
                                    {editAlias ? "Update existing alias mapping." : "Link multiple package names to a canonical one to unify vulnerability tracking."}
                                </SheetDescription>
                            </SheetHeader>
                            <AliasForm
                                onSuccess={() => setIsSheetOpen(false)}
                                initialData={editAlias || undefined}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <LookupTester />

            <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border shadow-sm backdrop-blur-sm">
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Search canonical name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="w-[180px]">
                    <Select value={ecoFilter} onValueChange={setEcoFilter}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Filter by ecosystem" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span>All Ecosystems</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="npm">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4" />
                                    <span>npm</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="pypi">
                                <div className="flex items-center gap-2">
                                    <Terminal className="h-4 w-4" />
                                    <span>pypi</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="maven">
                                <div className="flex items-center gap-2">
                                    <Feather className="h-4 w-4" />
                                    <span>maven</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="go">
                                <div className="flex items-center gap-2">
                                    <FileCode className="h-4 w-4" />
                                    <span>go</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="cargo">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4" />
                                    <span>cargo</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm transition-smooth hover:shadow-md">
                <DataTable columns={columns} data={items} />
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Alias"
                description="Are you sure you want to delete this alias mapping? This action cannot be undone."
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                variant="destructive"
                confirmText="Delete"
            />
        </div>
    );
}
 *cascade080*cascade080á *cascade08áé*cascade08éö*cascade08ö *cascade08˜*cascade08˜¦*cascade08¦Ï*cascade08Ïæ *cascade08æè *cascade08èñ *cascade08ñù *cascade08ù*cascade08ß *cascade08ßÈÈä *cascade08ä¥*cascade08¥© *cascade08©	*cascade08	´
 *cascade08´
¾
 *cascade08¾
Ş
Ş
ê
 *cascade08ê
ï
 *cascade08ï
“ *cascade08“Ä*cascade08Ä¨ *cascade08¨Ó*cascade08ÓÈ *cascade08Èü*cascade08üÇ *cascade08Çß*cascade08ßá *cascade08á¸*cascade08¸Í *cascade08Íß*cascade08ßÃ *cascade08Ãİ*cascade08İ¤ *cascade08¤ç*cascade08çè *cascade08èî*cascade08îï *cascade08ï©©ª *cascade08ªÀ*cascade08Àˆ *cascade08ˆÑ*cascade08Ñ× *cascade08×¬*cascade08¬ó *cascade08ó» *cascade08» Â  *cascade08Â —!*cascade08—!Û! *cascade08Û!¤#*cascade08¤#¨# *cascade08¨#ı#*cascade08ı#Ä$ *cascade08Ä$ï$*cascade08ï$ğ$ *cascade08ğ$ñ$*cascade08ñ$ò$ *cascade08ò$Š%*cascade08Š%‹% *cascade08‹%Œ%*cascade08Œ%% *cascade08%¿%¿%À% *cascade08À%â&*cascade08â&â* *cascade08â*™+*cascade08™+÷, *cascade08÷,ù,*cascade08ù,”. *cascade08”.±.*cascade08±.ø. *cascade08ø.ÿ.*cascade08ÿ.‚/ *cascade08‚/Œ0*cascade08Œ0Ä0 *cascade08Ä0Ú0*cascade08Ú0¤2 *cascade08¤2Å2*cascade08Å2¢3 *cascade08¢3¹3*cascade08¹3ü4 *cascade08ü45*cascade085ú7 *cascade08ú7œ8*cascade08œ8’< *cascade08’<™<*cascade08™<í< *cascade08í<Œ= *cascade08Œ=ó= *cascade08ó=ó> *cascade08ó>¸?*cascade08¸?ù@ *cascade08ù@û@ *cascade08û@ÛB *cascade08ÛB«R *cascade08«RS*cascade08Sc *cascade08cùg*cascade08ùgÂk *cascade08ÂkÉk*cascade08ÉkÊk *cascade08ÊkÍk*cascade08ÍkÎk *cascade08ÎkĞk*cascade08ĞkÑk *cascade08ÑkÕk*cascade08ÕkÖk *cascade08Ök×k*cascade08×kØk *cascade08ØkÙk*cascade08ÙkÚk *cascade08ÚkÛk*cascade08ÛkÜk *cascade08Ükİk*cascade08İkŞk *cascade08Şkãk*cascade08ãkäk *cascade08äkæk*cascade08ækçk *cascade08çkêk*cascade08êkëk *cascade08ëkîk*cascade08îkòk *cascade08òkök*cascade08ök÷k *cascade08÷køk*cascade08økúk *cascade08úkük*cascade08ükşk *cascade08şkƒl*cascade08ƒl…l *cascade08…ll*cascade08l‘l *cascade08‘l“l*cascade08“l–l *cascade08–l´l*cascade08´l¹l *cascade08¹l»l*cascade08»l½l *cascade08½lÀl*cascade08ÀlÁl *cascade08ÁlÄl*cascade08ÄlÅl *cascade08ÅlÉl*cascade08ÉlÊl *cascade08Êlél*cascade08élêl *cascade08êlòl*cascade08òlól *cascade08ólúl*cascade08úlào *cascade08àoöo *cascade08öop*cascade08p¨p *cascade08¨pºp*cascade08ºp¼p *cascade08¼pÊp*cascade08ÊpŞp *cascade08Şpæp*cascade08æpòp *cascade08òpÿp*cascade08ÿpƒq *cascade08ƒqq*cascade08q“q *cascade08“qšq*cascade08šq›q *cascade08›qq*cascade08qµq *cascade08µqÀq*cascade08ÀqĞq *cascade08Ğqñq*cascade08ñqr *cascade08rr*cascade08r r *cascade08 r®r*cascade08®rÃr *cascade08ÃrŞr*cascade08Şrär *cascade08ärër*cascade08ërôr *cascade08ôrör*cascade08örır *cascade08ır†s*cascade08†sÀs *cascade08Àsäs *cascade08äsæs*cascade08æsçs *cascade08çsès*cascade08èsìs *cascade08ìsîs*cascade08îsïs *cascade08ïsğs*cascade08ğs¥t *cascade08¥t¨t*cascade08¨t·t *cascade08·t¹t *cascade08¹tìt *cascade08ìtît*cascade08îtït *cascade08ïtğt*cascade08ğtôt *cascade08ôtöt*cascade08öt÷t *cascade08÷tøt*cascade08øt£u *cascade08£u¤u *cascade08¤u¹u *cascade08¹u¼u *cascade08¼uÁu *cascade08ÁuÏu *cascade08ÏuÓu *cascade08ÓuØu *cascade08ØuÙu*cascade08ÙuÚu *cascade08ÚuÛu*cascade08Ûuğu *cascade08ğuñu *cascade08ñuûu*cascade08ûuüu *cascade08üuıu*cascade08ıuşu *cascade08şuÿu*cascade08ÿu€v *cascade08€v†v*cascade08†v‡v *cascade08‡vˆv*cascade08ˆv‰v *cascade08‰v‘v*cascade08‘v”v *cascade08”v›v *cascade08›vìv *cascade08ìvóv *cascade08óv”w *cascade08”w•w*cascade08•w°w *cascade08°w²w *cascade08²w´w*cascade08´wºw *cascade08ºw»w*cascade08»w¼w *cascade08¼w¾w*cascade08¾w¿w *cascade08¿wÀw*cascade08ÀwØw *cascade08Øwİw*cascade08İwx *cascade08xœx*cascade08œx¥x *cascade08¥xºx*cascade08ºxİx *cascade08İxŞx *cascade08Şxôx *cascade08ôxöx*cascade08öx÷x *cascade08÷x§y *cascade08§y¨y *cascade08¨yÆy *cascade08ÆyÈy*cascade08ÈyÕy *cascade08ÕyÜy *cascade08Üy—z *cascade08—z™z*cascade08™zÄz *cascade08ÄzÅz *cascade08Åzëz *cascade08ëzíz*cascade08íz™{ *cascade08™{š{ *cascade08š{°{ *cascade08°{²{*cascade08²{»| *cascade08»|Á|*cascade08Á|Û| *cascade08Û|â| *cascade08â|Œ} *cascade08Œ}}*cascade08}~ *cascade08~~ *cascade08~‡ *cascade08‡*cascade08§ *cascade08§® *cascade08®Û *cascade08Ûß*cascade08ßà *cascade08à‚€ *cascade08‚€¦€ *cascade08¦€§€ *cascade08§€µ€ *cascade08µ€Õ€ *cascade08Õ€Ö€*cascade08Ö€ô€ *cascade08ô€ô€*cascade08ô€‰ *cascade08‰Š *cascade08Š‹ *cascade08‹Œ *cascade08Œ£ £§*cascade08§¬ ¬­ *cascade08­´*cascade08´¼ *cascade08¼¿ ¿Â*cascade08ÂÚ ÚÛ*cascade08Ûâ â©‚*cascade08©‚Ì‚*cascade08Ì‚Ï‚ *cascade08Ï‚Ö‚*cascade08Ö‚ê‚ *cascade08ê‚ï‚ *cascade08ï‚ğ‚ *cascade08ğ‚ô‚*cascade08ô‚õ‚ *cascade08õ‚ş‚*cascade08ş‚€ƒ *cascade08€ƒƒ*cascade08ƒƒ *cascade08ƒ”ƒ*cascade08”ƒ•ƒ *cascade08•ƒ™ƒ*cascade08™ƒƒ *cascade08ƒŸƒ *cascade08Ÿƒ ƒ *cascade08 ƒ¸ƒ *cascade08¸ƒºƒ*cascade08ºƒ»ƒ *cascade08»ƒ¼ƒ *cascade08¼ƒ½ƒ *cascade08½ƒÂƒ*cascade08ÂƒÃƒ *cascade08ÃƒÆƒ ÆƒÉƒ *cascade08Éƒİƒ İƒŞƒ*cascade08Şƒâƒ âƒãƒ *cascade08ãƒìƒ*cascade08ìƒíƒ *cascade08íƒïƒ *cascade08ïƒğƒ*cascade08ğƒ„„ *cascade08„„‡„*cascade08‡„ˆ„ *cascade08ˆ„”„*cascade08”„ „ *cascade08 „¡„*cascade08¡„¢„ *cascade08¢„¦„*cascade08¦„§„ *cascade08§„­„*cascade08­„®„ *cascade08®„²„*cascade08²„³„ *cascade08³„¶„*cascade08¶„·„ *cascade08·„¾„*cascade08¾„À„ *cascade08À„Æ„*cascade08Æ„Ç„ *cascade08Ç„Ê„*cascade08Ê„Ñ„*cascade08Ñ„Õ„*cascade08Õ„Ö„ *cascade08Ö„ƒ… *cascade08ƒ…„… *cascade08„…†… *cascade08†…… *cascade08…¢… *cascade08¢…£… *cascade08£…²… *cascade08²…Ï…*cascade08Ï…Ö… *cascade08Ö…Ú…*cascade08Ú…ß… *cascade08ß…á…*cascade08á…ã… *cascade08ã…ğ… *cascade08ğ…÷…*cascade08÷…ú…*cascade08ú…¤† *cascade08¤†¨†*cascade08¨†È† *cascade08È†ù†*cascade08ù†ı† *cascade08ı†È‡ È‡Ê‡*cascade08Ê‡Ì‡ Ì‡Ó‡*cascade08Ó‡ş‡ ş‡ˆ *cascade08ˆ„ˆ *cascade08„ˆŒˆ*cascade08Œˆœˆ *cascade08œˆˆ *cascade08ˆŸˆ *cascade08Ÿˆ«ˆ «ˆ­ˆ *cascade08­ˆµˆ*cascade08µˆÉˆ *cascade08ÉˆÊˆ*cascade08ÊˆÓˆ *cascade08ÓˆÜˆ *cascade08Üˆİˆ *cascade08İˆäˆ*cascade08äˆæˆ *cascade08æˆôˆ *cascade08ôˆõˆ *cascade08õˆùˆ *cascade08ùˆüˆ *cascade08üˆ…‰*cascade08…‰†‰ *cascade08†‰ˆ‰*cascade08ˆ‰‰‰ *cascade08‰‰Œ‰*cascade08Œ‰‰ *cascade08‰‰*cascade08‰‘‰ *cascade08‘‰’‰*cascade08’‰“‰ *cascade08“‰—‰*cascade08—‰™‰ *cascade08™‰š‰*cascade08š‰‰ *cascade08‰¦‰*cascade08¦‰¾‰ *cascade08¾‰¿‰*cascade08¿‰À‰ *cascade08À‰Á‰*cascade08Á‰Å‰ *cascade08Å‰Ë‰*cascade08Ë‰Ï‰ *cascade08Ï‰Ó‰*cascade08Ó‰Õ‰ *cascade08Õ‰×‰*cascade08×‰Ù‰ *cascade08Ù‰Ú‰*cascade08Ú‰Û‰ *cascade08Û‰ß‰*cascade08ß‰à‰ *cascade08à‰á‰*cascade08á‰â‰ *cascade08â‰û‰ û‰ş‰ *cascade08ş‰ÿ‰ *cascade08ÿ‰€Š *cascade08€ŠœŠ *cascade08œŠŠ*cascade08Š£Š *cascade08£Š¤Š*cascade08¤ŠªŠ *cascade08ªŠ«Š*cascade08«ŠÀŠ *cascade08ÀŠÁŠ *cascade08ÁŠËŠ *cascade08ËŠÓŠ*cascade08ÓŠİŠ *cascade08İŠàŠ*cascade08àŠîŠ *cascade08îŠïŠ *cascade08ïŠõŠ *cascade08õŠ÷Š *cascade08÷ŠùŠ *cascade08ùŠ…‹ *cascade08…‹—‹ *cascade08—‹™‹ *cascade08™‹¦‹ *cascade08¦‹€ *cascade08€ *cascade08Œ’ *cascade08Œ’Æ“*cascade08Æ“Ö“ *cascade08Ö“£”*cascade08£”ä” *cascade08ä”£•*cascade08£•¤• *cascade08¤•ª•*cascade08ª•«• *cascade08
«•á•á•â• *cascade08â•ì–*cascade08ì–°— *cascade08°—í˜*cascade08í˜ó˜ *cascade08ó˜À™*cascade08À™ƒš *cascade08ƒš¿›*cascade08¿›Æ› *cascade08Æ›“œ*cascade08“œÓœ *cascade08Óœ—*cascade08—˜ *cascade08
˜ÊÊË *cascade08Ëß*cascade08ß¤Ÿ *cascade08¤ŸÜ *cascade08Ü á  *cascade08á ®¡*cascade08®¡½¡ *cascade08½¡¾¡ *cascade08¾¡†¢ *cascade08†¢‡¢ *cascade08‡¢¢ *cascade08¢Ÿ¢ *cascade08Ÿ¢Ë£ *cascade08Ë£Ì£ *cascade08Ì£Ü£ *cascade08Ü£†¤ *cascade08†¤š¤ *cascade08š¤¤ *cascade08¤Ÿ¤ *cascade08Ÿ¤ ¤ *cascade08 ¤Ç¤ *cascade08Ç¤Ë¤*cascade08Ë¤Ş¤ *cascade08Ş¤ß¤ *cascade08ß¤É¥ *cascade08É¥Ê¥ *cascade08Ê¥–§ *cascade08–§™§ *cascade08™§Ö§ *cascade08Ö§×§ *cascade08×§æ§ *cascade08æ§ğ§ *cascade08ğ§ñ§*cascade08ñ§ò§ *cascade08ò§ó§*cascade08ó§ú§ *cascade08ú§ÿ§*cascade08ÿ§¨ *cascade082Efile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Aliases/AliasList.tsx