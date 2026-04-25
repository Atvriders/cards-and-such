import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFlipThreeState, CardFlipThreeSettings } from "./state.js";
import { isTerminal, cardRank, cardSuit, SUIT_SYMS, RANK_NAMES } from "./state.js";
import "./CardFlipThree.css";

export function CardFlipThree({ state, dispatch, onGameOver }: GameProps<CardFlipThreeState, CardFlipThreeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="cft-wrap">
      <div className="cft-info">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
      </div>
      {state.phase !== "gameover" ? (
        <>
          <div className="cft-hand">
            {state.hand.map((card, i) => {
              const revealed = state.revealed[i];
              const rank = cardRank(card);
              const suit = cardSuit(card);
              const isRed = suit === 1 || suit === 2;
              return (
                <div
                  key={i}
                  className={`cft-card${revealed ? " revealed" + (isRed ? " red" : " black") : ""}`}
                  onClick={() => dispatch({ type: "flip", index: i })}
                >
                  {revealed ? `${RANK_NAMES[rank]}${SUIT_SYMS[suit]}` : "?"}
                </div>
              );
            })}
          </div>
          {state.revealed.every(Boolean) && (
            <button className="cft-next" onClick={() => dispatch({ type: "next" })}>
              {state.round < state.totalRounds ? "Next Round" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="cft-done">
          <h2>Game Over!</h2>
          <div className="cft-final">Final Score: {state.score}</div>
        </div>
      )}
    </div>
  );
}
