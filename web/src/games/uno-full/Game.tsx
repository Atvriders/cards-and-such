import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  UnoFullState,
  UnoFullAction,
  UnoFullSettings,
  UnoCard,
  UnoColor,
} from "./state.js";
import { isPlayable, isTerminal, isWild } from "./state.js";
import "./Game.css";

type Props = GameProps<UnoFullState, UnoFullSettings>;

const COLOR_NAMES: Record<UnoColor, string> = {
  R: "Red",
  Y: "Yellow",
  G: "Green",
  B: "Blue",
};

const COLOR_HEX: Record<UnoColor, string> = {
  R: "#d63a3a",
  Y: "#e2b400",
  G: "#2e9d4a",
  B: "#2b7bd1",
};

function CardFace({ card }: { card: UnoCard }): JSX.Element {
  const color = card.color;
  const cls = `uf-card uf-card--${color ?? "wild"}`;
  let label: string = card.value;
  if (card.value === "Draw2") label = "+2";
  else if (card.value === "WildD4") label = "+4";
  else if (card.value === "Skip") label = "⊘";
  else if (card.value === "Reverse") label = "⇅";
  else if (card.value === "Wild") label = "★";
  return (
    <div
      className={cls}
      style={color ? { backgroundColor: COLOR_HEX[color] } : undefined}
      aria-label={`${color ? COLOR_NAMES[color] + " " : "Wild "}${card.value}`}
    >
      <span className="uf-card-corner uf-card-corner--tl">{label}</span>
      <span className="uf-card-center">{label}</span>
      <span className="uf-card-corner uf-card-corner--br">{label}</span>
    </div>
  );
}

function CardBack(): JSX.Element {
  return <div className="uf-card uf-card--back" aria-hidden="true" />;
}

export function UnoFullGame(props: Props): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const endedRef = useRef(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const top = state.discard[state.discard.length - 1]!;
  const isMyTurn = state.turn === 0 && state.phase === "playing";
  const myHand = state.hands[0] ?? [];

  const handlePlay = (cardId: string): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "play", cardId });
  };
  const handleDraw = (): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "draw" });
  };
  const handlePass = (): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "passAfterDraw" });
  };
  const handlePickColor = (color: UnoColor): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "pickColor", color });
  };
  const handleCallUno = (): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "callUno" });
  };
  const handleNextRound = (): void => {
    (dispatch as (a: UnoFullAction) => void)({ type: "nextRound" });
  };

  let statusText: string;
  if (state.phase === "gameOver") {
    statusText = state.gameWinner === 0 ? "You won the match!" : `Bot ${state.gameWinner} won the match`;
  } else if (state.phase === "roundOver") {
    statusText = state.roundWinner === 0 ? "You won the round!" : `Bot ${state.roundWinner} won the round`;
  } else if (state.phase === "pickColor") {
    statusText = "Pick a color for your wild";
  } else if (state.turn === 0) {
    statusText = state.drewThisTurn ? "You drew — play it or pass" : "Your turn";
  } else {
    statusText = `Bot ${state.turn} is thinking…`;
  }

  return (
    <div className="uf-wrap fade-in">
      <div className="uf-hud">
        <div className="uf-stat" data-testid="uno-full-status">{statusText}</div>
        <div className="uf-stat">
          Active:&nbsp;
          <span
            className="uf-color-chip"
            style={{ backgroundColor: COLOR_HEX[state.activeColor] }}
          >
            {COLOR_NAMES[state.activeColor]}
          </span>
        </div>
        <div className="uf-stat">
          Dir <b>{state.direction === 1 ? "▶" : "◀"}</b>
        </div>
        <div className="uf-stat">Stock <b>{state.stock.length}</b></div>
        <button
          type="button"
          className="uf-btn uf-btn--ghost"
          onClick={() => setShowRules((v) => !v)}
          title="Show rules summary"
        >
          {showRules ? "Hide rules" : "Rules"}
        </button>
      </div>

      <div className="uf-scoreboard pulse" data-testid="uno-full-scoreboard">
        {state.scores.map((s, i) => (
          <div
            key={i}
            className={`uf-score ${state.turn === i && state.phase === "playing" ? "uf-score--active" : ""}`}
          >
            <span className="uf-score-name">{i === 0 ? "You" : `Bot ${i}`}</span>
            <span className="uf-score-num">{s}</span>
            <span className="uf-score-cards">
              {state.hands[i]!.length} card{state.hands[i]!.length === 1 ? "" : "s"}
              {state.hands[i]!.length === 1 && state.unoCalled[i] ? " · UNO!" : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="uf-bots">
        {state.hands.slice(1).map((h, i) => (
          <div className="uf-bot" key={i}>
            <div className="uf-bot-cards">
              {Array.from({ length: Math.min(h.length, 8) }).map((_, j) => (
                <div key={j} className="uf-bot-card"><CardBack /></div>
              ))}
            </div>
            <div className="uf-bot-label">Bot {i + 1} · {h.length} card{h.length === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>

      <div className="uf-center">
        <div className="uf-discard">
          <div className="uf-discard-label">Top</div>
          <CardFace card={top} />
        </div>
        <div className="uf-actions">
          <button
            type="button"
            data-testid="hint-target-uno-full-draw"
            className="uf-btn uf-btn--primary"
            onClick={handleDraw}
            disabled={!isMyTurn || state.drewThisTurn}
            title="Draw a card from the stock"
          >
            Draw
          </button>
          <button
            type="button"
            data-testid="hint-target-uno-full-pass"
            className="uf-btn"
            onClick={handlePass}
            disabled={!isMyTurn || !state.drewThisTurn}
            title="Pass after drawing an unplayable card"
          >
            Pass
          </button>
          <button
            type="button"
            data-testid="hint-target-uno-full-uno"
            className="uf-btn uf-btn--uno"
            onClick={handleCallUno}
            disabled={myHand.length > 2 || state.unoCalled[0]}
            title="Call UNO when you have one card left"
          >
            UNO!
          </button>
        </div>
      </div>

      <div className="uf-hand">
        <div className="uf-hand-label">Your hand</div>
        <div className="uf-hand-row">
          {myHand.map((card) => {
            const legal = isMyTurn && isPlayable(card, top, state.activeColor);
            return (
              <button
                type="button"
                key={card.id}
                data-testid={`hint-target-uno-full-${card.id}`}
                className={`uf-handslot ${legal ? "uf-handslot--legal" : "uf-handslot--illegal"}`}
                onClick={() => legal && handlePlay(card.id)}
                disabled={!legal}
                title={legal ? "Play this card" : "Not playable"}
                aria-label={`${card.color ?? "Wild"} ${card.value}${legal ? "" : ", not playable"}`}
              >
                <CardFace card={card} />
              </button>
            );
          })}
        </div>
      </div>

      {state.phase === "pickColor" && (
        <div className="uf-overlay">
          <div className="uf-modal bounce-in">
            <h3>Choose a color</h3>
            <div className="uf-color-row">
              {(["R", "Y", "G", "B"] as UnoColor[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  className="uf-color-btn"
                  style={{ backgroundColor: COLOR_HEX[c] }}
                  onClick={() => handlePickColor(c)}
                  title={`Declare ${COLOR_NAMES[c]}`}
                  aria-label={`Declare ${COLOR_NAMES[c]}`}
                >
                  {COLOR_NAMES[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.phase === "roundOver" && (
        <div className="uf-overlay">
          <div className="uf-modal bounce-in">
            <h3>{state.roundWinner === 0 ? "Round won!" : `Bot ${state.roundWinner} won the round`}</h3>
            <table className="uf-result-table">
              <tbody>
                {state.scores.map((s, i) => (
                  <tr key={i}>
                    <td>{i === 0 ? "You" : `Bot ${i}`}</td>
                    <td>{s} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="uf-btn uf-btn--primary"
              onClick={handleNextRound}
              title="Begin the next round"
            >
              Next round
            </button>
          </div>
        </div>
      )}

      {state.phase === "gameOver" && (
        <div className="uf-overlay">
          <div className={`uf-modal bounce-in ${state.gameWinner === 0 ? "uf-modal--win" : "uf-modal--loss"}`}>
            <h3>{state.gameWinner === 0 ? "You won the match!" : `Bot ${state.gameWinner} won the match`}</h3>
            <table className="uf-result-table">
              <tbody>
                {state.scores.map((s, i) => (
                  <tr key={i}>
                    <td>{i === 0 ? "You" : `Bot ${i}`}</td>
                    <td>{s} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRules && (
        <div className="uf-overlay" onClick={() => setShowRules(false)}>
          <div className="uf-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Quick rules</h3>
            <ul className="uf-rules">
              <li>Match the top card by color, number, or symbol.</li>
              <li>Wild — change color any time. Wild +4 — also makes next player draw 4.</li>
              <li>Skip / Reverse / Draw-Two affect the next player.</li>
              <li>Call UNO when down to one card or you'll draw 4 next turn.</li>
              <li>Empty your hand to win the round and score opponents' card points.</li>
              <li>First to {state.settings.targetScore} wins the match.</li>
            </ul>
            <button type="button" className="uf-btn" onClick={() => setShowRules(false)} title="Close rules">
              Close
            </button>
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="uf-log" aria-label="Recent events">
          {state.log.slice(0, 4).map((line, i) => (
            <div key={i} className="uf-log-line">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
