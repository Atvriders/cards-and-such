import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwentyTensQuizSettings { questions: "10" | "15"; }
export interface TwentyTensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwentyTensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was elected U.S. President in 2016?",
    "choices": [
      "Hillary Clinton",
      "Donald Trump",
      "Bernie Sanders",
      "Ted Cruz"
    ],
    "correct": 1
  },
  {
    "question": "Which 2011 al-Qaeda leader was killed by US Navy SEALs?",
    "choices": [
      "Ayman al-Zawahiri",
      "Osama bin Laden",
      "Abu Bakr al-Baghdadi",
      "Anwar al-Awlaki"
    ],
    "correct": 1
  },
  {
    "question": "Which UK referendum result in 2016 led to leaving the EU?",
    "choices": [
      "Scexit",
      "Brexit",
      "Frexit",
      "Grexit"
    ],
    "correct": 1
  },
  {
    "question": "Instagram was launched in?",
    "choices": [
      "2009",
      "2010",
      "2011",
      "2012"
    ],
    "correct": 1
  },
  {
    "question": "Which 2012 Disney company acquired Lucasfilm?",
    "choices": [
      "Pixar",
      "Marvel",
      "Disney",
      "Fox"
    ],
    "correct": 2
  },
  {
    "question": "The Arab Spring uprisings began in late 2010 in which country?",
    "choices": [
      "Egypt",
      "Tunisia",
      "Libya",
      "Syria"
    ],
    "correct": 1
  },
  {
    "question": "Which 2011 royal wedding featured Prince William and?",
    "choices": [
      "Kate Middleton",
      "Meghan Markle",
      "Pippa Middleton",
      "Eugenie"
    ],
    "correct": 0
  },
  {
    "question": "Which 2015 climate accord was signed in Paris?",
    "choices": [
      "Kyoto Protocol",
      "Paris Agreement",
      "Copenhagen Accord",
      "Doha Amendment"
    ],
    "correct": 1
  },
  {
    "question": "Which 2010 oil spill polluted the Gulf of Mexico?",
    "choices": [
      "Exxon Valdez",
      "Deepwater Horizon",
      "Prestige",
      "Sea Empress"
    ],
    "correct": 1
  },
  {
    "question": "Pope Benedict XVI was succeeded in 2013 by?",
    "choices": [
      "John Paul III",
      "Francis",
      "Leo XIV",
      "Pius XIII"
    ],
    "correct": 1
  },
  {
    "question": "Which 2010 Apple device popularized tablets?",
    "choices": [
      "iPhone 4",
      "iPad",
      "Apple Watch",
      "MacBook Air"
    ],
    "correct": 1
  },
  {
    "question": "North Korea's leader since 2011 is?",
    "choices": [
      "Kim Il-sung",
      "Kim Jong-il",
      "Kim Jong-un",
      "Kim Yo-jong"
    ],
    "correct": 2
  },
  {
    "question": "Which 2014 World Cup did Germany win in Brazil?",
    "choices": [
      "FIFA World Cup",
      "Copa America",
      "Euro",
      "Confederations Cup"
    ],
    "correct": 0
  },
  {
    "question": "Snapchat launched in?",
    "choices": [
      "2010",
      "2011",
      "2012",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Which 2012 American TV show featured a meth-cooking chemistry teacher (finale year)?",
    "choices": [
      "Mad Men",
      "Breaking Bad",
      "The Sopranos",
      "Better Call Saul"
    ],
    "correct": 1
  },
  {
    "question": "Which 2017 movement against sexual harassment went viral on social media?",
    "choices": [
      "#TimesUp",
      "#MeToo",
      "#BlackLivesMatter",
      "#Resist"
    ],
    "correct": 1
  },
  {
    "question": "Which 2015 Cuban-U.S. event restored diplomatic relations?",
    "choices": [
      "Trade embargo lift",
      "Diplomatic restoration",
      "Bay of Pigs apology",
      "Castro visit"
    ],
    "correct": 1
  },
  {
    "question": "Which 2019 Notre-Dame event in Paris shocked the world?",
    "choices": [
      "Bombing",
      "Fire",
      "Earthquake",
      "Flood"
    ],
    "correct": 1
  },
  {
    "question": "Which 2016 Brazilian city hosted the Summer Olympics?",
    "choices": [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Salvador"
    ],
    "correct": 1
  },
  {
    "question": "Which 2014 viral fundraiser involved dumping ice water?",
    "choices": [
      "ALS Ice Bucket Challenge",
      "Cinnamon Challenge",
      "Mannequin Challenge",
      "Tide Pod Challenge"
    ],
    "correct": 0
  },
  {
    "question": "Which 2017 solar event swept across the United States?",
    "choices": [
      "Total solar eclipse",
      "Annular eclipse",
      "Lunar eclipse",
      "Aurora storm"
    ],
    "correct": 0
  },
  {
    "question": "Bitcoin was created by the pseudonymous?",
    "choices": [
      "Vitalik Buterin",
      "Satoshi Nakamoto",
      "Charlie Lee",
      "Hal Finney"
    ],
    "correct": 1
  },
  {
    "question": "Which 2019 finale concluded HBO's Game of Thrones?",
    "choices": [
      "Season 7",
      "Season 8",
      "Season 9",
      "Season 10"
    ],
    "correct": 1
  },
  {
    "question": "Which 2010s app, founded 2009, popularized ride-sharing?",
    "choices": [
      "Lyft",
      "Uber",
      "Grab",
      "Bolt"
    ],
    "correct": 1
  },
  {
    "question": "The Higgs boson was confirmed at CERN in?",
    "choices": [
      "2010",
      "2011",
      "2012",
      "2013"
    ],
    "correct": 2
  },
  {
    "question": "Which 2019 climate activist addressed the UN at age 16?",
    "choices": [
      "Greta Thunberg",
      "Malala Yousafzai",
      "Vanessa Nakate",
      "Autumn Peltier"
    ],
    "correct": 0
  },
  {
    "question": "Which 2014 Russian annexation drew international sanctions?",
    "choices": [
      "Crimea",
      "Donbas",
      "Abkhazia",
      "South Ossetia"
    ],
    "correct": 0
  },
  {
    "question": "Which 2018 royal wedding featured Prince Harry and?",
    "choices": [
      "Meghan Markle",
      "Kate Middleton",
      "Pippa Middleton",
      "Eugenie"
    ],
    "correct": 0
  },
  {
    "question": "Marvel's 'Avengers: Endgame' was released in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Which 2013 NSA leaker fled to Russia?",
    "choices": [
      "Julian Assange",
      "Edward Snowden",
      "Chelsea Manning",
      "Reality Winner"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TwentyTensQuizSettings): TwentyTensQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TwentyTensQuizState, action: TwentyTensQuizAction): TwentyTensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TwentyTensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
