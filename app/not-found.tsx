import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="glass-panel relative w-full max-w-lg rounded-[32px] p-10">
        <span className="absolute -top-5 right-8 -rotate-6 rounded-2xl border-[3px] border-fg bg-org px-4 py-1.5 text-lg font-black text-on">Rejected by QA</span>
        <p className="text-7xl font-black tracking-[-0.05em]">404</p>
        <p className="mt-4 text-xl leading-relaxed">There&apos;s no page at this address. Check the link, or go back to the home page.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-fg px-6 py-3.5 font-semibold text-surface">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
