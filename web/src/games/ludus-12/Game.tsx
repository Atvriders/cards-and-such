import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Ludus12State, Ludus12Settings, Ludus12Action } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function Ludus12Game({ state, dispatch, onGameOver }: GameProps<Ludus12State, Ludus12Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const moves = state.turn === "P" && state.phase === "moving" ? legalMoves(state, "P") : [];
  const movesByFrom = new Map<number, number[]>();
  for (const m of moves) {
    if (!movesByFrom.has(m.from)) movesByFrom.set(m.from, []);
    movesByFrom.get(m.from)!.push(m.pips);
  }

  const isPTurn = state.turn === "P";
  const halfA = Math.floor(POINTS / 2);

  if (state.phase === "done") {
    const won = state.winner === "P";
    return (
      <div className="ludus12-wrap">
        <h2 className={`ludus12-banner ${won ? "ludus12-win" : "ludus12-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="ludus12-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`ludus12-point ${i % 2 === 0 ? "ludus12-even" : "ludus12-odd"}`}>
        <div className="ludus12-point-num">{i + 1}</div>
        <div className="ludus12-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="ludus12-chk ludus12-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="ludus12-chk ludus12-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="ludus12-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="ludus12-movehint">
            {myMoves.map((pips, k) => (
              <button data-testid="hint-target-ludus-12-move"
                key={k}
                className="ludus12-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as Ludus12Action)}
              >
                +{pips}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ludus12-wrap">
      <div className="ludus12-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="ludus12-meta">
        <span className="ludus12-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="ludus12-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="ludus12-info">P bar: {state.pBar}</span>
            <span className="ludus12-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="ludus12-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="ludus12-info">No-hit (block)</span>}
        {THREE_DICE && <span className="ludus12-info">3 dice</span>}
      </div>
      <div className="ludus12-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="ludus12-die">{d}</div>
        )) : <div className="ludus12-die ludus12-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button data-testid="hint-target-ludus-12-roll" className="ludus12-btn ludus12-btn-roll" onClick={() => dispatch({ type: "roll" } as Ludus12Action)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button data-testid="hint-target-ludus-12-endTurn" className="ludus12-btn ludus12-btn-end" onClick={() => dispatch({ type: "endTurn" } as Ludus12Action)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="ludus12-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="ludus12-board">
        <div className="ludus12-half ludus12-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="ludus12-half ludus12-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="ludus12-bar">
          {state.pBar > 0 && <span className="ludus12-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="ludus12-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="ludus12-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
