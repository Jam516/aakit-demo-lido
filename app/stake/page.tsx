"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useBalance } from "wagmi";
import { useState, useEffect } from 'react';
import { Hash, parseUnits } from 'viem'
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

type UOStatus =
  | "Submit"
  | "Requesting"
  | "Bundling"
  | "Retrying"
  | "Received"
  | "Error Bundling";

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
  // Define your state variables and their setters
  const [address, setAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [uotxHash, setUOTxhash] = useState<Hash>();
  const [uoStatus, setUOStatus] = useState<UOStatus>("Submit");

  // Access UserContext values and external hooks
  const { user, alchemyProvider, isInitialized } = useUser();
  const { toast } = useToast()
  const { data: ethData } = useBalance({
    address: address as `0x${string}` | undefined,
    watch: true,
  });
  const { data: stethData } = useBalance({
    address: address as `0x${string}` | undefined,
    token: '0xbf52359044670050842df67da8183d7d278477f5',
    watch: true,
  });

  // Format data
  const ethBalance = parseFloat(ethData?.formatted || "0")?.toFixed(3);
  const stethBalance = parseFloat(stethData?.formatted || "0")?.toFixed(3);

  // Define utility functions
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const isNotNumber = isNaN(Number(inputValue));

  // Fetch and set the user's address
  useEffect(() => {
    const fetchAddress = async () => {
      if (user && alchemyProvider && isInitialized) {
        const fetchedAddress = await alchemyProvider.getAddress();
        setAddress(fetchedAddress);
      }
    };
    fetchAddress();
  }, [user, alchemyProvider, isInitialized]);

  // Define the main function to handle the stake action
  async function handleClick() {
    if (!alchemyProvider) {
      console.error("AlchemyProvider is not initialized");
      return;
    }

    let uohash;
    let uorequest;
    setUOStatus("Requesting");
    try {
      ({ hash: uohash, request: uorequest } = await alchemyProvider.sendUserOperation({
        target: '0xbf52359044670050842df67da8183d7d278477f5',
        data: "0x",
        value: parseUnits(inputValue, 18),
      }));
    } catch (error) {
      // Handle any errors that occur during the user operation request
      console.error('Error sending user operation:', error);
      setUOStatus("Error Bundling");
      toast({
        variant: "destructive",
        title: "Error sending user operation",
      });
      setTimeout(() => setUOStatus("Submit"), 5000);
      return;
    }

    setUOStatus("Bundling");
    let txHash;
    let replacedhash;
    try {
      txHash = await alchemyProvider.waitForUserOperationTransaction(uohash);
    } catch (error) {
      console.error('Error bundling user operation:', error);
      setUOStatus("Retrying");
      try {
        ({ hash: replacedhash } = await alchemyProvider.dropAndReplaceUserOperation(uorequest));
        txHash = await alchemyProvider.waitForUserOperationTransaction(replacedhash);
      } catch (retryError) {
        console.error('Error during retry:', retryError);
        setUOStatus("Error Bundling");
        toast({
          variant: "destructive",
          title: "Error bundling user operation",
        });
        setTimeout(() => setUOStatus("Submit"), 5000);
        return;
      }
    }

    setUOTxhash(txHash);
    setUOStatus("Received");
    toast({
      title: "Transaction Successful!"
    });
    console.log("Txn Hash:", txHash);
    setTimeout(() => {
      setUOStatus("Submit");
    }, 5000);

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
              uoStatus !== "Submit" ||
              Number(inputValue) >= Number(ethBalance)
            }>
            {uoStatus}
            {(uoStatus === "Requesting" || uoStatus === "Bundling") && (
              <span className="loading loading-spinner loading-md"></span>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        {Number(inputValue) > Number(ethBalance) && (
          <div className="text-foreground/70">You dont have enough ETH...</div>
        )}
        {uotxHash && (
          <div className="text-center">
            <a
              href={`https://sepolia.etherscan.io/tx/${uotxHash}`}
              className="btn text-blue-700 underline"
            >
              Your Txn Details
            </a>
          </div>
        )}
      </CardFooter>
    </Card >
  );
}


export default function StakePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-3 ">
      <TitleBlock />
      <StakeBlock />
    </div>
  )
}
