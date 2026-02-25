—import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-out active:scale-95 hover:shadow-lg hover:-translate-y-0.5",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/20",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-destructive/20",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-none hover:translate-y-0",
                link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none hover:translate-y-0",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
Ö *cascade08ÖÜ*cascade08Ü† *cascade08†«*cascade08«Ë *cascade08ËÚ*cascade08Úı *cascade08ıë*cascade08ëí *cascade08í¶*cascade08¶ﬂ	 *cascade08ﬂ	Ö
*cascade08Ö
œ
 *cascade08œ
Å*cascade08Å— *cascade082Bfile:///c:/SCOUTNEW/scout_db/frontend/src/components/ui/button.tsx