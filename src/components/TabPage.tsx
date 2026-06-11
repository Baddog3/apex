interface TabPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function TabPage({ title, description, children }: TabPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-medium uppercase tracking-widest">{title}</h1>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
      {children}
    </div>
  );
}
