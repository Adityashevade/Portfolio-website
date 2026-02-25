É;import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { VulnerabilitySearch } from "@/components/VulnerabilitySearch";
import { VulnerabilityEditForm } from "@/components/VulnerabilityEditForm";

export function OverrideForm({ onSuccess }: { onSuccess?: () => void }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [vulnId, setVulnId] = useState("");
    const [selectedVuln, setSelectedVuln] = useState<any>(null); // Original
    const [editedVuln, setEditedVuln] = useState<any>(null); // Modified by user
    const [reason, setReason] = useState("");

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            console.log("Sending override data to backend:", data);
            try {
                const res = await api.post("/overrides", data);
                console.log("Backend response:", res);
                return res.data;
            } catch (error) {
                console.error("API Request Failed:", error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Override created successfully!");
            alert("Override created successfully!");
            queryClient.invalidateQueries({ queryKey: ["overrides"] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/overrides");
            }
        },
        onError: (error: any) => {
            console.error("Mutation failed:", error);
            let msg = error.response?.data?.detail || error.message || "Unknown error";
            if (typeof msg === 'object') {
                msg = JSON.stringify(msg, null, 2);
            }
            alert(`Failed to create override: ${msg}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate Diff Fields
        const changes: { path: string; operation: string; value: any }[] = [];


        console.log("Submitting Override...", { selectedVuln, editedVuln });

        if (selectedVuln && editedVuln) {
            // Summary
            if (editedVuln.summary !== selectedVuln.summary) {
                changes.push({ path: "summary", operation: "set", value: editedVuln.summary });
            }
            // Details
            if (editedVuln.details !== selectedVuln.details) {
                changes.push({ path: "details", operation: "set", value: editedVuln.details });
            }
            // Severity Score
            if (
                editedVuln.severity?.cvss_v3_score !== selectedVuln.severity?.cvss_v3_score &&
                !(editedVuln.severity?.cvss_v3_score === undefined && selectedVuln.severity?.cvss_v3_score === undefined)
            ) {
                // Handle case where severity object might not exist on target
                changes.push({ path: "severity", operation: "set", value: editedVuln.severity });
            }

            // Affected - Compare JSON stringified versions for deep equality
            // Ensure we are comparing valid arrays
            const editedAffected = editedVuln.affected || [];
            const selectedAffected = selectedVuln.affected || [];
            if (JSON.stringify(editedAffected) !== JSON.stringify(selectedAffected)) {
                changes.push({ path: "affected", operation: "set", value: editedAffected });
            }
            // References - Compare JSON stringified versions
            const editedRefs = editedVuln.references || [];
            const selectedRefs = selectedVuln.references || [];
            if (JSON.stringify(editedRefs) !== JSON.stringify(selectedRefs)) {
                changes.push({ path: "references", operation: "set", value: editedRefs });
            }
        }

        console.log("Calculated Changes:", changes);

        if (changes.length === 0) {
            alert("No changes detected. You must modify at least one field to create an override.");
            return;
        }

        createMutation.mutate({
            vulnerability_id: vulnId,
            reason: reason, // Ensure reason is passed
            created_by: "scout-frontend-user",
            fields: changes,
        });
    };



    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Vulnerability ID
                    </label>
                    <VulnerabilitySearch
                        value={vulnId}
                        onQueryChange={(val) => setVulnId(val)}
                        onSelect={(vuln) => {
                            setVulnId(vuln.id);
                            setSelectedVuln(vuln);
                            // Deep copy to ensure we aren't mutating the original reference
                            setEditedVuln(JSON.parse(JSON.stringify(vuln)));
                        }}
                    />

                    {/* Vulnerability Edit Form */}
                    {selectedVuln && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <VulnerabilityEditForm
                                key={selectedVuln.id}
                                initialData={selectedVuln}
                                onChange={(data) => setEditedVuln(data)}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Reason</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Why is this override necessary?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>



                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {createMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Override
                    </button>
                </div>
            </form>
        </div>
    );
}
å *cascade08åî *cascade08îğğñ *cascade08ñôôõ *cascade08õööø *cascade08øüüı *cascade08ışşÿ *cascade08ÿ— *cascade08—¦¦¨ *cascade08¨®®¯ *cascade08¯»»¼ *cascade08¼ÀÀÁ *cascade08ÁÅÅÆ *cascade08ÆÇÇÈ *cascade08Èããä *cascade08äêêì *cascade08ìğğñ *cascade08ñõõö *cascade08ö÷÷û *cascade08ûš *cascade08šÃ*cascade08ÃÒ *cascade08ÒÕÕÖ *cascade08Öİİã *cascade08ãééê *cascade08êîîû *cascade08û€€ *cascade08……‡ *cascade08‡““  *cascade08 ¢¢£ *cascade08£¤¤¥ *cascade08¥¨¨© *cascade08©ªª¯ *cascade08¯±±² *cascade08²³³´ *cascade08´··¸ *cascade08¸¹¹Æ *cascade08ÆÑÑÒ *cascade08ÒÔÔÕ *cascade08ÕİİŞ *cascade08Şààá *cascade08áççë *cascade08ëïïñ *cascade08ñòòõ *cascade08õööø *cascade08øùùû *cascade08ûüüı *cascade08ışşÿ *cascade08ÿ€€ *cascade08‚‚… *cascade08…††‡ *cascade08‡ *cascade08’’ş *cascade08şÚÚ“ *cascade08“ÏÏé *cascade08éó	ó	‘
 *cascade08‘
ƒƒÚ *cascade08Ú°*cascade08°Ç *cascade08ÇÖ*cascade08Öî *cascade08îôô÷ *cascade08÷ûûÿ *cascade08ÿ€€• *cascade08•šš› *cascade08›œœ *cascade08££¬ *cascade08¬­­° *cascade08°±±³ *cascade08³´´¶ *cascade08¶¸¸º *cascade08º½½Ë *cascade08ËÌÌÏ *cascade08ÏĞĞÑ *cascade08ÑØØÚ *cascade08Úßßá *cascade08áççè *cascade08èëëí *cascade08íññò *cascade08òôôö *cascade08ö÷÷ù *cascade08ùûûü *cascade08üÿÿ€ *cascade08€‚‚ƒ *cascade08ƒ‹‹Œ *cascade08Œ *cascade08 *cascade08––¤ *cascade08¤¥¥¦ *cascade08¦««¬ *cascade08¬°°± *cascade08±²²³ *cascade08³»»¼ *cascade08¼¿¿Ô *cascade08ÔŞŞß *cascade08ßææç *cascade08çììí *cascade08í÷÷… *cascade08…††˜ *cascade08˜™™š *cascade08šœœ *cascade08  *cascade08 ¡¡¢ *cascade08¢¤¤¥ *cascade08¥§§© *cascade08©ªª¬ *cascade08¬­­¯ *cascade08¯µµ¶ *cascade08¶»»¼ *cascade08¼½½¾ *cascade08¾¿¿Ñ *cascade08ÑÒÒá *cascade08áââã *cascade08ãääå *cascade08åëëì *cascade08ìííô *cascade08ôõõ÷ *cascade08÷øøù *cascade08ùûûü *cascade08üşş *cascade08„„… *cascade08…‡‡ˆ *cascade08ˆ‰‰“ *cascade08“––› *cascade08› *cascade08  ¡ *cascade08¡¤¤¥ *cascade08¥¨¨² *cascade08²··¸ *cascade08¸ºº» *cascade08»¼¼¿ *cascade08¿ÀÀÁ *cascade08ÁÃÃÄ *cascade08ÄÅÅÇ *cascade08ÇÊÊÚ *cascade08Úååè *cascade08èêêë *cascade08ëîîğ *cascade08ğòòó *cascade08óõõ÷ *cascade08÷üü„ *cascade08„…… *cascade08 *cascade08””— *cascade08—¬ *cascade08¬ºº» *cascade08»¿¿À *cascade08ÀÂÂÃ *cascade08ÃÅÅÇ *cascade08ÇÈÈË *cascade08ËÑÑÔ *cascade08ÔÖÖ× *cascade08×ÚÚÜ *cascade08Üİİß *cascade08ßààá *cascade08áââã *cascade08ãææê *cascade08êëëî *cascade08îğğø *cascade08øüüş *cascade08ş„ *cascade08„‡‡ˆ *cascade08ˆŒŒ *cascade08 *cascade08‘ *cascade08‘””• *cascade08•––˜ *cascade08˜™™§ *cascade08§©©ª *cascade08ª¬¬¯ *cascade08¯°°À *cascade08ÀÁÁÂ *cascade08ÂÃÃÄ *cascade08ÄÆÆÈ *cascade08ÈËËÍ *cascade08ÍÒÒÔ *cascade08ÔİİŞ *cascade08Şßßá *cascade08áïïğ *cascade08ğññ„ *cascade08„……† *cascade08†‰‰Š *cascade08Š *cascade08““” *cascade08”››œ *cascade08œ  ¡ *cascade08¡££¤ *cascade08¤¥¥§ *cascade08§ªª¬ *cascade08¬®®¯ *cascade08¯µµ¶ *cascade08¶¹¹º *cascade08º¾¾¿ *cascade08¿ÀÀÁ *cascade08ÁÃÃÆ *cascade08ÆÌÌÏ *cascade08ÏÒÒà *cascade08àááï *cascade08ïññò *cascade08òôô‡ *cascade08‡‰‰Š *cascade08ŠŒŒ *cascade08““” *cascade08”™™š *cascade08šœœ *cascade08¢¢£ *cascade08£¥¥§ *cascade08§¨¨© *cascade08©¹¹Ì *cascade08ÌÍÍÎ *cascade08ÎÑÑÒ *cascade08ÒÕÕÖ *cascade08ÖÛÛÜ *cascade08Üààá *cascade08áââä *cascade08äççè *cascade08èêêì *cascade08ìííî *cascade08îïïğ *cascade08ğññô *cascade08ôõõö *cascade08ö÷÷ú *cascade08úşş€ *cascade08€‚ *cascade08‚ƒƒ… *cascade08…ˆˆŠ *cascade08ŠŒŒ *cascade08 *cascade08’’” *cascade08”šš¨ *cascade08¨««· *cascade08·½½Ã *cascade08ÃÈÈÖ *cascade08ÖØØÙ *cascade08ÙÚÚì *cascade08ìîîï *cascade08ïõõö *cascade08öıış *cascade08ş *cascade08’’“ *cascade08“¼¼Ì *cascade08ÌÎÎÏ *cascade08ÏÒÒÓ *cascade08ÓÕÕØ *cascade08ØÚÚÛ *cascade08ÛÜÜà *cascade08àããä *cascade08äééê *cascade08êëëğ *cascade08ğôôõ *cascade08õöö÷ *cascade08÷øøş *cascade08ş‚ *cascade08‚ƒƒ† *cascade08†‡‡Š *cascade08Š‹‹Œ *cascade08Œ *cascade08• *cascade08•™™ *cascade08Ÿ *cascade08Ÿ¡¡¦ *cascade08¦ªª« *cascade08«­­® *cascade08®°°± *cascade08±²²´ *cascade08´µµÃ *cascade08ÃÄÄÅ *cascade08ÅÆÆØ *cascade08ØÚÚÛ *cascade08ÛÜÜß *cascade08ßááâ *cascade08âææç *cascade08çììí *cascade08íõõö *cascade08öüüı *cascade08ı‚‚ƒ *cascade08ƒ††‡ *cascade08‡ŒŒ *cascade08˜˜¨ *cascade08¨©©® *cascade08®µµ¶ *cascade08¶ÁÁÂ *cascade08ÂÈÈÉ *cascade08ÉÓÓÔ *cascade08ÔÕÕØ *cascade08Øèèí *cascade08íîîñ *cascade08ñöö÷ *cascade08÷ùù‡ *cascade08‡ŒŒ˜ *cascade08˜Ÿ *cascade08Ÿ¡¡¤ *cascade08¤¥¥¦ *cascade08¦­­® *cascade08®²²³ *cascade08³¾¾¿ *cascade08¿ÇÇÈ *cascade08ÈËËÌ *cascade08ÌĞĞÑ *cascade08ÑÙÙç *cascade08çééê *cascade08êğğñ *cascade08ñóóô *cascade08ô÷÷ø *cascade08øşşÿ *cascade08ÿ‚‚ƒ *cascade08ƒœ *cascade08œ¡¡¢ *cascade08¢°°± *cascade08±²²³ *cascade08³´´¶ *cascade08¶»»¼ *cascade08¼¾¾¿ *cascade08¿ÁÁÃ *cascade08ÃÄÄÅ *cascade08ÅÍÍÛ *cascade08Ûààá *cascade08áããè *cascade08èëëì *cascade08ìîîò *cascade08òõõö *cascade08ö÷÷ø *cascade08øúúû *cascade08ûÿÿ€ *cascade08€‚ *cascade08‚‡‡ˆ *cascade08ˆ *cascade08  ¡ *cascade08¡ÀÀÁ *cascade08ÁÄÄÅ *cascade08ÅËËÌ *cascade08ÌÕÕÖ *cascade08Öááã *cascade08ãèèû *cascade08ûüüı *cascade08ı€€ *cascade08„„† *cascade08†ˆˆŒ *cascade08Œ *cascade08‘‘” *cascade08”••– *cascade08–——˜ *cascade08˜šš› *cascade08›œœŸ *cascade08Ÿ  ¡ *cascade08¡¢¢¤ *cascade08¤¥¥¦ *cascade08¦§§ª *cascade08ª¬¬® *cascade08®¯¯· *cascade08·¸¸º *cascade08º¾¾Ã *cascade08ÃÆÆÔ *cascade08Ô××ã *cascade08ãççè *cascade08èééë *cascade08ëïïñ *cascade08ñòòó *cascade08óôôõ *cascade08õùùú *cascade08ú‚‚… *cascade08…‰‰Š *cascade08Š *cascade08 *cascade08““¢ *cascade08¢§§¨ *cascade08¨²²³ *cascade08³´´µ *cascade08µÊÊË *cascade08ËÍÍÎ *cascade08ÎÓÓß *cascade08ßääå *cascade08åññò *cascade08òóóô *cascade08ô‹‹Œ *cascade08Œ *cascade08””  *cascade08 ¢¢£ *cascade08£­­¯ *cascade08¯³³´ *cascade08´ºº» *cascade08»½½¿ *cascade08¿ÀÀÁ *cascade08ÁÂÂÃ *cascade08ÃÈÈÊ *cascade08ÊÌÌÍ *cascade08ÍÑÑÒ *cascade08ÒÓÓÔ *cascade08ÔÕÕÖ *cascade08Ö××Ø *cascade08ØÛÛÜ *cascade08ÜŞŞß *cascade08ßââô *cascade08ô‚‚ƒ *cascade08ƒˆˆ‰ *cascade08‰––— *cascade08—¡¡¢ *cascade08¢¨¨© *cascade08©¯¯± *cascade08±²²³ *cascade08³´´¶ *cascade08¶¾¾Ì *cascade08ÌÍÍ× *cascade08×ØØå *cascade08åééë *cascade08ëğğñ *cascade08ñòòó *cascade08óôôõ *cascade08õùùü *cascade08üşşÿ *cascade08ÿ  ‚  *cascade08‚ „ „ …  *cascade08… † † ˆ  *cascade08ˆ Š Š ‹  *cascade08‹ Œ Œ   *cascade08 ’ ’ œ  *cascade08œ   Ÿ  *cascade08Ÿ ® ® ¯  *cascade08¯ ² ² ³  *cascade08³ ¹ ¹ Æ  *cascade08Æ Ç Ç È  *cascade08È Î Î Ğ  *cascade08Ğ Ñ Ñ Ò  *cascade08Ò Õ Õ Ö  *cascade08Ö Ø Ø Û  *cascade08Û Ü Ü İ  *cascade08İ à à á  *cascade08á â â ã  *cascade08ã è è é  *cascade08é ê ê ë  *cascade08ë ì ì î  *cascade08î ó ó ÷  *cascade08÷ ú ú ı  *cascade08ı ÿ ÿ ƒ! *cascade08ƒ!!!! *cascade08!˜!˜!™! *cascade08™!!!«! *cascade08«!®!®!¯! *cascade08¯!°!°!±! *cascade08±!²!²!¼! *cascade08¼!Á!Á!É! *cascade08É!Í!Í!Ï! *cascade08Ï!Ğ!Ğ!Ò! *cascade08Ò!Ó!Ó!Ô! *cascade08Ô!Õ!Õ!×! *cascade08×!à!à!î! *cascade08î!ñ!ñ!ò! *cascade08ò!÷!÷!ù! *cascade08ù!ı!ı!ş! *cascade08ş!‚"‚"ƒ" *cascade08ƒ"…"…"†" *cascade08†"‡"‡"•" *cascade08•"—"—"™" *cascade08™"š"š"›" *cascade08›"œ"œ"" *cascade08"""Ÿ" *cascade08Ÿ" " "¡" *cascade08¡"¢"¢"£" *cascade08£"¤"¤"¥" *cascade08¥"§"§"¨" *cascade08¨"©"©"«" *cascade08«"­"­"°" *cascade08°"±"±"¹" *cascade08¹"»"»"¾" *cascade08¾"Á"Á"Â" *cascade08Â"Ì"Ì"Ğ" *cascade08Ğ"Ñ"Ñ"Ò" *cascade08Ò"Ó"Ó"Ô" *cascade08Ô"Õ"Õ"Ö" *cascade08Ö"×"×"Ù" *cascade08Ù"Ú"Ú"Û" *cascade08Û"Ü"Ü"İ" *cascade08İ"Ş"Ş"î" *cascade08î"ï"ï"ı" *cascade08ı"„#„#…# *cascade08…###—# *cascade08—#œ#œ# # *cascade08 #ª#ª#®# *cascade08®#´#´#µ# *cascade08µ#¸#¸#Á# *cascade08Á#Ä#Ä#Ğ# *cascade08Ğ#×#*cascade08×#Ø# *cascade08Ø#Ú#Ú#İ# *cascade08İ#Ş#*cascade08
Ş#ß# ß#á# *cascade08á#å#å#è# *cascade08
è#ñ# ñ#ò#*cascade08
ò#ø# ø#„$ *cascade08„$‰$‰$Š$ *cascade08Š$—$—$˜$ *cascade08˜$$$Ÿ$ *cascade08Ÿ$¡$¡$µ$ *cascade08µ$¶$¶$Ê$ *cascade08Ê$Ë$ *cascade08Ë$Ì$ *cascade08Ì$Í$ *cascade08Í$Î$Î$Ï$ *cascade08Ï$Ğ$Ğ$Ò$ *cascade08Ò$Õ$Õ$Ö$ *cascade08Ö$×$×$Ù$ *cascade08Ù$Û$Û$İ$ *cascade08İ$Ş$Ş$ß$ *cascade08ß$ã$ã$ı$ *cascade08ı$ÿ$ÿ$€% *cascade08€%%%£% *cascade08£%¤%¤%§% *cascade08§%¨%¨%®% *cascade08®%¯%¯%Ï% *cascade08Ï%Ô%Ô%å% *cascade08å%æ%æ%è% *cascade08è%é%é%ƒ& *cascade08ƒ&›&›&§& *cascade08§&¬&¬&­& *cascade08­&¯&¯&°& *cascade08°&É&É&Ë& *cascade08Ë&Ì&Ì&Ï& *cascade08Ï&Ğ&Ğ&Ñ& *cascade08Ñ&Û&Û&õ& *cascade08õ&Š'Š'–' *cascade08–'''Ÿ' *cascade08Ÿ'¤'¤'­' *cascade08­'°'°'µ' *cascade08µ'·'·'¸' *cascade08¸'º'º'»' *cascade08»'½'½'Ş' *cascade08Ş'î'î'ï' *cascade08ï'ñ'ñ'ò' *cascade08ò'ó'ó'‘( *cascade08‘(“(“(”( *cascade08”(—(—(˜( *cascade08˜(›(›(( *cascade08( ( (¡( *cascade08¡(¤(¤(Â( *cascade08Â(Ê(Ê(Ë( *cascade08Ë(Ğ(Ğ(Ñ( *cascade08Ñ(Ò(Ò(Ó( *cascade08Ó(Ô(Ô(Ö( *cascade08Ö(Ø(Ø(ö( *cascade08ö(ø(ø(ù( *cascade08ù(ı(ı(ş( *cascade08ş(‚)‚)ƒ) *cascade08ƒ)…)…)†) *cascade08†)Œ)Œ)) *cascade08)))) *cascade08)–)–)—) *cascade08—)£)£)¥) *cascade08¥)¨)¨)¬) *cascade08¬)²)²)´) *cascade08´)¶)¶)Ô) *cascade08Ô)Ö)Ö)×) *cascade08×)Ù)Ù)Ú) *cascade08Ú)à)à)á) *cascade08á)è)è)é) *cascade08é)ë)ë)ì) *cascade08ì)ó)ó)ô) *cascade08ô)õ)õ)÷) *cascade08÷)„*„** *cascade08*¢*¢*ª* *cascade08ª*·*·*¸* *cascade08¸*º*º*Ğ* *cascade08Ğ*Ó*Ó*Ô* *cascade08Ô*á*á*â* *cascade08â*ä*ä*æ* *cascade08æ*ï*ï*…+ *cascade08…+’+’+“+ *cascade08“+•+•+–+ *cascade08–+™+™+±+ *cascade08±+²+²+³+ *cascade08³+µ+µ+º+ *cascade08º+¼+¼+½+ *cascade08½+¾+¾+¿+ *cascade08¿+Â+Â+Ä+ *cascade08Ä+Å+Å+Æ+ *cascade08Æ+Ç+Ç+Î+ *cascade08Î+Ï+Ï+Ò+ *cascade08Ò+Õ+Õ+×+ *cascade08×+Ù+Ù+Ü+ *cascade08Ü+İ+İ+ã+ *cascade08ã+ä+ä+å+ *cascade08å+æ+æ+ç+ *cascade08ç+ê+ê+ë+ *cascade08ë+ì+ì+ğ+ *cascade08ğ+ñ+ñ+ô+ *cascade08ô+õ+õ+ö+ *cascade08ö+ø+ø+ú+ *cascade08ú+û+û+™, *cascade08™,œ,œ,, *cascade08,,,¡, *cascade08¡,£,£,¤, *cascade08¤,¯,¯,Ñ, *cascade08Ñ,ˆ-*cascade08ˆ---- *cascade08-“-“-•- *cascade08•-–-–-˜- *cascade08˜-œ-œ-- *cascade08-Ÿ-Ÿ- - *cascade08 -¡-¡-Ï- *cascade08Ï-Ó-Ó-Ø- *cascade08Ø-Ú-Ú-Û- *cascade08Û-İ-İ-Ş- *cascade08Ş-ß-ß-à- *cascade08à-ã-ã-ä- *cascade08ä-å-å-Â. *cascade08Â.Ä.Ä.Ö. *cascade08Ö.à.à.ğ. *cascade08ğ.ı.ı.€/ *cascade08€/‰/‰/Š/ *cascade08Š/‹/‹/¡/ *cascade08¡/§/§/¨/ *cascade08¨/©/©/ª/ *cascade08ª/±/±/²/ *cascade08²/´/´/µ/ *cascade08µ/¹/¹/º/ *cascade08º/¼/¼/½/ *cascade08½/Á/Á/Â/ *cascade08Â/Ã/Ã/Ä/ *cascade08Ä/È/È/É/ *cascade08É/Ê/Ê/Í/ *cascade08Í/à/à/á/ *cascade08á/ã/ã/å/ *cascade08å/í/í/÷/ *cascade08÷/„0„0š0 *cascade08š0œ0œ0§0 *cascade08§0¨0¨0©0 *cascade08©0­0­0¯0 *cascade08¯0º0º0¼0 *cascade08¼0½0½0¾0 *cascade08¾0¿0¿0À0 *cascade08À0Å0Å0Æ0 *cascade08Æ0È0È0É0 *cascade08É0Ï0Ï0Ğ0 *cascade08Ğ0Ö0Ö0Ø0 *cascade08Ø0Ü0Ü0Ş0 *cascade08Ş0á0á0â0 *cascade08â0ä0ä0å0 *cascade08å0ç0ç0ì0 *cascade08ì0ô0ô0õ0 *cascade08õ0ö0ö0ÿ0 *cascade08ÿ011‚1 *cascade08‚1ƒ1ƒ1„1 *cascade08„1ˆ1ˆ1Š1 *cascade08Š111’1 *cascade08’1“1“1”1 *cascade08”1™1™1š1 *cascade08š1œ1œ11 *cascade081®1®1°1 *cascade08°1·1·1¦2 *cascade08¦2¨2¨2­2 *cascade08­2®2®2°2 *cascade08°2³2³2´2 *cascade08´2µ2µ2¶2 *cascade08¶2·2·2¸2 *cascade08¸2¹2¹2¼2 *cascade08¼2¾2¾2¿2 *cascade08¿2À2À2Â2 *cascade08Â2Ã2Ã2Å2 *cascade08Å2Æ2Æ2Ç2 *cascade08Ç2È2È2É2 *cascade08É2Ë2Ë2æ2 *cascade08æ2ö2ö2÷2 *cascade08÷2ù2ù2ú2 *cascade08ú2ş2ş2ÿ2 *cascade08ÿ2‡3‡3ˆ3 *cascade08ˆ3“3“3­3 *cascade08­3®3®3°3 *cascade08°3±3±3³3 *cascade08³3µ3µ3¶3 *cascade08¶3·3·3¸3 *cascade08¸3»3»3Õ3 *cascade08Õ3â3â3ã3 *cascade08ã3å3å3æ3 *cascade08æ3è3è3é3 *cascade08é3í3í3ï3 *cascade08ï3€4€4š4 *cascade08š444Ÿ4 *cascade08Ÿ4¢4¢4¸4 *cascade08¸4º4º4Ò4 *cascade08Ò4Ö4Ö4É; *cascade082Jfile:///c:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideForm.tsx