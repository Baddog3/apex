"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { TabBar } from "./TabBar";

const tabs = [
  { href: "/today", key: "today" as const },
  { href: "/chart", key: "chart" as const },
  { href: "/compatibility", key: "compatibility" as const },
  { href: "/chat", key: "chat" as const },
  { href: "/profile", key: "profile" as const },
];

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const pathname = usePathname();
  const strings = t();

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      {showNav && (
        <aside className="hidden w-48 shrink-0 border-r border-border md:flex md:flex-col">
          <div className="border-b border-border px-6 py-8">
            <span className="text-sm font-medium uppercase tracking-widest">
              {strings.app.name}
            </span>
          </div>
          <nav className="flex flex-col">
            {tabs.map(({ href, key }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "border-l-2 px-6 py-4 text-xs uppercase tracking-widest transition-colors",
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {strings.nav[key]}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="flex flex-1 flex-col">
        <main className={["flex flex-1 flex-col", showNav ? "pb-16 md:pb-0" : ""].join(" ")}>
          {children}
        </main>
        {showNav && <TabBar />}
      </div>
    </div>
  );
}
