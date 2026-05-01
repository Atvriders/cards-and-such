import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen80sQuizSettings { questions: "10" | "15"; }
export interface Nineteen80sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen80sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which Berlin landmark fell on November 9, 1989?",
    "choices": [
      "Brandenburg Gate",
      "Berlin Wall",
      "Checkpoint Charlie",
      "Reichstag"
    ],
    "correct": 1
  },
  {
    "question": "Who was U.S. President for most of the 1980s?",
    "choices": [
      "Jimmy Carter",
      "Ronald Reagan",
      "George H.W. Bush",
      "Bill Clinton"
    ],
    "correct": 1
  },
  {
    "question": "Which space shuttle exploded shortly after launch in January 1986?",
    "choices": [
      "Columbia",
      "Challenger",
      "Discovery",
      "Atlantis"
    ],
    "correct": 1
  },
  {
    "question": "The 1986 nuclear disaster occurred at which Soviet plant?",
    "choices": [
      "Three Mile Island",
      "Fukushima",
      "Chernobyl",
      "Mayak"
    ],
    "correct": 2
  },
  {
    "question": "Michael Jackson's best-selling 1982 album was titled?",
    "choices": [
      "Bad",
      "Off the Wall",
      "Thriller",
      "Dangerous"
    ],
    "correct": 2
  },
  {
    "question": "Which UK PM led the country through most of the 1980s?",
    "choices": [
      "John Major",
      "Margaret Thatcher",
      "James Callaghan",
      "Tony Blair"
    ],
    "correct": 1
  },
  {
    "question": "Madonna's 1984 hit single about being a virgin was?",
    "choices": [
      "Material Girl",
      "Like a Virgin",
      "Holiday",
      "Lucky Star"
    ],
    "correct": 1
  },
  {
    "question": "Which 1985 charity concert was organized by Bob Geldof?",
    "choices": [
      "Farm Aid",
      "Live Aid",
      "Concert for Bangladesh",
      "Hands Across America"
    ],
    "correct": 1
  },
  {
    "question": "Who became Soviet leader in 1985, introducing glasnost?",
    "choices": [
      "Andropov",
      "Chernenko",
      "Gorbachev",
      "Yeltsin"
    ],
    "correct": 2
  },
  {
    "question": "Which Pixar parent company released the Macintosh in 1984?",
    "choices": [
      "IBM",
      "Apple",
      "Microsoft",
      "Commodore"
    ],
    "correct": 1
  },
  {
    "question": "The 1982 film 'E.T.' was directed by?",
    "choices": [
      "George Lucas",
      "Steven Spielberg",
      "Ron Howard",
      "Richard Donner"
    ],
    "correct": 1
  },
  {
    "question": "Which Falklands War occurred in 1982 between the UK and?",
    "choices": [
      "Chile",
      "Brazil",
      "Argentina",
      "Uruguay"
    ],
    "correct": 2
  },
  {
    "question": "MTV launched in what year, kicking off the music video era?",
    "choices": [
      "1980",
      "1981",
      "1982",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "Which 1989 protest at Tiananmen Square ended in violence?",
    "choices": [
      "Anti-war protest",
      "Pro-democracy protest",
      "Labor strike",
      "Religious march"
    ],
    "correct": 1
  },
  {
    "question": "Prince's 1984 film and album shared what title?",
    "choices": [
      "1999",
      "Purple Rain",
      "Sign o' the Times",
      "Parade"
    ],
    "correct": 1
  },
  {
    "question": "The Rubik's Cube became a global craze in which decade?",
    "choices": [
      "1970s",
      "1980s",
      "1990s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "Which 1980 John Lennon album was released just before his death?",
    "choices": [
      "Imagine",
      "Double Fantasy",
      "Mind Games",
      "Walls and Bridges"
    ],
    "correct": 1
  },
  {
    "question": "Who was the first woman appointed to the U.S. Supreme Court (1981)?",
    "choices": [
      "Ruth Bader Ginsburg",
      "Sandra Day O'Connor",
      "Sonia Sotomayor",
      "Elena Kagan"
    ],
    "correct": 1
  },
  {
    "question": "Which 1989 Tim Burton film starred Michael Keaton as a superhero?",
    "choices": [
      "Beetlejuice",
      "Batman",
      "Superman",
      "Edward Scissorhands"
    ],
    "correct": 1
  },
  {
    "question": "CNN, the first 24-hour news channel, launched in?",
    "choices": [
      "1979",
      "1980",
      "1981",
      "1982"
    ],
    "correct": 1
  },
  {
    "question": "The Iran-Contra affair came to light during which presidency?",
    "choices": [
      "Carter",
      "Reagan",
      "Bush",
      "Clinton"
    ],
    "correct": 1
  },
  {
    "question": "Which 1985 'New Coke' company famously reverted within months?",
    "choices": [
      "Pepsi",
      "Coca-Cola",
      "Dr Pepper",
      "RC Cola"
    ],
    "correct": 1
  },
  {
    "question": "Which boxer was undisputed heavyweight champion in 1987?",
    "choices": [
      "Muhammad Ali",
      "Mike Tyson",
      "Larry Holmes",
      "Evander Holyfield"
    ],
    "correct": 1
  },
  {
    "question": "Who shot John Lennon outside the Dakota apartments in 1980?",
    "choices": [
      "John Hinckley Jr.",
      "Mark David Chapman",
      "Sirhan Sirhan",
      "Lee Harvey Oswald"
    ],
    "correct": 1
  },
  {
    "question": "The Bhopal disaster of 1984 occurred in which country?",
    "choices": [
      "Pakistan",
      "Bangladesh",
      "India",
      "Sri Lanka"
    ],
    "correct": 2
  },
  {
    "question": "Which 1989 video game console launched the Game Boy?",
    "choices": [
      "Sega Genesis",
      "Nintendo Game Boy",
      "Atari Lynx",
      "TurboGrafx-16"
    ],
    "correct": 1
  },
  {
    "question": "Mikhail Gorbachev's policy of openness was called?",
    "choices": [
      "Perestroika",
      "Glasnost",
      "Détente",
      "Solidarity"
    ],
    "correct": 1
  },
  {
    "question": "Which 1980 horror film by Stanley Kubrick starred Jack Nicholson?",
    "choices": [
      "The Exorcist",
      "The Shining",
      "Halloween",
      "Poltergeist"
    ],
    "correct": 1
  },
  {
    "question": "The Exxon Valdez oil spill struck which U.S. state in 1989?",
    "choices": [
      "California",
      "Alaska",
      "Louisiana",
      "Texas"
    ],
    "correct": 1
  },
  {
    "question": "Pac-Man was released in arcades in?",
    "choices": [
      "1978",
      "1979",
      "1980",
      "1981"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen80sQuizSettings): Nineteen80sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen80sQuizState, action: Nineteen80sQuizAction): Nineteen80sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen80sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
