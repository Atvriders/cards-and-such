import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen90sQuizSettings { questions: "10" | "15"; }
export interface Nineteen90sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen90sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which Berlin event of the early 1990s reunified Germany?",
    "choices": [
      "Wall fall",
      "German reunification",
      "Treaty of Maastricht",
      "Two-plus-Four Agreement"
    ],
    "correct": 1
  },
  {
    "question": "Who became South Africa's first Black president in 1994?",
    "choices": [
      "Desmond Tutu",
      "Nelson Mandela",
      "Thabo Mbeki",
      "F.W. de Klerk"
    ],
    "correct": 1
  },
  {
    "question": "Which web browser was released by Netscape in 1994?",
    "choices": [
      "Mosaic",
      "Navigator",
      "Internet Explorer",
      "Opera"
    ],
    "correct": 1
  },
  {
    "question": "The Soviet Union officially dissolved in what year?",
    "choices": [
      "1989",
      "1990",
      "1991",
      "1992"
    ],
    "correct": 2
  },
  {
    "question": "Which Nirvana album, released in 1991, popularized grunge?",
    "choices": [
      "Bleach",
      "Nevermind",
      "In Utero",
      "Incesticide"
    ],
    "correct": 1
  },
  {
    "question": "Princess Diana died in a Paris car crash in?",
    "choices": [
      "1995",
      "1996",
      "1997",
      "1998"
    ],
    "correct": 2
  },
  {
    "question": "Which 1993 Steven Spielberg film featured genetically engineered dinosaurs?",
    "choices": [
      "Jurassic Park",
      "The Lost World",
      "Schindler's List",
      "Hook"
    ],
    "correct": 0
  },
  {
    "question": "Who was U.S. President from 1993 to 2001?",
    "choices": [
      "George H.W. Bush",
      "Bill Clinton",
      "Al Gore",
      "George W. Bush"
    ],
    "correct": 1
  },
  {
    "question": "Which 1994 genocide killed roughly 800,000 people?",
    "choices": [
      "Bosnian",
      "Rwandan",
      "Cambodian",
      "Darfur"
    ],
    "correct": 1
  },
  {
    "question": "Tony Blair became UK Prime Minister in?",
    "choices": [
      "1995",
      "1996",
      "1997",
      "1998"
    ],
    "correct": 2
  },
  {
    "question": "Which 1997 film by James Cameron won 11 Academy Awards?",
    "choices": [
      "Avatar",
      "Titanic",
      "True Lies",
      "Terminator 2"
    ],
    "correct": 1
  },
  {
    "question": "Dolly the sheep, the first cloned mammal, was announced in?",
    "choices": [
      "1995",
      "1996",
      "1997",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "The Spice Girls formed in which country?",
    "choices": [
      "United States",
      "United Kingdom",
      "Australia",
      "Canada"
    ],
    "correct": 1
  },
  {
    "question": "Which boy band sang 'I Want It That Way' in 1999?",
    "choices": [
      "NSYNC",
      "Backstreet Boys",
      "98 Degrees",
      "Boyz II Men"
    ],
    "correct": 1
  },
  {
    "question": "Who founded Amazon.com in 1994?",
    "choices": [
      "Bill Gates",
      "Jeff Bezos",
      "Larry Page",
      "Mark Cuban"
    ],
    "correct": 1
  },
  {
    "question": "Which 1995 OJ Simpson trial verdict shocked the world?",
    "choices": [
      "Guilty",
      "Not guilty",
      "Mistrial",
      "Hung jury"
    ],
    "correct": 1
  },
  {
    "question": "The Hubble Space Telescope was launched in?",
    "choices": [
      "1989",
      "1990",
      "1991",
      "1992"
    ],
    "correct": 1
  },
  {
    "question": "Which 1991 conflict was led by a US-led coalition against Iraq?",
    "choices": [
      "Iraq War",
      "Gulf War",
      "Afghan War",
      "Kosovo War"
    ],
    "correct": 1
  },
  {
    "question": "Friends, the NBC sitcom, premiered in?",
    "choices": [
      "1992",
      "1993",
      "1994",
      "1995"
    ],
    "correct": 2
  },
  {
    "question": "Google was founded in what year?",
    "choices": [
      "1996",
      "1997",
      "1998",
      "1999"
    ],
    "correct": 2
  },
  {
    "question": "Which 1992 Disney animated film featured Robin Williams as Genie?",
    "choices": [
      "The Lion King",
      "Aladdin",
      "Beauty and the Beast",
      "Pocahontas"
    ],
    "correct": 1
  },
  {
    "question": "The Oklahoma City bombing occurred in?",
    "choices": [
      "1993",
      "1994",
      "1995",
      "1996"
    ],
    "correct": 2
  },
  {
    "question": "Which 1999 sci-fi film starred Keanu Reeves as Neo?",
    "choices": [
      "The Matrix",
      "eXistenZ",
      "Dark City",
      "Strange Days"
    ],
    "correct": 0
  },
  {
    "question": "Who composed the 1990s blockbuster musical 'Rent'?",
    "choices": [
      "Andrew Lloyd Webber",
      "Jonathan Larson",
      "Stephen Sondheim",
      "Stephen Schwartz"
    ],
    "correct": 1
  },
  {
    "question": "The Euro was introduced as an accounting currency in?",
    "choices": [
      "1997",
      "1998",
      "1999",
      "2000"
    ],
    "correct": 2
  },
  {
    "question": "Which 1996 video game introduced 3D Mario?",
    "choices": [
      "Mario Kart 64",
      "Super Mario 64",
      "Mario Party",
      "Paper Mario"
    ],
    "correct": 1
  },
  {
    "question": "Hong Kong was returned from UK to China in?",
    "choices": [
      "1995",
      "1996",
      "1997",
      "1998"
    ],
    "correct": 2
  },
  {
    "question": "Which 1991 Queen frontman died of AIDS-related illness?",
    "choices": [
      "Brian May",
      "Roger Taylor",
      "Freddie Mercury",
      "John Deacon"
    ],
    "correct": 2
  },
  {
    "question": "Which 1998 search engine launched from Stanford?",
    "choices": [
      "Yahoo!",
      "AltaVista",
      "Google",
      "Lycos"
    ],
    "correct": 2
  },
  {
    "question": "The Channel Tunnel between UK and France opened in?",
    "choices": [
      "1992",
      "1993",
      "1994",
      "1995"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen90sQuizSettings): Nineteen90sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen90sQuizState, action: Nineteen90sQuizAction): Nineteen90sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen90sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
