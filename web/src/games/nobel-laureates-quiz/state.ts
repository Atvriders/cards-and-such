import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NobelLaureatesQuizSettings { questions: "10" | "20" | "30"; }
export interface NobelLaureatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NobelLaureatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Nobel Prizes are awarded by?", choices: ["UK", "Sweden", "Norway", "Switzerland"], correct: 1 },
  { question: "Nobel Peace Prize awarded in?", choices: ["Stockholm", "Oslo", "Copenhagen", "Helsinki"], correct: 1 },
  { question: "Alfred Nobel invented?", choices: ["Telephone", "Dynamite", "Radio", "TV"], correct: 1 },
  { question: "Marie Curie won prizes in?", choices: ["Physics & Chemistry", "Physics & Medicine", "Chemistry & Peace", "Medicine & Peace"], correct: 0 },
  { question: "Marie Curie was the first woman to?", choices: ["Lead a country", "Win a Nobel", "Fly", "Discover an element"], correct: 1 },
  { question: "Einstein's Nobel was for?", choices: ["Relativity", "Photoelectric effect", "E=mc^2", "Brownian motion"], correct: 1 },
  { question: "Year Einstein won the Nobel?", choices: ["1905", "1921", "1933", "1945"], correct: 1 },
  { question: "MLK won Nobel Peace Prize in?", choices: ["1960", "1964", "1968", "1972"], correct: 1 },
  { question: "Mother Teresa won Peace Prize in?", choices: ["1969", "1979", "1989", "1999"], correct: 1 },
  { question: "Nelson Mandela shared Peace Prize with?", choices: ["Tutu", "de Klerk", "Mbeki", "Obama"], correct: 1 },
  { question: "Malala Yousafzai won Peace Prize at age?", choices: ["15", "17", "19", "21"], correct: 1 },
  { question: "Youngest Nobel laureate ever?", choices: ["Curie", "Malala", "Einstein", "Pauling"], correct: 1 },
  { question: "Linus Pauling won prizes in?", choices: ["Chemistry & Peace", "Physics & Peace", "Chemistry & Medicine", "Peace & Medicine"], correct: 0 },
  { question: "Watson & Crick Nobel was for?", choices: ["Atom", "DNA structure", "Penicillin", "Insulin"], correct: 1 },
  { question: "Fleming's Nobel was for?", choices: ["Penicillin", "X-rays", "Radium", "Vaccine"], correct: 0 },
  { question: "Hemingway won Nobel for?", choices: ["Physics", "Literature", "Peace", "Medicine"], correct: 1 },
  { question: "Bob Dylan won Nobel for?", choices: ["Peace", "Literature", "Music", "Medicine"], correct: 1 },
  { question: "Year Dylan won the Nobel?", choices: ["2010", "2013", "2016", "2019"], correct: 2 },
  { question: "Kissinger shared Peace Prize with?", choices: ["Le Duc Tho", "Sadat", "Begin", "Arafat"], correct: 0 },
  { question: "Sadat & Begin won Peace Prize for?", choices: ["Camp David", "Oslo", "Madrid", "Geneva"], correct: 0 },
  { question: "Gorbachev won Peace Prize in?", choices: ["1985", "1990", "1995", "2000"], correct: 1 },
  { question: "Tutu won Peace Prize for?", choices: ["Anti-apartheid", "Climate", "Vaccines", "Education"], correct: 0 },
  { question: "Obama won Peace Prize in?", choices: ["2008", "2009", "2010", "2012"], correct: 1 },
  { question: "First Nobel Peace Prize year?", choices: ["1895", "1901", "1910", "1920"], correct: 1 },
  { question: "Heisenberg won for?", choices: ["Uncertainty principle", "Relativity", "Quantum mechanics", "Atom split"], correct: 2 },
  { question: "Feynman shared Physics Nobel for?", choices: ["QED", "String theory", "Black holes", "Higgs"], correct: 0 },
  { question: "Tagore won Nobel for?", choices: ["Peace", "Literature", "Physics", "Chemistry"], correct: 1 },
  { question: "First Asian Nobel laureate?", choices: ["Tagore", "Yukawa", "Pamuk", "Bose"], correct: 0 },
  { question: "Rutherford's Nobel was in?", choices: ["Physics", "Chemistry", "Medicine", "Peace"], correct: 1 },
  { question: "Fridtjof Nansen won Peace Prize for?", choices: ["Arctic exploration", "Refugee aid", "Disarmament", "Mediation"], correct: 1 },
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
