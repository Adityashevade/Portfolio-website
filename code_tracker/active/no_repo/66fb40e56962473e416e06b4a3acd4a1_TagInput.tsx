ê
import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    description?: string;
    maxTags?: number;
}

export function TagInput({
    value = [],
    onChange,
    placeholder = "Type and press Enter...",
    description,
    maxTags
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // Remove last tag on backspace if input is empty
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        if (maxTags && value.length >= maxTags) return;

        if (!value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    // Focus input when clicking on container
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all",
                    "min-h-[42px]"
                )}
                onClick={handleContainerClick}
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
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag} // Add tag on blur as well
                />
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}
ê *cascade082Hfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/TagInput.tsx