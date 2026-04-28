import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HyakuninIsshuSettings { questions: "10"; }
export interface HyakuninIsshuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HyakuninIsshuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hyakunin Isshu means?", choices: ["100 cards, 1 player", "100 people, 1 poem each", "100 years, 1 song", "One in a hundred"], correct: 1 },
  { question: "The compiler of Hyakunin Isshu was?", choices: ["Murasaki Shikibu", "Sei Shonagon", "Fujiwara no Teika", "Matsuo Basho"], correct: 2 },
  { question: "Hyakunin Isshu was compiled in the?", choices: ["8th century", "11th century", "13th century", "17th century"], correct: 2 },
  { question: "Each poem is in what verse form?", choices: ["Haiku", "Tanka", "Renga", "Senryu"], correct: 1 },
  { question: "A tanka has how many syllables?", choices: ["17", "21", "31", "41"], correct: 2 },
  { question: "In the karuta game, the reader recites?", choices: ["The full poem", "The first half", "The last syllable only", "Only the title"], correct: 1 },
  { question: "Players grab cards showing?", choices: ["The first half", "The second half", "An author portrait", "A flower"], correct: 1 },
  { question: "The competitive form is called?", choices: ["Iroha Karuta", "Kyogi Karuta", "Hwatu", "Hanafuda"], correct: 1 },
  { question: "Hyakunin Isshu sets are traditionally played at?", choices: ["Cherry blossom", "New Year", "Tanabata", "Obon"], correct: 1 },
  { question: "The collection's purpose was originally?", choices: ["A board game", "A waka anthology", "A samurai code", "A travel diary"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HyakuninIsshuSettings): HyakuninIsshuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HyakuninIsshuState, action: HyakuninIsshuAction): HyakuninIsshuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HyakuninIsshuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
