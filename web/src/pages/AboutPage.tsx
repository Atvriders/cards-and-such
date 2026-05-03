import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { GAMES } from "../games/registry.js";
import { FAMILIES } from "../games/families.js";
import { THEMES } from "../platform/themes.js";
import "./AboutPage.css";

// Injected at build time by Vite's `define` (see web/vite.config.ts).
// Falls back to an empty array in dev or if the git log call fails.
declare const __BUILD_LATEST_COMMITS__: readonly string[] | undefined;
const LATEST_COMMITS: readonly string[] =
  typeof __BUILD_LATEST_COMMITS__ !== "undefined" && Array.isArray(__BUILD_LATEST_COMMITS__)
    ? __BUILD_LATEST_COMMITS__
    : [];

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
        description={`About Cards and Such — an open-source catalog of ${formatted(totalGames)} free in-browser solitaire, card, dice, board, and arcade games.`}
      />

      <header className="about-hero">
        <p className="about-eyebrow">Open source · MIT · self-hostable</p>
        <h1 className="about-hero-title">Cards &amp; Such</h1>
        <p className="about-hero-tag">
          An open-source catalog of{" "}
          <strong>{formatted(totalGames)}</strong> free, in-browser solitaire,
          card, dice, board, and arcade games.
        </p>
        <p className="about-hero-sub">
          No install. No account. No ads. Just play.
        </p>
      </header>

      <section className="settings-section about-section about-section--numbers" aria-labelledby="about-numbers-heading">
        <h2 id="about-numbers-heading">By the numbers</h2>
        <div className="about-stats" aria-label="Project statistics">
          <Stat name="games" value={formatted(totalGames)} label="Games" />
          <Stat name="categories" value={formatted(totalCategories)} label="Categories" />
          <Stat name="themes" value={formatted(totalThemes)} label="Themes" />
          <Stat name="families" value={formatted(totalFamilies)} label="Families" />
        </div>
        <p className="settings-hint about-section-foot">
          Counts are read from the live game registry at build time, so they
          stay honest as the catalog grows.
        </p>
        <p className="settings-hint about-section-foot" data-testid="about-hint-coverage">
          Hint coverage: 100% — every game has a hint button.
        </p>
      </section>

      <section className="settings-section about-section" aria-labelledby="about-what-heading">
        <h2 id="about-what-heading">What is this?</h2>
        <p>
          A single-page web app that bundles {formatted(totalGames)} classic and
          modern games into one fast, zero-friction lobby. Every game is a
          self-contained plugin, so the catalog keeps growing without one game
          blocking the next.
        </p>
      </section>

      <section className="settings-section about-section" data-testid="about-friend-mode" aria-labelledby="about-friend-heading">
        <h2 id="about-friend-heading">Friend mode</h2>
        <p>
          Same-seed friend matches let you and a friend race the exact same
          deal, then compare scores — no netcode, no signup.
        </p>
      </section>

      <section className="settings-section about-section" aria-labelledby="about-stack-heading">
        <h2 id="about-stack-heading">Stack</h2>
        <div className="about-chips">
          {STACK_CHIPS.map((chip) => (
            <span key={chip} className="about-chip">{chip}</span>
          ))}
        </div>
        <p className="settings-hint about-section-foot">
          A single Vite SPA with a small Node server backing lobby,
          leaderboards, and online play. Both ship as Docker images on GHCR.
        </p>
      </section>

      <section className="settings-section about-section" aria-labelledby="about-selfhost-heading">
        <h2 id="about-selfhost-heading">Self-host</h2>
        <p className="settings-hint">
          Save the snippet as <code>docker-compose.yml</code>, then run
          {" "}<code>docker compose up -d</code>. The web UI is served at
          {" "}<code>http://localhost:8080</code>. Images are published to GHCR
          on every push to <code>master</code>.
        </p>
        <pre className="about-code" aria-label="Docker compose example">
          <code>{COMPOSE_SNIPPET}</code>
        </pre>
        <ul className="about-list about-list-mono">
          <li><code>ghcr.io/atvriders/cards-and-such-web:latest</code></li>
          <li><code>ghcr.io/atvriders/cards-and-such-server:latest</code></li>
        </ul>
      </section>

      <section
        className="settings-section about-section"
        data-testid="about-whatsnew"
        aria-labelledby="about-whatsnew-heading"
      >
        <h2 id="about-whatsnew-heading">What&rsquo;s new</h2>
        <p className="settings-hint">
          The five most recent commits on <code>master</code>, captured at
          build time.
        </p>
        {LATEST_COMMITS.length === 0 ? (
          <p className="settings-hint about-section-foot">Build info unavailable.</p>
        ) : (
          <ul className="about-list about-list-mono about-whatsnew-list">
            {LATEST_COMMITS.map((line, idx) => {
              const spaceAt = line.indexOf(" ");
              const hash = spaceAt > 0 ? line.slice(0, spaceAt) : line;
              const subject = spaceAt > 0 ? line.slice(spaceAt + 1) : "";
              return (
                <li key={`${hash}-${idx}`} data-testid={`about-whatsnew-${idx}`}>
                  <code>{hash}</code> <span className="about-whatsnew-subject">{subject}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="settings-hint about-section-foot">
          For the full history, see the{" "}
          <a
            href="https://github.com/Atvriders/cards-and-such/blob/master/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-link"
          >
            Changelog
          </a>
          {" "}on GitHub.
        </p>
      </section>

      <section className="settings-section about-section" aria-labelledby="about-ack-heading">
        <h2 id="about-ack-heading">Acknowledgements</h2>
        <p>
          Built on the shoulders of countless open-source libraries and the
          public-domain rules of the games themselves. Full attributions live
          on the{" "}
          <Link to="/credits" className="settings-link">Credits</Link> page.
        </p>
        <p className="settings-hint about-section-foot">
          Source on{" "}
          <a
            href="https://github.com/Atvriders/cards-and-such"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-link"
          >
            GitHub
          </a>
          {" "}— issues, PRs, and new game plugins all welcome.
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
