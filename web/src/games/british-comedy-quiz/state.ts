import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishComedyQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishComedyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishComedyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What classic 1970s sitcom is set in a Torquay hotel?", choices: ["Fawlty Towers", "Are You Being Served?", "Dad's Army", "Keeping Up Appearances"], correct: 0 },
  { question: "Who plays Basil Fawlty?", choices: ["John Cleese", "Rowan Atkinson", "Stephen Fry", "Hugh Laurie"], correct: 0 },
  { question: "How many episodes of 'Fawlty Towers' were made?", choices: ["12", "20", "24", "32"], correct: 0 },
  { question: "Which Edmund Blackadder series is set during WWI?", choices: ["Blackadder Goes Forth", "Blackadder II", "Blackadder III", "The Black Adder"], correct: 0 },
  { question: "Who plays Baldrick in 'Blackadder'?", choices: ["Tony Robinson", "Hugh Laurie", "Stephen Fry", "Rik Mayall"], correct: 0 },
  { question: "What 1980s sitcom features Hyacinth Bucket?", choices: ["Keeping Up Appearances", "Last of the Summer Wine", "Open All Hours", "Yes Minister"], correct: 0 },
  { question: "How does Hyacinth pronounce her surname?", choices: ["Bouquet", "Bucket", "Buckee", "Boucher"], correct: 0 },
  { question: "What Channel 4 show featured Mark and Jeremy as flatmates?", choices: ["Peep Show", "Spaced", "The IT Crowd", "Black Books"], correct: 0 },
  { question: "Who plays Moss in 'The IT Crowd'?", choices: ["Richard Ayoade", "Chris O'Dowd", "Matt Berry", "Noel Fielding"], correct: 0 },
  { question: "Who created 'The Office' (UK)?", choices: ["Ricky Gervais and Stephen Merchant", "Steve Coogan", "Armando Iannucci", "Sacha Baron Cohen"], correct: 0 },
  { question: "What is David Brent's company?", choices: ["Wernham Hogg", "Slough Office", "Brent Industries", "Wessex Holdings"], correct: 0 },
  { question: "What political satire stars Peter Capaldi as Malcolm Tucker?", choices: ["The Thick of It", "Yes Minister", "Have I Got News for You", "House of Cards UK"], correct: 0 },
  { question: "Who created 'The Thick of It'?", choices: ["Armando Iannucci", "Ricky Gervais", "John Sullivan", "Jimmy Perry"], correct: 0 },
  { question: "What sitcom about market traders aired 1981-2003?", choices: ["Only Fools and Horses", "Open All Hours", "Last of the Summer Wine", "Bread"], correct: 0 },
  { question: "Who plays Del Boy?", choices: ["David Jason", "Nicholas Lyndhurst", "Lennard Pearce", "Buster Merryfield"], correct: 0 },
  { question: "What Home Guard sitcom aired 1968-1977?", choices: ["Dad's Army", "It Ain't Half Hot Mum", "Hi-de-Hi!", "'Allo 'Allo!"], correct: 0 },
  { question: "Captain Mainwaring's catchphrase about Pike?", choices: ["Stupid boy", "Don't panic", "We're doomed", "Permission to speak, sir"], correct: 0 },
  { question: "Who plays Edina in 'Absolutely Fabulous'?", choices: ["Jennifer Saunders", "Joanna Lumley", "Dawn French", "Julia Sawalha"], correct: 0 },
  { question: "Who plays Patsy in 'Absolutely Fabulous'?", choices: ["Joanna Lumley", "Jennifer Saunders", "Helena Bonham Carter", "Tilda Swinton"], correct: 0 },
  { question: "'Mr. Bean' starred which Cambridge graduate?", choices: ["Rowan Atkinson", "Hugh Laurie", "John Cleese", "Stephen Fry"], correct: 0 },
  { question: "What sketch show featured Vic Reeves and Bob Mortimer?", choices: ["Vic Reeves Big Night Out", "The Fast Show", "Goodness Gracious Me", "League of Gentlemen"], correct: 0 },
  { question: "Who created 'The League of Gentlemen'?", choices: ["Mark Gatiss, Steve Pemberton, Reece Shearsmith, Jeremy Dyson", "Sacha Baron Cohen", "Steve Coogan", "Armando Iannucci"], correct: 0 },
  { question: "What sitcom features Manny and Bernard at a bookshop?", choices: ["Black Books", "Spaced", "The IT Crowd", "Father Ted"], correct: 0 },
  { question: "'Father Ted' is set on what fictional Irish island?", choices: ["Craggy Island", "Dunluce", "Skellig", "Holy Island"], correct: 0 },
  { question: "Who created 'Father Ted'?", choices: ["Graham Linehan and Arthur Mathews", "Steve Coogan", "Armando Iannucci", "Ricky Gervais"], correct: 0 },
  { question: "Steve Coogan's famous chat show host is named?", choices: ["Alan Partridge", "Tony Ferrino", "Paul Calf", "Tommy Saxondale"], correct: 0 },
  { question: "Sacha Baron Cohen's Kazakh journalist character is?", choices: ["Borat", "Bruno", "Ali G", "Admiral General Aladeen"], correct: 0 },
  { question: "Who is the older brother in 'Peep Show'?", choices: ["Mark Corrigan", "Jeremy Usborne", "Sophie Chapman", "Super Hans"], correct: 0 },
  { question: "Who stars in 'Fleabag' as the lead?", choices: ["Phoebe Waller-Bridge", "Jodie Comer", "Olivia Colman", "Sian Clifford"], correct: 0 },
  { question: "'Yes Minister' first aired in?", choices: ["1980", "1976", "1985", "1972"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BritishComedyQuizSettings): BritishComedyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BritishComedyQuizState, action: BritishComedyQuizAction): BritishComedyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BritishComedyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
