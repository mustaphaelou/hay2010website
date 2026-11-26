/**
 * First focusable element of every page: "Aller au contenu" targets the `main`
 * landmark (`#contenu`). Shared by the site root layout and the global 404
 * document so both keep the same first-tab-stop contract.
 */
export function SkipLink() {
  return (
    <a
      href="#contenu"
      className="sr-only focus:not-sr-only focus:self-start focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-surface"
    >
      Aller au contenu
    </a>
  )
}
