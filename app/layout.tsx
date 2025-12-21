import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "500", "700", "900"],
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "بستان الأذكار",
  description: "تطبيق لتعليم الأذكار للأطفال",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${amiri.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
