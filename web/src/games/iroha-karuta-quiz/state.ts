import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IrohaKarutaSettings { questions: "10"; }
export interface IrohaKarutaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IrohaKarutaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Iroha Karuta deck has how many reading cards?", choices: ["44", "46", "48", "50"], correct: 2 },
  { question: "Iroha Karuta is most commonly played at?", choices: ["Children's Day", "New Year", "Obon", "Tanabata"], correct: 1 },
  { question: "The Iroha refers to a classical Japanese?", choices: ["Folktale", "Pangrammatic poem", "Battle song", "Drinking song"], correct: 1 },
  { question: "Each reading card begins with one?", choices: ["English letter", "Kanji", "Kana of the Iroha order", "Number"], correct: 2 },
  { question: "What do players do during a turn?", choices: ["Discard cards", "Read the poem", "Race to grab matching picture cards", "Place tiles"], correct: 2 },
  { question: "Iroha Karuta's content is usually?", choices: ["Family songs", "Proverbs", "Manga panels", "Number facts"], correct: 1 },
  { question: "The reader's deck is called?", choices: ["Yomi-fuda", "E-fuda", "Pi-fuda", "Ten-fuda"], correct: 0 },
  { question: "The matching picture cards are called?", choices: ["Yomi-fuda", "E-fuda", "Tan-fuda", "Hikari"], correct: 1 },
  { question: "The winner has?", choices: ["Most picture cards", "Fewest cards", "Smallest hand", "Most reading cards"], correct: 0 },
  { question: "Iroha Karuta primarily teaches Japanese children?", choices: ["Math", "Proverbs and phonetics", "Geography", "Calligraphy"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: IrohaKarutaSettings): IrohaKarutaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IrohaKarutaState, action: IrohaKarutaAction): IrohaKarutaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IrohaKarutaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
