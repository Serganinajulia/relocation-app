import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Onest, Raleway } from "next/font/google";

const raleway = Raleway({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
});

const onest = Onest({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ReloCalc — найди свой город",
  description: "Сервис-калькулятор релокации",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${raleway.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}