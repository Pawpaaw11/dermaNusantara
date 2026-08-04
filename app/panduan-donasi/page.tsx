import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Panduan Donasi",
  description: "Panduan langkah demi langkah berdonasi melalui Derma Nusantara, mulai dari memilih program hingga verifikasi pembayaran.",
  alternates: { canonical: "/panduan-donasi" },
};

const sections: LegalSection[] = [
  { title: "Pilih program", paragraphs: ["Buka halaman utama dan pilih program yang ingin Anda dukung. Baca tujuan, cerita program, perkembangan dana, dan informasi pendukung sebelum melanjutkan."] },
  { title: "Buka formulir donasi", paragraphs: ["Tekan tombol Donasi pada program. Di perangkat mobile, tombol Donasi Sekarang akan membantu menggulir langsung menuju formulir."] },
  { title: "Tentukan kontribusi", paragraphs: ["Pilih nominal yang tersedia atau masukkan nominal lain sesuai batas minimum. Untuk program berbasis barang atau paket, pilih jumlah unit yang ingin didonasikan."] },
  { title: "Isi informasi donatur", items: ["Masukkan nama dan nomor WhatsApp aktif agar informasi transaksi dapat disampaikan.", "Aktifkan pilihan Sembunyikan nama saya jika ingin tampil sebagai Hamba Allah.", "Tambahkan doa atau pesan dukungan secara opsional."] },
  { title: "Pilih metode pembayaran", paragraphs: ["Pilih metode pembayaran yang tersedia untuk program tersebut. Periksa kembali nominal dan informasi donatur sebelum melanjutkan."] },
  { title: "Periksa ringkasan", paragraphs: ["Sistem menampilkan ringkasan program, nominal atau jumlah, metode pembayaran, dan nama yang akan ditampilkan. Tekan Lanjutkan jika seluruh informasi sudah benar."] },
  { title: "Simpan invoice dan lakukan pembayaran", paragraphs: ["Setelah invoice dibuat, ikuti instruksi pembayaran yang tampil. Gunakan nomor invoice sebagai referensi dan bayar sesuai jumlah yang tercantum agar verifikasi dapat dilakukan dengan tepat."] },
  { title: "Tunggu verifikasi", paragraphs: ["Status pembayaran akan diperbarui setelah transaksi diperiksa. Simpan nomor atau tautan invoice untuk memeriksa status dan jangan membuat pembayaran ulang apabila transaksi masih dalam proses."] },
  { title: "Ikuti perkembangan program", paragraphs: ["Perkembangan pelaksanaan dan laporan penyaluran dipublikasikan secara berkala melalui halaman Berita Derma Nusantara."] },
  { title: "Butuh bantuan?", paragraphs: ["Jika invoice tidak muncul, pembayaran belum terverifikasi, atau terdapat kesalahan data, hubungi 081357035751 melalui telepon/WhatsApp atau kirim email ke Quantumspirit.edu@gmail.com. Sertakan nomor invoice dan bukti pendukung tanpa membagikan PIN atau kode rahasia perbankan."] },
];

export default function DonationGuidePage() {
  return <LegalPage title="Panduan Donasi" description="Ikuti langkah berikut agar proses donasi dan verifikasi pembayaran berjalan mudah dan aman." sections={sections} />;
}
