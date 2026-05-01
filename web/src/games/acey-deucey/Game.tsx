import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AceyState, AceySettings, AceyAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function AceyGame({ state, dispatch, onGameOver }: GameProps<AceyState, AceySettings>): JSX.Element {
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
      <div className="acey-d-wrap">
        <h2 className={`acey-d-banner ${won ? "acey-d-win" : "acey-d-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="acey-d-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`acey-d-point ${i % 2 === 0 ? "acey-d-even" : "acey-d-odd"}`}>
        <div className="acey-d-point-num">{i + 1}</div>
        <div className="acey-d-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="acey-d-chk acey-d-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="acey-d-chk acey-d-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="acey-d-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="acey-d-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="acey-d-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as AceyAction)}
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
    <div className="acey-d-wrap">
      <div className="acey-d-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="acey-d-meta">
        <span className="acey-d-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="acey-d-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="acey-d-info">P bar: {state.pBar}</span>
            <span className="acey-d-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="acey-d-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="acey-d-info">No-hit (block)</span>}
        {THREE_DICE && <span className="acey-d-info">3 dice</span>}
      </div>
      <div className="acey-d-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="acey-d-die">{d}</div>
        )) : <div className="acey-d-die acey-d-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="acey-d-btn acey-d-btn-roll" onClick={() => dispatch({ type: "roll" } as AceyAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="acey-d-btn acey-d-btn-end" onClick={() => dispatch({ type: "endTurn" } as AceyAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="acey-d-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="acey-d-board">
        <div className="acey-d-half acey-d-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="acey-d-half acey-d-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="acey-d-bar">
          {state.pBar > 0 && <span className="acey-d-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="acey-d-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="acey-d-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
