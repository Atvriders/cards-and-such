import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TarantinoQuizSettings { questions: "10" | "20" | "30"; }
export interface TarantinoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TarantinoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Reservoir Dogs year?", choices: ["1990", "1992", "1994", "1996"], correct: 1 },
  { question: "Pulp Fiction year?", choices: ["1992", "1994", "1996", "1998"], correct: 1 },
  { question: "Kill Bill Vol. 1 year?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Kill Bill Vol. 2 year?", choices: ["2003", "2004", "2006", "2008"], correct: 1 },
  { question: "Inglourious Basterds year?", choices: ["2007", "2009", "2011", "2013"], correct: 1 },
  { question: "Django Unchained year?", choices: ["2010", "2012", "2014", "2016"], correct: 1 },
  { question: "Once Upon a Time in Hollywood year?", choices: ["2017", "2019", "2021", "2023"], correct: 1 },
  { question: "Hateful Eight year?", choices: ["2013", "2015", "2017", "2019"], correct: 1 },
  { question: "Death Proof year?", choices: ["2005", "2007", "2009", "2011"], correct: 1 },
  { question: "Jackie Brown year?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "Pulp Fiction won Palme d'Or?", choices: ["Yes", "No", "Won Best Screenplay", "Just nominated"], correct: 0 },
  { question: "Mr. Pink in Reservoir Dogs played by?", choices: ["Steve Buscemi", "Tarantino", "Harvey Keitel", "Tim Roth"], correct: 0 },
  { question: "Mr. White?", choices: ["Harvey Keitel", "Buscemi", "Madsen", "Roth"], correct: 0 },
  { question: "Vincent Vega played by?", choices: ["John Travolta", "Bruce Willis", "Sam Jackson", "Ving Rhames"], correct: 0 },
  { question: "Jules Winnfield played by?", choices: ["Sam Jackson", "Travolta", "Willis", "Keitel"], correct: 0 },
  { question: "The Bride in Kill Bill played by?", choices: ["Uma Thurman", "Daryl Hannah", "Lucy Liu", "Vivica Fox"], correct: 0 },
  { question: "Bill played by?", choices: ["David Carradine", "Michael Madsen", "Travolta", "Keitel"], correct: 0 },
  { question: "Inglourious Basterds villain Hans Landa played by?", choices: ["Christoph Waltz", "Brad Pitt", "Eli Roth", "Diane Kruger"], correct: 0 },
  { question: "Christoph Waltz won Oscar for Basterds?", choices: ["Yes", "No", "Just nom", "Won for Django"], correct: 0 },
  { question: "Django Unchained lead?", choices: ["Jamie Foxx", "Will Smith", "Denzel Washington", "Idris Elba"], correct: 0 },
  { question: "Calvin Candie in Django?", choices: ["DiCaprio", "Pitt", "Cruise", "Damon"], correct: 0 },
  { question: "Tarantino's first script he sold?", choices: ["True Romance", "Natural Born Killers", "From Dusk Till Dawn", "Reservoir Dogs"], correct: 0 },
  { question: "Tarantino's birth year?", choices: ["1959", "1963", "1967", "1971"], correct: 1 },
  { question: "Tarantino's video store job was at?", choices: ["Video Archives", "Blockbuster", "Hollywood Video", "Movie Madness"], correct: 0 },
  { question: "Hateful Eight setting?", choices: ["Wyoming/snowstorm", "Texas", "California", "Tennessee"], correct: 0 },
  { question: "Once Upon a Time in Hollywood leads?", choices: ["DiCaprio & Pitt", "Pitt & Damon", "Cruise & Pitt", "DiCaprio & Damon"], correct: 0 },
  { question: "Once Upon a Time involves which historical figure?", choices: ["Charles Manson", "Nixon", "Kennedy", "Hoover"], correct: 0 },
  { question: "Tarantino's planned films total (per his rule)?", choices: ["10", "11", "12", "15"], correct: 0 },
  { question: "Tarantino's most frequent collaborator (composer)?", choices: ["Ennio Morricone", "Jerry Goldsmith", "RZA", "Just licensed music"], correct: 3 },
  { question: "Tarantino's cameo in Pulp Fiction as?", choices: ["Jimmie", "Marsellus", "Lance", "Captain Koons"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TarantinoQuizSettings): TarantinoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TarantinoQuizState, action: TarantinoQuizAction): TarantinoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TarantinoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
