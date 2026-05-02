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
export function PageHead({ title, description, exact, canonical }: PageHeadProps): null {
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
  }, [title, description, exact, canonical]);

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
