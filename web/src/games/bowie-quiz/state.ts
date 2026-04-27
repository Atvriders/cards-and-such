import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BowieQuizSettings { questions: "10" | "20" | "30"; }
export interface BowieQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BowieQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "David Bowie's birth name?", choices: ["David Jones", "David Robert Jones", "David Bowman", "David Wright"], correct: 1 },
  { question: "Year of Bowie's birth?", choices: ["1945", "1947", "1949", "1951"], correct: 1 },
  { question: "Bowie's London birthplace area?", choices: ["Brixton", "Camden", "Chelsea", "Soho"], correct: 0 },
  { question: "First major hit?", choices: ["Space Oddity", "Heroes", "Let's Dance", "Fame"], correct: 0 },
  { question: "'Space Oddity' year?", choices: ["1967", "1969", "1971", "1973"], correct: 1 },
  { question: "Bowie's alien rocker alter ego?", choices: ["Aladdin Sane", "Ziggy Stardust", "Thin White Duke", "Major Tom"], correct: 1 },
  { question: "'The Rise and Fall of Ziggy Stardust' year?", choices: ["1971", "1972", "1973", "1974"], correct: 1 },
  { question: "Bowie's character with lightning bolt face paint?", choices: ["Aladdin Sane", "Ziggy", "Pierrot", "Thin White Duke"], correct: 0 },
  { question: "Bowie's Berlin trilogy includes?", choices: ["Low", "Heroes", "Lodger", "All three"], correct: 3 },
  { question: "Bowie's collaborator on Berlin trilogy?", choices: ["Brian Eno", "Iggy Pop", "Tony Visconti", "All of these"], correct: 3 },
  { question: "'Let's Dance' year?", choices: ["1981", "1983", "1985", "1987"], correct: 1 },
  { question: "Producer of 'Let's Dance'?", choices: ["Nile Rodgers", "Brian Eno", "Tony Visconti", "Trevor Horn"], correct: 0 },
  { question: "Bowie sang 'Under Pressure' with?", choices: ["Queen", "Mick Jagger", "Tina Turner", "Lou Reed"], correct: 0 },
  { question: "Bowie sang 'Dancing in the Street' with?", choices: ["Mick Jagger", "Freddie Mercury", "Lou Reed", "Iggy Pop"], correct: 0 },
  { question: "Bowie's 1980 hit?", choices: ["Ashes to Ashes", "Modern Love", "China Girl", "Blue Jean"], correct: 0 },
  { question: "Year of Bowie's death?", choices: ["2014", "2016", "2018", "2020"], correct: 1 },
  { question: "Bowie's final studio album?", choices: ["Blackstar", "The Next Day", "Heathen", "Reality"], correct: 0 },
  { question: "Bowie's wife (1992)?", choices: ["Iman", "Angie", "Mary Finnigan", "Coco Schwab"], correct: 0 },
  { question: "Bowie's first wife?", choices: ["Angie Bowie", "Iman", "Mary Finnigan", "Hermione Farthingale"], correct: 0 },
  { question: "Bowie's son is filmmaker?", choices: ["Duncan Jones", "Ziggy Jones", "David Jr.", "Aladdin Jones"], correct: 0 },
  { question: "Duncan Jones directed?", choices: ["Moon", "Source Code", "Both", "Warcraft only"], correct: 2 },
  { question: "Bowie acted in which fantasy film?", choices: ["Labyrinth", "Legend", "Willow", "The Dark Crystal"], correct: 0 },
  { question: "'Labyrinth' was directed by?", choices: ["Jim Henson", "Frank Oz", "George Lucas", "Terry Gilliam"], correct: 0 },
  { question: "'The Man Who Fell to Earth' director?", choices: ["Nicolas Roeg", "Stanley Kubrick", "John Cassavetes", "Werner Herzog"], correct: 0 },
  { question: "Bowie covered 'Wild Is the Wind', originally by?", choices: ["Nina Simone", "Aretha Franklin", "Etta James", "Sarah Vaughan"], correct: 0 },
  { question: "Bowie's song with Queen?", choices: ["Under Pressure", "Bohemian Rhapsody", "Killer Queen", "Radio Ga Ga"], correct: 0 },
  { question: "What instrument did Bowie famously play, beyond vocals?", choices: ["Saxophone", "Cello", "Trombone", "Mandolin"], correct: 0 },
  { question: "Bowie's eyes appeared different colors due to?", choices: ["Anisocoria from injury", "Genetics", "Contact lenses", "Surgery"], correct: 0 },
  { question: "Iggy Pop album Bowie produced?", choices: ["The Idiot", "Lust for Life", "Both", "Raw Power only"], correct: 2 },
  { question: "Bowie's character in 'The Prestige' (2006)?", choices: ["Nikola Tesla", "Edison", "A magician", "Houdini"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BowieQuizSettings): BowieQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BowieQuizState, action: BowieQuizAction): BowieQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BowieQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
