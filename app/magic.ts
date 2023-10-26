import { Magic } from "magic-sdk";
import { createWalletClient, custom } from "viem";
import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";

// this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
const MAGIC_API_KEY = process.env.NEXT_PUBLIC_MAGIC_API_KEY ?? "demo";

const createMagic = (key) => {
    // We make sure that the window object is available
    // Then we create a new instance of Magic using a publishable key
    return typeof window !== 'undefined' && new Magic(key);
};

// instantiate Magic SDK instance
export const magic = createMagic(MAGIC_API_KEY);

// a viem wallet client that wraps magic for utility methods
// NOTE: this isn't necessary since you can just use the `magic.rpcProvider`
// directly, but this makes things much easier
export const magicClient = async () => {
    const client = await createWalletClient({
        transport: custom(await magic.wallet.getProvider()),
    });
    return client;
};

// a smart account signer you can use as an owner on ISmartContractAccount
export const magicSigner = async () => {
    const client = await magicClient();
    return new WalletClientSigner(client, "magic");
};