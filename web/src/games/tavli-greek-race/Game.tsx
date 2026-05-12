import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TavliGrState, TavliGrSettings, TavliGrAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function TavliGrGame({ state, dispatch, onGameOver }: GameProps<TavliGrState, TavliGrSettings>): JSX.Element {
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
      <div className="tavli-wrap">
        <h2 className={`tavli-banner ${won ? "tavli-win" : "tavli-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="tavli-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`tavli-point ${i % 2 === 0 ? "tavli-even" : "tavli-odd"}`}>
        <div className="tavli-point-num">{i + 1}</div>
        <div className="tavli-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="tavli-chk tavli-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="tavli-chk tavli-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="tavli-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="tavli-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="tavli-movebtn"
                title="Move checker"
                onClick={() => dispatch({ type: "move", from: i, pips } as TavliGrAction)}
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
    <div className="tavli-wrap">
      <div className="tavli-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="tavli-meta">
        <span className="tavli-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="tavli-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="tavli-info">P bar: {state.pBar}</span>
            <span className="tavli-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="tavli-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="tavli-info">No-hit (block)</span>}
        {THREE_DICE && <span className="tavli-info">3 dice</span>}
      </div>
      <div className="tavli-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="tavli-die">{d}</div>
        )) : <div className="tavli-die tavli-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="tavli-btn tavli-btn-roll" onClick={() => dispatch({ type: "roll" } as TavliGrAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="tavli-btn tavli-btn-end" onClick={() => dispatch({ type: "endTurn" } as TavliGrAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="tavli-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="tavli-board">
        <div className="tavli-half tavli-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="tavli-half tavli-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="tavli-bar">
          {state.pBar > 0 && <span className="tavli-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="tavli-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="tavli-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
