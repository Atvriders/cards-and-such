import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KurosawaQuizSettings { questions: "10" | "20" | "30"; }
export interface KurosawaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KurosawaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Seven Samurai year?", choices: ["1950", "1952", "1954", "1956"], correct: 2 },
  { question: "Rashomon year?", choices: ["1948", "1950", "1952", "1954"], correct: 1 },
  { question: "Yojimbo year?", choices: ["1959", "1961", "1963", "1965"], correct: 1 },
  { question: "Sanjuro year?", choices: ["1960", "1962", "1964", "1966"], correct: 1 },
  { question: "Throne of Blood year?", choices: ["1955", "1957", "1959", "1961"], correct: 1 },
  { question: "Hidden Fortress year?", choices: ["1956", "1958", "1960", "1962"], correct: 1 },
  { question: "Ran year?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Kagemusha year?", choices: ["1978", "1980", "1982", "1984"], correct: 1 },
  { question: "Dreams (Yume) year?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Madadayo year?", choices: ["1991", "1993", "1995", "1997"], correct: 1 },
  { question: "Ikiru year?", choices: ["1950", "1952", "1954", "1956"], correct: 1 },
  { question: "Stray Dog year?", choices: ["1947", "1949", "1951", "1953"], correct: 1 },
  { question: "Drunken Angel year?", choices: ["1946", "1948", "1950", "1952"], correct: 1 },
  { question: "Toshiro Mifune appeared in how many Kurosawa films?", choices: ["10", "12", "16", "20"], correct: 2 },
  { question: "Throne of Blood is a Japanese version of?", choices: ["Macbeth", "Hamlet", "King Lear", "Othello"], correct: 0 },
  { question: "Ran is based on which Shakespeare?", choices: ["King Lear", "Macbeth", "Hamlet", "Tempest"], correct: 0 },
  { question: "Kurosawa's Hidden Fortress influenced?", choices: ["Star Wars", "Magnificent 7", "Last Samurai", "2001"], correct: 0 },
  { question: "Magnificent Seven is remake of?", choices: ["Seven Samurai", "Yojimbo", "Rashomon", "Ikiru"], correct: 0 },
  { question: "Last Man Standing & Fistful of Dollars remake?", choices: ["Yojimbo", "Sanjuro", "Hidden Fortress", "Ran"], correct: 0 },
  { question: "Kurosawa won what honorary Oscar?", choices: ["Lifetime Achievement (1990)", "Best Director", "Best Picture", "Just nominated"], correct: 0 },
  { question: "Kurosawa won Best Foreign Language Film Oscar for?", choices: ["Rashomon", "Dersu Uzala", "Both", "Just Dersu"], correct: 2 },
  { question: "Dersu Uzala year?", choices: ["1973", "1975", "1977", "1979"], correct: 1 },
  { question: "Dersu Uzala location/co-production?", choices: ["Soviet Union", "China", "Korea", "France"], correct: 0 },
  { question: "Kurosawa born in?", choices: ["1908", "1910", "1912", "1914"], correct: 1 },
  { question: "Kurosawa died in?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Kurosawa's first film?", choices: ["Sanshiro Sugata", "Drunken Angel", "Most Beautiful", "Ikiru"], correct: 0 },
  { question: "Sanshiro Sugata year?", choices: ["1941", "1943", "1945", "1947"], correct: 1 },
  { question: "Kurosawa nicknamed?", choices: ["The Emperor", "The Master", "The Sensei", "The Sword"], correct: 0 },
  { question: "Color first used by Kurosawa in?", choices: ["Dodes'ka-den", "Ran", "Kagemusha", "Dreams"], correct: 0 },
  { question: "Dodes'ka-den year?", choices: ["1968", "1970", "1972", "1974"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KurosawaQuizSettings): KurosawaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KurosawaQuizState, action: KurosawaQuizAction): KurosawaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KurosawaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
