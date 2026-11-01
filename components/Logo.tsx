import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Redline Deco wordmark. The supplied light and dark artwork share the same
 * aspect ratio, so one box fits both and swaps on the `dark` class.
 *
 * Both images are decorative: callers wrap this in a link or supply their own
 * accessible name.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // Explicit width: aspect-ratio alone leaves the (absolutely filled)
        // images with a zero-size box on browsers/configs where the ratio is
        // not applied, which shows nothing at all.
        "relative block h-10 w-[102px] shrink-0 sm:h-12 sm:w-[122px]",
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width:640px) 102px, 122px"
        className="object-contain dark:hidden"
        priority
      />
      <Image
        src="/images/nightlogo.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width:640px) 102px, 122px"
        className="hidden object-contain dark:block"
      />
    </span>
  );
}
