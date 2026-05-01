import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageMiniState, CribbageMiniAction, CribbageMiniSettings } from "./state.js";
import { isTerminal, cardLabel, suitOf, KEEP_SIZE, TARGET_SCORE } from "./state.js";
import "./Game.css";

function CardView({ c, faceDown, selected, onClick }: { c: number | null; faceDown?: boolean | undefined; selected?: boolean | undefined; onClick?: (() => void) | undefined }): JSX.Element {
  if (c === null) {
    return <div className="crib-mini-card crib-mini-empty" />;
  }
  if (faceDown) {
    return <div className="crib-mini-card crib-mini-back" />;
  }
  const red = suitOf(c) === 1 || suitOf(c) === 2;
  return (
    <button
      className={`crib-mini-card ${red ? "crib-mini-red" : "crib-mini-black"}${selected ? " crib-mini-selected" : ""}`}
      onClick={onClick}
      type="button"
      disabled={!onClick}
    >
      {cardLabel(c)}
    </button>
  );
}

export function CribbageMiniGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CribbageMiniState, CribbageMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  let banner = "";
  let cls = "crib-mini-banner";
  if (state.winner === 0) { banner = "You win!"; cls += " crib-mini-win"; }
  else if (state.winner === 1) { banner = "Bot wins"; cls += " crib-mini-loss"; }
  else if (state.phase === "discard") banner = `Pick ${KEEP_SIZE} cards to discard to the crib`;
  else if (state.phase === "show") banner = "Show & score";

  return (
    <div className="crib-mini-root">
      <div className="crib-mini-header">
        <div className="crib-mini-title">Cribbage · race to {TARGET_SCORE}</div>
        <div className={cls}>{banner}</div>
        <div className="crib-mini-dealer">Dealer: {state.dealer === 0 ? "You" : "Bot"}</div>
      </div>
      <div className="crib-mini-pegboard">
        <div className="crib-mini-peg-row">
          <span>You: </span>
          <span className="crib-mini-peg-bar" style={{ width: `${Math.min(100, (state.yourScore / TARGET_SCORE) * 100)}%` }} />
          <span className="crib-mini-peg-num">{state.yourScore}</span>
        </div>
        <div className="crib-mini-peg-row crib-mini-bot-row">
          <span>Bot: </span>
          <span className="crib-mini-peg-bar crib-mini-peg-bot" style={{ width: `${Math.min(100, (state.botScore / TARGET_SCORE) * 100)}%` }} />
          <span className="crib-mini-peg-num">{state.botScore}</span>
        </div>
      </div>
      <div className="crib-mini-hands">
        <div className="crib-mini-hand-section">
          <div className="crib-mini-hand-label">Bot</div>
          <div className="crib-mini-hand">
            {state.botHand.map((_, i) => (
              <CardView
                key={i}
                c={state.phase === "show" ? state.botHand[i]! : 0}
                faceDown={state.phase !== "show"}
              />
            ))}
          </div>
        </div>
        {state.starter !== null && (
          <div className="crib-mini-starter">
            <div className="crib-mini-hand-label">Starter</div>
            <CardView c={state.starter} />
          </div>
        )}
        <div className="crib-mini-hand-section">
          <div className="crib-mini-hand-label">You</div>
          <div className="crib-mini-hand">
            {state.yourHand.map((c, i) => (
              <CardView
                key={i}
                c={c}
                selected={state.selected.includes(i)}
                onClick={state.phase === "discard" ? () => dispatch({ type: "toggleSelect", idx: i } as CribbageMiniAction) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
      {state.phase === "show" && state.lastBreakdown && (
        <div className="crib-mini-breakdown">
          <div className="crib-mini-bd-row">
            <span className="crib-mini-bd-label">Your hand</span>
            <span className="crib-mini-bd-detail">
              {state.lastBreakdown.youDetails.length > 0 ? state.lastBreakdown.youDetails.join(", ") : "no points"}
              {state.lastBreakdown.youCrib > 0 && ` + crib ${state.lastBreakdown.youCrib}pts`}
            </span>
          </div>
          <div className="crib-mini-bd-row">
            <span className="crib-mini-bd-label">Bot hand</span>
            <span className="crib-mini-bd-detail">
              {state.lastBreakdown.botDetails.length > 0 ? state.lastBreakdown.botDetails.join(", ") : "no points"}
            </span>
          </div>
        </div>
      )}
      <div className="crib-mini-actions">
        {state.phase === "discard" && (
          <button
            className="crib-mini-btn"
            disabled={state.selected.length !== KEEP_SIZE}
            onClick={() => dispatch({ type: "submit" } as CribbageMiniAction)}
          >
            Submit ({state.selected.length}/{KEEP_SIZE})
          </button>
        )}
        {state.phase === "show" && (
          <button
            className="crib-mini-btn"
            onClick={() => dispatch({ type: "next" } as CribbageMiniAction)}
          >
            Next deal
          </button>
        )}
      </div>
    </div>
  );
}
