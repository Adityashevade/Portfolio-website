ÏÏ
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/shared/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, ArrowUpDown, Trash2, Download, Upload, Pencil, ExternalLink, Globe, Box, Terminal, Feather, FileCode, Gem, Hexagon, Zap, Server, Package } from "lucide-react";
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
import { PackageNameInput } from "@/components/shared/PackageNameInput";
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
                <div className="flex gap-4 items-end relative z-50">
                    <div className="space-y-2 w-32">
                        <Label>Ecosystem</Label>
                        <Select value={ecosystem} onValueChange={setEcosystem}>
                            <SelectTrigger className="bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" align="start" sideOffset={5}>
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
                                <SelectItem value="crates.io">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4" />
                                        <span>crates.io (Rust)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="packagist">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        <span>packagist (PHP)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="rubygems">
                                    <div className="flex items-center gap-2">
                                        <Gem className="h-4 w-4" />
                                        <span>rubygems (Ruby)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="nuget">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4" />
                                        <span>nuget (.NET)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="hex">
                                    <div className="flex items-center gap-2">
                                        <Hexagon className="h-4 w-4" />
                                        <span>hex (Erlang)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pub">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        <span>pub (Dart)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="swift">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span>swift</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="debian">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-4 w-4" />
                                        <span>debian</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label>Package Name</Label>
                        <PackageNameInput
                            value={pkg}
                            onChange={(val) => setPkg(val)}
                            placeholder="e.g. log4j"
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
                        <SheetContent className="sm:max-w-none sm:w-[90%] overflow-y-auto">
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
                        <SelectContent position="popper" side="bottom" align="end" sideOffset={5}>
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
                            <SelectItem value="crates.io">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4" />
                                    <span>crates.io</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="packagist">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>packagist</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="rubygems">
                                <div className="flex items-center gap-2">
                                    <Gem className="h-4 w-4" />
                                    <span>rubygems</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="nuget">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4" />
                                    <span>nuget</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="hex">
                                <div className="flex items-center gap-2">
                                    <Hexagon className="h-4 w-4" />
                                    <span>hex</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="pub">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    <span>pub</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="swift">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span>swift</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="debian">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    <span>debian</span>
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
÷ *cascade08÷Á	 *cascade08Á	Ê *cascade08ÊÖ *cascade08Ö×*cascade08×Ø *cascade08Øå *cascade08å¢*cascade08¢¶> *cascade08¶>Á>*cascade08Á>˜? *cascade08˜?›?*cascade08›?þ˜ *cascade08þ˜ƒ™*cascade08ƒ™¢¦ *cascade08¢¦Ý¦*cascade08Ý¦ÏÏ *cascade082Efile:///C:/SCOUTNEW/scout_db/frontend/src/pages/Aliases/AliasList.tsx