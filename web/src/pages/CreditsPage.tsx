import { PageHead } from "../platform/PageHead.js";

interface Credit {
  name: string;
  url: string;
  role: string;
  license: string;
}

const CREDITS: Credit[] = [
  { name: "React", url: "https://react.dev/", role: "UI library powering every page and game.", license: "MIT" },
  { name: "Vite", url: "https://vitejs.dev/", role: "Dev server and production bundler.", license: "MIT" },
  { name: "Zustand", url: "https://github.com/pmndrs/zustand", role: "Tiny global state stores (auth, themes, toasts).", license: "MIT" },
  { name: "React Router", url: "https://reactrouter.com/", role: "Client-side routing for the lobby and game pages.", license: "MIT" },
  { name: "Vitest", url: "https://vitest.dev/", role: "Unit and component test runner.", license: "MIT" },
  { name: "Testing Library", url: "https://testing-library.com/", role: "DOM and React testing utilities.", license: "MIT" },
  { name: "Inter", url: "https://rsms.me/inter/", role: "Primary UI font.", license: "SIL Open Font License 1.1" },
  { name: "JetBrains Mono", url: "https://www.jetbrains.com/lp/mono/", role: "Monospace font for tables and code.", license: "SIL Open Font License 1.1" },
];

export default function CreditsPage(): JSX.Element {
  return (
    <div className="settings-page" data-testid="credits-page">
      <PageHead
        title="Credits"
        description="Open-source libraries, fonts, and tooling that power Cards and Such."
      />
      <h1>Credits</h1>

      <section className="settings-section">
        <p>
          Cards and Such stands on the shoulders of a great deal of open-source work. Thanks
          to the maintainers of the projects below — this app would not exist without them.
        </p>
      </section>

      <section className="settings-section">
        <h2>Libraries &amp; tooling</h2>
        <ul>
          {CREDITS.map((c) => (
            <li key={c.name}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="settings-link">
                <strong>{c.name}</strong>
              </a>
              {" — "}{c.role}{" "}
              <em>({c.license})</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="settings-section">
        <h2>And the rest</h2>
        <p>
          Every game ships with its own rules, art, and sounds. Where assets are derived from
          existing public-domain or permissively licensed material, attribution is included in
          the game's own source folder.
        </p>
      </section>
    </div>
  );
}
