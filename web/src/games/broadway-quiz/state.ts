import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BroadwayQuizSettings { questions: "10" | "20" | "30"; }
export interface BroadwayQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BroadwayQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Hamilton' was created by?", choices: ["Stephen Sondheim", "Lin-Manuel Miranda", "Jonathan Larson", "Pasek and Paul"], correct: 1 },
  { question: "'The Phantom of the Opera' is by?", choices: ["Stephen Schwartz", "Andrew Lloyd Webber", "Frank Wildhorn", "Maury Yeston"], correct: 1 },
  { question: "'Wicked' opened on Broadway in?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "'Rent' is by?", choices: ["Stephen Sondheim", "Jonathan Larson", "Lin-Manuel Miranda", "William Finn"], correct: 1 },
  { question: "'Sweeney Todd' is by?", choices: ["Stephen Sondheim", "Andrew Lloyd Webber", "Jerry Bock", "Cy Coleman"], correct: 0 },
  { question: "'A Chorus Line' won the Pulitzer in?", choices: ["1972", "1976", "1979", "1985"], correct: 1 },
  { question: "'Cats' is based on poems by?", choices: ["W.B. Yeats", "T.S. Eliot", "Robert Frost", "Dylan Thomas"], correct: 1 },
  { question: "'Les Misérables' is based on a novel by?", choices: ["Dumas", "Hugo", "Balzac", "Flaubert"], correct: 1 },
  { question: "'The Sound of Music' was written by?", choices: ["Lerner & Loewe", "Rodgers & Hammerstein", "Kander & Ebb", "Bock & Harnick"], correct: 1 },
  { question: "'My Fair Lady' is based on which Shaw play?", choices: ["Pygmalion", "Saint Joan", "Major Barbara", "Heartbreak House"], correct: 0 },
  { question: "'Fiddler on the Roof' is set in?", choices: ["Hungary", "Russia", "Poland", "Romania"], correct: 1 },
  { question: "'West Side Story' music is by?", choices: ["Bernstein", "Sondheim", "Bock", "Loesser"], correct: 0 },
  { question: "'Chicago' was choreographed by?", choices: ["Jerome Robbins", "Bob Fosse", "Michael Bennett", "Susan Stroman"], correct: 1 },
  { question: "'Hadestown' won the Tony for Best Musical in?", choices: ["2017", "2018", "2019", "2020"], correct: 2 },
  { question: "'Dear Evan Hansen' songs are by?", choices: ["Pasek and Paul", "Lin-Manuel Miranda", "Jason Robert Brown", "Sara Bareilles"], correct: 0 },
  { question: "'Avenue Q' is famous for using?", choices: ["Tap dance", "Puppets", "Aerial silks", "Holograms"], correct: 1 },
  { question: "'In the Heights' is set in?", choices: ["Harlem", "The Bronx", "Washington Heights", "East Village"], correct: 2 },
  { question: "'Annie' is based on a comic strip from?", choices: ["1924", "1934", "1944", "1954"], correct: 1 },
  { question: "'The Book of Mormon' is by?", choices: ["Trey Parker, Matt Stone, Robert Lopez", "Pasek and Paul", "Schwartz and Stein", "Kander and Ebb"], correct: 0 },
  { question: "'Spring Awakening' is by?", choices: ["Duncan Sheik", "Jonathan Larson", "Adam Guettel", "Jason Robert Brown"], correct: 0 },
  { question: "'Beauty and the Beast' opened on Broadway in?", choices: ["1991", "1994", "1997", "1999"], correct: 1 },
  { question: "'The Lion King' opened on Broadway in?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "'Six' tells the story of?", choices: ["Henry VIII's wives", "Six daughters", "Six sisters", "Six saints"], correct: 0 },
  { question: "'A Strange Loop' won the Pulitzer in?", choices: ["2018", "2019", "2020", "2022"], correct: 2 },
  { question: "'The Music Man' was written by?", choices: ["Meredith Willson", "Frank Loesser", "Jule Styne", "Cole Porter"], correct: 0 },
  { question: "'Guys and Dolls' is by?", choices: ["Frank Loesser", "Jule Styne", "Cole Porter", "Bock & Harnick"], correct: 0 },
  { question: "Stephen Schwartz wrote which 1970s hit?", choices: ["Pippin", "Godspell", "Both", "Neither"], correct: 2 },
  { question: "'Company' is by?", choices: ["Sondheim", "Lloyd Webber", "Rodgers", "Schwartz"], correct: 0 },
  { question: "'Sunday in the Park with George' is about?", choices: ["Seurat", "Monet", "Cézanne", "Pissarro"], correct: 0 },
  { question: "'Once on This Island' is by?", choices: ["Ahrens & Flaherty", "Pasek & Paul", "Bock & Harnick", "Kander & Ebb"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BroadwayQuizSettings): BroadwayQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BroadwayQuizState, action: BroadwayQuizAction): BroadwayQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BroadwayQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
