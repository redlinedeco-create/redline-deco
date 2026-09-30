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
        "relative block aspect-[1024/402] h-8 w-auto sm:h-9",
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width:640px) 82px, 92px"
        className="object-contain dark:hidden"
        priority
      />
      <Image
        src="/images/nightlogo.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width:640px) 82px, 92px"
        className="hidden object-contain dark:block"
      />
    </span>
  );
}
