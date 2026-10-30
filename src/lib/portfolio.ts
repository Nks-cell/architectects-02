export type ProjectStatus = "Completed" | "Ongoing";

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: number;
  description: string;
  short_description: string;
  status: ProjectStatus;
  image_url: string;
  featured: boolean;
};

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  interest: string;
  message: string;
  created_at: string;
};

export const CATEGORIES = [
  "Residential",
  "Civic",
  "Cultural",
  "Workplace",
  "Education",
] as const;

export const PLATES: { url: string; label: string }[] = [
  { url: "/plates/lumina.jpg", label: "Quay tower" },
  { url: "/plates/skyline.jpg", label: "Ridge houses" },
  { url: "/plates/aether.jpg", label: "Folded shell" },
  { url: "/plates/meridian.jpg", label: "Dye hall" },
  { url: "/plates/solstice.jpg", label: "Dune house" },
  { url: "/plates/harbor.jpg", label: "Civic hall" },
  { url: "/plates/cedar.jpg", label: "Forest school" },
  { url: "/plates/nocturne.jpg", label: "Night museum" },
];

export const INTERESTS = [
  "A new commission",
  "Residential",
  "Civic",
  "Cultural",
  "Workplace",
  "Education",
  "Something else",
] as const;

export function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

export function errText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Something went wrong. Please try again.";
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function mapProject(row: Project): Project {
  const status: ProjectStatus = row.status === "Ongoing" ? "Ongoing" : "Completed";
  return {
    ...row,
    id: Number(row.id),
    year: Number(row.year),
    featured: asBool(row.featured),
    status,
  };
}

