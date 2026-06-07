import { Button, Card, Input, Layout } from "@/components/ui";

export default function DesignPage() {
  return (
    <Layout showNav={false}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-12 px-6 py-12">
        <header>
          <h1 className="text-2xl font-medium uppercase tracking-widest">Design System</h1>
          <p className="mt-2 text-sm text-muted">Apex — минимализм Co-Star</p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted">Кнопки</h2>
          <div className="flex flex-col gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted">Поля ввода</h2>
          <Input label="Имя" placeholder="Как тебя зовут?" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="С ошибкой" error="Обязательное поле" />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted">Карточки</h2>
          <Card title="Сегодня">
            <p className="text-sm leading-relaxed">
              Сатурн делает квадрат к твоей Луне. Сегодня не время притворяться, что всё в
              порядке.
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Карточка без заголовка</p>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted">Палитра</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 border border-border p-3">
              <div className="h-8 w-8 bg-background border border-border" />
              <span className="text-xs text-muted">#000 background</span>
            </div>
            <div className="flex items-center gap-3 border border-border p-3">
              <div className="h-8 w-8 bg-foreground" />
              <span className="text-xs text-muted">#fff foreground</span>
            </div>
            <div className="flex items-center gap-3 border border-border p-3">
              <div className="h-8 w-8 bg-muted" />
              <span className="text-xs text-muted">#888 muted</span>
            </div>
            <div className="flex items-center gap-3 border border-border p-3">
              <div className="h-8 w-8 border-2 border-foreground bg-transparent" />
              <span className="text-xs text-muted">accent / border</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted">Типографика</h2>
          <p className="text-3xl font-medium tracking-tight">Geist Sans</p>
          <p className="text-sm text-muted">Geist — геометрический sans-serif от Vercel</p>
          <p className="font-mono text-sm">Geist Mono — для чата и данных</p>
        </section>
      </div>
    </Layout>
  );
}
