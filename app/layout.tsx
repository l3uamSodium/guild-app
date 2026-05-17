import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "⚔️ Guild Management",
    template: "%s | Guild Management",
  },
  description:
    "ระบบจัดการ Guild — ติดตาม Quest, War, คะแนน และสมาชิก ครบวงจร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0F0F14] text-[#E4E4F0] antialiased">
        {children}
      </body>
    </html>
  );
}
