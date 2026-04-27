import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NobelLaureatesQuizSettings { questions: "10" | "20" | "30"; }
export interface NobelLaureatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NobelLaureatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Nobel Prize was founded by?", choices: ["Albert Nobel", "Alfred Nobel", "Aaron Nobel", "Andre Nobel"], correct: 1 },
  { question: "Marie Curie won prizes in?", choices: ["Two fields", "Three fields", "One field", "Four fields"], correct: 0 },
  { question: "Einstein won the Nobel for?", choices: ["Relativity", "Photoelectric effect", "Brownian motion", "Atomic theory"], correct: 1 },
  { question: "MLK won the Peace Prize in?", choices: ["1954", "1964", "1974", "1984"], correct: 1 },
  { question: "Mandela shared 1993 Peace with?", choices: ["de Klerk", "Mbeki", "Tutu", "Suzman"], correct: 0 },
  { question: "Mother Teresa won Peace in?", choices: ["1969", "1979", "1989", "1999"], correct: 1 },
  { question: "Hemingway won Literature in?", choices: ["1944", "1954", "1964", "1974"], correct: 1 },
  { question: "Toni Morrison won Literature in?", choices: ["1983", "1993", "2003", "2013"], correct: 1 },
  { question: "Bob Dylan won Literature in?", choices: ["2010", "2014", "2016", "2018"], correct: 2 },
  { question: "Watson and Crick won for?", choices: ["Penicillin", "DNA structure", "Insulin", "Polio vaccine"], correct: 1 },
  { question: "Fleming won for?", choices: ["Penicillin", "X-rays", "Insulin", "Vaccination"], correct: 0 },
  { question: "Banting & Macleod won for?", choices: ["Insulin", "Penicillin", "DNA", "X-rays"], correct: 0 },
  { question: "Röntgen first Physics for?", choices: ["Radium", "X-rays", "Photons", "Electrons"], correct: 1 },
  { question: "Becquerel & Curies (1903) for?", choices: ["Radioactivity", "X-rays", "Atom splitting", "Quantum"], correct: 0 },
  { question: "Heisenberg won for?", choices: ["Relativity", "Quantum mechanics", "String theory", "Standard model"], correct: 1 },
  { question: "Bohr Nobel Physics for?", choices: ["Atomic structure", "Chromodynamics", "Cosmology", "Solid state"], correct: 0 },
  { question: "Linus Pauling won twice in?", choices: ["Chemistry & Peace", "Physics & Chem", "Lit & Peace", "Med & Chem"], correct: 0 },
  { question: "Malala won Peace at age?", choices: ["15", "17", "19", "21"], correct: 1 },
  { question: "Obama won Peace in?", choices: ["2008", "2009", "2010", "2011"], correct: 1 },
  { question: "Al Gore shared 2007 Peace with?", choices: ["UN", "IPCC", "Greenpeace", "WWF"], correct: 1 },
  { question: "Yousafzai is from?", choices: ["India", "Pakistan", "Bangladesh", "Afghanistan"], correct: 1 },
  { question: "First Economics Nobel awarded?", choices: ["1969", "1979", "1989", "1999"], correct: 0 },
  { question: "Krugman is famous in?", choices: ["Economics", "Physics", "Chemistry", "Literature"], correct: 0 },
  { question: "Friedman won for?", choices: ["Monetary economics", "Trade", "Game theory", "Behavioral"], correct: 0 },
  { question: "Daniel Kahneman won in?", choices: ["Economics", "Physics", "Med", "Lit"], correct: 0 },
  { question: "Carter won Peace in?", choices: ["1992", "1997", "2002", "2007"], correct: 2 },
  { question: "Yunus pioneered?", choices: ["Microcredit", "Solar", "Vaccines", "Internet"], correct: 0 },
  { question: "ICRC has won Peace ___ times?", choices: ["Once", "Twice", "Three times", "Four times"], correct: 2 },
  { question: "Tagore won Lit in?", choices: ["1903", "1913", "1923", "1933"], correct: 1 },
  { question: "Solzhenitsyn won Lit for?", choices: ["Russian dissidence work", "War poetry", "Plays", "Sci-fi"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NobelLaureatesQuizSettings): NobelLaureatesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NobelLaureatesQuizState, action: NobelLaureatesQuizAction): NobelLaureatesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NobelLaureatesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
