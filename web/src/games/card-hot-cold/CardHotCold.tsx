import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardHotColdState, CardHotColdSettings } from "./state.js";
import { isTerminal, cardRank, cardSuit, RANK_NAMES, SUIT_SYMS, isHot } from "./state.js";
import "./CardHotCold.css";

export function CardHotCold({ state, dispatch, onGameOver }: GameProps<CardHotColdState, CardHotColdSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const suit = cardSuit(state.current);
  const red = suit === 1 || suit === 2;
  const targetRevealed = state.phase === "revealed";
  const tSuit = cardSuit(state.target);
  const tRed = tSuit === 1 || tSuit === 2;
  const correct = state.guess !== null && (state.guess === "hot") === isHot(state.target);
  return (
    <div className="chc-wrap">
      <div className="chc-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {!terminal ? (
        <>
          <p style={{margin:0,color:"#555",fontSize:".9rem"}}>Hot = 7 or above | Cold = 6 or below</p>
          <div className="chc-cards">
            <div className={`chc-card ${red ? "red" : "black"}`}>{RANK_NAMES[cardRank(state.current)]}{SUIT_SYMS[suit]}</div>
            <span style={{fontSize:"1.5rem"}}>→</span>
            {targetRevealed
              ? <div className={`chc-card ${tRed ? "red" : "black"}`}>{RANK_NAMES[cardRank(state.target)]}{SUIT_SYMS[tSuit]}</div>
              : <div className="chc-card hidden">?</div>}
          </div>
          {state.phase === "playing" && (
            <div className="chc-btns">
              <button className="chc-btn hot" onClick={() => dispatch({ type: "guess", choice: "hot" })}>Hot 🔥</button>
              <button className="chc-btn cold" onClick={() => dispatch({ type: "guess", choice: "cold" })}>Cold ❄️</button>
            </div>
          )}
          {state.phase === "revealed" && (
            <>
              <div className={`chc-result ${correct ? "win" : "loss"}`}>{correct ? "+10 Correct!" : "Wrong!"}</div>
              <button className="chc-next" onClick={() => dispatch({ type: "next" })}>{state.round < state.totalRounds ? "Next" : "Finish"}</button>
            </>
          )}
        </>
      ) : (
        <div className="chc-done"><h2>Game Over!</h2><div className="chc-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}
