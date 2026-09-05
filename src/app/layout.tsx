import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안양공원묘원",
  description: "추억과 그리움이 머무는 자리, 안양공원묘원",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
