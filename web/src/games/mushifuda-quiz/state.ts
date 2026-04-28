import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MushifudaSettings { questions: "10"; }
export interface MushifudaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MushifudaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mushifuda is most strongly associated with which region?", choices: ["Hokkaido", "Tokyo", "Nagasaki", "Okinawa"], correct: 2 },
  { question: "A Mushifuda deck contains how many cards?", choices: ["20", "24", "36", "48"], correct: 1 },
  { question: "Mushifuda is derived from what parent game?", choices: ["Karuta", "Hanafuda", "Kabufuda", "Trump"], correct: 1 },
  { question: "Which months are removed in the Mushifuda deck?", choices: ["January–March", "April–June", "July–December", "All winter months"], correct: 2 },
  { question: "Mushifuda is best characterised as?", choices: ["A complex gambling game", "A simplified regional Hanafuda", "A children's card war", "A trick-taking game"], correct: 1 },
  { question: "The Mushifuda deck is most often used for?", choices: ["Teaching beginners", "Tournaments", "Solo solitaire", "Cooking score"], correct: 0 },
  { question: "Mushifuda removes cards to make the deck?", choices: ["Heavier", "Smaller and easier", "Harder for adults", "More rare"], correct: 1 },
  { question: "The remaining suits in Mushifuda represent which months?", choices: ["1–6", "2–7", "3–8", "6–11"], correct: 0 },
  { question: "A Mushifuda turn most resembles which other game?", choices: ["Hana Awase", "Mahjong", "Bridge", "Poker"], correct: 0 },
  { question: "Mushifuda is preserved primarily because of?", choices: ["Tournament play", "Local tradition", "Casino use", "Cookbook references"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MushifudaSettings): MushifudaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MushifudaState, action: MushifudaAction): MushifudaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MushifudaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
