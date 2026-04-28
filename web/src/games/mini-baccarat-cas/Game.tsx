import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratCasState, MiniBaccaratCasAction, MiniBaccaratCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function MiniBaccaratCasGame({ state, dispatch, onGameOver }: GameProps<MiniBaccaratCasState, MiniBaccaratCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.phase === "bet" && <>
        <div className="dm-info">Choose your bet:</div>
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type: "bet", side: "player" } as MiniBaccaratCasAction)}>Player</button>
          <button className="dm-btn" onClick={() => dispatch({ type: "bet", side: "banker" } as MiniBaccaratCasAction)}>Banker</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "bet", side: "tie" } as MiniBaccaratCasAction)}>Tie</button>
        </div>
      </>}
      {state.phase === "scored" && <>
        <div className="dm-info">Player:</div>
        <div className="dm-row">{state.player.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
        <div className="dm-info">Banker:</div>
        <div className="dm-row">{state.banker.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
        <div className="dm-result">{state.result} — +{state.pts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as MiniBaccaratCasAction)}>Next</button>
      </>}
    </div>
  );
}
