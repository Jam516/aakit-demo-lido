import React, { createContext, useContext, useEffect, useState } from "react"
import { useWeb3 } from "./Web3Context"
import { magicSigner } from "@/app/magic"
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { sepolia } from "viem/chains";
import {
    LightSmartContractAccount,
    getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";

// Define the type for the user context.
type UserContextType = {
    user: string | null
    alchemyProvider?: AlchemyProvider;
    isInitialized: boolean;
}

// Create a context for user data.
const UserContext = createContext<UserContextType>({
    user: null,
    alchemyProvider: undefined,
    isInitialized: false,
})

// Custom hook for accessing user context data.
export const useUser = () => useContext(UserContext)

// Provider component that wraps parts of the app that need user context.
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    // Use the web3 context.
    const { web3 } = useWeb3()

    // Initialize user state to hold user's account information.
    const [user, setUser] = useState<string | null>(null);
    // Initialize alchemyProvider state to hold the alchemyProvider instance.
    const [alchemyProvider, setAlchemyProvider] = useState<AlchemyProvider | undefined>(undefined);
    // Initialize isInitialized state to track whether the alchemyProvider is initialized.
    const [isInitialized, setIsInitialized] = useState<boolean>(false);


    // Function to retrieve and set user's account.
    const fetchUserAccount = async () => {
        // Use Web3 to get user's accounts.
        const accounts = await web3?.eth.getAccounts()

        // Update the user state with the first account (if available), otherwise set to null.
        setUser(accounts ? accounts[0] : null)
    }

    const initializeAlchemyProvider = async () => {
        const chain = sepolia;

        const alchemyKey: string = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "demo";

        const owner = await magicSigner();
        // Just doing this so I can call this in the useEffect below
        if (!(await owner.getAddress().catch(() => null))) {
            return;
        }
        const provider = new AlchemyProvider({
            apiKey: alchemyKey,
            chain,
            entryPointAddress: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        }).connect(
            (rpcClient) =>
                new LightSmartContractAccount({
                    entryPointAddress: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
                    chain: rpcClient.chain,
                    owner,
                    factoryAddress: getDefaultLightAccountFactory(chain),
                    rpcClient,
                }),
        );

        setAlchemyProvider(provider);
        setIsInitialized(true);
    };

    // Run fetchUserAccount function whenever the web3 instance changes.
    useEffect(() => {
        fetchUserAccount()
        initializeAlchemyProvider();
    }, [web3])

    // If the user logs out, set the isInitialized state to false.
    useEffect(() => {
        if (!user) {
            setIsInitialized(false);
        }
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                user,
                alchemyProvider,
                isInitialized,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}