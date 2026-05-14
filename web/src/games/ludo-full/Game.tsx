import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LudoFullState, LudoFullSettings, LudoFullAction } from "./state.js";
import {
  isTerminal,
  HOME_CENTER,
  YARD,
  NUM_PAWNS,
  NUM_PLAYERS,
  TRACK_SIZE,
  canMove,
} from "./state.js";
import "./Game.css";

const COLORS = ["red", "blue", "green", "yellow"] as const;
const LABELS = ["You (Red)", "Blue CPU", "Green CPU", "Yellow CPU"] as const;

function describePos(pos: number): string {
  if (pos === YARD) return "Yard";
  if (pos === HOME_CENTER) return "Home";
  if (pos >= TRACK_SIZE) return `Col ${pos - TRACK_SIZE + 1}`;
  return `Sq ${pos + 1}`;
}

export function LudoFull({
  state,
  dispatch,
  onGameOver,
}: GameProps<LudoFullState, LudoFullSettings>): JSX.Element {
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
  const isMoving = isMyTurn && state.phase === "moving";

  let status: string;
  if (state.winner === 0) status = "Victory! All four pawns home.";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins.`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is taking a turn…`;
  else if (canRoll) status = "Roll the die.";
  else status = `Rolled ${state.die} — pick a pawn to move.`;

  return (
    <div className="ludo-full fade-in">
      <div
        className={`lf-status pulse ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}
        data-testid="ludo-full-status"
      >
        {status}
      </div>

      <div className="lf-die-row">
        <div
          className="lf-die"
          data-testid="ludo-full-die"
          aria-label={state.die > 0 ? `Die showing ${state.die}` : "Die not yet rolled"}
        >
          {state.die > 0 ? state.die : "·"}
        </div>
        <button
          className="lf-roll-btn"
          data-testid="ludo-full-roll"
          onClick={() => dispatch({ type: "roll" } satisfies LudoFullAction)}
          disabled={!canRoll}
          title="Roll the six-sided die"
          aria-label="Roll the die"
        >
          Roll
        </button>
        <div className="lf-streak" title="Consecutive sixes (three in a row forfeits the turn)">
          6s: {state.sixStreak}/3
        </div>
      </div>

      <div className="lf-players">
        {Array.from({ length: NUM_PLAYERS }, (_, pi) => (
          <div
            key={pi}
            className={`lf-player color-${COLORS[pi]} ${state.turn === pi && state.winner === null ? "active" : ""}`}
            data-testid={`ludo-full-player-${pi}`}
          >
            <div className="lf-player-label">{LABELS[pi]}</div>
            <div className="lf-pawns">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const moveable = isMoving && pi === 0 && canMove(state.pawns, 0, pawnIdx, state.die);
                return (
                  <div key={pawnIdx} className="lf-pawn-row">
                    <span
                      className={`lf-token color-${COLORS[pi]} ${pos === HOME_CENTER ? "finished" : ""}`}
                      aria-label={`Pawn ${pawnIdx + 1}`}
                    >
                      {pos === YARD ? "Y" : pos === HOME_CENTER ? "H" : pawnIdx + 1}
                    </span>
                    <span className="lf-pos">{describePos(pos)}</span>
                    <button
                      className="lf-move-btn"
                      onClick={() =>
                        dispatch({ type: "move", pawn: pawnIdx } satisfies LudoFullAction)
                      }
                      disabled={!moveable}
                      data-testid={`ludo-full-move-${pi}-${pawnIdx}`}
                      title={`Move pawn ${pawnIdx + 1}`}
                      aria-label={`Move pawn ${pawnIdx + 1}`}
                    >
                      Move
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {state.winner !== null && (
        <div className="lf-done bounce-in" data-testid="ludo-full-done">
          {state.winner === 0 ? "You won the race!" : `${LABELS[state.winner]} wins this round.`}
        </div>
      )}

      <div className="lf-legend">
        Roll 6 to release a pawn. Roll 6 again for a bonus turn (three sixes forfeits!). Land on
        a foe to send it home unless they sit on a safe square. Reach the centre with an exact roll.
        First with all {NUM_PAWNS} pawns home wins!
      </div>
    </div>
  );
}
