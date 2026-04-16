import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/images/IconeBranco.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/images/IconeBranco.png",
    apple: "/images/IconeBranco.png",
  },
  manifest: "/manifest.json",
};

// Root layout — redirects to locale layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
