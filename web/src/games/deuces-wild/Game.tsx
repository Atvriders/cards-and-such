import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DeucesWildState, DeucesWildSettings, DeucesWildAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const SUITS_RED = new Set(["♥", "♦"]);

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function DeucesWild({ state, dispatch, onGameOver }: GameProps<DeucesWildState, DeucesWildSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, hand, held, handRank, lastResult } = state;
  const bet = parseInt(settings.bet, 10);

  function dis(a: DeucesWildAction) { dispatch(a); }

  return (
    <div className="dw-root">
      <div className="dw-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "draw" ? 1 : 0)} / {settings.handsPerSession}</span>
        <span>Bet: ${bet}</span>
      </div>

      {hand.length > 0 && (
        <div className="dw-hand">
          {hand.map((card, i) => (
            <div
              key={card.id + i}
              className={`dw-card-wrap${held[i] ? " held" : ""}`}
              onClick={() => phase === "draw" && dis({ type: "toggle-hold", index: i })}
            >
              <div className={`dw-card${SUITS_RED.has(card.suit) ? " red" : ""}${card.rank === 2 ? " wild" : ""}`}>
                <span>{rankLabel(card.rank)}</span>
                <span>{card.suit}</span>
              </div>
              <div className="dw-held-label">{held[i] ? "HELD" : ""}</div>
            </div>
          ))}
        </div>
      )}

      {handRank && <div className="dw-rank">{handRank}</div>}
      {lastResult && <div className="dw-result">{lastResult}</div>}

      <div className="dw-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "draw" && (
          <button onClick={() => dis({ type: "draw" })}>Draw</button>
        )}
        {terminal && <div className="dw-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <table className="dw-paytable">
        <thead><tr><th>Hand</th><th>Pays (per bet unit)</th></tr></thead>
        <tbody>
          {[
            ["Natural Royal Flush", "800x"],["Four Deuces","200x"],["Wild Royal Flush","25x"],
            ["Five of a Kind","15x"],["Straight Flush","9x"],["Four of a Kind","5x"],
            ["Full House","3x"],["Flush","2x"],["Straight","2x"],["Three of a Kind","1x"],
          ].map(([h, p]) => (
            <tr key={h}><td>{h}</td><td>{p}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
