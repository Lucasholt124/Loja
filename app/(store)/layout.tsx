import type { Metadata } from "next";
import "../globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/live";
import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import DisableDraftMode from "@/components/DisableDraftMode";
import { ptBR } from '@clerk/localizations';

export const metadata: Metadata = {
  title: "Shopr Next Ecommerce",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic
    localization={ptBR}
    >
      <html lang="pt-BR">
        <body className={`antialiased`}>
          {(await draftMode()).isEnabled && (
            <>
              <DisableDraftMode />
              <VisualEditing />
            </>
          )}
          <main className="">
            <Header />
            {children}
          </main>
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
