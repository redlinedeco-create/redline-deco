import type { Project } from "@/types";
import { photoPool, type PhotoFolder } from "./photoPool";

/** A contiguous run of photos from one folder: [folder, startIndex, count]. */
type Slice = readonly [PhotoFolder, from: number, count: number];

/** Expands folder slices into a single flat photo list. */
function photos(...slices: Slice[]): string[] {
  return slices.flatMap(([folder, from, count]) => photoPool[folder].slice(from, from + count));
}

/** First photo becomes the cover, the remainder become the project gallery. */
function pool(...slices: Slice[]): Pick<Project, "coverImage" | "images"> {
  const all = photos(...slices);
  return { coverImage: all[0], images: all.slice(1) };
}

export const projects: Project[] = [
  {
    id: "p1",
    title: {
      en: "Modern Apartment Interior",
      fr: "Intérieur d'appartement moderne",
      ar: "شقة داخلية عصرية",
    },
    slug: "modern-apartment-interior",
    category: "residential",
    location: { en: "Sebdou", fr: "Sebdou", ar: "سبدو" },
    year: 2025,
    description: {
      en: "Full interior renovation of a 3-bedroom apartment including false ceilings, partition walls, interior painting and custom drywall features.",
      fr: "Rénovation intérieure complète d'un appartement 3 chambres avec plafonds suspendus, cloisons, peinture et éléments en placo personnalisés.",
      ar: "ترميم داخلي كامل لشقة مكونة من 3 غرف نوم بما في ذلك الأسقف المعلقة، القواطع، الطلاء الداخلي وتصاميم جبس بورد مخصصة.",
    },
    services: ["drywall", "ceilings", "partitions", "painting", "renovation"],
    ...pool(["dryceiling", 0, 18]),
    featured: true,
    createdAt: "2025-01-15",
  },
  {
    id: "p2",
    title: {
      en: "Commercial Office Space",
      fr: "Bureau commercial",
      ar: "مساحة مكتب تجاري",
    },
    slug: "commercial-office-space",
    category: "commercial",
    location: { en: "Tlemcen", fr: "Tlemcen", ar: "تلمسان" },
    year: 2025,
    description: {
      en: "Fit-out of an open-plan commercial office with glass partition walls, suspended ceiling system and professional painting.",
      fr: "Aménagement d'un bureau commercial open-space avec cloisons vitrées, plafonds suspendus et peinture professionnelle.",
      ar: "تجهيز مساحة مكتب تجارية مفتوحة بقواطع زجاجية وأنظمة أسقف معلقة وطلاء احترافي.",
    },
    services: ["ceilings", "partitions", "painting"],
    ...pool(["dryceiling", 18, 8], ["pvc", 0, 4]),
    featured: true,
    createdAt: "2025-02-10",
  },
  {
    id: "p3",
    title: {
      en: "Luxury Villa Ceilings",
      fr: "Plafonds de villa de luxe",
      ar: "أسقف فيلا فاخرة",
    },
    slug: "luxury-villa-ceilings",
    category: "ceilings",
    location: { en: "Sebdou", fr: "Sebdou", ar: "سبدو" },
    year: 2024,
    description: {
      en: "Custom-designed false ceilings with indirect lighting and decorative cornices for a luxury family villa.",
      fr: "Plafonds suspendus sur-mesure avec éclairage indirect et moulures décoratives pour une villa familiale de luxe.",
      ar: "أسقف معلقة بتصاميم مخصصة بإضاءة غير مباشرة وزخارف جانبية لفيلا عائلية فاخرة.",
    },
    services: ["ceilings", "decorative", "painting"],
    ...pool(["dryceiling", 26, 28], ["led-profile", 0, 6]),
    featured: true,
    createdAt: "2024-11-20",
  },
  {
    id: "p4",
    title: {
      en: "Decorative Accent Wall",
      fr: "Mur d'accent décoratif",
      ar: "جدار زخرفي مميز",
    },
    slug: "decorative-accent-wall",
    category: "decorative",
    location: { en: "Tlemcen", fr: "Tlemcen", ar: "تلمسان" },
    year: 2025,
    description: {
      en: "Custom textured decorative painting and drywall feature wall for a modern living room.",
      fr: "Peinture décorative texturée et mur en placo sur-mesure pour un salon moderne.",
      ar: "طلاء زخرفي ملامس وجدار مميز بالجبس بورد لصالة عصرية.",
    },
    services: ["decorative", "painting", "drywall"],
    ...pool(["decorations", 0, 14]),
    featured: true,
    createdAt: "2025-03-05",
  },
  {
    id: "p5",
    title: {
      en: "Full House Renovation",
      fr: "Rénovation complète maison",
      ar: "ترميم منزل كامل",
    },
    slug: "full-house-renovation",
    category: "renovation",
    location: { en: "Sebdou", fr: "Sebdou", ar: "سبدو" },
    year: 2024,
    description: {
      en: "Complete house renovation including all rooms, wall finishing, ceilings, partitions and interior/exterior painting.",
      fr: "Rénovation complète d'une maison incluant toutes les pièces, finitions des murs, plafonds, cloisons et peinture.",
      ar: "ترميم منزل كامل يشمل جميع الغرف وتشطيب الجدران والأسقف والقواطع والطلاء.",
    },
    services: ["renovation", "painting", "drywall", "ceilings", "wallFinishing"],
    ...pool(["decorations", 14, 16], ["painting", 0, 4]),
    featured: false,
    createdAt: "2024-09-12",
  },
  {
    id: "p6",
    title: {
      en: "Drywall Partition System",
      fr: "Système de cloisons Placo",
      ar: "نظام قواطع الجبس بورد",
    },
    slug: "drywall-partition-system",
    category: "partitions",
    location: { en: "Tlemcen", fr: "Tlemcen", ar: "تلمسان" },
    year: 2025,
    description: {
      en: "Installation of drywall partition walls to create a new multi-room layout in a large open space.",
      fr: "Installation de cloisons en placo pour créer un nouveau multi-pièces dans un grand espace ouvert.",
      ar: "تركيب قواطع جبس بورد لإنشاء تخطيط جديد متعدد الغرف في مساحة مفتوحة كبيرة.",
    },
    services: ["partitions", "drywall", "wallFinishing"],
    ...pool(["drywalls", 0, 5], ["pvc", 4, 12]),
    featured: false,
    createdAt: "2025-01-28",
  },
  {
    id: "p7",
    title: {
      en: "Apartment Interior Painting",
      fr: "Peinture intérieure appartement",
      ar: "طلاء داخلي لشقة",
    },
    slug: "apartment-interior-painting",
    category: "painting",
    location: { en: "Sebdou", fr: "Sebdou", ar: "سبدو" },
    year: 2025,
    description: {
      en: "Professional interior painting for a 4-room apartment with premium paint finish.",
      fr: "Peinture intérieure professionnelle pour un appartement 4 pièces avec finition haut de gamme.",
      ar: "طلاء داخلي احترافي لشقة مكونة من 4 غرف بدهانات فاخرة.",
    },
    services: ["painting", "wallFinishing"],
    ...pool(["painting", 4, 21]),
    featured: false,
    createdAt: "2025-02-22",
  },
  {
    id: "p8",
    title: {
      en: "Custom Drywall TV Feature",
      fr: "Mur TV en Placo sur-mesure",
      ar: "جدار تلفزيون جبس بورد مخصص",
    },
    slug: "custom-drywall-tv-feature",
    category: "drywall",
    location: { en: "Tlemcen", fr: "Tlemcen", ar: "تلمسان" },
    year: 2025,
    description: {
      en: "Custom drywall TV wall unit with integrated LED lighting and storage.",
      fr: "Mur TV sur-mesure en placo avec éclairage LED intégré et rangements.",
      ar: "وحدة جدار تلفزيون بالجبس بورد بإضاءة LED وتخزين متكامل.",
    },
    services: ["drywall", "painting", "custom"],
    ...pool(["decorations", 30, 12]),
    featured: true,
    createdAt: "2025-03-18",
  },
];
