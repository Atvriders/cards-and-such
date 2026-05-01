import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ScorseseQuizSettings { questions: "10" | "20" | "30"; }
export interface ScorseseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ScorseseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Martin Scorsese born?", choices: ["1938", "1942", "1946", "1950"], correct: 1 },
  { question: "Where was Scorsese born?", choices: ["Queens, New York", "Brooklyn", "Manhattan (Little Italy)", "Bronx"], correct: 2 },
  { question: "What 1976 film stars De Niro as Travis Bickle?", choices: ["Taxi Driver", "Mean Streets", "Raging Bull", "The Deer Hunter"], correct: 0 },
  { question: "What 1980 boxing biopic earned De Niro an Oscar?", choices: ["Raging Bull", "The Champ", "Rocky", "Million Dollar Baby"], correct: 0 },
  { question: "Who plays Jake LaMotta?", choices: ["Robert De Niro", "Joe Pesci", "Al Pacino", "Sylvester Stallone"], correct: 0 },
  { question: "What 1990 mob film stars Ray Liotta as Henry Hill?", choices: ["Goodfellas", "Casino", "The Departed", "Mean Streets"], correct: 0 },
  { question: "Joe Pesci won Best Supporting Actor Oscar for?", choices: ["Goodfellas", "Casino", "Raging Bull", "The Irishman"], correct: 0 },
  { question: "What 1995 Scorsese film is set in Las Vegas casinos?", choices: ["Casino", "Goodfellas", "Wolf of Wall Street", "Bringing Out the Dead"], correct: 0 },
  { question: "Scorsese won Best Director Oscar for which 2006 film?", choices: ["The Departed", "The Aviator", "Hugo", "Gangs of New York"], correct: 0 },
  { question: "The Departed is a remake of which Hong Kong film?", choices: ["Infernal Affairs", "Hard Boiled", "A Better Tomorrow", "City of Sadness"], correct: 0 },
  { question: "Who plays Frank Costello in The Departed?", choices: ["Jack Nicholson", "Matt Damon", "Leonardo DiCaprio", "Mark Wahlberg"], correct: 0 },
  { question: "What 2004 biopic about Howard Hughes stars DiCaprio?", choices: ["The Aviator", "Hugo", "The Wolf of Wall Street", "Gangs of New York"], correct: 0 },
  { question: "What 2013 Scorsese-DiCaprio film about Jordan Belfort?", choices: ["The Wolf of Wall Street", "The Departed", "Shutter Island", "Gangs of New York"], correct: 0 },
  { question: "Wolf of Wall Street is based on whose memoir?", choices: ["Jordan Belfort", "Bernie Madoff", "Michael Milken", "Ivan Boesky"], correct: 0 },
  { question: "Scorsese's 2011 family film?", choices: ["Hugo", "The Aviator", "Cape Fear", "Bringing Out the Dead"], correct: 0 },
  { question: "What 2019 Netflix film features De Niro, Pacino, Pesci?", choices: ["The Irishman", "Goodfellas 2", "Casino 2", "Mean Streets II"], correct: 0 },
  { question: "The Irishman is based on a book about?", choices: ["Frank Sheeran", "Jimmy Hoffa Jr.", "John Gotti", "Lucky Luciano"], correct: 0 },
  { question: "What 1988 controversial religious film by Scorsese?", choices: ["The Last Temptation of Christ", "Kundun", "Silence", "Bringing Out the Dead"], correct: 0 },
  { question: "What 2016 Scorsese film about Jesuit missionaries in Japan?", choices: ["Silence", "Kundun", "The Last Temptation of Christ", "Hugo"], correct: 0 },
  { question: "Scorsese's 2023 film about Osage murders?", choices: ["Killers of the Flower Moon", "The Irishman", "Silence", "Hugo"], correct: 0 },
  { question: "Who stars in Killers of the Flower Moon?", choices: ["DiCaprio, De Niro, Lily Gladstone", "Pacino, Pesci, Gladstone", "DiCaprio, Hardy, Gladstone", "De Niro, Pesci, Hill"], correct: 0 },
  { question: "What 1973 film helped establish Scorsese with De Niro/Keitel?", choices: ["Mean Streets", "Boxcar Bertha", "Who's That Knocking", "Taxi Driver"], correct: 0 },
  { question: "What 1991 Scorsese remake stars De Niro as a stalker?", choices: ["Cape Fear", "The King of Comedy", "Bringing Out the Dead", "Casino"], correct: 0 },
  { question: "What documentary did Scorsese make about The Band?", choices: ["The Last Waltz", "No Direction Home", "George Harrison: Living in the Material World", "Shine a Light"], correct: 0 },
  { question: "Scorsese's documentary about Bob Dylan is called?", choices: ["No Direction Home", "Rolling Thunder Revue", "Both", "Don't Look Back"], correct: 2 },
  { question: "What 1985 Scorsese black comedy stars Griffin Dunne?", choices: ["After Hours", "The King of Comedy", "Bringing Out the Dead", "Mean Streets"], correct: 0 },
  { question: "What 1982 satire stars De Niro as a wannabe comedian?", choices: ["The King of Comedy", "Taxi Driver", "Raging Bull", "After Hours"], correct: 0 },
  { question: "Scorsese frequently collaborates with which editor?", choices: ["Thelma Schoonmaker", "Walter Murch", "Sally Menke", "Anne V. Coates"], correct: 0 },
  { question: "Who plays Ace Rothstein in Casino?", choices: ["Robert De Niro", "Joe Pesci", "James Woods", "Frank Vincent"], correct: 0 },
  { question: "Scorsese's 2010 thriller with DiCaprio about an asylum?", choices: ["Shutter Island", "The Departed", "The Aviator", "Bringing Out the Dead"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ScorseseQuizSettings): ScorseseQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ScorseseQuizState, action: ScorseseQuizAction): ScorseseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ScorseseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
