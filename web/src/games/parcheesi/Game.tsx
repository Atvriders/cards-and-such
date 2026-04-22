import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParcheesiState, ParcheesiSettings } from "./state.js";
import type { ParcheesiAction } from "./state.js";
import { isTerminal, TRACK_SIZE, HOME_SQUARE, YARD, NUM_PAWNS } from "./state.js";
import "./Game.css";

const PLAYER_COLORS = ["blue", "red", "green", "orange"];
const PLAYER_LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Parcheesi({
  state,
  dispatch,
  onGameOver,
}: GameProps<ParcheesiState, ParcheesiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canRoll = isMyTurn && state.phase === "rolling";
  const canMove = isMyTurn && state.phase === "moving";

  function handleMove(pawn: number, dieIndex: number) {
    dispatch({ type: "move", pawn, dieIndex } satisfies ParcheesiAction);
  }

  let status = "";
  if (state.winner === 0) status = "You win!";
  else if (state.winner !== null) status = `Bot ${state.winner} wins!`;
  else if (!isMyTurn) status = `${PLAYER_LABELS[state.turn]} is moving…`;
  else if (canRoll) status = "Roll the dice!";
  else status = "Click a pawn to move (select die).";

  // For each unused die, find which pawns can use it
  function pawnsForDie(di: number): boolean[] {
    if (!canMove || state.usedDice[di]) return new Array(NUM_PAWNS).fill(false);
    return state.pawns[0]!.map((_, pi) => {
      const p = state.pawns[0]![pi]!;
      if (p === HOME_SQUARE) return false;
      if (p === YARD) return state.dice[di] === 5;
      return p + state.dice[di]! <= HOME_SQUARE;
    });
  }

  return (
    <div className="parcheesi">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      {/* Dice display */}
      <div className="parcheesi-dice">
        {state.dice.map((d, di) => (
          <div
            key={di}
            className={`die-face ${state.usedDice[di] ? "used" : ""}`}
            aria-label={`Die ${di + 1}: ${d}`}
          >
            {d}
          </div>
        ))}
        {canRoll && (
          <button
            className="roll-btn"
            onClick={() => dispatch({ type: "roll" } satisfies ParcheesiAction)}
          >
            Roll Dice
          </button>
        )}
      </div>

      {/* Player panels */}
      <div className="parcheesi-players">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div
            key={pi}
            className={`player-panel color-${PLAYER_COLORS[pi]} ${state.turn === pi && !state.winner ? "active-turn" : ""}`}
          >
            <div className="player-label">{PLAYER_LABELS[pi]}</div>
            <div className="pawn-list">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const canUse0 = pi === 0 && pawnsForDie(0)[pawnIdx];
                const canUse1 = pi === 0 && pawnsForDie(1)[pawnIdx];
                const posLabel =
                  pos === YARD ? "Yard" : pos === HOME_SQUARE ? "Home" : `Sq ${pos}`;
                return (
                  <div key={pawnIdx} className="pawn-entry">
                    <span
                      className={`pawn-token color-${PLAYER_COLORS[pi]} ${pos === HOME_SQUARE ? "finished" : ""}`}
                    >
                      {pos === YARD ? "Y" : pos === HOME_SQUARE ? "H" : pawnIdx + 1}
                    </span>
                    <span className="pawn-pos">{posLabel}</span>
                    {canUse0 && (
                      <button className="move-btn" onClick={() => handleMove(pawnIdx, 0)}>
                        +{state.dice[0]}
                      </button>
                    )}
                    {canUse1 && (
                      <button className="move-btn" onClick={() => handleMove(pawnIdx, 1)}>
                        +{state.dice[1]}
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
        Need die=5 to enter. Land on foe to send home. Safe squares: 0,8,13,21,26,34,39,47. First to bring all 4 home wins!
      </div>
    </div>
  );
}
