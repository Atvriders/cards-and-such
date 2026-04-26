import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSnapPairState, CardSnapPairAction, CardSnapPairSettings } from "./state.js";
import { isTerminal, rankName, suitName } from "./state.js";
import "./Game.css";

export function CardSnapPairGame({ state, dispatch, onGameOver }: GameProps<CardSnapPairState, CardSnapPairSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Score: {state.score}</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.score} pts</span></div>
      {state.phase === "waiting" && <><p>Snap two cards — if they match rank, score 20! Otherwise 5.</p><button className="cm-btn" onClick={() => dispatch({ type:"snap" } as CardSnapPairAction)}>Snap!</button></>}
      {state.phase === "revealed" && state.card1 !== null && state.card2 !== null && <>
        <div className="cm-cards">
          <div className={`cm-card ${Math.floor(state.card1/13)===1||Math.floor(state.card1/13)===2?"red":""}`}>{rankName(state.card1)}{suitName(state.card1)}</div>
          <div className={`cm-card ${Math.floor(state.card2/13)===1||Math.floor(state.card2/13)===2?"red":""}`}>{rankName(state.card2)}{suitName(state.card2)}</div>
        </div>
        <div className="cm-result">{state.matched ? "SNAP! Pair! +20" : "No match. +5"}</div>
        <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardSnapPairAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
