export default function InvoiceLoading() {
  return (
    <main
      aria-busy="true"
      className="min-h-screen bg-surface px-margin-mobile pb-16 md:px-margin-desktop"
      role="status"
    >
      <span className="sr-only">Memuat invoice</span>
      <div aria-hidden className="animate-pulse motion-reduce:animate-none">
        <header className="-mx-margin-mobile border-b border-white/50 px-margin-mobile py-4 md:-mx-margin-desktop md:px-margin-desktop">
          <div className="mx-auto flex max-w-container-max items-center justify-between">
            <div className="h-5 w-24 rounded-full bg-surface-container-high" />
            <div className="h-7 w-44 rounded-full bg-surface-container-high" />
            <div className="flex gap-2"><div className="size-9 rounded-full bg-surface-container-high" /><div className="size-9 rounded-full bg-surface-container-high" /></div>
          </div>
        </header>
        <div className="mx-auto flex max-w-xl flex-col gap-5 py-8 md:py-12">
          <div className="flex items-end justify-between"><div className="space-y-3"><div className="h-3 w-24 rounded bg-surface-container-high" /><div className="h-9 w-52 rounded bg-surface-container-high" /></div><div className="h-9 w-32 rounded-full bg-surface-container-high" /></div>
          <div className="ambient-shadow space-y-7 rounded-2xl bg-white/55 p-5 md:p-7">
            <div className="h-4 w-36 rounded bg-surface-container-high" />
            <div className="grid gap-5 md:grid-cols-2"><div className="space-y-2"><div className="h-3 w-20 rounded bg-surface-container-high" /><div className="h-5 w-48 rounded bg-surface-container-high" /></div><div className="space-y-2"><div className="h-3 w-16 rounded bg-surface-container-high" /><div className="h-5 w-40 rounded bg-surface-container-high" /></div></div>
            <div className="h-px bg-surface-container-high" />
            <div className="flex justify-between gap-5"><div className="space-y-3"><div className="h-3 w-28 rounded bg-surface-container-high" /><div className="h-7 w-48 rounded bg-surface-container-high" /></div><div className="h-9 w-36 rounded bg-surface-container-high" /></div>
          </div>
          <div className="ambient-shadow space-y-5 rounded-2xl bg-white/55 p-5 md:p-7">
            <div className="h-4 w-44 rounded bg-surface-container-high" />
            <div className="h-24 rounded-2xl bg-surface-container-high" />
            <div className="h-64 rounded-2xl bg-primary/20" />
            <div className="space-y-2"><div className="h-4 w-full rounded bg-surface-container-high" /><div className="h-4 w-4/5 rounded bg-surface-container-high" /></div>
          </div>
          <div className="h-14 rounded-full bg-surface-container-high" />
        </div>
      </div>
    </main>
  );
}
