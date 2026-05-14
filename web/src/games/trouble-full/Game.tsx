import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TroubleFullState, TroubleFullSettings, TroubleFullAction } from "./state.js";
import {
  isTerminal,
  canMove,
  YARD,
  FINISH,
  NUM_PAWNS,
  STRETCH_START,
  isInStretch,
} from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"] as const;
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"] as const;

function describePeg(pos: number): string {
  if (pos === YARD) return "Home Base";
  if (pos === FINISH) return "Finish";
  if (isInStretch(pos)) return `Stretch ${pos - STRETCH_START + 1}/4`;
  return `Sq ${pos}`;
}

export function TroubleFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TroubleFullState, TroubleFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canRoll = isMyTurn && state.phase === "rolling";
  const canPickMove = isMyTurn && state.phase === "moving";

  let status: string;
  if (state.winner === 0) status = "You win! All 4 pegs home.";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is popping…`;
  else if (canRoll) status = "Pop the bubble to roll the die!";
  else status = `You rolled ${state.die} — pick a peg to move.`;

  const humanRank = state.finishOrder.indexOf(0);
  const finalScore = terminal?.score ?? null;

  return (
    <div className="tf-game fade-in">
      <div
        className={`tf-status pulse ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}
        data-testid="trouble-full-status"
      >
        {status}
      </div>

      <div className="tf-die-row">
        {state.die > 0 && (
          <div className="tf-die" aria-label={`Die showing ${state.die}`}>{state.die}</div>
        )}
        {canRoll && (
          <button
            type="button"
            className="tf-pop"
            data-testid="trouble-full-pop"
            onClick={() => dispatch({ type: "roll" } satisfies TroubleFullAction)}
            title="Pop the bubble — roll the die"
            aria-label="Pop the bubble to roll the die"
          >
            Pop!
          </button>
        )}
        {canPickMove && !state.pawns[0]!.some((_, i) => canMove(state.pawns, 0, i, state.die)) && (
          <button
            type="button"
            className="tf-pass"
            data-testid="trouble-full-pass"
            onClick={() => dispatch({ type: "pass" } satisfies TroubleFullAction)}
            title="Pass — no legal move"
          >
            Pass turn
          </button>
        )}
      </div>

      <div className="tf-players">
        {Array.from({ length: state.numPlayers }, (_, pi) => {
          const pawnRow = state.pawns[pi]!;
          const finishedCount = pawnRow.filter((p) => p === FINISH).length;
          const yardCount = pawnRow.filter((p) => p === YARD).length;
          return (
            <div
              key={pi}
              className={`tf-panel color-${COLORS[pi]} ${state.turn === pi && state.winner === null ? "active" : ""}`}
              data-testid={`trouble-full-panel-${pi}`}
            >
              <div className="tf-panel-head">
                <span className="tf-panel-label">{LABELS[pi]}</span>
                <span className="tf-panel-meta">
                  {finishedCount}/4 home
                  {yardCount > 0 && ` • ${yardCount} in base`}
                </span>
              </div>
              <div className="tf-pawns">
                {pawnRow.map((pos, pawnIdx) => {
                  const moveable =
                    canPickMove && pi === 0 && canMove(state.pawns, 0, pawnIdx, state.die);
                  const colorClass = `color-${COLORS[pi]}`;
                  return (
                    <div key={pawnIdx} className="tf-pawn-row">
                      <span
                        className={`tf-peg ${colorClass} ${pos === FINISH ? "is-finish" : ""} ${pos === YARD ? "is-yard" : ""}`}
                        aria-label={`Peg ${pawnIdx + 1} of player ${LABELS[pi]} at ${describePeg(pos)}`}
                      >
                        {pos === YARD ? "B" : pos === FINISH ? "F" : pawnIdx + 1}
                      </span>
                      <span className="tf-peg-pos">{describePeg(pos)}</span>
                      {moveable && (
                        <button
                          type="button"
                          className="tf-move"
                          data-testid={`trouble-full-move-${pawnIdx}`}
                          onClick={() =>
                            dispatch({ type: "move", pawn: pawnIdx } satisfies TroubleFullAction)
                          }
                          title={`Move peg ${pawnIdx + 1} by ${state.die}`}
                        >
                          Move
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {state.winner !== null && (
        <div className="tf-end bounce-in" data-testid="trouble-full-end">
          <div className="tf-end-title">
            {state.winner === 0 ? "You finished first!" : `${LABELS[state.winner]} got home first.`}
          </div>
          {humanRank !== -1 ? (
            <div className="tf-end-sub">Your rank: {humanRank + 1} / {state.numPlayers}</div>
          ) : (
            <div className="tf-end-sub">Game over — finish next time!</div>
          )}
          {finalScore !== null && (
            <div className="tf-end-score">Score: {finalScore}</div>
          )}
        </div>
      )}

      <div className="tf-legend">
        Roll 6 to enter a peg. Land on a foe to bump them back. Exact roll to finish. All 4 pegs home wins.
      </div>
    </div>
  );
}
