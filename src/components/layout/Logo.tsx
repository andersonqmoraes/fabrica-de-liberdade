import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Use dark logo (for light backgrounds) */
  dark?: boolean;
}

const sizeMap = {
  sm: { icon: 52, fullH: 52 },
  md: { icon: 60, fullH: 60 },
  lg: { icon: 72, fullH: 72 },
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
      className={cn("flex-shrink-0 object-contain w-auto max-w-[200px]", className)}
      style={{ height: fullH }}
    />
  );
}
