import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** icon size in px */
  size?: number;
  /** show the "webmint." wordmark next to the icon */
  showWordmark?: boolean;
  /** text size class for the wordmark */
  textClassName?: string;
  className?: string;
}

export function Logo({
  size = 28,
  showWordmark = true,
  textClassName = "text-xl",
  className = "",
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Webmint"
        width={size}
        height={size}
        className="rounded-md shrink-0"
        priority
      />
      {showWordmark && (
        <span className={cn("font-brand italic tracking-tight", textClassName)}>
          web<span className="text-brand-green">mint</span>.
        </span>
      )}
    </span>
  );
}
