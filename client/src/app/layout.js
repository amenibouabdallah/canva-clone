"use client";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import NextAuthProvider from "@/providers/nextauth-provider";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";
import UserUpsert from "@/components/user-upsert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <UserUpsert />
          {children}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
