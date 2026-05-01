import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GrungeEraQuizSettings { questions: "10" | "20" | "30"; }
export interface GrungeEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GrungeEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Grunge's home city is widely considered?",
    "choices": [
      "Portland",
      "Seattle",
      "Olympia",
      "Tacoma"
    ],
    "correct": 1
  },
  {
    "question": "Nirvana's breakout album was?",
    "choices": [
      "Bleach",
      "Nevermind",
      "In Utero",
      "Incesticide"
    ],
    "correct": 1
  },
  {
    "question": "Pearl Jam's debut album was?",
    "choices": [
      "Vs.",
      "Ten",
      "Vitalogy",
      "No Code"
    ],
    "correct": 1
  },
  {
    "question": "Soundgarden's lead vocalist was?",
    "choices": [
      "Eddie Vedder",
      "Chris Cornell",
      "Layne Staley",
      "Mark Lanegan"
    ],
    "correct": 1
  },
  {
    "question": "Alice in Chains' lead singer was?",
    "choices": [
      "Jerry Cantrell",
      "Layne Staley",
      "Chris Cornell",
      "Andrew Wood"
    ],
    "correct": 1
  },
  {
    "question": "'Smells Like Teen Spirit' was released in?",
    "choices": [
      "1989",
      "1991",
      "1993",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Which label was synonymous with the Seattle scene?",
    "choices": [
      "Sub Pop",
      "Matador",
      "SST",
      "Dischord"
    ],
    "correct": 0
  },
  {
    "question": "Mother Love Bone's frontman who died in 1990 was?",
    "choices": [
      "Andrew Wood",
      "Stefanie Sargent",
      "Mia Zapata",
      "Kurt Cobain"
    ],
    "correct": 0
  },
  {
    "question": "Temple of the Dog was a tribute to?",
    "choices": [
      "Andrew Wood",
      "Kurt Cobain",
      "Layne Staley",
      "Mike Starr"
    ],
    "correct": 0
  },
  {
    "question": "Pearl Jam's bassist is?",
    "choices": [
      "Jeff Ament",
      "Mike McCready",
      "Stone Gossard",
      "Matt Cameron"
    ],
    "correct": 0
  },
  {
    "question": "Nirvana's drummer who later formed Foo Fighters?",
    "choices": [
      "Dave Grohl",
      "Krist Novoselic",
      "Chad Channing",
      "Pat Smear"
    ],
    "correct": 0
  },
  {
    "question": "Which film soundtrack featured many grunge bands in 1992?",
    "choices": [
      "Singles",
      "Reality Bites",
      "Empire Records",
      "Clerks"
    ],
    "correct": 0
  },
  {
    "question": "Stone Temple Pilots hailed from?",
    "choices": [
      "San Diego",
      "Seattle",
      "Los Angeles",
      "Portland"
    ],
    "correct": 0
  },
  {
    "question": "Hole was fronted by?",
    "choices": [
      "Courtney Love",
      "Kim Gordon",
      "Kat Bjelland",
      "Donita Sparks"
    ],
    "correct": 0
  },
  {
    "question": "Which Soundgarden album won a 1995 Grammy?",
    "choices": [
      "Superunknown",
      "Badmotorfinger",
      "Down on the Upside",
      "Louder Than Love"
    ],
    "correct": 0
  },
  {
    "question": "Alice in Chains' acoustic EP from 1994 was?",
    "choices": [
      "Sap",
      "Jar of Flies",
      "Unplugged",
      "Dirt"
    ],
    "correct": 1
  },
  {
    "question": "Pearl Jam famously fought ticket fees from which company?",
    "choices": [
      "Ticketmaster",
      "StubHub",
      "Live Nation",
      "TicketCity"
    ],
    "correct": 0
  },
  {
    "question": "Smashing Pumpkins' breakout double album was?",
    "choices": [
      "Siamese Dream",
      "Mellon Collie and the Infinite Sadness",
      "Adore",
      "Gish"
    ],
    "correct": 1
  },
  {
    "question": "Which Nirvana album was their final studio LP?",
    "choices": [
      "Bleach",
      "Nevermind",
      "In Utero",
      "MTV Unplugged"
    ],
    "correct": 2
  },
  {
    "question": "'Black Hole Sun' was by?",
    "choices": [
      "Soundgarden",
      "Nirvana",
      "Pearl Jam",
      "Alice in Chains"
    ],
    "correct": 0
  },
  {
    "question": "Eddie Vedder grew up surfing in which state?",
    "choices": [
      "California",
      "Washington",
      "Oregon",
      "Hawaii"
    ],
    "correct": 0
  },
  {
    "question": "Mudhoney's label of origin was?",
    "choices": [
      "Sub Pop",
      "Reprise",
      "Geffen",
      "Epic"
    ],
    "correct": 0
  },
  {
    "question": "Which band released 'Hunger Strike' in 1991?",
    "choices": [
      "Temple of the Dog",
      "Mad Season",
      "Soundgarden",
      "Mother Love Bone"
    ],
    "correct": 0
  },
  {
    "question": "Layne Staley's side project was?",
    "choices": [
      "Mad Season",
      "Audioslave",
      "Them Crooked Vultures",
      "Velvet Revolver"
    ],
    "correct": 0
  },
  {
    "question": "Kurt Cobain died in?",
    "choices": [
      "1992",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Krist Novoselic played which instrument?",
    "choices": [
      "Bass",
      "Drums",
      "Lead Guitar",
      "Keyboards"
    ],
    "correct": 0
  },
  {
    "question": "'Jeremy' was a hit single from which Pearl Jam album?",
    "choices": [
      "Ten",
      "Vs.",
      "Vitalogy",
      "No Code"
    ],
    "correct": 0
  },
  {
    "question": "The grunge fashion staple was the?",
    "choices": [
      "Flannel shirt",
      "Polo",
      "Tank top",
      "Cardigan"
    ],
    "correct": 0
  },
  {
    "question": "Which producer worked on Nevermind?",
    "choices": [
      "Butch Vig",
      "Steve Albini",
      "Rick Rubin",
      "Brendan O'Brien"
    ],
    "correct": 0
  },
  {
    "question": "'Man in the Box' was by?",
    "choices": [
      "Alice in Chains",
      "Soundgarden",
      "Stone Temple Pilots",
      "Bush"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GrungeEraQuizSettings): GrungeEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GrungeEraQuizState, action: GrungeEraQuizAction): GrungeEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GrungeEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
