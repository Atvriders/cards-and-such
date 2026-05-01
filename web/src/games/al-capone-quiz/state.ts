import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlCaponeQuizSettings { questions: "10" | "20"; }
export interface AlCaponeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlCaponeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "Al Capone's nickname?", "choices": ["Scarface", "Big Al", "Killer", "Boss"], "correct": 0},
  {"question": "In which city did Capone rule organized crime?", "choices": ["Chicago", "New York", "Boston", "Detroit"], "correct": 0},
  {"question": "Capone was born in?", "choices": ["Brooklyn, NY", "Naples", "Chicago", "Sicily"], "correct": 0},
  {"question": "What ultimately got Capone convicted?", "choices": ["Tax evasion", "Murder", "Bootlegging", "Bribery"], "correct": 0},
  {"question": "Year of Capone's tax conviction?", "choices": ["1931", "1925", "1934", "1929"], "correct": 0},
  {"question": "Famous 1929 massacre tied to Capone?", "choices": ["St. Valentine's Day", "Lincoln Day", "Labor Day", "Memorial Day"], "correct": 0},
  {"question": "Capone's mentor/predecessor?", "choices": ["Johnny Torrio", "Lucky Luciano", "Frank Costello", "Bugs Moran"], "correct": 0},
  {"question": "Capone got 'Scarface' from?", "choices": ["Knife fight in Brooklyn", "Razor", "Gun", "War wound"], "correct": 0},
  {"question": "Capone's main rival in Chicago?", "choices": ["Bugs Moran", "Lucky Luciano", "Dutch Schultz", "Meyer Lansky"], "correct": 0},
  {"question": "Bugs Moran led which gang?", "choices": ["North Side", "South Side", "West Side", "East Side"], "correct": 0},
  {"question": "Capone's enforcer 'Machine Gun' ___?", "choices": ["Jack McGurn", "Frank Nitti", "Tony Accardo", "Paul Ricca"], "correct": 0},
  {"question": "Capone's key bookkeeper turned witness?", "choices": ["Leslie Shumway", "Frank Wilson", "Edward O'Hare", "Jake Lingle"], "correct": 0},
  {"question": "Treasury agent who indicted Capone for taxes?", "choices": ["Frank Wilson", "Eliot Ness", "Hoover", "Purvis"], "correct": 0},
  {"question": "Eliot Ness led which squad?", "choices": ["Untouchables", "G-Men", "Bureau", "Vice"], "correct": 0},
  {"question": "Capone served prison time in?", "choices": ["Alcatraz", "Sing Sing", "Leavenworth", "San Quentin"], "correct": 0},
  {"question": "First federal prison Capone went to?", "choices": ["Atlanta", "Alcatraz", "Lewisburg", "Marion"], "correct": 0},
  {"question": "Disease that affected Capone in prison?", "choices": ["Syphilis", "Cancer", "TB", "Pneumonia"], "correct": 0},
  {"question": "Capone died in?", "choices": ["1947", "1955", "1939", "1962"], "correct": 0},
  {"question": "Capone died at his home in?", "choices": ["Palm Island, FL", "Chicago", "NY", "LA"], "correct": 0},
  {"question": "Capone's first crime job for Frankie Yale?", "choices": ["Bouncer", "Driver", "Cook", "Lookout"], "correct": 0},
  {"question": "Famous Capone hangout hotel in Chicago?", "choices": ["Lexington", "Drake", "Palmer", "Blackstone"], "correct": 0},
  {"question": "Capone reportedly earned how much yearly at peak?", "choices": ["$60M+", "$5M", "$200M", "$1B"], "correct": 0},
  {"question": "Speakeasies flourished due to which amendment?", "choices": ["18th", "19th", "21st", "16th"], "correct": 0},
  {"question": "Prohibition ended with which amendment?", "choices": ["21st", "18th", "19th", "20th"], "correct": 0},
  {"question": "Which actor won Oscar playing Ness?", "choices": ["Sean Connery", "De Niro", "Pacino", "Hopkins"], "correct": 0},
  {"question": "De Niro played Capone in which film?", "choices": ["The Untouchables", "Goodfellas", "Casino", "Heat"], "correct": 0},
  {"question": "Capone's brother who became a lawman?", "choices": ["Vincenzo (Richard Hart)", "Frank", "Ralph", "John"], "correct": 0},
  {"question": "Capone Soup Kitchens opened during?", "choices": ["Great Depression", "Prohibition repeal", "WWI", "Bank panic"], "correct": 0},
  {"question": "Capone moved to Chicago around year?", "choices": ["1919", "1925", "1915", "1930"], "correct": 0},
  {"question": "Capone's official prison number at Alcatraz?", "choices": ["AZ-85", "AZ-1", "AZ-100", "AZ-007"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AlCaponeQuizSettings): AlCaponeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AlCaponeQuizState, action: AlCaponeQuizAction): AlCaponeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AlCaponeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
