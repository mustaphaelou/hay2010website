import { PrototypeSwitcher } from "./switcher"
import { VARIANTS, type VariantKey } from "./brand-data"
import { VariantA } from "./variant-a"
import { VariantB } from "./variant-b"
import { VariantC } from "./variant-c"

export default async function BrandPrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>
}) {
  const requested = (await searchParams).variant?.toLowerCase()
  const current: VariantKey = VARIANTS.some((v) => v.key === requested)
    ? (requested as VariantKey)
    : "a"

  return (
    <>
      {current === "a" && <VariantA />}
      {current === "b" && <VariantB />}
      {current === "c" && <VariantC />}
      <PrototypeSwitcher current={current} />
    </>
  )
}
