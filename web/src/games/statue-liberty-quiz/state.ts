import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StatueLibertyQuizSettings { questions: "10" | "20"; }
export interface StatueLibertyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StatueLibertyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "City of the Statue of Liberty?", choices: ["New York", "Boston", "Philadelphia", "DC"], correct: 0 },
  { question: "Statue of Liberty was a gift from?", choices: ["UK", "France", "Italy", "Spain"], correct: 1 },
  { question: "Year of dedication?", choices: ["1776", "1886", "1903", "1924"], correct: 1 },
  { question: "Sculptor of the statue?", choices: ["Bartholdi", "Eiffel", "Rodin", "Pulitzer"], correct: 0 },
  { question: "Engineer of the iron framework?", choices: ["Eiffel", "Bartholdi", "Roebling", "Olmsted"], correct: 0 },
  { question: "Material of the outer skin?", choices: ["Bronze", "Copper", "Steel", "Marble"], correct: 1 },
  { question: "Approximate height (torch to base of pedestal)?", choices: ["~30 m", "~46 m", "~93 m", "~150 m"], correct: 2 },
  { question: "Why is the statue green?", choices: ["Painted", "Copper patina (verdigris)", "Algae", "Rust"], correct: 1 },
  { question: "Tablet held by Liberty bears the date?", choices: ["July 4, 1776", "Bastille Day", "Armistice Day", "ANZAC Day"], correct: 0 },
  { question: "Inscription on the tablet is in?", choices: ["English", "French", "Roman numerals", "Latin"], correct: 2 },
  { question: "Number of points on the crown?", choices: ["5", "7", "9", "13"], correct: 1 },
  { question: "Crown points symbolize?", choices: ["States", "7 seas/continents", "Stars", "Founding fathers"], correct: 1 },
  { question: "What is at her feet?", choices: ["Eagle", "Broken chains", "Bell", "Sword"], correct: 1 },
  { question: "Island the statue stands on (current name)?", choices: ["Ellis", "Liberty", "Roosevelt", "Governors"], correct: 1 },
  { question: "Original name of the island?", choices: ["Bedloe's", "Black Tom", "Hart", "Rikers"], correct: 0 },
  { question: "Pedestal designer?", choices: ["Hunt", "Eiffel", "Bartholdi", "Wright"], correct: 0 },
  { question: "Funds for the pedestal raised by?", choices: ["Tax", "Newspaper campaign (Pulitzer)", "Federal grant", "Private estate"], correct: 1 },
  { question: "Poem on the pedestal?", choices: ["The Raven", "The New Colossus", "Howl", "O Captain"], correct: 1 },
  { question: "Author of that poem?", choices: ["Whitman", "Lazarus", "Dickinson", "Frost"], correct: 1 },
  { question: "Famous line: 'Give me your...'?", choices: ["tired, your poor", "money, your votes", "kings, your queens", "wine, your bread"], correct: 0 },
  { question: "Statue first arrived disassembled in how many crates?", choices: ["~50", "~214", "~500", "~1,000"], correct: 1 },
  { question: "UNESCO World Heritage status year?", choices: ["1964", "1984", "2004", "2014"], correct: 1 },
  { question: "Original color when new?", choices: ["Brown (copper)", "Green", "Black", "Gold"], correct: 0 },
  { question: "Lightning strikes per year (approx)?", choices: ["~1", "~10", "~600", "~10,000"], correct: 2 },
  { question: "Walk-up access to crown allowed?", choices: ["Yes (limited)", "Never", "Only Mondays", "Only July 4"], correct: 0 },
  { question: "Number of windows in the crown?", choices: ["10", "17", "25", "50"], correct: 2 },
  { question: "Statue underwent major restoration in?", choices: ["1976", "1986", "1996", "2006"], correct: 1 },
  { question: "New torch (1986) is covered in?", choices: ["Paint", "24-karat gold leaf", "Bronze", "Glass"], correct: 1 },
  { question: "Movie 'Planet of the Apes' (1968) ends with?", choices: ["Statue intact", "Statue ruined on beach", "Statue talking", "Statue moving"], correct: 1 },
  { question: "Annual visitors (approx)?", choices: ["~500,000", "~4 million", "~25 million", "~100 million"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StatueLibertyQuizSettings): StatueLibertyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StatueLibertyQuizState, action: StatueLibertyQuizAction): StatueLibertyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StatueLibertyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
