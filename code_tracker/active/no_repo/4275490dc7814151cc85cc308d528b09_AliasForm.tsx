œB
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/shared/TagInput";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { VulnerabilitySearch } from "@/components/VulnerabilitySearch";

const formSchema = z.object({
    ecosystem: z.string().min(1, "Ecosystem is required"),
    canonical_name: z.string().min(1, "Canonical name is required"),
    aliases: z.array(z.string()).min(1, "At least one alias is required"),
    bidirectional: z.boolean(),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export function AliasForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ecosystem: initialData?.ecosystem || "",
            canonical_name: initialData?.canonical_name || "",
            aliases: initialData?.aliases || [],
            bidirectional: true,
            reason: initialData?.reason || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            const payload = {
                ...data,
                created_by: initialData?.created_by || "scout-frontend-user" // Preserve or set default
            };

            if (initialData?.id) {
                // Update
                const res = await api.put(`/aliases/${initialData.id}`, payload);
                return res.data;
            } else {
                // Create
                const res = await api.post("/aliases", payload);
                return res.data;
            }
        },
        onSuccess: () => {
            toast.success(initialData ? "Alias updated successfully" : "Alias created successfully");
            queryClient.invalidateQueries({ queryKey: ["aliases"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error("Failed to save alias: " + (error.response?.data?.detail || error.message));
        }
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="ecosystem">Ecosystem</Label>
                <Select onValueChange={(val) => form.setValue("ecosystem", val)} defaultValue={form.watch("ecosystem")}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select ecosystem" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={5}>
                        <SelectItem value="npm">npm</SelectItem>
                        <SelectItem value="pypi">pypi</SelectItem>
                        <SelectItem value="maven">maven</SelectItem>
                        <SelectItem value="go">go</SelectItem>
                        <SelectItem value="crates.io">crates.io (Rust)</SelectItem>
                        <SelectItem value="packagist">packagist (PHP)</SelectItem>
                        <SelectItem value="rubygems">rubygems (Ruby)</SelectItem>
                        <SelectItem value="nuget">nuget (.NET)</SelectItem>
                        <SelectItem value="hex">hex (Erlang/Elixir)</SelectItem>
                        <SelectItem value="pub">pub (Dart)</SelectItem>
                        <SelectItem value="swift">swift</SelectItem>
                        <SelectItem value="debian">debian</SelectItem>
                    </SelectContent>
                </Select>
                {form.formState.errors.ecosystem && <p className="text-sm text-destructive">{form.formState.errors.ecosystem.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="canonical_name">Canonical Name</Label>
                <div className="relative">
                    <VulnerabilitySearch
                        className="w-full"
                        value={form.watch("canonical_name")}
                        onQueryChange={(val) => form.setValue("canonical_name", val)}
                        onSelect={(vuln) => {
                            // When a vulnerability is selected, try to extract the likely package name
                            if (vuln.affected && vuln.affected.length > 0) {
                                const pkg = vuln.affected[0];
                                if (pkg.package) {
                                    form.setValue("canonical_name", pkg.package);
                                    if (pkg.ecosystem) {
                                        // Map DB ecosystem strings to our select values if needed
                                        const eco = pkg.ecosystem.toLowerCase();
                                        if (["npm", "pypi", "maven", "go", "cargo"].includes(eco)) {
                                            form.setValue("ecosystem", eco);
                                        }
                                    }
                                    toast.info(`Selected package: ${pkg.package}`);
                                }
                            } else {
                                // If no package info, just use the ID? No, user probably wants package name.
                                // But let's leave the ID if nothing else, or just keep what they typed.
                            }
                        }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Search for a vulnerability to auto-fill the affected package name, or type manually.
                    </p>
                </div>
                {form.formState.errors.canonical_name && <p className="text-sm text-destructive">{form.formState.errors.canonical_name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Aliases</Label>
                <TagInput
                    value={form.watch("aliases")}
                    onChange={(val) => form.setValue("aliases", val)}
                    placeholder="Type alias (e.g. log4j-core) and press Enter..."
                />
                <p className="text-xs text-muted-foreground">Enter alternative package names here.</p>
                {form.formState.errors.aliases && <p className="text-sm text-destructive">{form.formState.errors.aliases.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="bidirectional"
                    checked={true}
                    disabled={true}
                    onCheckedChange={() => { }}
                />
                <Label htmlFor="bidirectional" className="text-muted-foreground opacity-100 cursor-not-allowed">
                    Bidirectional (All names resolve to each other)
                </Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Why is this alias needed?" {...form.register("reason")} />
                {form.formState.errors.reason && <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Alias" : "Create Alias"}
                </Button>
            </div>
        </form>
    );
}

¡ *cascade08¡¬*cascade08¬Ñ *cascade08Ñ¡*cascade08¡¸ *cascade08¸˝*cascade08˝˛ *cascade08˛á*cascade08áà *cascade08àé*cascade08éè *cascade08èŸŸ€ *cascade08€›*cascade08›ﬁ *cascade08ﬁﬂ*cascade08ﬂ‡ *cascade08‡§§• *cascade08•®*cascade08®© *cascade08©≥!*cascade08≥!ß$ *cascade08ß$⁄$⁄$€$ *cascade08€$≥%*cascade08≥%¥% *cascade08¥%æ%*cascade08æ%ø% *cascade08ø%»%*cascade08»%…% *cascade08…%˚%*cascade08˚%¸% *cascade08¸%î&*cascade08î&§& *cascade08§&∂'*cascade08∂'∏' *cascade08∏'Á'Á'Ë' *cascade08Ë'Í'*cascade08Í'Î' *cascade08Î'Ó'*cascade08Ó'Ô' *cascade08Ô''*cascade08'Ò' *cascade08Ò'â(*cascade08â(ä( *cascade08ä(¥(¥(µ( *cascade08µ(¡(*cascade08¡(¬( *cascade08¬(À(*cascade08À(Ã( *cascade08Ã(Ä)Ä)Å) *cascade08Å)¨)¨)≠) *cascade08≠)∏)*cascade08∏)π) *cascade08π)∆)*cascade08∆)«) *cascade08«)Õ)*cascade08Õ)Œ) *cascade08Œ)É*É*Ö* *cascade08Ö*Æ**cascade08Æ*Ø* *cascade08Ø*‡**cascade08‡*·* *cascade08·*†+†+°+ *cascade08°+≠+*cascade08≠+Æ+ *cascade08Æ+ˆ+ˆ+˜+ *cascade08˜+´,*cascade08´,≠, *cascade08≠,ﬂ,*cascade08ﬂ,‡, *cascade08‡,¯-*cascade08¯-˘- *cascade08˘-ñ.*cascade08ñ.ó. *cascade08ó.†/*cascade08†/¢/ *cascade08¢/º/*cascade08º/Ω/ *cascade08Ω/◊/*cascade08◊/ÿ/ *cascade08ÿ/Ÿ/*cascade08Ÿ/⁄/ *cascade08⁄/Ñ0*cascade08Ñ0Ö0 *cascade08Ö0ñ0*cascade08ñ0ó0 *cascade08ó0¨0*cascade08¨0Æ0 *cascade08Æ0∞0*cascade08∞0±0 *cascade08±0‘1*cascade08‘1’1 *cascade08’1·1*cascade08·1‚1 *cascade08‚1Å2Å2Ç2 *cascade08Ç2à2*cascade08à2â2 *cascade08â2ç2*cascade08ç2é2 *cascade08é2ô2*cascade08ô2ö2 *cascade08ö2°2*cascade08°2¢2 *cascade08¢2≠2*cascade08≠2Æ2 *cascade08Æ2∂2*cascade08∂2∑2 *cascade08∑2∫2*cascade08∫2æ2 *cascade08æ2«2*cascade08«2»2 *cascade08»2Ë2Ë2È2 *cascade08È2Ç3Ç3±5 *cascade08±5≤5*cascade08≤5≥5 *cascade08≥5∂5*cascade08∂5‰5 *cascade08‰5Ë5*cascade08Ë5È5 *cascade08È5Í5*cascade08Í5Î5 *cascade08Î5Ï5*cascade08Ï5¬6 *cascade08¬6‘6*cascade08‘6°: *cascade08°:¢:*cascade08¢:£: *cascade08£:ª:*cascade08ª:º: *cascade08º:Ω:*cascade08Ω:æ: *cascade08æ:ø:*cascade08ø:¿: *cascade08¿:»:*cascade08»:ˆ: *cascade08ˆ:˜:*cascade08˜:¯: *cascade08¯:˘:*cascade08˘:æ; *cascade08æ;ˇ;*cascade08ˇ;Ä< *cascade08Ä<ñ<*cascade08ñ<≈< *cascade08≈<◊<*cascade08◊<œB *cascade082Efile:///C:/SCOUTNEW/scout_db/frontend/src/pages/Aliases/AliasForm.tsx