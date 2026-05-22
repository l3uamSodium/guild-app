import type { Metadata } from "next";
import { Cinzel_Decorative, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ONIZUKA | Guild Management",
    template: "%s | ONIZUKA",
  },
  description: "ระบบจัดการ Guild ONIZUKA 鬼塚 — Quest, War, Shop, Lucky Draw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${cinzel.variable} ${notoSansThai.variable} h-full`} suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{
          fontFamily: "var(--font-noto), sans-serif",
          background: "#08080F",
          color: "#E4E4F0",
        }}
      >
        <script dangerouslySetInnerHTML={{ __html: `
          if (!sessionStorage.getItem('hasPlayedIntro')) {
            document.documentElement.classList.add('do-intro-animation');
            sessionStorage.setItem('hasPlayedIntro', 'true');
          }
        `}} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
