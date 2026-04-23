import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LCRState, LCRSettings, LCRFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PLAYER_LABELS = ["You", "Bot A", "Bot B"];
const FACE_LABELS: Record<LCRFace, string> = { L: "L", C: "C", R: "R", "*": "*" };
const FACE_CLASS: Record<LCRFace, string> = { L: "face-l", C: "face-c", R: "face-r", "*": "face-dot" };

export function LCRGame({ state, dispatch, onGameOver }: GameProps<LCRState, LCRSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.currentPlayer === 0 && state.winner === null;

  return (
    <div className="lcr">
      <div className="lcr-header">
        <span>Pot: {state.pot} chips</span>
        {state.winner !== null && (
          <span className="lcr-winner">{PLAYER_LABELS[state.winner]} wins!</span>
        )}
      </div>

      <div className="lcr-players">
        {([0, 1, 2] as const).map((p) => (
          <div key={p} className={`lcr-player ${state.currentPlayer === p ? "active" : ""} ${state.winner === p ? "winner" : ""}`}>
            <div className="lcr-player-label">{PLAYER_LABELS[p]}</div>
            <div className="lcr-chips">
              {Array.from({ length: state.chips[p]! }, (_, i) => (
                <span key={i} className="lcr-chip" />
              ))}
              {state.chips[p] === 0 && <span className="lcr-out">out</span>}
            </div>
            <div className="lcr-chip-count">{state.chips[p]} chips</div>
          </div>
        ))}
      </div>

      {state.dice.length > 0 && (
        <div className="lcr-dice">
          {state.dice.map((face, i) => (
            <div key={i} className={`lcr-die ${FACE_CLASS[face]}`}>{FACE_LABELS[face]}</div>
          ))}
        </div>
      )}

      <div className="lcr-controls">
        {isHumanTurn && state.phase === "rolling" && (
          <button onClick={() => dispatch({ type: "roll" })}>Roll Dice</button>
        )}
        {isHumanTurn && state.phase === "result" && state.winner === null && (
          <button onClick={() => dispatch({ type: "confirm" })}>Next Turn</button>
        )}
        {!isHumanTurn && state.winner === null && (
          <div className="lcr-waiting">{PLAYER_LABELS[state.currentPlayer]} is rolling…</div>
        )}
      </div>

      <div className="lcr-legend">
        L = pass left · C = center pot · R = pass right · * = keep
      </div>
    </div>
  );
}
