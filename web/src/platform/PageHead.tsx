import { useEffect } from "react";

export interface PageHeadProps {
  /** Page title — appended automatically with the site suffix unless `exact` is true. */
  title: string;
  /** Optional meta description override. */
  description?: string;
  /** When true, set the document title verbatim without the " — Cards and Such" suffix. */
  exact?: boolean;
  /** Optional canonical URL — written to `<link rel="canonical">`. */
  canonical?: string;
  /**
   * Optional JSON-LD structured data payload. Written as a
   * `<script type="application/ld+json" data-pagehead="ld">` block and
   * replaced on each route change. Skip for marketing/static pages where
   * the index.html stamp covers it; supply for per-game pages so search
   * engines see VideoGame / WebApplication entities.
   */
  jsonLd?: Record<string, unknown>;
}

const SITE_SUFFIX = " — Cards and Such";
const DEFAULT_DESCRIPTION =
  "Cards and Such is a free in-browser game catalog with 4,500+ solitaire, card, dice, board, and arcade games.";

/**
 * Imperatively maintains the document title + key meta tags for the
 * current route. Renders nothing. Restores nothing on unmount — the next
 * route's PageHead will overwrite the title, and a tab without a head
 * mounted is an unmounted SPA which is fine to leave with stale state.
 */
export function PageHead({ title, description, exact, canonical, jsonLd }: PageHeadProps): null {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const fullTitle = exact ? title : `${title}${SITE_SUFFIX}`;
    document.title = fullTitle;

    const desc = description ?? DEFAULT_DESCRIPTION;
    setMeta("description", desc);
    setProperty("og:title", fullTitle);
    setProperty("og:description", desc);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);

    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      setProperty("og:url", canonical);
    }

    // JSON-LD: stamp into a stable <script data-pagehead="ld"> so we can
    // overwrite (rather than append) on each route change.
    if (jsonLd) {
      let ldScript = document.querySelector<HTMLScriptElement>('script[data-pagehead="ld"]');
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.type = "application/ld+json";
        ldScript.setAttribute("data-pagehead", "ld");
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else {
      const ldScript = document.querySelector<HTMLScriptElement>('script[data-pagehead="ld"]');
      if (ldScript) ldScript.remove();
    }
  }, [title, description, exact, canonical, jsonLd]);

  return null;
}

function setMeta(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name='${name}']`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[property='${property}']`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default PageHead;
