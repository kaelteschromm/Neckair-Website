import { images, type ImageName } from "@/lib/images.generated";
import { asset } from "@/lib/site";

/**
 * Responsives Bild in AVIF/WebP mit Unschärfe-Platzhalter.
 * Füllt standardmäßig seinen (relativ positionierten) Container per object-cover.
 */
export function Picture({
  name,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
  imgClassName = "",
  position = "center",
}: {
  name: ImageName;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  position?: string;
}) {
  const meta = images[name];
  const set = (fmt: string) => meta.widths.map((w) => `${asset(`/img/${name}-${w}.${fmt}`)} ${w}w`).join(", ");
  const fallback = meta.widths.find((w) => w >= 1200) ?? meta.widths[meta.widths.length - 1];
  return (
    <picture className={`block h-full w-full ${className}`}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={asset(`/img/${name}-${fallback}.webp`)}
        alt={alt}
        width={meta.width}
        height={meta.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={`h-full w-full object-cover ${imgClassName}`}
        style={{
          objectPosition: position,
          backgroundImage: `url(${meta.blur})`,
          backgroundSize: "cover",
          backgroundPosition: position,
        }}
      />
    </picture>
  );
}
