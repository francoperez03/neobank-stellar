"use client";

import {
    CrossmintProvider,
    CrossmintAuthProvider,
    CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

export function CorossmintCustomProvider({children}: {children: React.ReactNode;}) {
    const apiKey = import.meta.env.VITE_CROSSMINT_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Crossmint API KEY (.env)");
    }

    return (
        <CrossmintProvider
            apiKey={apiKey}
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