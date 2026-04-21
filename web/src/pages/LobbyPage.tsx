import { Link } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import type { GameCategory } from "../platform/game-plugin/types.js";
import "./LobbyPage.css";

const CATEGORY_ORDER: GameCategory[] = ["solitaire", "cards", "dice", "board"];
const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
};

export default function LobbyPage(): JSX.Element {
  if (GAMES.length === 0) {
    return (
      <div className="lobby-empty" data-testid="lobby-empty">
        <h1>Lobby</h1>
        <p>No games installed yet.</p>
      </div>
    );
  }
  const byCategory: Record<GameCategory, typeof GAMES> = {
    solitaire: [], cards: [], dice: [], board: [],
  };
  for (const g of GAMES) byCategory[g.category].push(g);

  return (
    <div className="lobby-page">
      <h1>Lobby</h1>
      {CATEGORY_ORDER.map((cat) => byCategory[cat].length > 0 && (
        <section key={cat}>
          <h2>{CATEGORY_LABELS[cat]}</h2>
          <div className="tiles">
            {byCategory[cat].map((g) => (
              <Link key={g.id} to={`/play/${g.id}`} className="tile" data-testid={`tile-${g.id}`}>
                <div className="tile-title">{g.title}</div>
                <div className="tile-desc">{g.description}</div>
                {g.players.multiplayer && (
                  <span className="tile-mp-badge" data-testid={`mp-badge-${g.id}`}>online</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
