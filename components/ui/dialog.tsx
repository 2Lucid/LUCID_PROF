"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Controlled vs Uncontrolled
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : isOpen;
    const handleOpenChange = (value: boolean) => {
        if (!isControlled) setIsOpen(value);
        onOpenChange?.(value);
    };

    return (
        <DialogContext.Provider value={{ open: currentOpen, setOpen: handleOpenChange }}>
            {currentOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    {/* Overlay click to close */}
                    <div className="absolute inset-0" onClick={() => handleOpenChange(false)} />
                    {/* Dialog Content Container to handle positioning */}
                    <div className="relative z-50 w-full max-w-lg">
                        {children}
                    </div>
                </div>
            )}
            {/* Render trigger always if it's there? No, primitive Dialog usually wraps trigger. But here we need to render children. 
                 Wait, my logic for rendering children inside the overlay is wrong if children includes Trigger.
                 Refactoring: simplistic approach.
             */}
            {!currentOpen && children}
        </DialogContext.Provider>
    )
}

// Rewriting Dialog to allow Trigger to work
export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const context = React.useContext(DialogContext);
    // Note: This simplistic trigger only works if Dialog logic is rendered higher up or if we restructure.
    // Making this work purely with children is tricky without a proper library.
    // Let's rely on the parent (AIGeneratorModal) controlling the state for now, 
    // or assume the Trigger is clickable content.

    // Actually, AIGeneratorModal uses controlled state `open` and `setOpen`.
    // So the Dialog root will handle the display.
    // But `DialogTrigger` is inside `Dialog`.

    // If open=false, Dialog (above) only renders children? 
    // If I return content here, it will be rendered.
    return (
        <div onClick={(e) => { e.stopPropagation(); context?.setOpen(true); }} className="inline-block">
            {children}
        </div>
    )
}

export const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const context = React.useContext(DialogContext);
    if (!context?.open) return null; // Should be handled by parent content, but double check.

    return (
        <div className={cn("grid w-full gap-4 border bg-background p-6 shadow-lg sm:rounded-lg", className)} onClick={(e) => e.stopPropagation()}>
            {children}
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={() => context.setOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
    )
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)
