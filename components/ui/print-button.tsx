"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => window.print()}
            className="gap-2 text-gray-400 hover:text-white hover:bg-white/10 no-print"
        >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
        </Button>
    )
}
