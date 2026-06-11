import { t } from "@/lib/i18n";

export function PremiumBadge() {
  const strings = t();

  return (
    <span className="shrink-0 border border-foreground/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
      {strings.premium.badge}
    </span>
  );
}
