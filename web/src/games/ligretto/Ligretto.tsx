import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LigrettoState, LigrettoSettings, LiCard, LiColor } from "./state.js";
import { isTerminal, canToCenter } from "./state.js";
import "./Ligretto.css";

type LigrettoAction =
  | { type: "play-ligretto-to-center" }
  | { type: "play-row-to-center"; rowIdx: number }
  | { type: "play-hand-to-center" }
  | { type: "play-ligretto-to-row"; rowIdx: number }
  | { type: "flip-hand" }
  | { type: "bot-tick" }
  | { type: "restart" };

function LiCardView({ card, selected, onClick, empty }: { card?: LiCard | null; selected?: boolean; onClick?: () => void; empty?: boolean }) {
  if (empty || !card) {
    return <div className="lig-card empty" onClick={onClick}>—</div>;
  }
  return (
    <div className={`lig-card ${card.color}${selected ? " selected" : ""}`} onClick={onClick}>
      {card.rank}
    </div>
  );
}

const COLORS: LiColor[] = ["red", "blue", "green", "yellow"];

export function Ligretto({ state, dispatch, onGameOver }: GameProps<LigrettoState, LigrettoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      tickRef.current = setInterval(() => dispatch({ type: "bot-tick" } as LigrettoAction), 700);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  function dis(a: LigrettoAction) { dispatch(a); }

  const ligTop = state.playerLigretto[state.playerLigretto.length - 1] ?? null;

  return (
    <div className="ligretto-game">
      <div className="lig-title">Ligretto</div>
      <div className="lig-status">
        Your Ligretto: <strong>{state.playerLigretto.length}</strong> | Bot: <strong>{state.botLigretto.length}</strong>
      </div>

      {terminal && (
        <div className="lig-game-over">
          {state.winner === "player" ? "You win!" : "Bot wins!"} — Score: {terminal.score}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "700px" }}>
        <div className="lig-label">Center Piles (1→10 same color)</div>
        <div className="lig-center-piles">
          {COLORS.map(color => {
            const pile = state.centerPiles[color] ?? [];
            const top = pile[pile.length - 1] ?? null;
            return (
              <div key={color} className={`lig-card ${color}`} style={{ opacity: top ? 1 : 0.4 }}>
                {top ? top.rank : "1"}
              </div>
            );
          })}
          <div className="lig-hint" style={{ alignSelf: "center", marginLeft: "0.5rem" }}>
            Click card then click "→ Center" to play
          </div>
        </div>
      </div>

      <div className="lig-player-area">
        <div className="lig-half">
          <div className="lig-label">Your Area</div>
          <div className="lig-row">
            <div>
              <div className="lig-label">Ligretto ({state.playerLigretto.length})</div>
              <LiCardView card={ligTop} onClick={() => {
                if (ligTop && canToCenter(ligTop, state.centerPiles)) dis({ type: "play-ligretto-to-center" });
              }} />
            </div>
            <div>
              <div className="lig-label">Row</div>
              <div className="lig-row">
                {state.playerRow.map((card, i) => (
                  <LiCardView key={i} card={card} onClick={() => {
                    if (card && canToCenter(card, state.centerPiles)) dis({ type: "play-row-to-center", rowIdx: i });
                    else if (!card && ligTop) dis({ type: "play-ligretto-to-row", rowIdx: i });
                  }} />
                ))}
              </div>
            </div>
            <div>
              <div className="lig-label">Hand ({state.playerHand.length})</div>
              <div className="lig-row">
                {state.playerHand.length > 0
                  ? <div className="lig-card facedown" onClick={() => dis({ type: "flip-hand" })}>{state.playerHand.length}</div>
                  : <div className="lig-card empty" onClick={() => dis({ type: "flip-hand" })}>↺</div>
                }
                {state.playerHandTop
                  ? <LiCardView card={state.playerHandTop} onClick={() => {
                      if (canToCenter(state.playerHandTop!, state.centerPiles)) dis({ type: "play-hand-to-center" });
                    }} />
                  : <div className="lig-card empty">—</div>
                }
              </div>
            </div>
          </div>
          <div className="lig-hint">
            Click Ligretto top / Row card / Hand card to play to center if valid.
            Click empty Row slot to move Ligretto there.
          </div>
        </div>

        <div className="lig-half" style={{ opacity: 0.8 }}>
          <div className="lig-label">Bot Area</div>
          <div className="lig-row">
            <div className="lig-card facedown">{state.botLigretto.length}</div>
            {state.botRow.map((card, i) => (
              <LiCardView key={i} card={card} />
            ))}
          </div>
        </div>
      </div>

      {terminal && (
        <button data-testid="hint-target-ligretto-action" className="lig-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
