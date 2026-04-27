import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InternetHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface InternetHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InternetHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was ARPANET?", choices: ["First commercial ISP", "Predecessor to the internet", "Email service", "Search engine"], correct: 1 },
  { question: "Who invented the World Wide Web?", choices: ["Tim Berners-Lee", "Vint Cerf", "Bob Kahn", "Marc Andreessen"], correct: 0 },
  { question: "Who is called 'a father of the internet' for TCP/IP?", choices: ["Berners-Lee", "Cerf and Kahn", "Tomlinson", "Postel"], correct: 1 },
  { question: "Who invented email (@ sign)?", choices: ["Cerf", "Tomlinson", "Berners-Lee", "Roberts"], correct: 1 },
  { question: "What was the first browser called Mosaic later renamed?", choices: ["Netscape", "Internet Explorer", "Firefox", "Chrome"], correct: 0 },
  { question: "What does HTTP stand for?", choices: ["HyperText Transfer Protocol", "High Text Transmission Protocol", "Home Transfer Protocol", "Host Transfer Protocol"], correct: 0 },
  { question: "What does URL stand for?", choices: ["Universal Resource Locator", "Uniform Resource Locator", "Unique Reference Link", "Universal Reference Link"], correct: 1 },
  { question: "What year was the WWW invented?", choices: ["1985", "1989", "1993", "1996"], correct: 1 },
  { question: "What was the first widely-used graphical web browser?", choices: ["Lynx", "Mosaic", "Netscape", "IE"], correct: 1 },
  { question: "Who founded Amazon?", choices: ["Jeff Bezos", "Elon Musk", "Bill Gates", "Larry Page"], correct: 0 },
  { question: "Who founded Yahoo?", choices: ["Page and Brin", "Yang and Filo", "Jobs and Wozniak", "Gates and Allen"], correct: 1 },
  { question: "What was the first search engine?", choices: ["Google", "Archie", "AltaVista", "Yahoo"], correct: 1 },
  { question: "What does DNS stand for?", choices: ["Domain Name System", "Data Network System", "Direct Name System", "Domain Network Service"], correct: 0 },
  { question: "What is RFC short for?", choices: ["Request For Comments", "Real-time File Channel", "Routing Function Code", "Root File Cache"], correct: 0 },
  { question: "What was Netscape's IPO famous for?", choices: ["Sparking dot-com era", "Failure", "Hostile takeover", "Bankruptcy"], correct: 0 },
  { question: "What is HTTPS?", choices: ["HTTP over SSL/TLS", "Faster HTTP", "HTTP for streaming", "HTTP for printers"], correct: 0 },
  { question: "Who founded YouTube?", choices: ["Hurley, Chen, Karim", "Page and Brin", "Zuckerberg", "Dorsey"], correct: 0 },
  { question: "Who founded Twitter?", choices: ["Dorsey, Williams, Stone, Glass", "Zuckerberg", "Brin", "Musk"], correct: 0 },
  { question: "Who founded Facebook?", choices: ["Zuckerberg", "Dorsey", "Page", "Bezos"], correct: 0 },
  { question: "What is IPv4 address length?", choices: ["32 bits", "64 bits", "128 bits", "256 bits"], correct: 0 },
  { question: "What is IPv6 address length?", choices: ["32 bits", "64 bits", "128 bits", "256 bits"], correct: 2 },
  { question: "When was Google founded?", choices: ["1995", "1998", "2001", "2004"], correct: 1 },
  { question: "What was AOL famous for in the 1990s?", choices: ["Dial-up internet/portal", "Search engine", "Mobile phones", "Social network"], correct: 0 },
  { question: "What is Wi-Fi?", choices: ["Wireless networking standard", "Cable type", "Phone protocol", "TV signal"], correct: 0 },
  { question: "Who founded Wikipedia?", choices: ["Jimmy Wales (and Larry Sanger)", "Linus Torvalds", "Marc Andreessen", "Tim Berners-Lee"], correct: 0 },
  { question: "What is the basic transport protocol of the web?", choices: ["TCP", "UDP", "ICMP", "FTP"], correct: 0 },
  { question: "What was the original version of Internet Explorer based on?", choices: ["Mosaic", "Netscape", "Lynx", "Opera"], correct: 0 },
  { question: "What is the purpose of HTML?", choices: ["Style web pages", "Structure content of web pages", "Run scripts", "Encrypt traffic"], correct: 1 },
  { question: "What is bandwidth?", choices: ["Data transfer rate", "Memory size", "CPU speed", "Disk space"], correct: 0 },
  { question: "What was Web 2.0 primarily about?", choices: ["User-generated content", "Static pages", "Mainframe access", "Print"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InternetHistoryQuizSettings): InternetHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InternetHistoryQuizState, action: InternetHistoryQuizAction): InternetHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InternetHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
