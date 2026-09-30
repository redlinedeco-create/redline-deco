import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: { en: "All", fr: "Tous", ar: "الكل" },
    slug: "all",
  },
  {
    id: "cat-2",
    name: { en: "Drywall", fr: "Placo", ar: "الجبس بورد" },
    slug: "drywall",
    description: {
      en: "Plasterboard and gypsum board works",
      fr: "Travaux de plaques de plâtre",
      ar: "أعمال تركيب الجبس بورد",
    },
  },
  {
    id: "cat-3",
    name: { en: "Ceilings", fr: "Plafonds", ar: "الأسقف" },
    slug: "ceilings",
    description: {
      en: "False and suspended ceilings",
      fr: "Plafonds suspendus",
      ar: "الأسقف المعلقة",
    },
  },
  {
    id: "cat-4",
    name: { en: "Partitions", fr: "Cloisons", ar: "القواطع" },
    slug: "partitions",
    description: {
      en: "Partition walls and room dividers",
      fr: "Cloisons et séparations",
      ar: "قواطع وجدران فصل",
    },
  },
  {
    id: "cat-5",
    name: { en: "Painting", fr: "Peinture", ar: "الطلاء" },
    slug: "painting",
    description: {
      en: "Interior painting",
      fr: "Peinture intérieure",
      ar: "طلاء داخلي",
    },
  },
  {
    id: "cat-6",
    name: {
      en: "Decorative Painting",
      fr: "Peinture décorative",
      ar: "الطلاء الديكوري",
    },
    slug: "decorative",
    description: {
      en: "Decorative finishes and effects",
      fr: "Finitions et effets décoratifs",
      ar: "تشطيبات وتأثيرات زخرفية",
    },
  },
  {
    id: "cat-7",
    name: { en: "Renovation", fr: "Rénovation", ar: "الترميم" },
    slug: "renovation",
    description: {
      en: "Full renovation works",
      fr: "Travaux de rénovation complète",
      ar: "أعمال ترميم كاملة",
    },
  },
  {
    id: "cat-8",
    name: { en: "Commercial", fr: "Commercial", ar: "مشاريع تجارية" },
    slug: "commercial",
    description: {
      en: "Commercial and retail projects",
      fr: "Projets commerciaux",
      ar: "مشاريع تجارية",
    },
  },
  {
    id: "cat-9",
    name: { en: "Residential", fr: "Résidentiel", ar: "مشاريع سكنية" },
    slug: "residential",
    description: {
      en: "Residential and home projects",
      fr: "Projets résidentiels et maisons",
      ar: "مشاريع سكنية ومنازل",
    },
  },
];
