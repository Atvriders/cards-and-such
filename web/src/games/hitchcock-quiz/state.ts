import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HitchcockQuizSettings { questions: "10" | "20" | "30"; }
export interface HitchcockQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HitchcockQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Psycho year?", choices: ["1958", "1960", "1962", "1964"], correct: 1 },
  { question: "Vertigo year?", choices: ["1956", "1958", "1960", "1962"], correct: 1 },
  { question: "Rear Window year?", choices: ["1952", "1954", "1956", "1958"], correct: 1 },
  { question: "The Birds year?", choices: ["1961", "1963", "1965", "1967"], correct: 1 },
  { question: "North by Northwest year?", choices: ["1957", "1959", "1961", "1963"], correct: 1 },
  { question: "Strangers on a Train year?", choices: ["1949", "1951", "1953", "1955"], correct: 1 },
  { question: "Rebecca (Hitchcock) year?", choices: ["1938", "1940", "1942", "1944"], correct: 1 },
  { question: "Rope year?", choices: ["1946", "1948", "1950", "1952"], correct: 1 },
  { question: "39 Steps year?", choices: ["1933", "1935", "1937", "1939"], correct: 1 },
  { question: "Lady Vanishes year?", choices: ["1936", "1938", "1940", "1942"], correct: 1 },
  { question: "Dial M for Murder year?", choices: ["1952", "1954", "1956", "1958"], correct: 1 },
  { question: "Notorious year?", choices: ["1944", "1946", "1948", "1950"], correct: 1 },
  { question: "Marnie year?", choices: ["1962", "1964", "1966", "1968"], correct: 1 },
  { question: "Frenzy year?", choices: ["1970", "1972", "1974", "1976"], correct: 1 },
  { question: "Psycho lead actress?", choices: ["Janet Leigh", "Tippi Hedren", "Eva Marie Saint", "Grace Kelly"], correct: 0 },
  { question: "Norman Bates played by?", choices: ["Anthony Perkins", "Jimmy Stewart", "Cary Grant", "Tony Curtis"], correct: 0 },
  { question: "Vertigo lead?", choices: ["Jimmy Stewart", "Cary Grant", "Henry Fonda", "Robert Mitchum"], correct: 0 },
  { question: "Vertigo female lead?", choices: ["Kim Novak", "Grace Kelly", "Eva Marie Saint", "Tippi Hedren"], correct: 0 },
  { question: "Rear Window lead?", choices: ["Stewart", "Grant", "Mitchum", "Cooper"], correct: 0 },
  { question: "Rear Window co-star?", choices: ["Grace Kelly", "Eva Marie Saint", "Tippi Hedren", "Janet Leigh"], correct: 0 },
  { question: "Birds set in?", choices: ["Bodega Bay, CA", "Maine", "Florida", "UK"], correct: 0 },
  { question: "Birds female lead?", choices: ["Tippi Hedren", "Janet Leigh", "Grace Kelly", "Eva Marie Saint"], correct: 0 },
  { question: "North by Northwest leads?", choices: ["Grant & Saint", "Stewart & Kelly", "Grant & Kelly", "Mason & Hedren"], correct: 0 },
  { question: "Hitchcock cameos in his films?", choices: ["Yes", "No", "Sometimes", "Just early ones"], correct: 0 },
  { question: "Hitchcock TV anthology?", choices: ["Alfred Hitchcock Presents", "Twilight Zone", "Outer Limits", "Suspense"], correct: 0 },
  { question: "Hitchcock won Best Director Oscar?", choices: ["No", "Yes (Rebecca)", "Yes (Psycho)", "Yes (Vertigo)"], correct: 0 },
  { question: "Hitchcock received what honorary?", choices: ["AFI Life Achievement (1979) and KBE", "Just KBE", "Just AFI", "Lifetime Oscar only"], correct: 0 },
  { question: "Hitchcock born in?", choices: ["1899", "1901", "1903", "1905"], correct: 0 },
  { question: "Hitchcock died in?", choices: ["1978", "1980", "1982", "1984"], correct: 1 },
  { question: "Hitchcock's wife/collaborator?", choices: ["Alma Reville", "Joan Harrison", "Edith Head", "Bernard Herrmann's wife"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HitchcockQuizSettings): HitchcockQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HitchcockQuizState, action: HitchcockQuizAction): HitchcockQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HitchcockQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
