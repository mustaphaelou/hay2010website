import { PrototypeSwitcher } from "./switcher"
import { VARIANTS, type VariantKey } from "./homepage-data"
import { VariantA } from "./variant-a"
import { VariantB } from "./variant-b"
import { VariantC } from "./variant-c"

export default async function HomepagePrototypePage({
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
      <div className="bg-[#111217] px-4 py-2 text-center text-[10px] font-medium tracking-[0.18em] text-white/70 uppercase">
        Prototype #13 — page d’accueil · textes et visuels provisoires · jetable
      </div>
      {current === "a" && <VariantA />}
      {current === "b" && <VariantB />}
      {current === "c" && <VariantC />}
      <PrototypeSwitcher current={current} />
    </>
  )
}
