import "./globals.css";
import AuthLayoutWrapper from "@/components/AuthLayoutWrapper";

export const metadata = {
  title: "FHF Command Center",
  description: "AI Business Command Center for Forged Home Fitness",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-950">
        <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
      </body>
    </html>
  );
}
