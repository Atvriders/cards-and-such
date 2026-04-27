import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HipHopQuizSettings { questions: "10" | "20" | "30"; }
export interface HipHopQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HipHopQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hip hop is widely said to have started in which NYC borough?", choices: ["Brooklyn", "Manhattan", "The Bronx", "Queens"], correct: 2 },
  { question: "DJ Kool Herc is credited with pioneering?", choices: ["Beatboxing", "Breakbeats", "Auto-Tune", "Mumble rap"], correct: 1 },
  { question: "Tupac's first studio album was?", choices: ["Me Against the World", "2Pacalypse Now", "All Eyez on Me", "Strictly 4 My N.I.G.G.A.Z."], correct: 1 },
  { question: "The Notorious B.I.G. was from?", choices: ["Queens", "Compton", "Brooklyn", "Harlem"], correct: 2 },
  { question: "Jay-Z's debut album is?", choices: ["The Blueprint", "Reasonable Doubt", "In My Lifetime, Vol. 1", "Vol. 2... Hard Knock Life"], correct: 1 },
  { question: "Eminem's mentor was?", choices: ["Snoop Dogg", "Dr. Dre", "Jay-Z", "Ice Cube"], correct: 1 },
  { question: "Kanye West's debut album was?", choices: ["Late Registration", "Graduation", "The College Dropout", "808s & Heartbreak"], correct: 2 },
  { question: "Nas's 1994 classic album is?", choices: ["It Was Written", "Stillmatic", "Illmatic", "I Am..."], correct: 2 },
  { question: "Wu-Tang Clan is from?", choices: ["The Bronx", "Staten Island", "Queens", "Compton"], correct: 1 },
  { question: "OutKast is the duo from?", choices: ["Memphis", "New Orleans", "Atlanta", "Houston"], correct: 2 },
  { question: "Run-D.M.C. famously collaborated with which rock band on 'Walk This Way'?", choices: ["Bon Jovi", "Aerosmith", "Van Halen", "Guns N' Roses"], correct: 1 },
  { question: "N.W.A. stands for?", choices: ["Notorious West Anthem", "Niggaz Wit Attitudes", "New Wave Artists", "Nineteen West Avenue"], correct: 1 },
  { question: "Lauryn Hill was a member of?", choices: ["Salt-N-Pepa", "TLC", "The Fugees", "En Vogue"], correct: 2 },
  { question: "Snoop Dogg's debut album was?", choices: ["The Doggfather", "Tha Doggystyle", "Doggystyle", "Tha Last Meal"], correct: 2 },
  { question: "Lil Wayne's mixtape series is called?", choices: ["Tha Carter", "Da Drought", "Sorry 4 the Wait", "The Free Wheezy"], correct: 1 },
  { question: "Kendrick Lamar won Pulitzer for which album?", choices: ["good kid, m.A.A.d city", "Damn.", "To Pimp a Butterfly", "Mr. Morale & the Big Steppers"], correct: 1 },
  { question: "Drake is from which country?", choices: ["USA", "Canada", "UK", "Jamaica"], correct: 1 },
  { question: "Missy Elliott is known for working with producer?", choices: ["Pharrell", "Timbaland", "DJ Premier", "RZA"], correct: 1 },
  { question: "'Juicy' is a famous Biggie track from which album?", choices: ["Life After Death", "Ready to Die", "Born Again", "Duets"], correct: 1 },
  { question: "Public Enemy's 'Fight the Power' was on which film soundtrack?", choices: ["Boyz n the Hood", "Do the Right Thing", "Menace II Society", "New Jack City"], correct: 1 },
  { question: "MF DOOM's signature was?", choices: ["A gold chain", "A metal mask", "Sunglasses", "A bandana"], correct: 1 },
  { question: "A Tribe Called Quest was part of which collective?", choices: ["Soulquarians", "Native Tongues", "G-Unit", "Death Row"], correct: 1 },
  { question: "50 Cent's debut studio album was?", choices: ["The Massacre", "Curtis", "Get Rich or Die Tryin'", "Before I Self Destruct"], correct: 2 },
  { question: "Cardi B was a star on which TV show?", choices: ["Bad Girls Club", "Love & Hip Hop", "Real Housewives", "Empire"], correct: 1 },
  { question: "Travis Scott is from which Texas city?", choices: ["Austin", "Dallas", "Houston", "San Antonio"], correct: 2 },
  { question: "Megan Thee Stallion is from?", choices: ["Atlanta", "Miami", "Houston", "Memphis"], correct: 2 },
  { question: "Trap music is most associated with?", choices: ["NYC", "LA", "The South", "Chicago"], correct: 2 },
  { question: "J. Cole's record label is?", choices: ["Top Dawg", "Dreamville", "Roc Nation", "Def Jam"], correct: 1 },
  { question: "A 'cypher' in hip hop refers to?", choices: ["A coded lyric", "A circle of MCs taking turns", "A producer's signature", "A graffiti tag"], correct: 1 },
  { question: "Grandmaster Flash pioneered?", choices: ["Auto-Tune", "Turntablism", "Sampling drums", "Mumble flow"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HipHopQuizSettings): HipHopQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HipHopQuizState, action: HipHopQuizAction): HipHopQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HipHopQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
