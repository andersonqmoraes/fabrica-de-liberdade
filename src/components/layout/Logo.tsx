import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Use dark logo (for light backgrounds) */
  dark?: boolean;
}

const sizeMap = {
  sm: { icon: 32, fullH: 28 },
  md: { icon: 40, fullH: 36 },
  lg: { icon: 52, fullH: 48 },
};

export function Logo({ variant = "full", size = "md", className, dark = false }: LogoProps) {
  const { icon: iconSize, fullH } = sizeMap[size];

  if (variant === "icon") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={dark ? "/images/IconePreto.png" : "/images/IconeBranco.png"}
        alt="Fábrica de Liberdade"
        width={iconSize}
        height={iconSize}
        className={cn("flex-shrink-0 object-contain", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? "/images/Preto.png" : "/images/Branco.png"}
      alt="Fábrica de Liberdade"
      height={fullH}
      className={cn("flex-shrink-0 object-contain w-auto", className)}
      style={{ height: fullH }}
    />
  );
}
