import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex min-w-0 items-center gap-3" href="/admin">
      <svg
        aria-hidden
        className="h-10 w-9 shrink-0"
        fill="none"
        viewBox="0 0 138 150"
      >
        <path
          d="M64 0C80 12 90 27 89 42c0 20-18 32-31 46-15 16-23 32-16 58-24-9-41-31-41-58 0-17 6-32 16-44 16 8 26 23 28 41 8-8 18-14 25-23 13-17 9-35-6-49V0Z"
          fill="#3FA18C"
        />
        <path
          d="M132 71c-11 2-13 12-18 25-6 16-17 26-31 25-9-1-15-5-12-11 5-9 18-10 23-20 2-4 1-8-2-11-9 8-16 11-26 15-17 7-28 17-27 37 0 6 1 11 4 15 31 10 61-6 75-31 7-13 10-27 14-44Z"
          fill="#217DA2"
        />
        <circle cx="105" cy="55" r="11" fill="#D4AF37" />
      </svg>
      <div
        className={cn(
          "min-w-0 transition-opacity",
          compact && "pointer-events-none opacity-0",
        )}
      >
        <div className="whitespace-nowrap text-[1rem] font-extrabold uppercase leading-none">
          <span className="text-[#65D0B6]">Derma</span>{" "}
          <span className="text-[#69B9DB]">Nusantara</span>
        </div>
        <p className="mt-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Admin Panel
        </p>
      </div>
    </Link>
  );
}
