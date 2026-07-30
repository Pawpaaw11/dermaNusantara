"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminBrand } from "@/components/admin/AdminBrand";
import { authApi } from "@/lib/admin-api/auth";
import { AdminApiError } from "@/lib/admin-api/client";

const schema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});
type Values = z.infer<typeof schema>;

export default function AdminLoginPage() {
  return <Suspense fallback={<main className="min-h-screen animate-pulse bg-surface motion-reduce:animate-none" role="status"><span className="sr-only">Memuat halaman login</span></main>}><AdminLoginContent /></Suspense>;
}

function AdminLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: Values) {
    setApiError("");
    try {
      await authApi.login(values);
      const requested = params.get("returnTo");
      const target =
        requested?.startsWith("/admin") && !requested.startsWith("//")
          ? requested
          : "/admin";
      router.replace(target);
      router.refresh();
    } catch (error) {
      setApiError(
        error instanceof AdminApiError
          ? error.message
          : "Login belum dapat diproses.",
      );
    }
  }

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-primary p-14 text-white lg:flex lg:flex-col">
        <div className="absolute -right-28 -top-32 size-[30rem] rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-[#217DA2]/30 blur-3xl" />
        <div className="relative z-10 [&_p]:text-white/50">
          <AdminBrand />
        </div>
        <div className="relative z-10 my-auto max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            Amanah dalam setiap langkah
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight">
            Kelola kebaikan dengan data yang jelas dan terpercaya.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">
            Pusat operasional program, verifikasi donasi, dan transparansi
            Derma Nusantara.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/35">
          © 2026 Derma Nusantara. Akses khusus pengelola.
        </p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center lg:hidden [&_a]:rounded-2xl [&_a]:bg-primary [&_a]:px-5 [&_a]:py-4 [&_p]:text-white/50">
            <AdminBrand />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-secondary">
            Selamat datang kembali
          </p>
          <h2 className="mt-3 font-headline-md text-3xl text-primary">
            Masuk ke Admin Panel
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Gunakan akun admin Derma Nusantara.
          </p>

          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(submit)}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-on-surface">Email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input className="w-full rounded-xl border-outline-variant bg-white py-3.5 pl-11 pr-4 focus:border-primary focus:ring-primary" placeholder="admin@dermanusantara.id" type="email" {...form.register("email")} />
              </div>
              <span className="mt-1 block text-xs text-error">{form.formState.errors.email?.message}</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-on-surface">Password</span>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input className="w-full rounded-xl border-outline-variant bg-white py-3.5 pl-11 pr-12 focus:border-primary focus:ring-primary" placeholder="Masukkan password" type={showPassword ? "text" : "password"} {...form.register("password")} />
                <button aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary" onClick={() => setShowPassword((v) => !v)} type="button">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className="mt-1 block text-xs text-error">{form.formState.errors.password?.message}</span>
            </label>
            {apiError ? <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">{apiError}</div> : null}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition-colors hover:bg-primary-container disabled:cursor-wait disabled:bg-outline" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin motion-reduce:animate-none" size={18} /> : null}
              {form.formState.isSubmitting ? "Memeriksa akun..." : "Masuk ke Admin Panel"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-on-surface-variant">
            Area ini dilindungi. Aktivitas admin tercatat dalam audit log.
          </p>
        </div>
      </section>
    </main>
  );
}
