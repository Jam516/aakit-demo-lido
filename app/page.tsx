"use client"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBalance } from "wagmi";
import { useState, useEffect } from 'react';
import { useUser } from "@/lib/UserContext";
import { Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { BalanceDisplay } from "@/components/balancedisplay";

function TitleBlock() {
    return (
        <div className="flex flex-col items-center pt-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                Deposit Funds
            </h1><p className="max-w-[700px] text-lg text-muted-foreground">
                Deposit ETH and stETH into your account
            </p>
        </div>
    );
}

function DepositBlock() {
    // Define state variables
    const [address, setAddress] = useState<string | null>(null);
    // Access UserContext values and external hooks
    const { user, alchemyProvider, isInitialized } = useUser();
    const { toast } = useToast()

    // Effect hook to fetch and set the user's address
    useEffect(() => {
        const fetchAddress = async () => {
            if (user && alchemyProvider && isInitialized) {
                const fetchedAddress = await alchemyProvider.getAddress();
                setAddress(fetchedAddress);
            }
        };
        fetchAddress();
    }, [user, alchemyProvider, isInitialized]);

    // Function to copy address to clipboard
    function handleClick() {
        navigator.clipboard.writeText(content);
        toast({
            title: "Copied Address!",
        });
    }

    // Hook to fetch ETH balance
    const { data: ethData } = useBalance({
        address: address ?? undefined,
        watch: true,
    });
    const ethBalance = parseFloat(ethData?.formatted || "0")?.toFixed(3);

    // Hook to fetch stETH balance
    const { data: stethData } = useBalance({
        address: address ?? undefined,
        token: '0xbf52359044670050842df67da8183d7d278477f5',
        watch: true,
    });
    const stethBalance = parseFloat(stethData?.formatted || "0")?.toFixed(3);

    // Function to format Ethereum address for display
    function formatContent(content: string) {
        if (content.length <= 10) {
            return content;
        }
        return `${content.substring(0, 5)}...${content.substring(content.length - 5)}`;
    }

    // Determine content of the button based on user's login state and initialization status
    let content: string;
    if (!user) {
        content = "Log in to see your address";
    } else if (!isInitialized) {
        content = "Loading...";
    } else {
        content = address ?? 'address';
    }

    return (
        <Card>
            <CardHeader className="text-center">
                {!user
                    ? <div></div>
                    :
                    <BalanceDisplay ethBalance={ethBalance} stethBalance={stethBalance} />
                }
                <div className="py-2">
                    Copy the Ethereum address to send
                    <br></br>
                    funds to this account
                </div>
            </CardHeader>
            <CardContent>
                <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleClick}
                    disabled={!user}>
                    <Copy className="mr-2 h-4 w-4" />
                    {content.startsWith("0x") ? formatContent(content) : content}
                </Button>
            </CardContent>
        </Card >
    );
}


export default function Home() {
    return (
        <div className="flex flex-col items-center gap-6 py-3 ">
            <TitleBlock />
            <DepositBlock />
        </div>
    )
}
