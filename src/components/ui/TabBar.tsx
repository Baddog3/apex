"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_TABS } from "@/lib/navigation";
import { t } from "@/lib/i18n";

export function TabBar() {
  const pathname = usePathname();
  const strings = t();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <ul className="flex">
        {APP_TABS.map(({ href, key }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  "flex flex-col items-center py-3 text-[10px] uppercase tracking-wider transition-colors",
                  active ? "text-foreground" : "text-muted",
                ].join(" ")}
              >
                {strings.nav[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
