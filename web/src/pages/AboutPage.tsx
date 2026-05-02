import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { GAMES } from "../games/registry.js";
import { FAMILIES } from "../games/families.js";
import { THEMES } from "../platform/themes.js";
import "./AboutPage.css";

// Game categories — must mirror the GameCategory union in
// `src/platform/game-plugin/types.ts`. Hard-coded here because the
// type itself is not exported as a runtime value.
const CATEGORY_IDS = ["solitaire", "cards", "dice", "board", "arcade"] as const;

const STACK_CHIPS: ReadonlyArray<string> = [
  "React",
  "TypeScript",
  "Vite",
  "Vitest",
  "Zustand",
  "react-router",
  "CSS variables",
  "PWA",
  "Service Worker",
];

const COMPOSE_SNIPPET = `# docker-compose.yml
services:
  server:
    image: ghcr.io/atvriders/cards-and-such-server:latest
    environment:
      - PORT=8787
    ports:
      - "8787:8787"
  web:
    image: ghcr.io/atvriders/cards-and-such-web:latest
    ports:
      - "8080:80"
    depends_on:
      - server
`;

export default function AboutPage(): JSX.Element {
  // Defensive filter: registry occasionally has placeholder slots that
  // resolve to null when a plugin module fails to load.
  const games = GAMES.filter((g): g is NonNullable<typeof g> => g != null);
  const totalGames = games.length;
  const totalCategories = CATEGORY_IDS.length;
  const totalThemes = THEMES.length;
  const totalFamilies = FAMILIES.length;
  const formatted = (n: number): string => n.toLocaleString();

  return (
    <div className="about-page settings-page" data-testid="about-page">
      <PageHead
        title="About"
        description={`About Cards and Such — a sprawling open-source catalog of ${formatted(totalGames)}+ free in-browser solitaire, card, dice, board, and arcade games.`}
      />

      <header className="about-hero">
        <h1 className="about-hero-title">Cards &amp; Such</h1>
        <p className="about-hero-tag">
          A sprawling open-source catalog of{" "}
          <strong>{formatted(totalGames)}</strong> free, in-browser solitaire,
          card, dice, board, and arcade games. No install. No account. No ads.
        </p>
      </header>

      <section className="settings-section about-section">
        <h2>What is this?</h2>
        <p>
          Cards &amp; Such is a single-page web app that bundles thousands of
          classic and modern games into one fast, zero-friction lobby. Every
          game is a self-contained plugin, so the catalog can keep growing
          without any one game blocking the next. The whole project is open
          source and self-hostable — you can run your own copy with two Docker
          images.
        </p>
      </section>

      <section className="settings-section about-section">
        <h2>Numbers at a glance</h2>
        <div className="about-stats" aria-label="Project statistics">
          <Stat name="games" value={formatted(totalGames)} label="Games" />
          <Stat name="categories" value={formatted(totalCategories)} label="Categories" />
          <Stat name="themes" value={formatted(totalThemes)} label="Themes" />
          <Stat name="families" value={formatted(totalFamilies)} label="Families" />
        </div>
      </section>

      <section className="settings-section about-section">
        <h2>Stack</h2>
        <div className="about-chips">
          {STACK_CHIPS.map((chip) => (
            <span key={chip} className="about-chip">{chip}</span>
          ))}
        </div>
        <p className="settings-hint">
          The web client is a single Vite SPA with a small Node server backing
          lobby, leaderboards, and online play. Both ship as Docker images on
          GHCR.
        </p>
      </section>

      <section className="settings-section about-section">
        <h2>Self-host</h2>
        <p className="settings-hint">
          Drop the snippet below into a <code>docker-compose.yml</code>, then run
          {" "}<code>docker compose up -d</code>. The web UI is then available at
          {" "}<code>http://localhost:8080</code>. Container images are
          published to GHCR on every push to <code>master</code>.
        </p>
        <pre className="about-code" aria-label="Docker compose example">
          <code>{COMPOSE_SNIPPET}</code>
        </pre>
        <ul className="about-list about-list-mono">
          <li><code>ghcr.io/atvriders/cards-and-such-web:latest</code></li>
          <li><code>ghcr.io/atvriders/cards-and-such-server:latest</code></li>
        </ul>
      </section>

      <section className="settings-section about-section">
        <h2>Acknowledgements</h2>
        <p>
          Built on the shoulders of countless open-source libraries and the
          public-domain rules of the games themselves. Full attributions live
          on the <Link to="/credits" className="settings-link">Credits</Link>
          {" "}page. Source on{" "}
          <a
            href="https://github.com/Atvriders/cards-and-such"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-link"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function Stat({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: string;
}): JSX.Element {
  return (
    <div className="about-stat" data-testid={`about-stat-${name}`}>
      <div className="about-stat-value">{value}</div>
      <div className="about-stat-label">{label}</div>
    </div>
  );
}
