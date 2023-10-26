"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import { LidoLogo } from "@/components/lidologo"
import ConnectButton from "@/components/connectbutton"
import DisconnectButton from "@/components/disconnectbutton"
import { Web3Provider } from "@/lib/Web3Context"
import { MainMenu } from "@/components/mainmenu"
import { UserProvider, useUser } from "@/lib/UserContext"
import { Toaster } from "@/components/ui/toaster"
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { configureChains } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const inter = Inter({ subsets: ['latin'] })

const alchemyId = process.env.ALCHEMY_API_KEY;

const { chains, publicClient } = configureChains(
  [sepolia],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "demo" }), publicProvider()],
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})

function SiteHeader() {
  // Use the UserContext to get the current logged-in user
  const { user } = useUser()

  return (
    <div className="flex w-full justify-between px-3 pt-3">
      <LidoLogo />
      {!user ? (
        <ConnectButton />
      ) : (
        <>
          <DisconnectButton />
        </>
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="offline-plugin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512x512.png"></link>
      </head>
      <Web3Provider>
        <UserProvider>
          <WagmiConfig config={config}>
            <body className={inter.className}>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  <SiteHeader />
                  {children}
                </div>
                <MainMenu />
                <Toaster />
              </div>
            </body>
          </WagmiConfig>
        </UserProvider>
      </Web3Provider>
    </html>
  )
}
