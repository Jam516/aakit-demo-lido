"use client"

import { useState } from 'react';
import { Hash, parseUnits } from 'viem'
import { useUser } from "@/lib/UserContext";
import { stethConfig } from '@/lib/stethabi'
import { encodeFunctionData } from 'viem'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type UOStatus =
    | "Send"
    | "Requesting"
    | "Bundling"
    | "Received"
    | "Error Bundling";



function TitleBlock() {
    return (
        <div className="flex flex-col items-center pt-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                Withdraw
            </h1><p className="max-w-[700px] text-lg text-center text-muted-foreground">
                Withdraw ETH and receive stETH from your wallet
            </p>
        </div>
    );
}

function WithdrawBlock() {
    // Define your state variables and their setters
    const [uotxHash, setUOTxhash] = useState<Hash>();
    const [uoStatus, setUOStatus] = useState<UOStatus>("Send");

    // Access UserContext values and external hooks
    const { user, alchemyProvider, isInitialized } = useUser();
    const { toast } = useToast()

    // Define your form schema using Zod
    const TransferSchema = z.object({
        token: z.string(),
        address: z.string().length(42),
        amount: z.coerce.number().min(0),
    });

    // Initialize your form
    const form = useForm<z.infer<typeof TransferSchema>>({
        resolver: zodResolver(TransferSchema),
        defaultValues: {
            token: "",
            address: "",
            amount: 0,
        },
    })

    // Define the main function to handle the token send action
    async function onSubmit(values: z.infer<typeof TransferSchema>) {
        if (!alchemyProvider) {
            console.error("AlchemyProvider is not initialized");
            return;
        }

        // Destructure values for easier access and readability
        const { token, address, amount } = values;

        // Early return if the token is not selected
        if (!token) {
            console.log('Please select a token');
            return;
        }

        // Convert the amount to the correct units
        const parsedAmount = parseUnits(amount.toString(), 18);

        // Start the user operation request process
        setUOStatus("Requesting");

        let uohash;
        // Determine the token type and send the user operation accordingly
        try {
            if (token == 'ETH') {
                ({ hash: uohash } = await alchemyProvider.sendUserOperation({
                    target: values.address,
                    data: "0x",
                    value: parseUnits(values.amount.toString(), 18),
                }));

            }
            else if (values.token == 'stETH') {
                setUOStatus("Requesting");
                ({ hash: uohash } = await alchemyProvider.sendUserOperation({
                    target: "0xbf52359044670050842df67da8183d7d278477f5",
                    data: encodeFunctionData({
                        abi: stethConfig.abi,
                        functionName: 'transfer',
                        args: [values.address, parseUnits(values.amount.toString(), 18)]
                    }),
                }));
            }
        } catch (error) {
            // Handle any errors that occur during the user operation request
            console.error('Error sending user operation:', error);
            setUOStatus("Error Bundling");
            toast({
                variant: "destructive",
                title: "Error sending user operation",
            });
            setTimeout(() => setUOStatus("Send"), 5000);
            return;
        }

        // Wait for the user operation transaction to be bundled
        setUOStatus("Bundling");
        let txHash: Hash;
        try {
            txHash = await alchemyProvider.waitForUserOperationTransaction(uohash);
            // Handle the successful transaction
            setUOTxhash(txHash);
            setUOStatus("Received");
            toast({
                title: "Transaction Successful!"
            });
            console.log("Txn Hash:", txHash);
        } catch (error) {
            // Handle any errors that occur while waiting for the transaction
            console.error('Error bundling user operation:', error);
            setUOStatus("Error Bundling");
            setTimeout(() => {
                setUOStatus("Send");
            }, 5000);
            toast({
                variant: "destructive",
                title: "Error bundling user operation",
            });

        } finally {
            // Reset the user operation status after a delay
            setTimeout(() => setUOStatus("Send"), 5000);
        }

    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Token</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a token to send" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ETH">ETH</SelectItem>
                                        <SelectItem value="stETH">stETH</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send to</FormLabel>
                                <FormControl>
                                    <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full"
                        disabled={!user || uoStatus !== "Send"}>
                        {uoStatus}
                    </Button>
                </form>
            </Form>
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
        </>
    );
}


export default function WithdrawPage() {
    return (
        <div className="flex flex-col items-center gap-6 py-3 ">
            <TitleBlock />
            <WithdrawBlock />
        </div>
    )
}

