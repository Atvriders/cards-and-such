import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjState, AtlanticCityBjAction, AtlanticCityBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function AtlanticCityBjGame({ state, dispatch, onGameOver }: GameProps<AtlanticCityBjState, AtlanticCityBjSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ac-bj-wrap"><div className="ac-bj-done"><h2>Done!</h2><div className="ac-bj-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="ac-bj-wrap">
      <div className="ac-bj-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ac-bj-score">{state.score} pts</div>
      <div className="ac-bj-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="ac-bj-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="ac-bj-card black">??</div>
          : <div key={i} className={`ac-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="ac-bj-info">You ({state.yourTotal}):</div>
      <div className="ac-bj-row">{state.you.map((c, i) => <div key={i} className={`ac-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="ac-bj-row">
        <button data-testid="hint-target-atlantic-city-bj-hit" className="ac-bj-btn" onClick={() => dispatch({ type: "hit" } as AtlanticCityBjAction)}>Hit</button>
        <button data-testid="hint-target-atlantic-city-bj-stand" className="ac-bj-btn alt" onClick={() => dispatch({ type: "stand" } as AtlanticCityBjAction)}>Stand</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="ac-bj-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-atlantic-city-bj-next" className="ac-bj-btn alt" onClick={() => dispatch({ type: "next" } as AtlanticCityBjAction)}>Next</button>
      </>}
    </div>
  );
}
