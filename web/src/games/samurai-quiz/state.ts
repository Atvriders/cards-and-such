import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface SamuraiQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface SamuraiQuizState { settings: SamuraiQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type SamuraiQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What was the samurai code of honor called?", answer: "Bushido", wrong: ["Kenjutsu","Budo","Shinto"] },
  { question: "What was a samurai's primary weapon?", answer: "Katana", wrong: ["Naginata","Yari","Tanto"] },
  { question: "Which era marks the peak of samurai culture in Japan?", answer: "Edo Period", wrong: ["Meiji Period","Heian Period","Kamakura Period"] },
  { question: "What was the ritualistic suicide of samurai called?", answer: "Seppuku", wrong: ["Harakiri only","Bushido death","Ronin"] },
  { question: "What did 'ronin' mean?", answer: "Samurai without a master", wrong: ["Elite warrior","Sword master","Castle guard"] },
  { question: "Who united Japan in the late 16th century?", answer: "Tokugawa Ieyasu", wrong: ["Oda Nobunaga","Toyotomi Hideyoshi","Takeda Shingen"] },
  { question: "What was the feudal lord title in Japan?", answer: "Daimyo", wrong: ["Shogun","Samurai","Ronin"] },
  { question: "What was the highest military title in feudal Japan?", answer: "Shogun", wrong: ["Daimyo","Emperor","Ronin"] },
  { question: "What is the Japanese art of sword fighting?", answer: "Kenjutsu", wrong: ["Judo","Karate","Ninjutsu"] },
  { question: "What was a samurai's lightweight underarmor called?", answer: "Hakama", wrong: ["Katana","Do","Kabuto"] },
  { question: "What period saw the first samurai class emerge?", answer: "Heian Period", wrong: ["Edo Period","Meiji Period","Nara Period"] },
  { question: "What famous battle ended the Sengoku period?", answer: "Battle of Sekigahara", wrong: ["Battle of Kawanakajima","Battle of Nagashino","Battle of Okehazama"] },
  { question: "What is the Japanese curved shortsword called?", answer: "Wakizashi", wrong: ["Tanto","Katana","Naginata"] },
  { question: "What religion was central to samurai culture?", answer: "Zen Buddhism", wrong: ["Shinto","Confucianism","Taoism"] },
  { question: "What does 'samurai' literally mean?", answer: "One who serves", wrong: ["Warrior","Sword master","Noble fighter"] },
  { question: "Which famous novel features the 47 ronin story?", answer: "Chushingura", wrong: ["Tale of Genji","Book of Five Rings","Hagakure"] },
  { question: "Who wrote the Book of Five Rings on strategy?", answer: "Miyamoto Musashi", wrong: ["Tokugawa Ieyasu","Sun Tzu","Yamamoto Tsunetomo"] },
  { question: "What type of armor did samurai wear?", answer: "Lamellar armor (Yoroi)", wrong: ["Chainmail","Plate armor","Leather armor"] },
  { question: "What was the samurai helmet called?", answer: "Kabuto", wrong: ["Mempo","Do","Sode"] },
  { question: "When did the samurai class officially end?", answer: "Meiji Restoration (1868)", wrong: ["1945","1600","1750"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SamuraiQuizSettings): SamuraiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: SamuraiQuizState, action: SamuraiQuizAction): SamuraiQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: SamuraiQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
