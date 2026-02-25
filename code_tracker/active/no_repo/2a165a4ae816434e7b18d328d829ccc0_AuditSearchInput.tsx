Ã-
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, Shield, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);

    // Extract unique values from data
    const allSuggestions = useMemo(() => {
        if (!data) return [];
        const actors = new Set<string>();
        const vulns = new Set<string>();

        data.forEach(item => {
            if (item.actor) actors.add(item.actor);
            if (item.vulnerability_id) vulns.add(item.vulnerability_id);
        });

        const result: Suggestion[] = [];
        actors.forEach(a => result.push({ type: 'actor', value: a }));
        vulns.forEach(v => result.push({ type: 'vulnerability', value: v }));

        return result;
    }, [data]);

    // Filter suggestions based on input
    useEffect(() => {
        if (!value || value.length < 1) {
            setFilteredSuggestions([]);
            return;
        }

        const lower = value.toLowerCase();
        const matches = allSuggestions.filter(s =>
            s.value.toLowerCase().includes(lower)
        ).slice(0, 10); // Limit to 10 suggestions

        setFilteredSuggestions(matches);
    }, [value, allSuggestions]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const clearSearch = () => {
        onChange("");
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen && filteredSuggestions.length > 0} onOpenChange={setIsOpen}>
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
                        {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((item, i) => (
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
                                        {item.type}
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
Ã-2Pfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/AuditSearchInput.tsx