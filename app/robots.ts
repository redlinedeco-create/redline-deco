import type { MetadataRoute } from "next";
import { CONTACT_INFO } from "@/lib/utils";

const BASE_URL = `https://${CONTACT_INFO.website}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
