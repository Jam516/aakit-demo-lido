import Link from "next/link";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation"


export function MainMenu({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {

    const pathname = usePathname();
    const segments = pathname.split("/")[1];
    return (

        <nav
            className={cn("fixed bottom-0 flex w-full items-center border-t border-gray-400 py-4 bg-white", className)}
            {...props}
        >
            <div className="flex w-1/3 justify-center">
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center space-y-2",
                        segments === "bundlers" ? "text-foreground" : "text-foreground/60"
                    )}
                >
                    <img src="/receive.png" alt="Deposit Icon" className="h-4 w-4" />
                    <span className="text-xs font-medium text-primary">Deposit</span>
                </Link>
            </div>
            <div className="flex w-1/3 justify-center">
                <Link
                    href="/withdraw"
                    className={cn(
                        "flex flex-col items-center space-y-2",
                        segments === "bundlers" ? "text-foreground" : "text-foreground/60"
                    )}
                >
                    <img src="/send.png" alt="Withdraw Icon" className="h-4 w-4" />
                    <span className="text-xs font-medium text-primary">Withdraw</span>
                </Link>
            </div>
            <div className="flex w-1/3 justify-center">
                <Link
                    href="/stake"
                    className={cn(
                        "flex flex-col items-center space-y-2",
                        segments === "overview" ? "text-foreground" : "text-foreground/60"
                    )}
                >
                    <img src="/thunder.png" alt="Stake Icon" className="w-a4 h-4" />
                    <span className="text-xs font-medium text-primary">Stake</span>
                </Link>
            </div>
        </nav>
    )
}
