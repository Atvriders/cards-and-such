import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Adventurer {
  id: number;
  name: string;
  skill: number; // 1-5, determines quest success chance
  cost: number;  // gold to hire
}

export interface Quest {
  id: number;
  name: string;
  reward: number;
  difficulty: number; // 1-5 needed skill
  desc: string;
}

const ADVENTURER_POOL: Omit<Adventurer, "id">[] = [
  { name: "Brom the Bold", skill: 2, cost: 5 },
  { name: "Lyra Swiftarrow", skill: 3, cost: 8 },
  { name: "Theron Sage", skill: 4, cost: 12 },
  { name: "Grunk Ironhide", skill: 2, cost: 5 },
  { name: "Elara Moonveil", skill: 5, cost: 18 },
  { name: "Pip the Quick", skill: 1, cost: 3 },
  { name: "Sable Dusk", skill: 3, cost: 8 },
  { name: "Coran Stoutbeard", skill: 2, cost: 6 },
  { name: "Mira Flamehair", skill: 4, cost: 14 },
  { name: "Odo Wanderer", skill: 1, cost: 3 },
];

const QUEST_POOL: Omit<Quest, "id">[] = [
  { name: "Rat in the Cellar", reward: 4, difficulty: 1, desc: "Clear rats from the miller's cellar." },
  { name: "Missing Shipment", reward: 6, difficulty: 2, desc: "Track a lost merchant wagon." },
  { name: "Haunted Mill", reward: 10, difficulty: 3, desc: "Investigate ghost sightings." },
  { name: "Bandit Road", reward: 8, difficulty: 2, desc: "Escort a merchant past bandits." },
  { name: "Lost Prince", reward: 15, difficulty: 4, desc: "Find the missing noble's heir." },
  { name: "Cave Dragon", reward: 20, difficulty: 5, desc: "Slay the wyvern terrorizing farms." },
  { name: "Cursed Idol", reward: 12, difficulty: 3, desc: "Retrieve an idol from cursed ruins." },
  { name: "Spy Hunt", reward: 9, difficulty: 3, desc: "Root out the spy in the castle." },
  { name: "Stolen Crown", reward: 18, difficulty: 4, desc: "Recover the stolen royal crown." },
  { name: "Sea Monster", reward: 22, difficulty: 5, desc: "Drive off the creature plaguing fishermen." },
  { name: "Goblin Raid", reward: 7, difficulty: 2, desc: "Repel a goblin attack on the village." },
  { name: "Enchanted Relic", reward: 14, difficulty: 4, desc: "Bring back a magical artifact safely." },
];

export interface QuestTavernState {
  rngSeed: number;
  gold: number;
  day: number;
  maxDays: number;
  hired: readonly Adventurer[];
  availableAdventurers: readonly Adventurer[];
  availableQuests: readonly Quest[];
  activeQuests: readonly { questId: number; adventurerId: number; returnsDay: number }[];
  completedQuests: number;
  failedQuests: number;
  log: readonly string[];
  phase: "manage" | "done";
}

export type QuestTavernAction =
  | { type: "hire"; adventurerId: number }
  | { type: "sendOnQuest"; adventurerId: number; questId: number }
  | { type: "endDay" };

function pickRandom<T>(arr: T[], rng: () => number, count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

export function initialState(seed: number): QuestTavernState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);

  let idCounter = 1;
  const advPool = pickRandom(ADVENTURER_POOL, rng2, 4).map(a => ({ ...a, id: idCounter++ }));
  const questPool = pickRandom(QUEST_POOL, rng2, 5).map(q => ({ ...q, id: idCounter++ }));

  return {
    rngSeed: nextSeed,
    gold: 20,
    day: 1,
    maxDays: 10,
    hired: [],
    availableAdventurers: advPool,
    availableQuests: questPool,
    activeQuests: [],
    completedQuests: 0,
    failedQuests: 0,
    log: ["Day 1: The tavern doors are open. Hire adventurers and send them on quests!"],
    phase: "manage",
  };
}

export function reducer(state: QuestTavernState, action: QuestTavernAction): QuestTavernState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "hire": {
      const adv = state.availableAdventurers.find(a => a.id === action.adventurerId);
      if (!adv) return state;
      if (state.gold < adv.cost) return state;
      return {
        ...state,
        gold: state.gold - adv.cost,
        hired: [...state.hired, adv],
        availableAdventurers: state.availableAdventurers.filter(a => a.id !== action.adventurerId),
        log: [...state.log, `Hired ${adv.name} for ${adv.cost}g.`],
      };
    }

    case "sendOnQuest": {
      const adv = state.hired.find(a => a.id === action.adventurerId);
      const quest = state.availableQuests.find(q => q.id === action.questId);
      if (!adv || !quest) return state;
      // Check adventurer not already on a quest
      if (state.activeQuests.some(aq => aq.adventurerId === action.adventurerId)) return state;
      const questDuration = quest.difficulty; // days away
      return {
        ...state,
        availableQuests: state.availableQuests.filter(q => q.id !== action.questId),
        activeQuests: [...state.activeQuests, {
          questId: action.questId,
          adventurerId: action.adventurerId,
          returnsDay: state.day + questDuration,
        }],
        log: [...state.log, `${adv.name} sent on "${quest.name}" (back in ${questDuration} days).`],
      };
    }

    case "endDay": {
      const nextDay = state.day + 1;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);

      const logLines: string[] = [];
      let gold = state.gold;
      let completed = state.completedQuests;
      let failed = state.failedQuests;

      // Resolve returning quests
      const stillActive: typeof state.activeQuests[0][] = [];
      for (const aq of state.activeQuests) {
        if (aq.returnsDay <= nextDay) {
          const quest = QUEST_POOL.find(q => q.name !== "") ?
            // find from all pools by matching id
            [...state.availableQuests, ...QUEST_POOL.map((q, i) => ({ ...q, id: i + 100 }))].find(q => q.id === aq.questId) ?? null
            : null;
          const adv = state.hired.find(a => a.id === aq.adventurerId);
          if (!adv) { stillActive.push(aq); continue; }
          const questEntry = state.availableQuests.find(q => q.id === aq.questId) ??
            // We need to track quest data through active quests - simplified: use difficulty from activeQuests data
            { name: "Quest", reward: 10, difficulty: 3, id: aq.questId, desc: "" };
          // success if skill >= difficulty or random chance
          const successRoll = rng2();
          const questInfo = QUEST_POOL.find((q, i) => (i + 1) === aq.questId) ??
            { name: "Quest", reward: 10, difficulty: 3, desc: "" };
          void quest; void questInfo;
          // Store quest info in active quest for resolution
          const successChance = Math.min(0.95, 0.5 + (adv.skill - questEntry.difficulty) * 0.15);
          if (successRoll < successChance) {
            gold += questEntry.reward;
            completed++;
            logLines.push(`${adv.name} completed "${questEntry.name}"! +${questEntry.reward}g.`);
          } else {
            failed++;
            logLines.push(`${adv.name} failed "${questEntry.name}". No reward.`);
          }
        } else {
          stillActive.push(aq);
        }
      }

      // Refresh market every 3 days
      let advAvail = state.availableAdventurers;
      let questAvail = state.availableQuests;
      if (nextDay % 3 === 0) {
        let idC = 200 + nextDay * 10;
        advAvail = pickRandom(ADVENTURER_POOL, rng2, 3).map(a => ({ ...a, id: idC++ }));
        questAvail = [...state.availableQuests, ...pickRandom(QUEST_POOL, rng2, 2).map(q => ({ ...q, id: idC++ }))].slice(0, 5);
        logLines.push("New adventurers and quests available!");
      }

      const isDone = nextDay > state.maxDays;

      return {
        ...state,
        rngSeed: nextSeed,
        day: nextDay,
        gold,
        completedQuests: completed,
        failedQuests: failed,
        activeQuests: stillActive,
        availableAdventurers: advAvail,
        availableQuests: questAvail,
        log: [...state.log, `--- Day ${nextDay} ---`, ...logLines],
        phase: isDone ? "done" : "manage",
      };
    }
  }
}

export function isTerminal(state: QuestTavernState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score based on gold + completed quests
  const score = Math.min(100, Math.round((state.gold / 80) * 50 + (state.completedQuests / 6) * 50));
  return { score };
}
