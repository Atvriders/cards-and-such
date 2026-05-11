import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PageHead } from "./PageHead.js";

const SITE_SUFFIX = " — Cards and Such";

afterEach(() => {
  cleanup();
  document.title = "";
  document.head
    .querySelectorAll("meta[name='description'], meta[name='twitter:title'], meta[name='twitter:description'], meta[property='og:title'], meta[property='og:description'], meta[property='og:url'], link[rel='canonical']")
    .forEach((el) => el.remove());
});

function metaContent(selector: string): string | null {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  return el ? el.getAttribute("content") : null;
}

describe("PageHead", () => {
  it("sets document.title with the site suffix and writes description + og/twitter meta tags", () => {
    render(<PageHead title="Solitaire" description="Play Solitaire online." />);
    expect(document.title).toBe(`Solitaire${SITE_SUFFIX}`);
    expect(metaContent("meta[name='description']")).toBe("Play Solitaire online.");
    expect(metaContent("meta[property='og:title']")).toBe(`Solitaire${SITE_SUFFIX}`);
    expect(metaContent("meta[property='og:description']")).toBe("Play Solitaire online.");
    expect(metaContent("meta[name='twitter:title']")).toBe(`Solitaire${SITE_SUFFIX}`);
    expect(metaContent("meta[name='twitter:description']")).toBe("Play Solitaire online.");
  });

  it("uses the verbatim title when exact is true and falls back to the default description", () => {
    render(<PageHead title="Cards and Such" exact />);
    expect(document.title).toBe("Cards and Such");
    const desc = metaContent("meta[name='description']");
    expect(desc).not.toBeNull();
    expect(desc).toContain("Cards and Such");
    expect(desc).toContain("4,500+");
  });

  it("creates a canonical link and og:url when canonical is provided, updating both on re-render", () => {
    const { rerender } = render(<PageHead title="A" canonical="https://example.com/a" />);
    const link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
    expect(link).not.toBeNull();
    expect(link!.href).toBe("https://example.com/a");
    expect(metaContent("meta[property='og:url']")).toBe("https://example.com/a");

    rerender(<PageHead title="B" canonical="https://example.com/b" />);
    expect(document.title).toBe(`B${SITE_SUFFIX}`);
    expect(document.head.querySelectorAll("link[rel='canonical']").length).toBe(1);
    expect(document.head.querySelector<HTMLLinkElement>("link[rel='canonical']")!.href).toBe(
      "https://example.com/b",
    );
    expect(metaContent("meta[property='og:url']")).toBe("https://example.com/b");
  });
});
