import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan situs dan layanan donasi Derma Nusantara.",
  alternates: { canonical: "/syarat-ketentuan" },
};

// Teks praktis untuk peluncuran; tinjau bersama penasihat hukum sebelum dijadikan dokumen hukum final.
const sections: LegalSection[] = [
  { title: "Persetujuan penggunaan", paragraphs: ["Dengan menggunakan situs atau membuat donasi, Anda menyatakan telah membaca dan menyetujui ketentuan ini. Jika tidak menyetujuinya, mohon tidak melanjutkan penggunaan layanan."] },
  { title: "Kelayakan dan informasi pengguna", paragraphs: ["Pengguna harus memiliki kewenangan untuk melakukan transaksi dan memberikan informasi yang benar. Pengguna bertanggung jawab atas ketepatan nama, nomor WhatsApp, nominal, metode pembayaran, serta informasi lain yang dikirimkan."] },
  { title: "Proses donasi", items: ["Donasi dibuat untuk program yang dipilih dengan nominal atau jumlah kontribusi yang ditentukan pengguna.", "Invoice dan instruksi pembayaran diterbitkan setelah formulir berhasil dikirim.", "Status donasi baru dinyatakan lunas setelah pembayaran diterima dan diverifikasi.", "Kesalahan nominal, nomor invoice, atau metode pembayaran dapat memperlambat proses verifikasi."] },
  { title: "Anonimitas dan pesan publik", paragraphs: ["Pengguna dapat memilih agar nama ditampilkan sebagai anonim. Doa atau pesan hanya boleh berisi konten yang pantas dan tidak melanggar hak pihak lain. Derma Nusantara dapat menyembunyikan atau menghapus pesan yang melanggar ketentuan."] },
  { title: "Pembatalan dan pengembalian dana", paragraphs: ["Donasi yang telah diterima dan diverifikasi pada prinsipnya dialokasikan untuk program terkait. Permintaan akibat transaksi ganda, kesalahan pembayaran, atau kondisi khusus dapat diajukan melalui kontak resmi dan akan ditinjau berdasarkan bukti transaksi, status penyaluran, dan ketentuan yang berlaku. Pengajuan tidak otomatis menjamin pengembalian dana."] },
  { title: "Program dan pelaporan", paragraphs: ["Informasi target, perkembangan, serta penyaluran program akan diperbarui secara berkala sesuai data yang tersedia. Perubahan pelaksanaan dapat terjadi karena kondisi lapangan, kebutuhan penerima manfaat, atau keadaan di luar kendali yang wajar."] },
  { title: "Larangan penyalahgunaan", items: ["Mengirim data palsu, melakukan percobaan akses tanpa izin, mengganggu sistem, atau menggunakan layanan untuk kegiatan melanggar hukum.", "Menyalin, memanipulasi, atau menggunakan konten dan identitas Derma Nusantara secara menyesatkan.", "Mengirim pesan yang mengandung penipuan, kebencian, ancaman, spam, atau pelanggaran hak pihak lain."] },
  { title: "Hak atas konten", paragraphs: ["Nama, logo, desain, tulisan, foto, dan materi situs dimiliki atau digunakan secara sah oleh Derma Nusantara dan mitranya. Penggunaan di luar tujuan pribadi memerlukan izin, kecuali diperbolehkan oleh hukum."] },
  { title: "Batas tanggung jawab", paragraphs: ["Kami berupaya menjaga layanan tetap akurat dan tersedia, tetapi tidak menjamin layanan selalu bebas gangguan. Tanggung jawab akan dilaksanakan secara wajar sesuai ketentuan hukum yang berlaku."] },
  { title: "Perubahan dan hukum yang berlaku", paragraphs: ["Ketentuan dapat diperbarui sesuai perkembangan layanan. Penggunaan layanan dan penyelesaian perselisihan tunduk pada hukum Republik Indonesia."] },
  { title: "Hubungi kami", paragraphs: ["Pertanyaan mengenai ketentuan ini dapat disampaikan melalui Quantumspirit.edu@gmail.com atau 081357035751."] },
];

export default function TermsPage() {
  return <LegalPage title="Syarat & Ketentuan" description="Ketentuan ini mengatur penggunaan situs, proses donasi, dan tanggung jawab pengguna serta Derma Nusantara." sections={sections} />;
}
