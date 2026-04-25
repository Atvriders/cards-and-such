import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuestTavernState, QuestTavernAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function QuestTavern({ state, dispatch, onGameOver }: GameProps<QuestTavernState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [selectedAdv, setSelectedAdv] = useState<number | null>(null);

  const d = (a: QuestTavernAction) => dispatch(a);

  const isOnQuest = (advId: number) => state.activeQuests.some(aq => aq.adventurerId === advId);

  if (state.phase === "done") {
    return (
      <div className="qt-wrap">
        <div className="qt-header"><span className="qt-title">Quest Tavern</span></div>
        <div className="qt-done">
          <div className="qt-done-title">Tavern Ledger Closed</div>
          <div className="qt-done-stats">
            <div>Final Gold: {state.gold}g</div>
            <div>Quests Completed: {state.completedQuests}</div>
            <div>Quests Failed: {state.failedQuests}</div>
            <div>Score: {terminal?.score ?? 0}/100</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qt-wrap">
      <div className="qt-header">
        <span className="qt-title">Quest Tavern</span>
        <div className="qt-stats">
          <span>Day {state.day}/{state.maxDays}</span>
          <span>{state.gold}g</span>
          <span>{state.completedQuests} done</span>
        </div>
      </div>

      <div className="qt-section">Available Adventurers (click to hire)</div>
      <div className="qt-list">
        {state.availableAdventurers.map(adv => (
          <div key={adv.id} className="qt-card">
            <div className="qt-card-header">
              <span className="qt-card-name">{adv.name}</span>
              <span className="qt-card-detail">Skill {adv.skill} | {adv.cost}g</span>
              <button className="qt-btn" disabled={state.gold < adv.cost}
                onClick={() => d({ type: "hire", adventurerId: adv.id })}>Hire</button>
            </div>
          </div>
        ))}
        {state.availableAdventurers.length === 0 && <div className="qt-card-desc">No adventurers available.</div>}
      </div>

      <div className="qt-section">Your Roster ({state.hired.length} hired)</div>
      <div className="qt-list">
        {state.hired.map(adv => (
          <div key={adv.id} className={`qt-card ${isOnQuest(adv.id) ? "qt-active" : ""}`}>
            <div className="qt-card-header">
              <span className="qt-card-name">{adv.name}</span>
              <span className="qt-card-detail">Skill {adv.skill}</span>
              {isOnQuest(adv.id)
                ? <span className="qt-active-line">On quest</span>
                : <button className="qt-btn" onClick={() => setSelectedAdv(selectedAdv === adv.id ? null : adv.id)}>
                    {selectedAdv === adv.id ? "Cancel" : "Send"}
                  </button>}
            </div>
            {selectedAdv === adv.id && !isOnQuest(adv.id) && (
              <div>
                {state.availableQuests.map(q => (
                  <button key={q.id} className="qt-quest-btn"
                    onClick={() => { d({ type: "sendOnQuest", adventurerId: adv.id, questId: q.id }); setSelectedAdv(null); }}>
                    {q.name} (diff {q.difficulty}, +{q.reward}g)
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {state.hired.length === 0 && <div className="qt-card-desc">Hire adventurers above to begin.</div>}
      </div>

      {state.log.length > 0 && (
        <div className="qt-log">
          {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="qt-log-line">{l}</div>)}
        </div>
      )}

      <button className="qt-end-day" onClick={() => { setSelectedAdv(null); d({ type: "endDay" }); }}>
        End Day {state.day} →
      </button>
    </div>
  );
}
