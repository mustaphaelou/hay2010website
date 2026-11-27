import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The supplied HAY2010 badge (public/brand — the only logo).
 *
 * The header shows it plain on white; the footer shows it on the decided paper
 * chip so `2010.Sarl` stays legible on ink. The SVG is served as a vector, so
 * the image pipeline is bypassed (`unoptimized`): rasterising it would only
 * lose the badge's fine edges.
 */
export function SiteLogo({
  chip = false,
  priority = false,
}: {
  chip?: boolean
  priority?: boolean
}) {
  return (
    <span className={cn("inline-flex w-fit", chip && "bg-paper p-2")}>
      <Image
        src="/brand/hay2010-logo.svg"
        alt="HAY2010"
        width={468}
        height={355}
        priority={priority}
        unoptimized
        className="h-[52px] w-auto"
      />
    </span>
  )
}
