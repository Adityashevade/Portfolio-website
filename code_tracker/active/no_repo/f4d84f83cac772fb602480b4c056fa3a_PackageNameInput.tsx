ˇ&
import { useState, useRef, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

interface PackageNameInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

interface Vulnerability {
    id: string;
    affected?: {
        package?: string;
        ecosystem?: string;
    }[];
}

export function PackageNameInput({
    value,
    onChange,
    placeholder = "e.g. log4j",
    className
}: PackageNameInputProps) {
    // Note: isOpen is controlled by input focus and typing
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    const [debouncedQuery, setDebouncedQuery] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(value);
        }, 200);
        return () => clearTimeout(handler);
    }, [value]);

    // Fetch suggestions
    const { data: suggestions, isLoading } = useQuery({
        queryKey: ["package-name-search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];

            const res = await api.get(`/vulnerabilities/search`, {
                params: { q: debouncedQuery, limit: 15 }
            });
            const vulns = res.data as Vulnerability[];

            const packages = new Set<string>();
            vulns.forEach(v => {
                if (v.affected) {
                    v.affected.forEach(a => {
                        if (a.package) packages.add(a.package);
                    });
                }
            });

            return Array.from(packages).slice(0, 10);
        },
        enabled: debouncedQuery.length >= 2 && isOpen, // Only fetch if open
    });

    const handleSelect = (pkg: string) => {
        onChange(pkg);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen && value.length >= 2} onOpenChange={setIsOpen}>
            <PopoverAnchor asChild>
                <div className="relative w-full" ref={containerRef}>
                    <Input
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            if (e.target.value.length >= 2) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (value.length >= 2) setIsOpen(true);
                        }}
                        // We handle blur via Popover's outside/focus interaction, but for input specifically:
                        // Popover handles outside clicks.
                        placeholder={placeholder}
                        className={className}
                    />
                </div>
            </PopoverAnchor>

            <PopoverContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="p-0 w-[--radix-popover-trigger-width] min-w-[200px]"
                align="start"
                sideOffset={4}
            >
                <ScrollArea className="max-h-[200px]">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding packages...
                            </div>
                        ) : suggestions && suggestions.length > 0 ? (
                            suggestions.map((pkg, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={() => handleSelect(pkg)}
                                >
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span>{pkg}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                No known packages found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
™ *cascade08™˝*cascade08˝® *cascade08®Â*cascade08Â®	 *cascade08®	©	*cascade08©	„ *cascade08„‰*cascade08‰Â *cascade08ÂÊ*cascade08ÊÁ *cascade08ÁÈ*cascade08Èı *cascade08ı˜*cascade08˜¯ *cascade08¯˙*cascade08˙¸ *cascade08¸˝*cascade08˝ˇ *cascade08ˇÄ*cascade08ÄÖ *cascade08Öà*cascade08àé *cascade08éè*cascade08èê *cascade08êí*cascade08íî *cascade08îï*cascade08ïó *cascade08óò*cascade08òô *cascade08ô°*cascade08°£ *cascade08£•*cascade08•ß *cascade08ß©*cascade08©™ *cascade08™´*cascade08´≠ *cascade08≠Æ*cascade08Æπ *cascade08π∫*cascade08∫» *cascade08» *cascade08 À *cascade08ÀÃ*cascade08ÃÕ *cascade08ÕŒ*cascade08Œ– *cascade08–—*cascade08—” *cascade08”‘*cascade08‘ÿ *cascade08ÿŸ*cascade08Ÿ⁄ *cascade08⁄€*cascade08€‹ *cascade08‹›*cascade08›ﬁ *cascade08ﬁﬂ*cascade08ﬂâ *cascade08âê*cascade08êß *cascade08ß®*cascade08®¥ *cascade08¥ª*cascade08ª√ *cascade08√≈*cascade08≈’ *cascade08’€*cascade08€Í *cascade08ÍÚ*cascade08Úñ *cascade08ñö*cascade08öÆ *cascade08Æ≤*cascade08≤· *cascade08·â*cascade08â´ *cascade08´≥*cascade08≥∑ *cascade08∑∫*cascade08∫  *cascade08 œ*cascade08œ· *cascade08·È*cascade08È¶ *cascade08¶´*cascade08´ª *cascade08ªæ*cascade08æ“ *cascade08“Ü*cascade08Ü± *cascade08±π*cascade08π‹ *cascade08‹‰*cascade08‰Ë *cascade08Ë˛*cascade08˛å *cascade08åê*cascade08êë *cascade08ëì*cascade08ìî *cascade08îñ*cascade08ñó *cascade08ó°*cascade08°¢ *cascade08¢§*cascade08§• *cascade08•±*cascade08±≥ *cascade08≥∏*cascade08∏ª *cascade08ªΩ*cascade08Ωæ *cascade08æ√*cascade08√∆ *cascade08∆ﬁ*cascade08ﬁﬂ *cascade08ﬂ¯*cascade08¯ï *cascade08ïñ *cascade08ñó *cascade08óò*cascade08òô *cascade08ôö*cascade08öõ *cascade08õú*cascade08úù *cascade08ùû *cascade08ûü*cascade08ü° *cascade08°¢*cascade08¢£ *cascade08£§ *cascade08§•*cascade08•¶ *cascade08¶ß*cascade08ß® *cascade08®´*cascade08´¨ *cascade08¨≠*cascade08≠Æ *cascade08Æ∞*cascade08∞± *cascade08±≤*cascade08≤≥ *cascade08≥∂*cascade08∂∑*cascade08∑∫*cascade08∫ª *cascade08ªΩ*cascade08Ω¡ *cascade08¡¬ *cascade08¬√*cascade08√≈ *cascade08≈«*cascade08«» *cascade08»À*cascade08ÀÃ *cascade08ÃÂ*cascade08ÂÊ *cascade08Ê˚*cascade08˚¸ *cascade08¸˝ *cascade08˝Ç*cascade08ÇÉ *cascade08Éà*cascade08àï *cascade08ïô*cascade08ô¢ *cascade08¢©*cascade08©œ& *cascade08œ&”&*cascade08”&‘& *cascade08‘&›&*cascade08›&Í& *cascade08Í&Ó&*cascade08Ó&Ô& *cascade08Ô&Ò&*cascade08Ò&ˇ& *cascade082Pfile:///C:/SCOUTNEW/scout_db/frontend/src/components/shared/PackageNameInput.tsx