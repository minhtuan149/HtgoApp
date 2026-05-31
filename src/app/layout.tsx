import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatDev | Hand-Drawn App Showcase Portfolio",
  description: "A creative, modern landing page designed in a colorful hand-drawn pencil sketch wireframe style showcasing digital products.",
  keywords: ["sketchbook", "portfolio", "hand-drawn wireframe", "NextJS", "creative landing page"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="notebook-paper">
        <main className="page-frame">
          {children}
        </main>
      </body>
    </html>
  );
}
