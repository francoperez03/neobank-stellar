"use client";

import {
    CrossmintProvider,
    CrossmintAuthProvider,
    CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

const CROSSMINT_API_KEY = import.meta.env.VITE_CROSSMINT_API_KEY;

if (!CROSSMINT_API_KEY) {
    throw new Error(
        "Missing Crossmint API KEY (.env)"
    );
}

export function CorossmintCustomProvider({children}: {children: React.ReactNode;}) {
    return (
        <CrossmintProvider
            apiKey={CROSSMINT_API_KEY}
        >
            <CrossmintAuthProvider
                loginMethods={["email", "google"]}
            >
                <CrossmintWalletProvider
                    createOnLogin={{
                        chain: "stellar",
                        recovery: { type: "email" },
                    }}
                >
                    {children}
                </CrossmintWalletProvider>
            </CrossmintAuthProvider>
        </CrossmintProvider>
    );
}