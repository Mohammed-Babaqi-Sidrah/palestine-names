import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أسماء لا تُنسى — From Numbers to Names",
  description:
    "أرشيف تفاعلي لأسماء الشهداء الفلسطينيين. من الأرقام إلى الأسماء — قصة بيانات تحكيها البشرية.",
  keywords: ["فلسطين", "أرشيف", "أسماء", "Palestine", "names", "archive", "data"],
  openGraph: {
    title: "أسماء لا تُنسى",
    description: "لم تكن أرقامًا. كانت أسماء.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
