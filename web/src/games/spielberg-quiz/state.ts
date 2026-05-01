import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpielbergQuizSettings { questions: "10" | "20" | "30"; }
export interface SpielbergQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpielbergQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Steven Spielberg born?", choices: ["1942", "1946", "1950", "1954"], correct: 1 },
  { question: "What 1975 film made Spielberg famous?", choices: ["Jaws", "Duel", "Sugarland Express", "Close Encounters"], correct: 0 },
  { question: "Jaws is based on a novel by?", choices: ["Peter Benchley", "Stephen King", "Tom Clancy", "Michael Crichton"], correct: 0 },
  { question: "Who composed the score for Jaws?", choices: ["John Williams", "Jerry Goldsmith", "Hans Zimmer", "Maurice Jarre"], correct: 0 },
  { question: "What is the name of the shark in Jaws (production nickname)?", choices: ["Bruce", "Sharkie", "Big Mouth", "Sammy"], correct: 0 },
  { question: "What 1977 sci-fi film features alien contact?", choices: ["Close Encounters of the Third Kind", "E.T.", "AI", "War of the Worlds"], correct: 0 },
  { question: "What 1981 Indiana Jones film?", choices: ["Raiders of the Lost Ark", "Temple of Doom", "Last Crusade", "Kingdom of the Crystal Skull"], correct: 0 },
  { question: "Who plays Indiana Jones?", choices: ["Harrison Ford", "Sean Connery", "Tom Selleck", "Magnum"], correct: 0 },
  { question: "What 1982 alien-friendship film?", choices: ["E.T. the Extra-Terrestrial", "Close Encounters", "AI", "Super 8"], correct: 0 },
  { question: "What 1993 dinosaur film?", choices: ["Jurassic Park", "Jurassic World", "Dinosaur", "Land of the Lost"], correct: 0 },
  { question: "Who wrote the novel 'Jurassic Park'?", choices: ["Michael Crichton", "Stephen King", "John Grisham", "Robert Ludlum"], correct: 0 },
  { question: "Spielberg won Best Director Oscar for which 1993 film?", choices: ["Schindler's List", "Jurassic Park", "Indiana Jones", "Hook"], correct: 0 },
  { question: "Schindler's List is based on a book by?", choices: ["Thomas Keneally", "Elie Wiesel", "Anne Frank", "Primo Levi"], correct: 0 },
  { question: "What 1998 WWII film opens with the D-Day landing?", choices: ["Saving Private Ryan", "The Thin Red Line", "Pearl Harbor", "Band of Brothers"], correct: 0 },
  { question: "Who plays Captain Miller in Saving Private Ryan?", choices: ["Tom Hanks", "Matt Damon", "Tom Sizemore", "Edward Burns"], correct: 0 },
  { question: "What 2002 sci-fi film stars Tom Cruise as a precrime cop?", choices: ["Minority Report", "War of the Worlds", "AI", "Catch Me If You Can"], correct: 0 },
  { question: "What 2002 caper film stars DiCaprio as Frank Abagnale Jr.?", choices: ["Catch Me If You Can", "The Aviator", "The Wolf of Wall Street", "Minority Report"], correct: 0 },
  { question: "What 2012 historical drama stars Daniel Day-Lewis?", choices: ["Lincoln", "War Horse", "Bridge of Spies", "The Post"], correct: 0 },
  { question: "What 2017 newsroom drama stars Streep and Hanks?", choices: ["The Post", "Bridge of Spies", "Lincoln", "Munich"], correct: 0 },
  { question: "Spielberg co-founded which studio in 1994?", choices: ["DreamWorks", "Amblin", "Pixar", "Lucasfilm"], correct: 0 },
  { question: "Who co-founded DreamWorks with Spielberg?", choices: ["Jeffrey Katzenberg and David Geffen", "George Lucas", "Ron Howard", "James Cameron"], correct: 0 },
  { question: "Spielberg's production company?", choices: ["Amblin Entertainment", "Bad Robot", "Legendary", "Bad Hat Harry"], correct: 0 },
  { question: "What 2005 Spielberg film about the Munich Olympics?", choices: ["Munich", "War Horse", "Bridge of Spies", "Lincoln"], correct: 0 },
  { question: "What 2021 musical remake did Spielberg direct?", choices: ["West Side Story", "In the Heights", "The Music Man", "Cats"], correct: 0 },
  { question: "What semi-autobiographical 2022 film?", choices: ["The Fabelmans", "West Side Story", "Ready Player One", "Bridge of Spies"], correct: 0 },
  { question: "Spielberg won Best Director Oscar a second time for?", choices: ["Saving Private Ryan", "Schindler's List", "Lincoln", "Munich"], correct: 0 },
  { question: "Who is Spielberg's frequent music collaborator?", choices: ["John Williams", "Hans Zimmer", "Alan Silvestri", "Howard Shore"], correct: 0 },
  { question: "Indiana Jones' ultimate quest in 'Last Crusade'?", choices: ["Holy Grail", "Ark of Covenant", "Sankara stones", "Crystal Skull"], correct: 0 },
  { question: "Spielberg directed which TV episode of Columbo (early career)?", choices: ["Murder by the Book", "Death Lends a Hand", "Suitable for Framing", "Lady in Waiting"], correct: 0 },
  { question: "What 2011 motion-capture film about a young reporter?", choices: ["The Adventures of Tintin", "War Horse", "Ready Player One", "AI"], correct: 0 },
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
