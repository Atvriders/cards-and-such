import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PineappleOfcState, PineappleOfcAction, PineappleOfcSettings, OFCBoard } from "./state.js";
import { isTerminal, isValidBoard } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

function BoardView({ board, label }: { board: OFCBoard; label: string }): JSX.Element {
  const cls = (s: string): string => `pineap-ofc-${s}`;
  const valid = board.top.length === 3 && board.middle.length === 5 && board.bottom.length === 5
    ? isValidBoard(board) : true;
  return (
    <div className={cls("boardview")}>
      <div className={cls("rowlabel")}>{label} {!valid && <span className={cls("foul")}>FOUL</span>}</div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Top</div>
        <div className={cls("ofcards")}>
          {board.top.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 3 - board.top.length }).map((_, i) => <div key={`pt${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Mid</div>
        <div className={cls("ofcards")}>
          {board.middle.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 5 - board.middle.length }).map((_, i) => <div key={`pm${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Bot</div>
        <div className={cls("ofcards")}>
          {board.bottom.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 5 - board.bottom.length }).map((_, i) => <div key={`pb${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
    </div>
  );
}

export function PineappleOfcGame({ state, dispatch, onGameOver }: GameProps<PineappleOfcState, PineappleOfcSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const dis = (a: PineappleOfcAction): void => dispatch(a);
  const cls = (s: string): string => `pineap-ofc-${s}`;

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const inHand = state.phase === "initial-place" || state.phase === "draw-place";
  const inDiscard = state.phase === "discard";

  const canTop = state.player.top.length < 3;
  const canMid = state.player.middle.length < 5;
  const canBot = state.player.bottom.length < 5;

  return (
    <div className={`${cls("felt")} thmPineapOFC`}>
      <div className={cls("hud")}>
        <span className={cls("stat")}>Round {Math.max(state.round, 1)}/{state.totalRounds}</span>
        <span className={cls("stat")}>Score: {state.score >= 0 ? "+" : ""}{state.score}</span>
        {state.drawNum > 0 && <span className={cls("stat")}>Draw {state.drawNum}/4</span>}
      </div>

      <BoardView board={state.cpu} label="CPU" />

      <div className={cls("currentcard")}>
        <div className={cls("msg")}>{state.message}</div>
        {state.hand.length > 0 && (
          <>
            <div className={cls("cardlabel")}>{inDiscard ? "Click a card to discard:" : "Click a card to select, then a row:"}</div>
            <div className={cls("handcards")}>
              {state.hand.map((c, i) => (
                <Card
                  key={i}
                  card={c}
                  className={selectedIdx === i ? cls("selected") : ""}
                  onClick={() => {
                    if (inDiscard) dis({ type: "discard", cardIndex: i });
                    else setSelectedIdx(i);
                  }}
                />
              ))}
            </div>
            {inHand && (
              <div className={cls("placeactions")}>
                <button data-testid="hint-target-pineap-ofc-top" title="Place in top row" className={cls("btn")} onClick={() => dis({ type: "place", row: "top", cardIndex: selectedIdx })} disabled={!canTop}>Top</button>
                <button data-testid="hint-target-pineap-ofc-mid" title="Place in middle row" className={cls("btn")} onClick={() => dis({ type: "place", row: "middle", cardIndex: selectedIdx })} disabled={!canMid}>Mid</button>
                <button data-testid="hint-target-pineap-ofc-bot" title="Place in bottom row" className={cls("btn")} onClick={() => dis({ type: "place", row: "bottom", cardIndex: selectedIdx })} disabled={!canBot}>Bot</button>
              </div>
            )}
          </>
        )}
      </div>

      <BoardView board={state.player} label="You" />

      <div className={cls("actions")}>
        {state.phase === "scored" && (
          <button data-testid="hint-target-pineap-ofc-deal" className={`${cls("btn")} ${cls("deal")}`} onClick={() => dis({ type: "next" })}>Next Round</button>
        )}
        {state.phase === "initial-place" && state.player.top.length === 0 && state.player.middle.length === 0 && state.player.bottom.length === 0 && state.hand.length === 0 && (
          <button data-testid="hint-target-pineap-ofc-deal" className={`${cls("btn")} ${cls("deal")}`} onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
      </div>

      {state.phase === "done" && <div className={cls("gameover")}>Final Score: {state.score >= 0 ? "+" : ""}{state.score}</div>}
    </div>
  );
}
