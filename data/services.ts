import type { ServiceItem } from "@/types";

export const services: ServiceItem[] = [
  {
    id: "svc-1",
    name: {
      en: "Drywall Installation",
      fr: "Pose de Placo",
      ar: "تركيب الجبس بورد",
    },
    description: {
      en: "Professional plasterboard and gypsum board installation with precise finishing.",
      fr: "Pose professionnelle de plaques de plâtre avec finitions précises.",
      ar: "تركيب احترافي لألواح الجبس بتشطيبات دقيقة.",
    },
    icon: "Layers",
    startingPrice: 1800,
    unit: "m²",
  },
  {
    id: "svc-2",
    name: {
      en: "False Ceilings",
      fr: "Plafonds Suspendus",
      ar: "الأسقف المعلقة",
    },
    description: {
      en: "Modern suspended ceilings with clean lines and integrated lighting options.",
      fr: "Plafonds modernes avec lignes épurées et options d'éclairage intégré.",
      ar: "أسقف معلقة حديثة بخطوط أنيقة وإمكانيات إضاءة متكاملة.",
    },
    icon: "Ceiling",
    startingPrice: 2500,
    unit: "m²",
  },
  {
    id: "svc-3",
    name: {
      en: "Partition Walls",
      fr: "Cloisons",
      ar: "الجدران والقواطع",
    },
    description: {
      en: "Custom internal partition walls tailored to your space layout.",
      fr: "Cloisons intérieures sur-mesure adaptées à votre espace.",
      ar: "قواطع داخلية مخصصة حسب ترتيب مساحتك.",
    },
    icon: "PanelTop",
    startingPrice: 2200,
    unit: "m²",
  },
  {
    id: "svc-4",
    name: {
      en: "Interior Painting",
      fr: "Peinture Intérieure",
      ar: "الطلاء الداخلي",
    },
    description: {
      en: "Premium interior painting with a flawless smooth finish.",
      fr: "Peinture intérieure haut de gamme et finition impeccable.",
      ar: "طلاء داخلي فاخر بلمسة نهائية سلسة ومثالية.",
    },
    icon: "Brush",
    startingPrice: 600,
    unit: "m²",
  },
  {
    id: "svc-5",
    name: {
      en: "Decorative Painting",
      fr: "Peinture Décorative",
      ar: "الطلاء والديكور",
    },
    description: {
      en: "Decorative finishes, textures and custom paint effects.",
      fr: "Finitions décoratives, textures et effets personnalisés.",
      ar: "تشطيبات زخرفية، ملامس وتأثيرات طلاء مخصصة.",
    },
    icon: "Palette",
    startingPrice: 1200,
    unit: "m²",
  },
  {
    id: "svc-6",
    name: {
      en: "Wall Finishing",
      fr: "Finition des Murs",
      ar: "تشطيب الجدران",
    },
    description: {
      en: "Smooth walls ready for paint with premium plasters and fillers.",
      fr: "Murs lisses et prêts à peindre avec enduits de qualité.",
      ar: "جدران سلسة جاهزة للطلاء بمواد عالية الجودة.",
    },
    icon: "PaintRoller",
    startingPrice: 800,
    unit: "m²",
  },
  {
    id: "svc-7",
    name: {
      en: "Renovation & Finishing",
      fr: "Rénovation & Finitions",
      ar: "الترميم والتشطيبات",
    },
    description: {
      en: "Complete interior renovation and finishing from start to finish.",
      fr: "Rénovation intérieure complète de A à Z.",
      ar: "ترميم داخلي كامل وتشطيبات شاملة من البداية حتى النهاية.",
    },
    icon: "Hammer",
    startingPrice: 3500,
    unit: "m²",
  },
  {
    id: "svc-8",
    name: {
      en: "Custom Designs",
      fr: "Designs Sur-Mesure",
      ar: "تصاميم مخصصة",
    },
    description: {
      en: "Custom drywall designs and bespoke interior solutions.",
      fr: "Créations en placo et solutions intérieures personnalisées.",
      ar: "تصاميم جبس بورد وحلول داخلية حسب الطلب.",
    },
    icon: "Sparkles",
  },
];
