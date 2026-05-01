import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HyperState, HyperSettings, HyperAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function HyperGame({ state, dispatch, onGameOver }: GameProps<HyperState, HyperSettings>): JSX.Element {
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
      <div className="hyper-bg-wrap">
        <h2 className={`hyper-bg-banner ${won ? "hyper-bg-win" : "hyper-bg-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="hyper-bg-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`hyper-bg-point ${i % 2 === 0 ? "hyper-bg-even" : "hyper-bg-odd"}`}>
        <div className="hyper-bg-point-num">{i + 1}</div>
        <div className="hyper-bg-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="hyper-bg-chk hyper-bg-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="hyper-bg-chk hyper-bg-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="hyper-bg-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="hyper-bg-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="hyper-bg-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as HyperAction)}
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
    <div className="hyper-bg-wrap">
      <div className="hyper-bg-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="hyper-bg-meta">
        <span className="hyper-bg-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="hyper-bg-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="hyper-bg-info">P bar: {state.pBar}</span>
            <span className="hyper-bg-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="hyper-bg-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="hyper-bg-info">No-hit (block)</span>}
        {THREE_DICE && <span className="hyper-bg-info">3 dice</span>}
      </div>
      <div className="hyper-bg-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="hyper-bg-die">{d}</div>
        )) : <div className="hyper-bg-die hyper-bg-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="hyper-bg-btn hyper-bg-btn-roll" onClick={() => dispatch({ type: "roll" } as HyperAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="hyper-bg-btn hyper-bg-btn-end" onClick={() => dispatch({ type: "endTurn" } as HyperAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="hyper-bg-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="hyper-bg-board">
        <div className="hyper-bg-half hyper-bg-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="hyper-bg-half hyper-bg-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="hyper-bg-bar">
          {state.pBar > 0 && <span className="hyper-bg-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="hyper-bg-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="hyper-bg-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
