import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LudoState, LudoSettings } from "./state.js";
import type { LudoAction } from "./state.js";
import { isTerminal, HOME_POS, YARD, NUM_PAWNS } from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Ludo({
  state,
  dispatch,
  onGameOver,
}: GameProps<LudoState, LudoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canRoll = isMyTurn && state.phase === "rolling";
  const canMove = isMyTurn && state.phase === "moving";

  let status = "";
  if (state.winner === 0) status = "You win!";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is rolling…`;
  else if (canRoll) status = "Roll the die!";
  else status = `Rolled ${state.die} — click a pawn to move.`;

  return (
    <div className="ludo">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      <div className="ludo-die-row">
        {state.die > 0 && (
          <div className="die-face">{state.die}</div>
        )}
        {canRoll && (
          <button className="roll-btn" onClick={() => dispatch({ type: "roll" } satisfies LudoAction)}>
            Roll Die
          </button>
        )}
      </div>

      <div className="ludo-players">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div
            key={pi}
            className={`ludo-player-panel color-${COLORS[pi]} ${state.turn === pi && !state.winner ? "active-turn" : ""}`}
          >
            <div className="player-label">{LABELS[pi]}</div>
            <div className="pawn-list">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const moveable = canMove && pi === 0 && pos !== HOME_POS && (pos === YARD ? state.die === 6 : pos + state.die <= HOME_POS);
                const label = pos === YARD ? "Yard" : pos === HOME_POS ? "Home" : `Sq ${pos}`;
                return (
                  <div key={pawnIdx} className="pawn-entry">
                    <span className={`pawn-token color-${COLORS[pi]} ${pos === HOME_POS ? "finished" : ""}`}>
                      {pos === YARD ? "Y" : pos === HOME_POS ? "H" : pawnIdx + 1}
                    </span>
                    <span className="pawn-pos">{label}</span>
                    {moveable && (
                      <button className="move-btn" onClick={() => dispatch({ type: "move", pawn: pawnIdx } satisfies LudoAction)}>
                        Move
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="race-legend">
        Roll 6 to bring a pawn out. Roll 6 again for a bonus turn. Land on foe to send home. First with all 4 home wins!
      </div>
    </div>
  );
}
