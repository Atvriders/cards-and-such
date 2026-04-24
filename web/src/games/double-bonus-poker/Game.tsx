import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleBonusState, DoubleBonusSettings, DoubleBonusAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const RED_SUITS = new Set(["♥", "♦"]);

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function DoubleBonusPoker({ state, dispatch, onGameOver }: GameProps<DoubleBonusState, DoubleBonusSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, hand, held, handRank, lastResult } = state;

  function dis(a: DoubleBonusAction) { dispatch(a); }

  return (
    <div className="db-root">
      <div className="db-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "draw" ? 1 : 0)} / {settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      {hand.length > 0 && (
        <div className="db-hand">
          {hand.map((card, i) => (
            <div
              key={card.id + i}
              className={`db-card-wrap${held[i] ? " held" : ""}`}
              onClick={() => phase === "draw" && dis({ type: "toggle-hold", index: i })}
            >
              <div className={`db-card${RED_SUITS.has(card.suit) ? " red" : ""}`}>
                <span>{rankLabel(card.rank)}</span>
                <span>{card.suit}</span>
              </div>
              <div className="db-held-label">{held[i] ? "HELD" : ""}</div>
            </div>
          ))}
        </div>
      )}

      {handRank && <div className="db-rank">{handRank}</div>}
      {lastResult && <div className="db-result">{lastResult}</div>}

      <div className="db-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "draw" && (
          <button onClick={() => dis({ type: "draw" })}>Draw</button>
        )}
        {terminal && <div className="db-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <table className="db-paytable">
        <thead><tr><th>Hand</th><th>Pays (per bet unit)</th></tr></thead>
        <tbody>
          {[
            ["Royal Flush","800x"],["Straight Flush","50x"],
            ["Four Aces","160x"],["Four 2s-4s","80x"],["Four 5s-Ks","50x"],
            ["Full House","10x"],["Flush","7x"],["Straight","5x"],
            ["Three of a Kind","3x"],["Two Pair","1x"],["Jacks or Better","1x"],
          ].map(([h, p]) => (
            <tr key={h}><td>{h}</td><td>{p}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
