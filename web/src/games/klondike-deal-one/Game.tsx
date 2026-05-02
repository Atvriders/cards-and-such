import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeDealOneState, KlondikeDealOneAction, KlondikeDealOneSettings } from "./state.js";
import { isTerminal, cardName, cardSuit, ROUNDS } from "./state.js";
import "./Game.css";

const SUIT_GLYPH = ["♠", "♥", "♦", "♣"];

function rankAndSuit(c: number): { rank: string; suit: string; red: boolean } {
  const name = cardName(c);
  const suit = SUIT_GLYPH[cardSuit(c)]!;
  const rank = name.replace(suit, "");
  const red = cardSuit(c) === 1 || cardSuit(c) === 2;
  return { rank, suit, red };
}

export function KlondikeDealOneGame({ state, dispatch, onGameOver }: GameProps<KlondikeDealOneState, KlondikeDealOneSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const rating = state.score >= 120 ? "Excellent" : state.score >= 80 ? "Good" : state.score >= 40 ? "Fair" : "Pass";
    return (
      <div className="kd1-wrap">
        <div className="kd1-banner">
          <h2 className="kd1-title">Run Complete</h2>
          <div className="kd1-final">{state.score} pts</div>
          <div className="kd1-rating">{rating}</div>
        </div>
      </div>
    );
  }

  const remaining = state.deck.length - state.pos;

  return (
    <div className="kd1-wrap">
      <div className="kd1-bar">
        <div className="kd1-stat"><span>Round</span><b>{state.round + 1} / {ROUNDS}</b></div>
        <div className="kd1-stat"><span>Score</span><b>{state.score}</b></div>
        <div className="kd1-stat"><span>Stock</span><b>{remaining}</b></div>
      </div>
      <div className="kd1-info">
        Click a card in your hand to <em>swap</em> it for the next stock card. Then Keep & Score, or Discard for +1.
      </div>
      <div className="kd1-hand">
        {state.hand.map((c, i) => {
          const { rank, suit, red } = rankAndSuit(c);
          return (
            <button
              key={`${c}-${i}`}
              className={`kd1-card${red ? " red" : " black"}`}
              onClick={() => dispatch({ type: "swap", index: i } as KlondikeDealOneAction)}
              title={`Swap with next stock card`}
            >
              <span className="kd1-corner top">{rank}<br />{suit}</span>
              <span className="kd1-pip">{suit}</span>
              <span className="kd1-corner bot">{rank}<br />{suit}</span>
            </button>
          );
        })}
      </div>
      <div className="kd1-actions">
        <button data-testid="hint-target-klondike-deal-one-primary" className="kd1-btn keep" onClick={() => dispatch({ type: "keep" } as KlondikeDealOneAction)}>
          Keep &amp; Score
        </button>
        <button className="kd1-btn disc" onClick={() => dispatch({ type: "discard", index: 0 } as KlondikeDealOneAction)}>
          Discard Hand (+1)
        </button>
      </div>
      {state.log.length > 0 && (
        <div className="kd1-log">
          {state.log.slice(-3).map((l, i) => (
            <div key={i} className="kd1-log-entry">{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
