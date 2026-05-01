import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TarantinoQuizSettings { questions: "10" | "20" | "30"; }
export interface TarantinoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TarantinoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Quentin Tarantino's first feature film as director?", choices: ["Reservoir Dogs", "Pulp Fiction", "True Romance", "Jackie Brown"], correct: 0 },
  { question: "What year did 'Pulp Fiction' release?", choices: ["1992", "1994", "1996", "1998"], correct: 1 },
  { question: "Pulp Fiction won Best Original Screenplay Oscar - who shared it?", choices: ["Tarantino and Roger Avary", "Tarantino solo", "Tarantino and Lawrence Bender", "Tarantino and Sally Menke"], correct: 0 },
  { question: "What color suits do the gangsters wear in Reservoir Dogs?", choices: ["Black with white shirts", "Gray", "Blue", "All black"], correct: 0 },
  { question: "What is Mr. Pink's actor?", choices: ["Steve Buscemi", "Tim Roth", "Michael Madsen", "Harvey Keitel"], correct: 0 },
  { question: "What is the song Mr. Blonde dances to during the torture scene?", choices: ["Stuck in the Middle With You", "Hooked on a Feeling", "Misirlou", "Son of a Preacher Man"], correct: 0 },
  { question: "Who plays Vincent Vega in 'Pulp Fiction'?", choices: ["John Travolta", "Bruce Willis", "Samuel L. Jackson", "Tim Roth"], correct: 0 },
  { question: "What 1997 film features Pam Grier as the lead?", choices: ["Jackie Brown", "Kill Bill", "Death Proof", "Inglourious Basterds"], correct: 0 },
  { question: "Jackie Brown is based on a novel by?", choices: ["Elmore Leonard", "James Ellroy", "Walter Mosley", "Cormac McCarthy"], correct: 0 },
  { question: "What 2003 martial arts film starts the 'Bride' saga?", choices: ["Kill Bill: Volume 1", "Kill Bill: Volume 2", "Death Proof", "Jackie Brown"], correct: 0 },
  { question: "Who plays The Bride in 'Kill Bill'?", choices: ["Uma Thurman", "Lucy Liu", "Vivica A. Fox", "Daryl Hannah"], correct: 0 },
  { question: "Who plays Bill in 'Kill Bill'?", choices: ["David Carradine", "Michael Madsen", "Christoph Waltz", "Quentin Tarantino"], correct: 0 },
  { question: "What 2009 alt-history WWII film did Tarantino direct?", choices: ["Inglourious Basterds", "Death Proof", "Django Unchained", "Pulp Fiction"], correct: 0 },
  { question: "Christoph Waltz won Oscars for which Tarantino films?", choices: ["Inglourious Basterds and Django Unchained", "Just Inglourious Basterds", "Just Django", "Once Upon a Time in Hollywood"], correct: 0 },
  { question: "What 2012 western stars Jamie Foxx as a freed slave?", choices: ["Django Unchained", "Hateful Eight", "Once Upon a Time in Hollywood", "Inglourious Basterds"], correct: 0 },
  { question: "What 2015 western is set after the Civil War?", choices: ["The Hateful Eight", "Django Unchained", "Once Upon a Time in Hollywood", "Reservoir Dogs"], correct: 0 },
  { question: "What format was 'The Hateful Eight' shot in?", choices: ["Ultra Panavision 70", "Standard 35mm", "IMAX", "Digital"], correct: 0 },
  { question: "Who composed the score for 'The Hateful Eight'?", choices: ["Ennio Morricone", "John Williams", "Hans Zimmer", "Howard Shore"], correct: 0 },
  { question: "What 2019 Tarantino film stars DiCaprio and Pitt?", choices: ["Once Upon a Time in Hollywood", "The Hateful Eight", "Django Unchained", "Inglourious Basterds"], correct: 0 },
  { question: "Who plays Cliff Booth in 'Once Upon a Time in Hollywood'?", choices: ["Brad Pitt", "Leonardo DiCaprio", "Margot Robbie", "Al Pacino"], correct: 0 },
  { question: "Tarantino has stated he plans to retire after how many films?", choices: ["10", "12", "15", "20"], correct: 0 },
  { question: "Tarantino worked at which video store in his youth?", choices: ["Video Archives", "Blockbuster", "Hollywood Video", "West Coast Video"], correct: 0 },
  { question: "Who composed many original Tarantino soundtracks via curation, especially for Kill Bill?", choices: ["RZA collaborated; mostly curated tracks", "John Williams", "Danny Elfman", "Hans Zimmer"], correct: 0 },
  { question: "What restaurant scene location is iconic in Pulp Fiction?", choices: ["Jack Rabbit Slim's", "Mel's Diner", "Big Kahuna Burger", "Denny's"], correct: 0 },
  { question: "What burger does Jules describe in Pulp Fiction?", choices: ["Big Kahuna Burger", "Royale with Cheese", "Both", "Quarter Pounder"], correct: 2 },
  { question: "Who plays Jules in Pulp Fiction?", choices: ["Samuel L. Jackson", "Ving Rhames", "Laurence Fishburne", "Wesley Snipes"], correct: 0 },
  { question: "Tarantino won how many Best Original Screenplay Oscars?", choices: ["Two", "Three", "One", "Four"], correct: 0 },
  { question: "What car drives in Death Proof?", choices: ["1970 Chevrolet Nova", "1969 Dodge Charger", "1965 Mustang", "1971 Plymouth Cuda"], correct: 0 },
  { question: "Tarantino directed which True Romance contribution?", choices: ["Wrote the screenplay (directed by Tony Scott)", "Both wrote and directed", "Just produced", "Neither"], correct: 0 },
  { question: "What is the name of the brothel in 'From Dusk Till Dawn' (Tarantino wrote)?", choices: ["Titty Twister", "Bottom Drop", "Border Bar", "Vampire Inn"], correct: 0 },
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
