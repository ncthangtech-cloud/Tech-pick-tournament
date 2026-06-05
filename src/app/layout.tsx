import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vietnam Airlines | Technical Department Pickleball Championship 2026",
  description: "Official score tracking and automatic bracket progression software for the Vietnam Airlines Pickleball Tournament.",
};

export default function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
