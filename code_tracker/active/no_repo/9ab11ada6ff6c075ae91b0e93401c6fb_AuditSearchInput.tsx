’<
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, Shield, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Suggestion {
    type: 'actor' | 'vulnerability';
    value: string;
}

interface AuditSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    data: any[]; // The full audit log data to derive suggestions from
    className?: string;
    placeholder?: string;
}

export function AuditSearchInput({
    value,
    onChange,
    data,
    className,
    placeholder = "Search actor or vulnerability..."
}: AuditSearchInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [debouncedQuery, setDebouncedQuery] = useState(value);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(value);
        }, 200);
        return () => clearTimeout(handler);
    }, [value]);

    // Local suggestions from audit log data (Actor & Vulnerability ID)
    const localSuggestions = useMemo(() => {
        if (!data || !value) return [];
        const lower = value.toLowerCase();
        const actors = new Set<string>();
        const vulns = new Set<string>();

        data.forEach(item => {
            if (item.actor && item.actor.toLowerCase().includes(lower)) actors.add(item.actor);
            if (item.vulnerability_id && item.vulnerability_id.toLowerCase().includes(lower)) vulns.add(item.vulnerability_id);
        });

        const result: Suggestion[] = [];
        actors.forEach(a => result.push({ type: 'actor', value: a }));
        vulns.forEach(v => result.push({ type: 'vulnerability', value: v }));

        return result;
    }, [data, value]);

    // Remote suggestions from database (Vulnerabilities only)
    const { data: remoteSuggestions, isLoading: isRemoteLoading } = useQuery({
        queryKey: ["audit-vulnerability-search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];
            try {
                const res = await api.get(`/vulnerabilities/search`, {
                    params: { q: debouncedQuery, limit: 10 }
                });
                return (res.data as any[]).map(v => ({ type: 'vulnerability', value: v.id } as Suggestion));
            } catch (e) {
                console.error("Failed to fetch remote suggestions", e);
                return [];
            }
        },
        enabled: debouncedQuery.length >= 2 && isOpen,
        staleTime: 60000, // 1 minute cache
    });

    // Merge and deduplicate suggestions
    const finalSuggestions = useMemo(() => {
        const all = [...localSuggestions, ...(remoteSuggestions || [])];
        const unique = new Map<string, Suggestion>();

        all.forEach(s => {
            const key = `${s.type}-${s.value}`;
            if (!unique.has(key)) {
                unique.set(key, s);
            }
        });

        return Array.from(unique.values()).slice(0, 15); // Limit to 15 total
    }, [localSuggestions, remoteSuggestions]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const clearSearch = () => {
        onChange("");
        setIsOpen(false);
    };

    const isLoading = isRemoteLoading && debouncedQuery.length >= 2;

    return (
        <Popover open={isOpen && value.length > 0} onOpenChange={setIsOpen}>
            <PopoverAnchor asChild>
                <div className={cn("relative", className)} ref={containerRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (value.length >= 1) setIsOpen(true);
                        }}
                        placeholder={placeholder}
                        className="pl-9 pr-9 bg-background"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </PopoverAnchor>

            <PopoverContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="p-0 w-[--radix-popover-trigger-width] min-w-[300px]"
                align="start"
                sideOffset={4}
            >
                <ScrollArea className="max-h-[300px]">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching database...
                            </div>
                        ) : finalSuggestions.length > 0 ? (
                            finalSuggestions.map((item, i) => (
                                <div
                                    key={`${item.type}-${item.value}-${i}`}
                                    className="flex items-center justify-between px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
                                    onClick={() => handleSelect(item.value)}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.type === 'actor' ? (
                                            <User className="h-4 w-4 text-blue-500/70" />
                                        ) : (
                                            <Shield className="h-4 w-4 text-orange-500/70" />
                                        )}
                                        <span>{item.value}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-background">
                                        {item.type === 'vulnerability' && !localSuggestions.find(s => s.value === item.value && s.type === 'vulnerability') ?
                                            'Database' : item.type}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No matching results found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
a *cascade08aj*cascade08jî *cascade08îÈ*cascade08Èƒ *cascade08ƒ≈*cascade08≈∆ *cascade08∆À*cascade08ÀÕ *cascade08ÕŒ*cascade08Œ– *cascade08–‘*cascade08‘’ *cascade08’÷*cascade08÷◊ *cascade08◊⁄*cascade08⁄€ *cascade08€‹*cascade08‹› *cascade08›Ê*cascade08ÊÁ *cascade08ÁÍ*cascade08ÍÏ *cascade08ÏÌ*cascade08ÌÓ *cascade08ÓÔ*cascade08ÔÒ *cascade08Òˆ*cascade08ˆ˜ *cascade08˜à	*cascade08à	â	 *cascade08â	ã	*cascade08ã	å	 *cascade08å	ç	*cascade08ç	é	 *cascade08é	ß	*cascade08ß	®	 *cascade08®	ª	*cascade08ª	æ	 *cascade08æ	«	*cascade08«	Õ	 *cascade08Õ	–	*cascade08–	—	 *cascade08—	“	*cascade08“	”	 *cascade08”	Î	*cascade08Î	Ì	 *cascade08Ì		*cascade08	Ò	 *cascade08Ò	Ú	*cascade08Ú	Û	 *cascade08Û	˚	*cascade08˚	¸	 *cascade08¸	Å
*cascade08Å
Ö
 *cascade08Ö
ï
*cascade08ï
ó
 *cascade08ó
ô
*cascade08ô
û
 *cascade08û
ü
*cascade08ü
†
 *cascade08†
°
*cascade08°
£
 *cascade08£
§
*cascade08§
•
 *cascade08•
≤
*cascade08≤
≥
 *cascade08≥
∂
*cascade08∂
∑
 *cascade08∑
æ
*cascade08æ
ø
 *cascade08ø
 
*cascade08 
À
 *cascade08À
Ã
*cascade08Ã
—
 *cascade08—
Ô
*cascade08Ô
ˆ
 *cascade08ˆ
Ä*cascade08ÄÑ *cascade08Ñü*cascade08ü¨ *cascade08¨Ø*cascade08Ø‡ *cascade08‡Í*cascade08ÍÜ *cascade08Ü≤*cascade08≤µ *cascade08µ·*cascade08·° *cascade08°ÿ*cascade08ÿÛ *cascade08Û˙*cascade08˙à *cascade08àå*cascade08åõ *cascade08õ§*cascade08§® *cascade08®Õ*cascade08ÕŒ *cascade08Œ“*cascade08“” *cascade08”·*cascade08·„ *cascade08„Â*cascade08ÂÁ *cascade08ÁÌ*cascade08ÌÓ *cascade08ÓÖ*cascade08ÖÜ *cascade08Üè*cascade08èë *cascade08ëì*cascade08ìó *cascade08óö*cascade08öõ *cascade08õπ*cascade08πª *cascade08ªﬁ*cascade08ﬁﬂ *cascade08ﬂÈ*cascade08ÈÍ *cascade08ÍÎ*cascade08Î¸ *cascade08¸Ä*cascade08ÄÖ *cascade08Öè*cascade08èë *cascade08ëì*cascade08ìó *cascade08ó°*cascade08°£ *cascade08£•*cascade08•Ø *cascade08Ø∞*cascade08∞≤ *cascade08≤Œ*cascade08Œ› *cascade08›‰*cascade08‰Â *cascade08ÂË*cascade08ËÈ *cascade08ÈÒ*cascade08ÒÚ *cascade08ÚÖ*cascade08Öá *cascade08áà*cascade08àâ *cascade08âä*cascade08äã *cascade08ãØ*cascade08Ø∞ *cascade08∞¡*cascade08¡√ *cascade08√À*cascade08À’ *cascade08’à*cascade08àâ *cascade08âí*cascade08íì *cascade08ì∫*cascade08∫æ *cascade08æ¬*cascade08¬‘ *cascade08‘◊*cascade08◊⁄ *cascade08⁄ﬁ*cascade08ﬁÈ *cascade08ÈÛ*cascade08Û˝ *cascade08˝˛*cascade08˛ˇ *cascade08ˇÖ*cascade08ÖÜ *cascade08Üâ*cascade08âä *cascade08äë*cascade08ëì *cascade08ìõ*cascade08õú *cascade08úù*cascade08ùü *cascade08ü∑*cascade08∑π *cascade08πœ*cascade08œ– *cascade08–—*cascade08—“ *cascade08“à*cascade08àâ *cascade08âä*cascade08äã *cascade08ãî*cascade08îï *cascade08ïú*cascade08úù *cascade08ù≠*cascade08≠Ø *cascade08Ø¥*cascade08¥∂ *cascade08∂ª*cascade08ªÃ *cascade08ÃŒ*cascade08Œ— *cascade08—ÿ*cascade08ÿÂ *cascade08ÂË*cascade08ËÈ *cascade08È¯*cascade08¯˘ *cascade08˘ì*cascade08ìî *cascade08îö*cascade08öõ *cascade08õ®*cascade08®© *cascade08©”*cascade08”ÿ *cascade08ÿ⁄*cascade08⁄Ë *cascade08ËÅ*cascade08Åà *cascade08à£*cascade08£§ *cascade08§¶*cascade08¶® *cascade08®™*cascade08™´ *cascade08´≠*cascade08≠Æ *cascade08Æƒ*cascade08ƒ≈ *cascade08≈∆*cascade08∆» *cascade08»…*cascade08…  *cascade08 Ã*cascade08ÃÕ *cascade08ÕŒ*cascade08Œœ *cascade08œ”*cascade08”‘ *cascade08‘’*cascade08’ﬂ *cascade08ﬂû*cascade08û™ *cascade08™´*cascade08´ª *cascade08ªº*cascade08ºø *cascade08ø¬*cascade08¬» *cascade08» *cascade08 À *cascade08ÀÃ*cascade08ÃÕ *cascade08Õ—*cascade08—‹ *cascade08‹‡*cascade08‡· *cascade08·‚*cascade08‚Ω *cascade08ΩÖ*cascade08Ö¥ *cascade08¥∂*cascade08∂•+ *cascade08•+‰+*cascade08‰+Â+ *cascade08Â+È+*cascade08È+Í+ *cascade08Í+–,*cascade08–,—, *cascade08—,Á,*cascade08Á,È, *cascade08È,,*cascade08,Ò, *cascade08Ò,˘,*cascade08˘,˙, *cascade08˙,Ç-*cascade08Ç-É- *cascade08É-‘-*cascade08‘-é. *cascade08é.ê.*cascade08ê.≥7 *cascade08≥7‚8*cascade08‚8’< *cascade082Pfile:///C:/SCOUTNEW/scout_db/frontend/src/components/shared/AuditSearchInput.tsx