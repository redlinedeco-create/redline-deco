/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // WebP only. AVIF is deliberately excluded: GHSA-2xp9-vwfh-vxw4 is an
    // unauthenticated RCE in the Next image optimizer triggered by AVIF input,
    // and the installed Next is not yet patched for it.
    formats: ["image/webp"],
    // Only the homepage before/after slider still points off-site.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
        pathname: "/api/ide/v1/text_to_image",
      },
    ],
  },
};

export default nextConfig;
