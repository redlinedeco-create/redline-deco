/**
 * Turns a stored storage path such as "painting/painting-01.jpg" into a public
 * URL. Safe on both server and client -- it only reads a NEXT_PUBLIC_ variable.
 */
export const MEDIA_BUCKET = "media";

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return `/${path}`;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * Strips a Supabase public URL (or a local /images path) back down to the bare
 * storage path, which is the form the database stores.
 */
export function toStoragePath(src: string): string {
  return src
    .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, "")
    .replace(/^\/images\//, "");
}