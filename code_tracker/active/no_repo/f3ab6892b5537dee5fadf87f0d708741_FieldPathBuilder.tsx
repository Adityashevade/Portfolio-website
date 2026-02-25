•.
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldPathBuilderProps = {
    value: string;
    onChange: (value: string) => void;
};

const TOP_LEVEL_FIELDS = [
    { value: "custom", label: "-- Select / Custom --" },
    { value: "severity", label: "Severity" },
    { value: "affected", label: "Affected Packages" },
    { value: "summary", label: "Summary" },
    { value: "details", label: "Details" },
    { value: "references", label: "References" },
];

export function FieldPathBuilder({ value, onChange }: FieldPathBuilderProps) {
    const [mode, setMode] = useState("custom");
    const [topLevel, setTopLevel] = useState("custom");
    const [subField, setSubField] = useState("");

    // Affected specific state
    const [ecosystem, setEcosystem] = useState("");
    const [pkg, setPkg] = useState("");
    const [affectedField, setAffectedField] = useState("");

    // Initialize logic could be added here to parse existing values

    useEffect(() => {
        if (mode === "custom") return;

        let newValue = "";
        if (mode === "simple" && topLevel && topLevel !== "custom") {
            newValue = subField ? `${topLevel}.${subField}` : topLevel;
        } else if (mode === "affected") {
            if (ecosystem || pkg) {
                // partial construction allowed
                newValue = `affected` + (ecosystem || pkg ? `[ecosystem=${ecosystem},package=${pkg}]` : "");
                if (affectedField) newValue += `.${affectedField}`;
            } else {
                newValue = "affected";
            }
        }

        // Avoid infinite loop if value matches
        if (newValue && newValue !== value) {
            onChange(newValue);
        }
    }, [mode, topLevel, subField, ecosystem, pkg, affectedField]);

    const handleTopLevelChange = (val: string) => {
        setTopLevel(val);
        if (val === "affected") {
            setMode("affected");
        } else if (val === "custom") {
            setMode("custom");
        } else {
            setMode("simple");
            setSubField("");
            // Default subfields
            if (val === "severity") setSubField("cvss_v3_score");
        }
    };

    return (
        <div className="space-y-2 border p-3 rounded-md bg-muted/20">
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Field Path Builder</Label>
                <div className="flex gap-2">
                    <div className="w-[180px]">
                        <Select value={topLevel} onValueChange={handleTopLevelChange}>
                            <SelectTrigger><SelectValue placeholder="Field Type" /></SelectTrigger>
                            <SelectContent>
                                {TOP_LEVEL_FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === "custom" && (
                        <Input
                            placeholder="Manually enter path..."
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className="flex-1"
                        />
                    )}

                    {mode === "simple" && (
                        <Input
                            placeholder="sub_field"
                            value={subField}
                            onChange={e => setSubField(e.target.value)}
                            className="flex-1"
                        />
                    )}
                </div>
            </div>

            {mode === "affected" && (
                <div className="space-y-2 mt-2 p-2 bg-background rounded border">
                    <Label className="text-xs font-semibold">Target Package</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">Ecosystem</Label>
                            <Input placeholder="npm" value={ecosystem} onChange={e => setEcosystem(e.target.value)} className="h-8" />
                        </div>
                        <div>
                            <Label className="text-xs">Package Name</Label>
                            <Input placeholder="package-name" value={pkg} onChange={e => setPkg(e.target.value)} className="h-8" />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Property to Override</Label>
                        <Select value={affectedField} onValueChange={setAffectedField}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="Select property" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">fixed (Fixed Version)</SelectItem>
                                <SelectItem value="versions">versions (Affected Versions)</SelectItem>
                                <SelectItem value="ranges">ranges (Version Ranges)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                        Preview: {`affected[ecosystem=${ecosystem},package=${pkg}].${affectedField || "..."}`}
                    </div>
                </div>
            )}
        </div>
    );
}
•.*cascade082Pfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/FieldPathBuilder.tsx