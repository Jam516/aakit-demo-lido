"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAccount, useBalance } from "wagmi";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from 'react';
import { parseUnits } from 'viem'
import { useWeb3 } from "@/lib/Web3Context";
import { useUser } from "@/lib/UserContext";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"

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
    // Use the UserContext to get the alchemyProvider and isInitialized state
    const { user, alchemyProvider, isInitialized } = useUser();
    const [address, setAddress] = useState<string | null>(null);

    const { toast } = useToast()

    useEffect(() => {
        const fetchAddress = async () => {
            if (user && alchemyProvider && isInitialized) {
                const fetchedAddress = await alchemyProvider.getAddress();
                setAddress(fetchedAddress);
            }
        };
        fetchAddress();
    }, [user, alchemyProvider, isInitialized]);

    let content: string;
    if (!user) {
        content = "Log in to see your address";
    } else if (!isInitialized) {
        content = "Loading...";
    } else {
        content = address ?? 'address';
    }

    function handleClick() {
        navigator.clipboard.writeText(content);
        toast({
            title: "Copied Address!",
        });
    }

    const {
        data: ethData,
        isError: ethIsError,
        isLoading: ethIsLoading,
    } = useBalance({
        address: address ?? undefined,
        watch: true,
    });

    const ethBalance = parseFloat(ethData?.formatted || "0")?.toFixed(3);

    const {
        data: stethData,
        isError: stethIsError,
        isLoading: stethIsLoading,
    } = useBalance({
        address: address ?? undefined,
        token: '0xbf52359044670050842df67da8183d7d278477f5',
        watch: true,
    });

    const stethBalance = parseFloat(stethData?.formatted || "0")?.toFixed(3);

    function formatContent(content: string) {
        if (content.length <= 10) {
            return content;
        }
        return `${content.substring(0, 5)}...${content.substring(content.length - 5)}`;
    }

    return (
        <Card>
            <CardHeader className="text-center">
                {!user
                    ? <div></div>
                    :
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
                    <Copy className="mr-2 h-4 w-4" /> {formatContent(content)}
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
