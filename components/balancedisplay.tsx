import { Separator } from "@/components/ui/separator"
import {
    CardDescription,
} from "@/components/ui/card"

export function BalanceDisplay({ ethBalance, stethBalance }) {
    return (
        <>
            <CardDescription>Available to stake</CardDescription>
            <h1 className="font-extrabold leading-tight tracking-tighter text-xl">
                {ethBalance} ETH
            </h1>
            <Separator />
            <CardDescription>Staked amount</CardDescription>
            <h1 className="font-extrabold leading-tight tracking-tighter text-xl">
                {stethBalance} stETH
            </h1>
            <Separator />
        </>
    )
}