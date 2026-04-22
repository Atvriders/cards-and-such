import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SetState, SetAction, SetCard, Attr3 } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const SHAPE_EMOJI: Record<Attr3, string> = { 0: "⬭", 1: "◇", 2: "〜" };
const COLOR_CLS: Record<Attr3, string> = { 0: "set-symbol--red", 1: "set-symbol--green", 2: "set-symbol--purple" };
const FILL_STYLE: Record<Attr3, React.CSSProperties> = {
  0: { opacity: 0.25 },
  1: { opacity: 0.6 },
  2: { opacity: 1 },
};

import type React from "react";

function SetCardView({ card, selected, onClick }: { card: SetCard | null; selected: boolean; onClick: () => void }) {
  if (!card) return <div className="set-card set-card--empty" />;
  const count = card.count + 1;
  return (
    <div
      className={`set-card${selected ? " set-card--selected" : ""}`}
      onClick={onClick}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`set-symbol ${COLOR_CLS[card.color]}`}
          style={FILL_STYLE[card.fill]}
        >
          {SHAPE_EMOJI[card.shape]}
        </span>
      ))}
    </div>
  );
}

export function SetGame({ state, dispatch }: GameProps<SetState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  return (
    <div className="set-game">
      <div className="set-game-status">
        <span>Sets found: {state.setsFound}</span>
        <span>Score: {state.score}</span>
        <span>Deck: {state.deck.length}</span>
        <span>Selected: {state.selected.length}/3</span>
      </div>

      {state.invalidSet && (
        <div className="set-game-msg set-game-msg--invalid">Not a valid SET — try again!</div>
      )}
      {state.noSetOnTable && !terminal && (
        <div className="set-game-msg set-game-msg--no-set">No SET on the table! (dealing more cards)</div>
      )}
      {terminal && (
        <div className="set-game-msg set-game-msg--won">
          {state.won ? `Deck cleared! Score: ${state.score}` : `No more SETs — final score: ${state.score}`}
        </div>
      )}

      <div className="set-game-grid">
        {state.table.map((card, i) => (
          <SetCardView
            key={i}
            card={card}
            selected={state.selected.includes(i)}
            onClick={() => {
              if (!terminal) dispatch({ type: "selectCard", tableIndex: i } satisfies SetAction);
            }}
          />
        ))}
      </div>

      {!terminal && (
        <div className="set-game-actions">
          <button className="set-game-btn" onClick={() => dispatch({ type: "hint" } satisfies SetAction)}>
            Hint (highlight 1st card of a set)
          </button>
        </div>
      )}

      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Select 3 cards forming a SET: each attribute (color/shape/fill/count) must be all-same or all-different.
      </div>
    </div>
  );
}
