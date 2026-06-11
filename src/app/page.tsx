import Link from "next/link";

import { Button } from "@/components/ui";
import { t } from "@/lib/i18n";

export default function Home() {
  const strings = t();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted">{strings.app.name}</p>
        <h1 className="mt-3 text-3xl font-medium uppercase tracking-widest">
          {strings.app.tagline}
        </h1>
      </div>
      <Link href="/login">
        <Button>{strings.auth.loginTitle}</Button>
      </Link>
    </main>
  );
}
