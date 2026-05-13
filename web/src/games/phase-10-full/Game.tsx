import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { P10State, P10Action, P10Settings, P10Card, Seat } from "./state.js";
import { isTerminal, PHASES, describeCard } from "./state.js";
import "./Game.css";

const SEATS: Seat[] = [0, 1, 2, 3];

function cardColorClass(c: P10Card): string {
  if (c.kind === "wild") return "p10f-card p10f-wild";
  if (c.kind === "skip") return "p10f-card p10f-skip";
  return `p10f-card p10f-${c.color}`;
}

export function Phase10FullGame(
  { state, dispatch, onGameOver }: GameProps<P10State, P10Settings>,
): JSX.Element {
  const endedRef = useRef(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-step CPUs while it's their turn.
  useEffect(() => {
    if (state.stage === "draw" && state.current !== 0) {
      const t = setTimeout(() => {
        dispatch({ type: "cpu-step" } as P10Action);
      }, 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state.stage, state.current, dispatch]);

  if (state.stage === "done") {
    return (
      <div className="p10f-wrap fade-in">
        <div className="p10f-done bounce-in">
          <h2>{state.winner === 0 ? "You win!" : `CPU ${state.winner} wins`}</h2>
          <div className="p10f-final pulse">Final scores</div>
          <ul className="p10f-scoreboard">
            {SEATS.map((s) => (
              <li key={s} className={s === state.winner ? "p10f-winner" : ""}>
                {s === 0 ? "You" : `CPU ${s}`} — Phase {Math.min(10, state.phaseOf[s]!)} —
                {" "}{state.scores[s]} pts
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const goal = PHASES[state.phaseOf[0]! - 1]!;
  const top = state.discard[state.discard.length - 1];
  const yourTurn = state.current === 0;

  return (
    <div className="p10f-wrap fade-in">
      <header className="p10f-header">
        <div className="p10f-round">Round {state.round}</div>
        <div className="p10f-phase pulse">
          Your Phase {goal.index}: <span>{goal.desc}</span>
          {state.laidThisRound[0] && <span className="p10f-laid"> (laid)</span>}
        </div>
      </header>

      <section className="p10f-table">
        <div className="p10f-opponents">
          {([1, 2, 3] as Seat[]).map((s) => (
            <div key={s} className={`p10f-opp ${state.current === s ? "p10f-active" : ""}`}>
              <div className="p10f-opp-label">CPU {s}</div>
              <div className="p10f-opp-info">
                Phase {state.phaseOf[s]} · {state.hands[s]!.length} cards
                {state.laidThisRound[s] && <span className="p10f-laid"> · laid</span>}
              </div>
              <div className="p10f-opp-pts">{state.scores[s]} pts</div>
            </div>
          ))}
        </div>

        <div className="p10f-piles">
          <button
            type="button"
            className="p10f-pile p10f-stock"
            data-testid="hint-target-phase-10-full-draw-stock"
            title="Draw a card from the stockpile (face-down)"
            disabled={!yourTurn || state.stage !== "draw"}
            onClick={() => dispatch({ type: "draw", from: "stock" } as P10Action)}
          >
            <span className="p10f-pile-label">Stock</span>
            <span className="p10f-pile-count">{state.draw.length}</span>
          </button>
          <button
            type="button"
            className="p10f-pile p10f-discard"
            title="Pick up the top of the discard pile"
            disabled={!yourTurn || state.stage !== "draw" || !top || top.kind === "skip"}
            onClick={() => dispatch({ type: "draw", from: "discard" } as P10Action)}
          >
            <span className="p10f-pile-label">Discard</span>
            {top ? (
              <span className={cardColorClass(top)}>{describeCard(top)}</span>
            ) : (
              <span className="p10f-pile-empty">—</span>
            )}
          </button>
        </div>
      </section>

      <section className="p10f-hand-area">
        <div className="p10f-status" data-testid="phase-10-full-status">{state.message}</div>
        {state.lastAction && <div className="p10f-action">{state.lastAction}</div>}

        <div className="p10f-hand">
          {state.hands[0]!.map((c) => {
            const sel = state.selected.includes(c.id);
            const isPlay = state.stage === "play" && yourTurn;
            return (
              <button
                key={c.id}
                type="button"
                className={`${cardColorClass(c)} ${sel ? "p10f-selected" : ""}`}
                title={
                  isPlay
                    ? state.laidThisRound[0]
                      ? `Discard ${describeCard(c)}`
                      : `Select ${describeCard(c)} for phase or discard`
                    : describeCard(c)
                }
                disabled={!isPlay}
                onClick={() => {
                  if (state.laidThisRound[0]) {
                    dispatch({ type: "discard", cardId: c.id } as P10Action);
                  } else {
                    dispatch({ type: "toggle-select", cardId: c.id } as P10Action);
                  }
                }}
              >
                {describeCard(c)}
              </button>
            );
          })}
        </div>

        {yourTurn && state.stage === "play" && (
          <div className="p10f-controls">
            {!state.laidThisRound[0] && (
              <button
                type="button"
                className="p10f-btn p10f-btn-primary"
                data-testid="hint-target-phase-10-full-lay"
                title="Lay down selected cards as your phase"
                disabled={state.selected.length === 0}
                onClick={() => dispatch({ type: "lay-down" } as P10Action)}
              >
                Lay Down Phase
              </button>
            )}
            {state.selected.length === 1 && (
              <button
                type="button"
                className="p10f-btn"
                title="Discard the one selected card to end your turn"
                onClick={() =>
                  dispatch({ type: "discard", cardId: state.selected[0]! } as P10Action)
                }
              >
                Discard Selected
              </button>
            )}
            <button
              type="button"
              className="p10f-btn p10f-btn-ghost"
              title="Clear current card selection"
              disabled={state.selected.length === 0}
              onClick={() => {
                // toggle every selected off
                for (const id of state.selected) {
                  dispatch({ type: "toggle-select", cardId: id } as P10Action);
                }
              }}
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {state.stage === "round-end" && (
        <section className="p10f-roundend bounce-in">
          <h3>Round {state.round} complete</h3>
          <ul>
            {SEATS.map((s) => (
              <li key={s}>
                {s === 0 ? "You" : `CPU ${s}`}: Phase {state.phaseOf[s]} · {state.scores[s]} pts
                {state.laidThisRound[s] && " · advanced"}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="p10f-btn p10f-btn-primary"
            data-testid="hint-target-phase-10-full-next-round"
            title="Begin the next round"
            onClick={() => dispatch({ type: "next-round" } as P10Action)}
          >
            Next Round
          </button>
        </section>
      )}
    </div>
  );
}
