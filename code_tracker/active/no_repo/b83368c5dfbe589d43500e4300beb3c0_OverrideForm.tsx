á<import { useState } from "react";
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
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Create Override</h2>
                <p className="text-muted-foreground">Override vulnerability data.</p>
            </div>

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
å *cascade08å®*cascade08®Ä *cascade08ÄÅ *cascade08ÅÆ *cascade08ÆÌ*cascade08Ìï *cascade08ïò*cascade08òó *cascade08óù *cascade08ùû *cascade08ûÅ *cascade08Å‹ *cascade08‹£*cascade08£¥ *cascade08¥§*cascade08§© *cascade08©«*cascade08«¬ *cascade08¬¶*cascade08¶¹ *cascade08¹¿*cascade08¿À *cascade08ÀÂ*cascade08ÂÄ *cascade08ÄÈ*cascade08ÈÉ *cascade08ÉÔ*cascade08ÔÕ *cascade08ÕÖ*cascade08Ö× *cascade08×Ş*cascade08Şß *cascade08ßã*cascade08ãä *cascade08äå*cascade08åş *cascade08şÚ*cascade08Ú“ *cascade08“Ï*cascade08Ïé *cascade08éó	*cascade08ó	Ÿ
 *cascade08Ÿ
‘*cascade08‘â *cascade08âË *cascade08ËÍ*cascade08Í– *cascade08–†*cascade08†Ê *cascade08Ê¨ *cascade08¨Ì*cascade08ÌÕ *cascade08Õí*cascade08íî *cascade08îõ*cascade08õö *cascade08ö÷*cascade08÷ù *cascade08ùŠ*cascade08Š‹ *cascade08‹ *cascade08ğ*cascade08ğŒ *cascade08Œ *cascade08”*cascade08”• *cascade08•§*cascade08§¬ *cascade08¬¯ *cascade08¯²*cascade08²Æ *cascade08ÆÇ *cascade08ÇÉ*cascade08ÉÊ *cascade08Ê’*cascade08’“ *cascade08“˜*cascade08˜š *cascade08š§*cascade08§© *cascade08©¸*cascade08¸Ç *cascade08Ç÷ *cascade08÷ú*cascade08úı *cascade08ış *cascade08ş‹*cascade08‹ *cascade08*cascade08‘ *cascade08‘’*cascade08’• *cascade08•¿*cascade08¿Â *cascade08ÂÖ*cascade08Ö× *cascade08×Ø*cascade08ØÙ *cascade08ÙÚ *cascade08Úì*cascade08ìó *cascade08óö *cascade08öš*cascade08š› *cascade08›¸ *cascade08¸º*cascade08º¼ *cascade08¼À*cascade08ÀÌ *cascade08Ì×*cascade08×á *cascade08áâ*cascade08âî *cascade08îğ *cascade08ğô*cascade08ôõ *cascade08õø*cascade08øù *cascade08ùú*cascade08úû *cascade08ûü *cascade08üş*cascade08şÿ *cascade08ÿ*cascade08‚ *cascade08‚ƒ*cascade08ƒ„ *cascade08„…*cascade08…† *cascade08†‡*cascade08‡— *cascade08—˜*cascade08˜§ *cascade08§´*cascade08´µ *cascade08µÃ *cascade08ÃÆ*cascade08ÆØ *cascade08ØÚ*cascade08ÚÛ *cascade08ÛŞ*cascade08Şà *cascade08àä*cascade08äæ *cascade08æé*cascade08éë *cascade08ëí*cascade08íñ *cascade08ñò *cascade08òö *cascade08öù*cascade08ùú *cascade08úû*cascade08ûü *cascade08üş*cascade08şÿ *cascade08ÿ*cascade08‚ *cascade08‚‡*cascade08‡ˆ *cascade08ˆ‰*cascade08‰Š *cascade08Š‹*cascade08‹Œ *cascade08Œ*cascade08 *cascade08–*cascade08–» *cascade08»¿ *cascade08¿Æ *cascade08ÆÉ *cascade08ÉÊ *cascade08ÊÕ *cascade08ÕØ*cascade08ØŞ *cascade08Şß *cascade08ßå*cascade08åæ *cascade08æŠ *cascade08ŠŒ*cascade08Œ¤ *cascade08¤¥ *cascade08¥¦ *cascade08¦©*cascade08©« *cascade08«¬*cascade08¬® *cascade08®´*cascade08´· *cascade08·¹ *cascade08¹¼*cascade08¼¿ *cascade08¿Ã*cascade08ÃÄ *cascade08ÄÆ*cascade08ÆÉ *cascade08ÉË*cascade08ËÌ *cascade08ÌÏ*cascade08ÏĞ *cascade08ĞÔ*cascade08ÔÕ *cascade08ÕÙ*cascade08ÙÛ *cascade08Û’*cascade08’« *cascade08«¬ *cascade08¬´*cascade08´¶ *cascade08¶· *cascade08·¸*cascade08¸¾ *cascade08¾¿ *cascade08¿Ü *cascade08Üİ*cascade08İƒ *cascade08ƒ… *cascade08…*cascade08Ÿ *cascade08Ÿ§ *cascade08§ª*cascade08ª­ *cascade08­º *cascade08º»*cascade08»ã *cascade08ãæ *cascade08æó *cascade08óö*cascade08öû *cascade08ûÿ*cascade08ÿ€ *cascade08€ƒ*cascade08ƒ† *cascade08†‰*cascade08‰‹ *cascade08‹”*cascade08”¢ *cascade08¢ *cascade08 ¦ *cascade08¦§ *cascade08§¹ *cascade08¹º*cascade08ºÅ *cascade08ÅÆ *cascade08ÆÚ *cascade08ÚÛ*cascade08Ûò *cascade08òó *cascade08óù*cascade08ùú *cascade08ú…*cascade08…† *cascade08†ˆ*cascade08ˆ‰ *cascade08‰Œ*cascade08Œ *cascade08*cascade08 *cascade08—*cascade08—˜ *cascade08˜¡*cascade08¡¢ *cascade08¢£ *cascade08£¦*cascade08¦ª *cascade08ª« *cascade08«¬*cascade08¬­ *cascade08­³*cascade08³´ *cascade08´¶ *cascade08¶·*cascade08·ä *cascade08äœ *cascade08œ ¡  *cascade08¡ ¢  *cascade08¢ ² *cascade08² ³  *cascade08³ Í *cascade08Í Î  *cascade08Î Ò *cascade08Ò Ó  *cascade08Ó Ù *cascade08Ù Û  *cascade08Û ß  *cascade08ß ™!*cascade08™!­! *cascade08­!®! *cascade08®!²!*cascade08²!º! *cascade08º!Á!*cascade08Á!Ç! *cascade08Ç!Ô!*cascade08Ô!Õ! *cascade08Õ!İ!*cascade08İ!Ş! *cascade08Ş!ğ!*cascade08ğ!ñ! *cascade08ñ!ı!*cascade08ı!€" *cascade08€"†"*cascade08†"‡" *cascade08‡"‘"*cascade08‘"’" *cascade08’"”"*cascade08”"•" *cascade08•"™"*cascade08™"š" *cascade08š"›" *cascade08›"£"*cascade08£"¤" *cascade08¤"¿"*cascade08¿"Á" *cascade08Á"Â" *cascade08Â"Ğ"*cascade08Ğ"Ñ" *cascade08Ñ"ã"*cascade08ã"ä" *cascade08ä"é"*cascade08é"ê" *cascade08ê"ü"*cascade08ü"ƒ# *cascade08ƒ#„#*cascade08„#…# *cascade08…#ˆ#*cascade08ˆ#‰# *cascade08‰##*cascade08#ª# *cascade08ª#®#*cascade08®#¸# *cascade08¸#¼#*cascade08¼#ï# *cascade08ï#ñ#*cascade08ñ#ù# *cascade08ù#û#*cascade08û#‚$ *cascade08‚$†$*cascade08†$Ú$ *cascade08Ú$İ$*cascade08İ$é$ *cascade08é$ê$*cascade08ê$±% *cascade08±%µ%*cascade08µ%Ï% *cascade08Ï%Ó%*cascade08Ó%‰& *cascade08‰&Š&*cascade08Š&–& *cascade08–&™&*cascade08™&¶& *cascade08¶&º&*cascade08º&º' *cascade08º'¼'*cascade08¼'Ğ' *cascade08Ğ'Ò'*cascade08Ò'ô' *cascade08ô'ø'*cascade08ø'‚( *cascade08‚(…(*cascade08…(•( *cascade08•(–(*cascade08–(À( *cascade08À(Ä(*cascade08Ä(Ô( *cascade08Ô(Ø(*cascade08Ø(©) *cascade08©)­)*cascade08­)Ü) *cascade08Ü)à)*cascade08à)õ) *cascade08õ)÷)*cascade08÷)* *cascade08*‘**cascade08‘*½* *cascade08½*Á**cascade08Á*Å* *cascade08Å*É**cascade08É*Ê* *cascade08Ê*Ò**cascade08Ò*Ó* *cascade08Ó*Õ**cascade08Õ*Ö* *cascade08Ö*Ø**cascade08Ø*Ù* *cascade08Ù*â**cascade08â*ã* *cascade08ã*ç**cascade08ç*è* *cascade08è*ì**cascade08ì*í* *cascade08í*î**cascade08î*ï* *cascade08ï*ò**cascade08ò*ó* *cascade08ó*õ**cascade08õ*ö* *cascade08ö*÷**cascade08÷*ø* *cascade08ø*ù**cascade08ù*û* *cascade08û*ı**cascade08ı*ş* *cascade08ş*ˆ+*cascade08ˆ+‰+ *cascade08‰+¤+*cascade08¤+¥+ *cascade08¥+§+*cascade08§+ª+ *cascade08ª+·+*cascade08·+¸+ *cascade08¸+º+*cascade08º+»+ *cascade08»+Ó+*cascade08Ó+í+ *cascade08í+ñ+ *cascade08ñ+ô+*cascade08ô+„, *cascade08„,…,*cascade08…,‹, *cascade08‹,,*cascade08,±, *cascade08±,³,*cascade08³,´, *cascade08´,µ,*cascade08µ,¶, *cascade08¶,¸,*cascade08¸,¹, *cascade08¹,º,*cascade08º,À, *cascade08À,Ä,*cascade08Ä,ü, *cascade08ü,€-*cascade08€-ä- *cascade08ä-è-*cascade08è-ö- *cascade08ö-£.*cascade08£.¥. *cascade08¥.¦.*cascade08¦.§. *cascade08§.¨.*cascade08¨.©. *cascade08©.´.*cascade08´.µ. *cascade08µ.¶.*cascade08¶.¹. *cascade08¹.ã.*cascade08ã.ä. *cascade08ä.è.*cascade08è.ê. *cascade08ê.í.*cascade08í.î. *cascade08î.ğ.*cascade08ğ.ò. *cascade08ò.ö.*cascade08ö.ı. *cascade08ı.ƒ/*cascade08ƒ/„/ *cascade08„/¡/*cascade08¡/¦/ *cascade08¦/§/*cascade08§/»/ *cascade08»/¾/*cascade08¾/Æ/ *cascade08Æ/Ê/*cascade08Ê/ê/ *cascade08ê/î/*cascade08î/ø/ *cascade08ø/û/*cascade08û/‡0 *cascade08‡0ˆ0*cascade08ˆ0¥0 *cascade08¥0©0*cascade08©01 *cascade081‘1*cascade08‘1œ1 *cascade08œ1 1*cascade08 1ú3 *cascade08ú3ş3*cascade08ş3Á4 *cascade08Á4Å4*cascade08Å4Õ4 *cascade08Õ4×4*cascade08×4ë4 *cascade08ë4í4*cascade08í4®5 *cascade08®5²5*cascade08²5¼5 *cascade08¼5¿5*cascade08¿5Ï5 *cascade08Ï5Ğ5*cascade08Ğ5Ô5 *cascade08Ô5Ø5*cascade08Ø5ò5 *cascade08ò5õ5*cascade08õ56 *cascade086‚6*cascade08‚6¶6 *cascade08¶6º6*cascade08º6Ã6 *cascade08Ã6Ç6*cascade08Ç6ş6 *cascade08ş6‚7*cascade08‚7§7 *cascade08§7«7*cascade08«7—: *cascade08—:š:*cascade08š:ª: *cascade08ª:«:*cascade08«:®: *cascade08®:²:*cascade08²:ş: *cascade08ş:‚;*cascade08‚;µ; *cascade08µ;¶;*cascade08¶;Ê; *cascade08Ê;Í;*cascade08Í;Ñ; *cascade08Ñ;Õ;*cascade08Õ;ú; *cascade08ú;ü;*cascade08ü;Œ< *cascade08Œ<<*cascade08<¥< *cascade08¥<©<*cascade08©<±< *cascade08±<´<*cascade08´<¼< *cascade08¼<½<*cascade08½<Æ< *cascade08Æ<Ê<*cascade08Ê<Ö< *cascade08Ö<Ú<*cascade08Ú<á< *cascade082Jfile:///C:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideForm.tsx