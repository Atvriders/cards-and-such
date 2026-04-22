import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TroubleState, TroubleSettings } from "./state.js";
import type { TroubleAction } from "./state.js";
import { isTerminal, HOME_POS, YARD, NUM_PAWNS } from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Trouble({
  state,
  dispatch,
  onGameOver,
}: GameProps<TroubleState, TroubleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canRoll = isMyTurn && state.phase === "rolling";
  const canMove = isMyTurn && state.phase === "moving";

  let status = "";
  if (state.winner === 0) status = "You win!";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is popping…`;
  else if (canRoll) status = "Pop the bubble!";
  else status = `Rolled ${state.die} — click a pawn to move.`;

  return (
    <div className="trouble-game">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      <div className="trouble-die-row">
        {state.die > 0 && (
          <div className="die-face pop-die">{state.die}</div>
        )}
        {canRoll && (
          <button className="pop-btn" onClick={() => dispatch({ type: "roll" } satisfies TroubleAction)}>
            🫧 Pop!
          </button>
        )}
      </div>

      <div className="trouble-players">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div key={pi} className={`player-panel color-${COLORS[pi]} ${state.turn === pi && !state.winner ? "active-turn" : ""}`}>
            <div className="player-label">{LABELS[pi]}</div>
            <div className="pawn-list">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const moveable = canMove && pi === 0 && pos !== HOME_POS && (pos === YARD ? state.die === 6 : pos + state.die <= HOME_POS);
                const label = pos === YARD ? "Home Base" : pos === HOME_POS ? "Finish" : `Sq ${pos}`;
                return (
                  <div key={pawnIdx} className="pawn-entry">
                    <span className={`pawn-token color-${COLORS[pi]} ${pos === HOME_POS ? "finished" : ""}`}>
                      {pos === YARD ? "B" : pos === HOME_POS ? "F" : pawnIdx + 1}
                    </span>
                    <span className="pawn-pos">{label}</span>
                    {moveable && (
                      <button className="move-btn" onClick={() => dispatch({ type: "move", pawn: pawnIdx } satisfies TroubleAction)}>
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
        Pop to roll. Roll 6 to bring a pawn out. Roll 6 again for a bonus turn. Land on foe to send them back!
      </div>
    </div>
  );
}
