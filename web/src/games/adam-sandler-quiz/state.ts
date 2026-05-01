import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AdamSandlerQuizSettings { questions: "10" | "20" | "30"; }
export interface AdamSandlerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AdamSandlerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Adam Sandler born?", choices: ["1962", "1966", "1970", "1973"], correct: 1 },
  { question: "What state was Sandler raised in?", choices: ["New Hampshire", "New York", "New Jersey", "Connecticut"], correct: 0 },
  { question: "Sandler joined SNL in what year?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "What 1995 film features Sandler as a man returning to school?", choices: ["Billy Madison", "Happy Gilmore", "Big Daddy", "The Waterboy"], correct: 0 },
  { question: "In 'Happy Gilmore' (1996), Sandler plays a hockey player who becomes a?", choices: ["Golfer", "Football player", "Boxer", "Skier"], correct: 0 },
  { question: "Who plays Shooter McGavin in 'Happy Gilmore'?", choices: ["Christopher McDonald", "Bob Barker", "Carl Weathers", "Kevin Nealon"], correct: 0 },
  { question: "In 'The Waterboy' (1998), Sandler plays?", choices: ["Bobby Boucher", "Henry Roth", "Sonny Koufax", "Robbie Hart"], correct: 0 },
  { question: "Sandler's wedding singer character is named?", choices: ["Robbie Hart", "Henry Roth", "Bobby Boucher", "Billy Madison"], correct: 0 },
  { question: "Who co-stars with Sandler in 'The Wedding Singer' (1998)?", choices: ["Drew Barrymore", "Jennifer Aniston", "Salma Hayek", "Winona Ryder"], correct: 0 },
  { question: "Sandler's production company is named?", choices: ["Happy Madison", "Big Daddy", "Sandler Films", "Funny Bone"], correct: 0 },
  { question: "What 1999 film stars Sandler as a single dad?", choices: ["Big Daddy", "Mr. Deeds", "Click", "50 First Dates"], correct: 0 },
  { question: "In '50 First Dates' (2004), Sandler tries to win the heart of?", choices: ["Drew Barrymore's character with amnesia", "Jennifer Aniston", "Salma Hayek", "Penelope Cruz"], correct: 0 },
  { question: "Sandler stars opposite Jack Nicholson in which 2003 film?", choices: ["Anger Management", "Spanglish", "Click", "Mr. Deeds"], correct: 0 },
  { question: "Sandler received critical acclaim for which 2002 P.T. Anderson film?", choices: ["Punch-Drunk Love", "Spanglish", "Reign Over Me", "Funny People"], correct: 0 },
  { question: "What 2019 Safdie brothers film starred Sandler as a jeweler?", choices: ["Uncut Gems", "Hustle", "The Meyerowitz Stories", "Murder Mystery"], correct: 0 },
  { question: "Sandler plays Howard Ratner in?", choices: ["Uncut Gems", "Hustle", "Pixels", "Click"], correct: 0 },
  { question: "Which 2008 film co-stars Sandler with Don Cheadle as old college friends?", choices: ["Reign Over Me", "Funny People", "Anger Management", "Click"], correct: 0 },
  { question: "Sandler released a comedy album titled?", choices: ["They're All Gonna Laugh at You!", "What the Hell Happened to Me?", "What's Your Name?", "All of these"], correct: 3 },
  { question: "Sandler's 'Hanukkah Song' debuted on which show?", choices: ["SNL Weekend Update", "Comedy Central Special", "Tonight Show", "Letterman"], correct: 0 },
  { question: "What 2010 ensemble comedy reunites Sandler with childhood friends?", choices: ["Grown Ups", "Just Go With It", "That's My Boy", "Bedtime Stories"], correct: 0 },
  { question: "Sandler co-stars with Drew Barrymore in how many films?", choices: ["Three", "Two", "Four", "Five"], correct: 0 },
  { question: "What 2022 basketball drama starred Sandler?", choices: ["Hustle", "Air", "Coach", "Free Throw"], correct: 0 },
  { question: "Sandler signed a multi-film deal with which streaming platform?", choices: ["Netflix", "Hulu", "Amazon Prime", "Apple TV+"], correct: 0 },
  { question: "Who plays the villain in 'Billy Madison'?", choices: ["Bradley Whitford", "Steve Buscemi", "Norm Macdonald", "Chris Farley"], correct: 0 },
  { question: "In 'Mr. Deeds' (2002), Sandler's character inherits how much money?", choices: ["$40 billion", "$1 million", "$100 million", "$10 billion"], correct: 0 },
  { question: "Which Sandler movie features the song 'Grow Old With You'?", choices: ["The Wedding Singer", "50 First Dates", "Big Daddy", "Click"], correct: 0 },
  { question: "Sandler hosts which annual comedy holiday concert event historically?", choices: ["Comedy Central charity events; Hanukkah segments", "Just for Laughs Montreal", "Caesars Palace", "MTV Awards"], correct: 0 },
  { question: "Sandler appeared in 'Saturday Night Live' until what year?", choices: ["1995", "1997", "1999", "2001"], correct: 0 },
  { question: "Sandler plays a hairdresser in which 2008 comedy?", choices: ["You Don't Mess With the Zohan", "Bedtime Stories", "I Now Pronounce You Chuck and Larry", "Funny People"], correct: 0 },
  { question: "What number is on Happy Gilmore's hockey jersey?", choices: ["No specific number established", "9", "18", "23"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AdamSandlerQuizSettings): AdamSandlerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AdamSandlerQuizState, action: AdamSandlerQuizAction): AdamSandlerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AdamSandlerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
