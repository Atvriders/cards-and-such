import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCrawlerState, CardCrawlerAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const KIND_ICONS: Record<string, string> = {
  fight: "⚔️", heal: "💚", gold: "💰", enemy: "👹", boss: "💀", empty: "·",
};

export function CardCrawler({ state, dispatch, onGameOver }: GameProps<CardCrawlerState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);

  return (
    <div className="cc-wrap">
      <div className="cc-header">
        <span className="cc-title">Card Crawler</span>
        <span className="cc-hp">HP {state.playerHp}/{state.playerMaxHp} ({hpPct}%)</span>
        <span className="cc-gold">Gold {state.gold}</span>
        <span>Score {state.score}</span>
      </div>

      <div className="cc-grid">
        {state.grid.map((card, idx) => {
          if (!card.revealed) {
            return (
              <div key={card.id} className="cc-card cc-hidden" onClick={() => dispatch({ type: "flip", idx } as CardCrawlerAction)}>
                <div>?</div>
                <div style={{ fontSize: "0.65rem" }}>Click</div>
              </div>
            );
          }
          const cls = `cc-card cc-${card.kind} cc-revealed`;
          return (
            <div key={card.id} className={cls}>
              <div>{KIND_ICONS[card.kind]}</div>
              <div className="cc-card-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      {state.phase === "cleared" && <div className="cc-end cc-win">All cleared! Final score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="cc-end cc-dead">Defeated! Score: {terminal?.score}</div>}

      <div className="cc-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="cc-log-line">{l}</div>)}
      </div>
    </div>
  );
}
