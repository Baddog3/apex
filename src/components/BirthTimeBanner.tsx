import Link from "next/link";

import { t } from "@/lib/i18n";

export function BirthTimeBanner() {
  const strings = t();

  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-widest">
          {strings.birthTime.bannerTitle}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {strings.birthTime.bannerDescription}
        </p>
      </div>
      <Link
        href="/profile/birth-time"
        className="text-xs uppercase tracking-widest text-foreground underline underline-offset-4 transition-colors hover:text-muted"
      >
        {strings.birthTime.bannerAction}
      </Link>
    </div>
  );
}
