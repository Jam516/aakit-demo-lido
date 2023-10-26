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
import { useBalance } from "wagmi";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from 'react';
import { parseUnits } from 'viem'
import { useWeb3 } from "@/lib/Web3Context";
import { useUser } from "@/lib/UserContext";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { useToast } from "@/components/ui/use-toast"

function TitleBlock() {
  return (
    <div className="flex flex-col items-center pt-4">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Stake ETH
      </h1><p className="max-w-[700px] text-lg text-muted-foreground">
        Stake ETH and receive stETH
      </p>
    </div>
  );
}

function StakeBlock() {
  // Use the UserContext to get the alchemyProvider and isInitialized state
  const { user, alchemyProvider, isInitialized } = useUser();
  const [address, setAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the input value state when the input changes
    setInputValue(event.target.value);
  };

  const isNotNumber = isNaN(Number(inputValue));

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

  async function handleClick() {
    try {
      const { hash } = await alchemyProvider.sendUserOperation({
        target: '0xbf52359044670050842df67da8183d7d278477f5',
        data: "0x",
        value: parseUnits(inputValue, 18),
      });

      toast({
        title: "UserOp Submitted!",
        description: `Hash: ${hash}`
      });
      console.log("UserOp Hash:", hash);

    } catch (error) {

      toast({
        variant: "destructive",
        title: "Error sending user operation:",
      });

      console.error("Error sending user operation:", error);
    }
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
        <div>
          Enter the amount of ETH
          <br></br>
          you want to stake
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <Input placeholder="0" value={inputValue}
            onChange={handleInputChange} />
          <Button
            onClick={handleClick}
            className="w-full bg-blue-500	hover:bg-blue-400"
            disabled={
              inputValue === "" ||
              isNotNumber ||
              !user ||
              Number(inputValue) > Number(ethBalance)
            }>
            Submit
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        {Number(inputValue) > Number(ethBalance) && (
          <div className="text-foreground/70">You dont have enough ETH...</div>
        )}
      </CardFooter>
    </Card >
  );
}


export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-3 ">
      <TitleBlock />
      <StakeBlock />
    </div>
  )
}
