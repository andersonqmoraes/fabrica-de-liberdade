import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { icon: 32, text: "text-sm" },
  md: { icon: 40, text: "text-base" },
  lg: { icon: 52, text: "text-lg" },
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-icon.svg"
        alt="Fábrica de Liberdade"
        width={iconSize}
        height={iconSize}
        className="flex-shrink-0"
        style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(88%) saturate(413%) hue-rotate(116deg) brightness(93%) contrast(87%)" }}
      />
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-display font-bold text-white", textSize)}>
            Fábrica de
          </span>
          <span className={cn("font-display font-bold text-brand-400", textSize)}>
            Liberdade
          </span>
        </div>
      )}
    </div>
  );
}
