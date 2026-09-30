export interface Project {
  id: string;
  title: { en: string; fr: string; ar: string };
  slug: string;
  category: string;
  location: { en: string; fr: string; ar: string };
  year: number;
  description: { en: string; fr: string; ar: string };
  services: string[];
  coverImage: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  featured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: { en: string; fr: string; ar: string };
  slug: string;
  description?: { en: string; fr: string; ar: string };
}

export interface ServiceItem {
  id: string;
  name: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  icon: string;
  startingPrice?: number;
  unit?: string;
}

export interface Price {
  id: string;
  service: { en: string; fr: string; ar: string };
  category: string;
  description: { en: string; fr: string; ar: string };
  unit: { en: string; fr: string; ar: string };
  priceFrom: number;
  priceTo?: number;
  currency: string;
  notes?: { en: string; fr: string; ar: string };
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  project?: string;
  review: string;
  rating?: number;
  date?: string;
  photo?: string;
  isPlaceholder: boolean;
}

export interface ContactRequest {
  id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  projectType: "residential" | "commercial" | "other";
  serviceRequired: string;
  approximateArea?: string;
  budget?: string;
  preferredDate?: string;
  description: string;
  photos?: string[];
  documents?: string[];
  createdAt?: string;
}

export type Language = "en" | "fr" | "ar";

export type Theme = "light" | "dark";
