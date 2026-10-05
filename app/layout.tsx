import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { themeInitScript } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PathForge — a coding path built from your actual results",
  description:
    "PathForge turns scattered coding intention into a measurable path: curated lessons, quizzes and challenges, and a plan that adapts when you fall behind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} font-sans bg-canvas text-fg`}>
        {children}
      </body>
    </html>
  );
}
