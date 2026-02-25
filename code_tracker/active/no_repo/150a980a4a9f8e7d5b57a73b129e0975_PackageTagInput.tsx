Ð;
import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface PackageTagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    description?: string;
    maxTags?: number;
}

interface Vulnerability {
    id: string;
    affected?: {
        package?: string;
        ecosystem?: string;
    }[];
}

export function PackageTagInput({
    value = [],
    onChange,
    placeholder = "Type alias and press Enter...",
    description,
    maxTags
}: PackageTagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    const [debouncedQuery, setDebouncedQuery] = useState(inputValue);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(inputValue);
        }, 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    // Fetch suggestions
    const { data: suggestions, isLoading } = useQuery({
        queryKey: ["package-search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];

            // Search vulnerabilities to find relevant packages
            const res = await api.get(`/vulnerabilities/search`, {
                params: { q: debouncedQuery, limit: 15 }
            });
            const vulns = res.data as Vulnerability[];

            // Extract unique package names
            const packages = new Set<string>();
            vulns.forEach(v => {
                if (v.affected) {
                    v.affected.forEach(a => {
                        if (a.package) packages.add(a.package);
                    });
                }
            });

            // Filter out already selected values
            value.forEach(v => packages.delete(v));

            return Array.from(packages).slice(0, 10); // Limit suggestions
        },
        enabled: debouncedQuery.length >= 2,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (maxTags && value.length >= maxTags) return;
        if (!value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
        setIsOpen(false);
    };

    const removeTag = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={containerRef}>
            <div
                className={cn(
                    "flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all relative",
                    "min-h-[42px]"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(index);
                            }}
                            className="text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
                    placeholder={value.length === 0 ? placeholder : ""}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (inputValue.length >= 2) setIsOpen(true);
                    }}
                />
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && inputValue.length >= 2 && (
                <Card className="absolute z-50 w-full mt-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                        onClick={() => addTag(pkg)}
                                    >
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span>{pkg}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    No known packages found. Press Enter to add manually.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            )}

            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}
Ð;*cascade082Ofile:///C:/SCOUTNEW/scout_db/frontend/src/components/shared/PackageTagInput.tsx