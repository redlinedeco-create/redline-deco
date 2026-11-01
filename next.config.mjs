/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  images: {
    // WebP only. AVIF is deliberately excluded: GHSA-2xp9-vwfh-vxw4 is an
    // unauthenticated RCE in the Next image optimizer triggered by AVIF input,
    // and the installed Next is not yet patched for it.
    formats: ["image/webp"],
    remotePatterns: [
      // Project photos served from the Supabase "media" bucket.
      ...(supabaseUrl
        ? [
            {
              protocol: "https",
              hostname: new URL(supabaseUrl).hostname,
              pathname: "/storage/v1/object/public/media/**",
            },
          ]
        : []),
      // Only the homepage before/after slider still points off-site.
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
        pathname: "/api/ide/v1/text_to_image",
      },
    ],
  },
};

export default nextConfig;
