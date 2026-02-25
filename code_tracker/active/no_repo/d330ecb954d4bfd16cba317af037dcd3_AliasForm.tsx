ó/
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
            bidirectional: initialData?.bidirectional || false,
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
                    <SelectContent>
                        <SelectItem value="npm">npm</SelectItem>
                        <SelectItem value="pypi">pypi</SelectItem>
                        <SelectItem value="maven">maven</SelectItem>
                        <SelectItem value="go">go</SelectItem>
                        <SelectItem value="cargo">cargo</SelectItem>
                    </SelectContent>
                </Select>
                {form.formState.errors.ecosystem && <p className="text-sm text-destructive">{form.formState.errors.ecosystem.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="canonical_name">Canonical Name</Label>
                <Input id="canonical_name" placeholder="e.g. log4j" {...form.register("canonical_name")} />
                {form.formState.errors.canonical_name && <p className="text-sm text-destructive">{form.formState.errors.canonical_name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Aliases</Label>
                <TagInput
                    value={form.watch("aliases")}
                    onChange={(val) => form.setValue("aliases", val)}
                    placeholder="Type alias and press Enter..."
                />
                <p className="text-xs text-muted-foreground">Enter alternative package names here.</p>
                {form.formState.errors.aliases && <p className="text-sm text-destructive">{form.formState.errors.aliases.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="bidirectional"
                    checked={form.watch("bidirectional")}
                    onCheckedChange={(checked) => form.setValue("bidirectional", checked as boolean)}
                />
                <Label htmlFor="bidirectional">Bidirectional (All names resolve to each other)</Label>
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

 *cascade08*cascade08Ú *cascade08ÚÚ*cascade08Ú˘ *cascade08˘˘*cascade08˘ﬁ *cascade08ﬁπ*cascade08πÔ*cascade08ÔÍ *cascade08Íı *cascade08ıÇ	*cascade08Ç	û	 *cascade08û	ü	*cascade08ü	†	 *cascade08†	°	*cascade08°	¢	 *cascade08¢	£	*cascade08£	§	 *cascade08§	•	*cascade08•	¶	 *cascade08¶	®	*cascade08®	´	 *cascade08´	Æ	*cascade08Æ	Ø	 *cascade08Ø	≥	*cascade08≥	¥	 *cascade08¥	∂	*cascade08∂	˙
 *cascade08˙
î*cascade08îµ *cascade08µ‘*cascade08‘Ó *cascade08ÓÜ*cascade08Üá *cascade08áá*cascade08á¶ *cascade08¶ƒ*cascade08ƒ‡ *cascade08‡˜*cascade08˜ù *cascade08ùû*cascade08ûœ *cascade08œÍ*cascade08ÍÉ *cascade08Éí*cascade08íì *cascade08ìñ*cascade08ñò *cascade08òô*cascade08ô™ *cascade08™–*cascade08–ﬁ *cascade08ﬁ£*cascade08£· *cascade08·Â*cascade08Â˜ *cascade08˜Ü*cascade08ÜÆ *cascade08Æ» *cascade08»ı*cascade08ıï *cascade08ïË *cascade08ËÖ *cascade08Öë *cascade08ëÿ *cascade08ÿŸ*cascade08Ÿ⁄ *cascade08⁄€*cascade08€¶ *cascade08¶˜ *cascade08˜¯*cascade08¯ø *cascade08ø¿*cascade08¿¡ *cascade08¡ƒ*cascade08ƒ≠" *cascade08≠"Ø"Ø"∞" *cascade08∞"≤"*cascade08≤"≥" *cascade08≥"∂"*cascade08∂"Õ" *cascade08Õ"–"*cascade08–"‘" *cascade08‘"◊"*cascade08◊"ÿ" *cascade08ÿ"€"*cascade08€"‹" *cascade08‹"‡"*cascade08‡"·" *cascade08·"‚"*cascade08‚"Â" *cascade08Â"Ê"*cascade08Ê"Á" *cascade08Á"È"*cascade08È"ˇ" *cascade08ˇ"Ä#*cascade08Ä#Å# *cascade08Å#Ç#*cascade08Ç#É# *cascade08É#Ü#*cascade08Ü#à# *cascade08à#ã#*cascade08ã#å# *cascade08å#é#*cascade08é#è# *cascade08è#ë#*cascade08ë#ò# *cascade08ò#ô#*cascade08ô#ö# *cascade08ö#û#*cascade08û#†# *cascade08†#°#*cascade08°#®# *cascade08®#´#*cascade08´#«# *cascade08«#»#*cascade08»#…# *cascade08…#À#*cascade08À#Õ# *cascade08Õ#œ#*cascade08œ#–# *cascade08–#—#*cascade08—#”# *cascade08”#◊#*cascade08◊#ÿ# *cascade08ÿ#Ÿ#*cascade08Ÿ#€# *cascade08€#›#*cascade08›#ﬁ# *cascade08ﬁ#ﬂ#*cascade08ﬂ#‚# *cascade08‚#Â#*cascade08Â#Á# *cascade08Á#Î#*cascade08Î#Ï# *cascade08Ï##*cascade08#É$ *cascade08É$á$*cascade08á$ó$ *cascade08ó$¢$*cascade08¢$£$ *cascade08£$´$*cascade08´$¨$ *cascade08¨$≠$*cascade08≠$Æ$ *cascade08Æ$π$*cascade08π$∫$ *cascade08∫$¿$*cascade08¿$¡$ *cascade08¡$¬$*cascade08¬$√$ *cascade08√$ƒ$*cascade08ƒ$∆$*cascade08∆$«$ *cascade08«$…$*cascade08…$À$ *cascade08À$Œ$*cascade08Œ$–$ *cascade08–$—$*cascade08—$”$ *cascade08”$‘$*cascade08‘$÷$ *cascade08÷$ÿ$*cascade08ÿ$€$ *cascade08€$‹$*cascade08‹$ﬁ$ *cascade08ﬁ$ﬂ$*cascade08ﬂ$‰$ *cascade08‰$Â$*cascade08Â$Á$ *cascade08Á$È$*cascade08È$Í$*cascade08Í$Î$ *cascade08Î$Ï$*cascade08Ï$ÿ& *cascade08ÿ&„&*cascade08„&Ô& *cascade08Ô&Ò&*cascade08Ò&Ú& *cascade08Ú&˘&*cascade08˘&˚& *cascade08˚&Ä'*cascade08Ä'Ç' *cascade08Ç'Ñ'*cascade08Ñ'Ö' *cascade08Ö'à'*cascade08à'â' *cascade08â'ç'*cascade08ç'é' *cascade08é'•'*cascade08•'ß' *cascade08ß'≥'*cascade08≥'¬' *cascade08¬'∆'*cascade08∆'«' *cascade08«'Õ'*cascade08Õ'œ' *cascade08œ'⁄'*cascade08⁄'‹' *cascade08‹'‚'*cascade08‚'„' *cascade08„'Ò'*cascade08Ò'Û' *cascade08Û'Ù'*cascade08Ù'ı' *cascade08ı'˜'*cascade08˜'˛' *cascade08˛'ˇ'*cascade08ˇ'Ä( *cascade08Ä(Ñ(*cascade08Ñ(ï( *cascade08ï(©(*cascade08©(π( *cascade08π(¡(*cascade08¡(°, *cascade08°,´,*cascade08´,º, *cascade08º,À,*cascade08À,Ã, *cascade08Ã,◊,*cascade08◊,ÿ, *cascade08ÿ,‡,*cascade08‡,ê- *cascade08ê-ë-*cascade08ë-ª- *cascade08ª-º-*cascade08º-ô. *cascade08ô.•.*cascade08•.¶. *cascade08¶.ß.*cascade08ß.®. *cascade08®.Ø.*cascade08Ø.∞. *cascade08∞.∂.*cascade08∂.∑. *cascade08∑.∏.*cascade08∏.π. *cascade08π.∫.*cascade08∫.∆. *cascade08∆.».*cascade08».Û. *cascade08Û.ˆ.*cascade08ˆ.É/ *cascade08É/Ñ/*cascade08Ñ/Ü/ *cascade08Ü/á/*cascade08á/ì/ *cascade08ì/ï/*cascade08ï/ó/ *cascade082Efile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Aliases/AliasForm.tsx