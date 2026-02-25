÷
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-transparent border-white/10 hover:bg-white/5 data-[state=open]:bg-white/10">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}
 Â
Âû ûÿ*cascade08
ÿ†	 †	ˆ	*cascade08
ˆ	”	 ”	–	*cascade08
–	«	 «	¯	*cascade08
¯	€
 €
„
*cascade08
„
Š
 Š

*cascade08

¯
 ¯
³
*cascade08
³
÷
 2Dfile:///C:/SCOUTNEW/scout_db/frontend/src/components/mode-toggle.tsx