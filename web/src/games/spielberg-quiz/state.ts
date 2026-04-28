import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpielbergQuizSettings { questions: "10" | "20" | "30"; }
export interface SpielbergQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpielbergQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Jaws year?", choices: ["1973", "1975", "1977", "1979"], correct: 1 },
  { question: "Close Encounters year?", choices: ["1975", "1977", "1979", "1981"], correct: 1 },
  { question: "Raiders of the Lost Ark year?", choices: ["1979", "1981", "1983", "1985"], correct: 1 },
  { question: "ET year?", choices: ["1980", "1982", "1984", "1986"], correct: 1 },
  { question: "Indiana Jones Temple of Doom year?", choices: ["1982", "1984", "1986", "1988"], correct: 1 },
  { question: "Last Crusade year?", choices: ["1987", "1989", "1991", "1993"], correct: 1 },
  { question: "Jurassic Park year?", choices: ["1991", "1993", "1995", "1997"], correct: 1 },
  { question: "Schindler's List year?", choices: ["1991", "1993", "1995", "1997"], correct: 1 },
  { question: "Saving Private Ryan year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "AI: Artificial Intelligence year?", choices: ["1999", "2001", "2003", "2005"], correct: 1 },
  { question: "Minority Report year?", choices: ["2000", "2002", "2004", "2006"], correct: 1 },
  { question: "Catch Me If You Can year?", choices: ["2000", "2002", "2004", "2006"], correct: 1 },
  { question: "Munich year?", choices: ["2003", "2005", "2007", "2009"], correct: 1 },
  { question: "Lincoln year?", choices: ["2010", "2012", "2014", "2016"], correct: 1 },
  { question: "Bridge of Spies year?", choices: ["2013", "2015", "2017", "2019"], correct: 1 },
  { question: "Ready Player One year?", choices: ["2016", "2018", "2020", "2022"], correct: 1 },
  { question: "Fabelmans year?", choices: ["2020", "2022", "2024", "2025"], correct: 1 },
  { question: "Spielberg won Best Director Oscar for?", choices: ["Schindler's List", "Saving Private Ryan", "Both", "Just Schindler's"], correct: 2 },
  { question: "Spielberg co-founded which studio?", choices: ["DreamWorks", "Pixar", "Lucasfilm", "Imagine"], correct: 0 },
  { question: "DreamWorks co-founders?", choices: ["Spielberg, Katzenberg, Geffen", "Lucas, Spielberg, Coppola", "Just Spielberg", "Spielberg & Disney"], correct: 0 },
  { question: "Indy actor?", choices: ["Harrison Ford", "Tom Hanks", "Mel Gibson", "Sean Connery"], correct: 0 },
  { question: "Hooker (Jaws shark hunter)?", choices: ["Quint", "Brody", "Hooper", "Vaughn"], correct: 0 },
  { question: "Schindler in Schindler's List?", choices: ["Liam Neeson", "Anthony Hopkins", "Ralph Fiennes", "Geoffrey Rush"], correct: 0 },
  { question: "Amon Goeth?", choices: ["Ralph Fiennes", "Liam Neeson", "Stellan Skarsgard", "Christoph Waltz"], correct: 0 },
  { question: "ET phone home destination?", choices: ["Home/spaceship", "Earth", "Phone booth", "Mom"], correct: 0 },
  { question: "Spielberg's first feature?", choices: ["Duel", "Sugarland Express", "Jaws", "Firelight"], correct: 0 },
  { question: "Spielberg born in?", choices: ["1944", "1946", "1948", "1950"], correct: 1 },
  { question: "Color Purple year?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Empire of the Sun year?", choices: ["1985", "1987", "1989", "1991"], correct: 1 },
  { question: "Hook year?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpielbergQuizSettings): SpielbergQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpielbergQuizState, action: SpielbergQuizAction): SpielbergQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpielbergQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
