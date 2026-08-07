export type PublicTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoUrl?: string | null;
  sortOrder: number;
};

const base = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");

export async function getTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const response = await fetch(`${base}/testimonials`, { cache: "no-store" });
    if (!response.ok) return [];
    const body = await response.json() as { data?: PublicTestimonial[] };
    return Array.isArray(body.data) ? body.data.slice(0, 3) : [];
  } catch {
    return [];
  }
}
