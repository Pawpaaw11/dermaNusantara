import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan Derma Nusantara dalam mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi pengguna dan donatur.",
  alternates: { canonical: "/kebijakan-privasi" },
};

// Teks praktis untuk peluncuran; tinjau bersama penasihat hukum sebelum dijadikan dokumen hukum final.
const sections: LegalSection[] = [
  { title: "Ruang lingkup", paragraphs: ["Kebijakan ini menjelaskan cara Derma Nusantara memproses data ketika Anda mengakses situs, memilih program, membuat donasi, memeriksa invoice, atau menghubungi kami."] },
  { title: "Data yang kami kumpulkan", items: ["Nama donatur, nomor WhatsApp, pilihan untuk tampil anonim, serta doa atau pesan yang Anda kirimkan.", "Informasi transaksi seperti program, nominal atau jumlah kontribusi, metode pembayaran, nomor invoice, waktu, dan status verifikasi.", "Data teknis seperlunya, seperti alamat IP, jenis perangkat, browser, log permintaan, dan informasi keamanan sesi.", "Komunikasi yang Anda kirimkan melalui email, telepon, WhatsApp, atau kanal dukungan lainnya."] },
  { title: "Tujuan penggunaan data", items: ["Membuat dan memproses instruksi donasi serta melakukan verifikasi pembayaran.", "Mengirim informasi invoice, status transaksi, dan komunikasi layanan yang relevan.", "Menampilkan nama atau pesan donatur hanya sesuai pilihan yang diberikan; donatur anonim ditampilkan menggunakan label umum.", "Menjaga keamanan layanan, mencegah penyalahgunaan, menyelesaikan kendala, dan memenuhi kewajiban hukum.", "Menyusun informasi program dan laporan secara agregat tanpa membuka data pribadi yang tidak diperlukan."] },
  { title: "Penyimpanan dan keamanan", paragraphs: ["Kami menerapkan pembatasan akses, validasi data, pengamanan sesi, pencatatan aktivitas administratif, dan langkah teknis lain yang wajar. Tidak ada sistem yang sepenuhnya bebas risiko, sehingga pengamanan akan dievaluasi dan ditingkatkan secara berkala."] },
  { title: "Pembagian data", paragraphs: ["Data tidak diperjualbelikan. Data hanya dapat dibagikan secara terbatas kepada penyedia layanan, mitra pembayaran, atau pihak berwenang apabila diperlukan untuk menjalankan layanan, memproses transaksi, menjaga keamanan, atau memenuhi kewajiban hukum."] },
  { title: "Cookies dan log teknis", paragraphs: ["Situs dapat menggunakan cookie atau teknologi serupa untuk menjaga sesi, keamanan, preferensi, serta fungsi layanan. Log teknis digunakan untuk diagnosis, pencegahan penyalahgunaan, dan peningkatan kualitas layanan."] },
  { title: "Retensi data", paragraphs: ["Data disimpan selama masih diperlukan untuk tujuan layanan, pencatatan transaksi, penyelesaian sengketa, keamanan, audit, dan kewajiban hukum. Setelah tidak diperlukan, data akan dihapus, dianonimkan, atau dibatasi pemrosesannya sesuai kemampuan teknis dan ketentuan yang berlaku."] },
  { title: "Hak Anda", paragraphs: ["Anda dapat meminta informasi, koreksi, pembaruan, atau penghapusan data pribadi sesuai ketentuan yang berlaku. Permintaan dapat memerlukan verifikasi identitas dan dapat dibatasi apabila data wajib dipertahankan untuk pencatatan transaksi atau kewajiban hukum."] },
  { title: "Perubahan kebijakan", paragraphs: ["Kebijakan ini dapat diperbarui ketika layanan atau ketentuan yang berlaku berubah. Tanggal pembaruan terbaru akan dicantumkan pada halaman ini."] },
  { title: "Hubungi kami", paragraphs: ["Pertanyaan atau permintaan terkait privasi dapat disampaikan melalui Quantumspirit.edu@gmail.com atau 081357035751."] },
];

export default function PrivacyPolicyPage() {
  return <LegalPage title="Kebijakan Privasi" description="Kami menghargai kepercayaan Anda dan berkomitmen menangani data pribadi secara bertanggung jawab, terbatas, dan transparan." sections={sections} />;
}
