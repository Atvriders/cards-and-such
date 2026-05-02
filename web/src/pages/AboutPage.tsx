import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import "./AboutPage.css";

// Stats are baked at build time — recomputed by tooling on releases.
// total-games: count of registered plugins in src/games/registry.ts
// families:    unique entries in src/games/families.ts
// themed:      games whose plugin metadata mentions "themed" reskins
// commits:     `git rev-list --count HEAD` at last release
const STATS = {
  totalGames: 4505,
  totalFamilies: 154,
  themedPercent: 4,
  totalCommits: 449,
} as const;

const CATEGORIES: ReadonlyArray<{
  id: string;
  label: string;
  count: number;
  blurb: string;
}> = [
  { id: "solitaire", label: "Solitaire", count: 452, blurb: "Klondike, FreeCell, Spider, and hundreds of obscure patiences." },
  { id: "cards", label: "Cards", count: 976, blurb: "Trick-takers, shedding games, rummies, pokers, and modern card games." },
  { id: "dice", label: "Dice", count: 474, blurb: "Yahtzee-likes, push-your-luck, roll-and-write." },
  { id: "board", label: "Board", count: 2093, blurb: "Chess variants, checkers families, abstract strategy, and trivia." },
  { id: "arcade", label: "Arcade", count: 510, blurb: "Quick-reflex toys, runners, clickers, match-3 sprints." },
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
  const formatted = (n: number): string => n.toLocaleString();
  return (
    <div className="about-page settings-page" data-testid="about-page">
      <PageHead
        title="About"
        description="About Cards and Such — a sprawling open-source catalog of 4,500+ free in-browser solitaire, card, dice, board, and arcade games."
      />

      <header className="about-hero">
        <h1 className="about-hero-title">About Cards and Such</h1>
        <p className="about-hero-tag">
          A sprawling open-source catalog of <strong>{formatted(STATS.totalGames)}+</strong>{" "}
          free, in-browser solitaire, card, dice, board, and arcade games. No install,
          no account required, no ads.
        </p>
      </header>

      <section className="about-stats" aria-label="Project statistics">
        <Stat value={`${formatted(STATS.totalGames)}+`} label="Games" />
        <Stat value={`${formatted(STATS.totalFamilies)}`} label="Families" />
        <Stat value={`${STATS.themedPercent}%`} label="Themed reskins" />
        <Stat value={`${formatted(STATS.totalCommits)}+`} label="Commits" />
      </section>

      <section className="settings-section about-section">
        <h2>Project goals</h2>
        <ul className="about-list">
          <li><strong>Breadth over polish</strong> — every minor variant of every classic deserves a tile.</li>
          <li><strong>Zero friction</strong> — open the page, click a tile, play. No download, no login wall.</li>
          <li><strong>Plugin-first</strong> — every game is a self-contained plugin so the catalog can grow indefinitely.</li>
          <li><strong>Open development</strong> — code, issues, and roadmap live publicly on GitHub.</li>
          <li><strong>Self-hostable</strong> — pull two images, run one compose file, host your own copy.</li>
        </ul>
      </section>

      <section className="settings-section about-section">
        <h2>Stack</h2>
        <div className="about-chips">
          <span className="about-chip">React 18</span>
          <span className="about-chip">Vite</span>
          <span className="about-chip">TypeScript</span>
          <span className="about-chip">Vitest</span>
          <span className="about-chip">Zustand</span>
          <span className="about-chip">react-router-dom</span>
          <span className="about-chip">Docker</span>
          <span className="about-chip">GitHub Actions</span>
        </div>
        <p className="settings-hint">
          The web client is a single Vite SPA; a thin Node server backs lobby, leaderboards,
          and online play. Both ship as Docker images on GHCR.
        </p>
      </section>

      <section className="settings-section about-section">
        <h2>Categories</h2>
        <div className="about-cats">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`about-cat about-cat-${cat.id}`}
              data-testid={`about-cat-${cat.id}`}
            >
              <span className="about-cat-count">{formatted(cat.count)}</span>
              <span className="about-cat-label">{cat.label}</span>
              <span className="about-cat-blurb">{cat.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="settings-section about-section">
        <h2>Source &amp; images</h2>
        <p>
          Code lives on{" "}
          <a
            href="https://github.com/Atvriders/cards-and-such"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-link"
          >
            GitHub: Atvriders/cards-and-such
          </a>
          . Contributions, bug reports, and new game plugins are welcome.
        </p>
        <p>Container images are published to the GitHub Container Registry on every push to <code>master</code>:</p>
        <ul className="about-list about-list-mono">
          <li><code>ghcr.io/atvriders/cards-and-such-web:latest</code></li>
          <li><code>ghcr.io/atvriders/cards-and-such-server:latest</code></li>
        </ul>
      </section>

      <section className="settings-section about-section">
        <h2>Self-host with Docker Compose</h2>
        <p className="settings-hint">
          Drop the snippet below into a <code>docker-compose.yml</code>, then run
          {" "}<code>docker compose up -d</code>. The web UI is available at
          {" "}<code>http://localhost:8080</code>.
        </p>
        <pre className="about-code" aria-label="Docker compose example">
          <code>{COMPOSE_SNIPPET}</code>
        </pre>
      </section>

      <section className="settings-section about-section">
        <h2>More</h2>
        <p>
          See <Link to="/credits" className="settings-link">Credits</Link>,{" "}
          <Link to="/privacy" className="settings-link">Privacy</Link>, or jump straight
          back to the <Link to="/" className="settings-link">lobby</Link>.
        </p>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }): JSX.Element {
  return (
    <div className="about-stat" data-testid={`about-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="about-stat-value">{value}</div>
      <div className="about-stat-label">{label}</div>
    </div>
  );
}
