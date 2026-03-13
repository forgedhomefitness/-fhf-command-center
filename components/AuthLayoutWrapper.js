"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  );
}
