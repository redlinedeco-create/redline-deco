import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CONTACT_INFO = {
  phone: "0657387514",
  phoneInternational: "+213657387514",
  phoneWhatsapp: "213657387514",
  email: "redlinedeco@gmail.com",
  location: {
    short: "SEBDOU - TLEMCEN",
    full: "SEBDOU - TLEMCEN, ALGERIA",
    city: "Sebdou, Tlemcen, Algeria",
  },
  website: "redline-deco.netlify.app",
  whatsappLink: "https://wa.me/213657387514",
  social: {
    facebook: "https://www.facebook.com/people/Redline-deco/61562024163100/",
    instagram: "https://www.instagram.com/redlinedeco8",
    tiktok: "https://www.tiktok.com/@redlinedeco",
  },
} as const;
