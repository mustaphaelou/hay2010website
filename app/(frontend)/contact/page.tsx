import { requirePublishedRubrique } from "@/lib/site/gates"

/** Contact — gate-guarded stub shipped by #21; the email-first page is #26. */
export default async function Page() {
  await requirePublishedRubrique("contact")
  return null
}
