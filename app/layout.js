import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "FHF Command Center",
  description: "AI Business Command Center for Forged Home Fitness",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-950">
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
