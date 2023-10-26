"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useBalance } from "wagmi";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from 'react';
import { parseUnits } from 'viem'
import { useWeb3 } from "@/lib/Web3Context";
import { useUser } from "@/lib/UserContext";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
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
    FormDescription,
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

const TransferSchema = z.object({
    token: z.string(),
    address: z.string().length(42),
    amount: z.coerce.number().min(0),
});

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
    // Use the UserContext to get the alchemyProvider and isInitialized state
    const { user, alchemyProvider, isInitialized } = useUser();
    const { toast } = useToast()

    const form = useForm<z.infer<typeof TransferSchema>>({
        resolver: zodResolver(TransferSchema),
        defaultValues: {
            token: "",
            address: "",
            amount: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof TransferSchema>) {
        // Send a user operation from your smart contract account
        if (values.token == 'ETH') {
            try {
                const { hash } = await alchemyProvider.sendUserOperation({
                    target: values.address,
                    data: "0x",
                    value: parseUnits(values.amount.toString(), 18),
                });
                console.log('ETH send')
                console.log(values)

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
        else if (values.token == 'stETH') {
            try {
                const { hash } = await alchemyProvider.sendUserOperation(
                    {
                        target: "0xbf52359044670050842df67da8183d7d278477f5",
                        data: encodeFunctionData({
                            abi: stethConfig.abi,
                            functionName: 'transfer',
                            args: [values.address, parseUnits(values.amount.toString(), 18)]
                        }),
                    });
                console.log('stETH send')
                console.log(values)

                toast({
                    title: "UserOp Submitted!",
                    description: `Hash: ${hash}`
                });
                console.log("UserOp Hash:", hash);

            } catch (error) {
                console.error("Error sending user operation:", error);

                toast({
                    variant: "destructive",
                    title: "Error sending user operation:",
                });
            }
        } else {
            console.log('select a token')
        }
    }

    return (
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
                <Button type="submit" className="w-full" disabled={!user}>Send</Button>
            </form>
        </Form>
    );
}


export default function Home() {
    return (
        <div className="flex flex-col items-center gap-6 py-3 ">
            <TitleBlock />
            <WithdrawBlock />
        </div>
    )
}

