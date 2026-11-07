export type Tier = "County" | "State Senate" | "State Assembly" | "City" | "Agency";
export type Stance = "Champion" | "Persuadable" | "Skeptic";

export type Official = {
  id: string;
  name: string;
  title: string;
  tier: Tier;
  jurisdiction: string;
  stance: Stance;
  influence: number; // 1-10
  persuadability: number; // 1-10
  why: string;
  hook: string;
  phone: string;
};

export const AGENDAS = [
  {
    id: "zoning", emoji: "🏗️", label: "Affordable housing / zoning reform", sub: "More homes, faster approvals, lower rents",
    topic: "more homes in Orange County",
    stat: "Orange County needs roughly 180,000 new homes this cycle. We're not asking for a miracle. We're asking for a vote.",
    asks: { County: "agendize a vote to open county surplus land for affordable homes", City: "fast-track by-right approvals for projects that meet your Housing Element", Agency: "prioritize shovel-ready affordable projects in the next funding round", State: "co-sponsor permit-streamlining legislation for homes near jobs and transit" },
    subject: "Build, baby, build",
  },
  {
    id: "tenants", emoji: "🔑", label: "Tenant protections / rent stabilization", sub: "Fewer evictions, predictable rents",
    topic: "stronger tenant protections",
    stat: "Over half of OC renters are rent-burdened. One surprise increase is the difference between staying and leaving.",
    asks: { County: "fund a countywide eviction-defense and right-to-counsel program", City: "adopt a local rent-increase cap and just-cause ordinance", Agency: "expand emergency rental assistance before the next eviction wave", State: "support legislation closing loopholes in the Tenant Protection Act" },
    subject: "Keep OC renters in OC",
  },
  {
    id: "homeless", emoji: "🏠", label: "Homelessness / supportive housing", sub: "Housing first, services that stick",
    topic: "supportive housing for unhoused neighbors",
    stat: "Thousands of Orange County residents are unhoused on any given night. Shelter beds are a start — keys are the solution.",
    asks: { County: "commit dedicated county funding to permanent supportive housing units", City: "zone for supportive housing and approve a navigation center site", Agency: "pair every new voucher with wraparound services", State: "protect Homekey and HHAP funding in the next budget" },
    subject: "Keys, not just beds",
  },
  {
    id: "transit", emoji: "🚆", label: "Homes near transit / missing middle", sub: "Duplexes, ADUs, and apartments by the train",
    topic: "homes near transit and missing-middle housing",
    stat: "Most OC land is zoned single-family only. Townhomes and duplexes near transit are illegal to build in much of the county.",
    asks: { County: "pilot missing-middle zoning on county unincorporated land", City: "legalize fourplexes and ADUs by right near Metrolink and OC Streetcar", Agency: "tie transportation dollars to housing near stations", State: "back transit-oriented housing legislation with real teeth" },
    subject: "Let us build the missing middle",
  },
] as const;
export type AgendaId = (typeof AGENDAS)[number]["id"];
export const getAgenda = (id: AgendaId) => AGENDAS.find((a) => a.id === id)!;

export const PERSONAS = [
  { id: "renter", label: "Renter / constituent" },
  { id: "nonprofit", label: "Advocacy nonprofit" },
  { id: "builder", label: "YIMBY / builder coalition" },
] as const;
export type PersonaId = (typeof PERSONAS)[number]["id"];

export const COUNTIES = [
  "Orange County, CA",
  "Los Angeles County, CA",
  "San Diego County, CA",
  "Riverside County, CA",
  "King County, WA",
  "Travis County, TX",
  "Maricopa County, AZ",
];

// Officeholders as of the 2025–26 session. Stance/scores are illustrative AI estimates for demo purposes only.
const OC: Official[] = [
  { id: "nguyen", name: "Janet Nguyen", title: "Supervisor, District 1", tier: "County", jurisdiction: "OC Board of Supervisors", stance: "Persuadable", influence: 9, persuadability: 6, why: "Board vote on county land, housing funds, and the Housing Element.", hook: "Little Saigon families doubling up to make rent", phone: "(714) 834-3110" },
  { id: "sarmiento", name: "Vicente Sarmiento", title: "Supervisor, District 2", tier: "County", jurisdiction: "OC Board of Supervisors", stance: "Champion", influence: 9, persuadability: 9, why: "Represents Santa Ana / Anaheim — the county's densest renter base.", hook: "Santa Ana renters spending 50%+ of income on rent", phone: "(714) 834-3220" },
  { id: "wagner", name: "Don Wagner", title: "Supervisor, District 3", tier: "County", jurisdiction: "OC Board of Supervisors", stance: "Skeptic", influence: 9, persuadability: 4, why: "Swing vote on county surplus land disposition.", hook: "Local control — cities choosing where homes go, before Sacramento does", phone: "(714) 834-3330" },
  { id: "chaffee", name: "Doug Chaffee", title: "Board Chair, District 4", tier: "County", jurisdiction: "OC Board of Supervisors", stance: "Persuadable", influence: 10, persuadability: 7, why: "Chair sets the agenda. If it's not agendized, it doesn't happen.", hook: "North OC seniors priced out of the towns they built", phone: "(714) 834-3440" },
  { id: "foley", name: "Katrina Foley", title: "Vice Chair, District 5", tier: "County", jurisdiction: "OC Board of Supervisors", stance: "Champion", influence: 9, persuadability: 8, why: "Vice Chair; coastal district where teachers and nurses can't live where they work.", hook: "South OC nurses commuting 90 minutes each way", phone: "(714) 834-3550" },
  { id: "umberg", name: "Tom Umberg", title: "State Senator, SD-34", tier: "State Senate", jurisdiction: "California Senate", stance: "Champion", influence: 8, persuadability: 8, why: "Senior member; carries weight on land-use and judiciary bills.", hook: "Streamlining approvals for homes near transit", phone: "(916) 651-4034" },
  { id: "strickland", name: "Tony Strickland", title: "State Senator, SD-36", tier: "State Senate", jurisdiction: "California Senate", stance: "Skeptic", influence: 7, persuadability: 5, why: "Coastal OC seat; key Republican vote on CEQA reform.", hook: "Cutting red tape and permit delays that make homes cost more", phone: "(916) 651-4036" },
  { id: "choi", name: "Steven Choi", title: "State Senator, SD-37", tier: "State Senate", jurisdiction: "California Senate", stance: "Persuadable", influence: 7, persuadability: 6, why: "Former Irvine mayor — knows master-planned growth firsthand.", hook: "Irvine-style planning for the next generation of homes", phone: "(916) 651-4037" },
  { id: "blakespear", name: "Catherine Blakespear", title: "State Senator, SD-38", tier: "State Senate", jurisdiction: "California Senate", stance: "Persuadable", influence: 7, persuadability: 6, why: "South OC / North SD coast; regional housing targets.", hook: "Coastal towns meeting RHNA without losing character", phone: "(916) 651-4038" },
  { id: "seyarto", name: "Kelly Seyarto", title: "State Senator, SD-32", tier: "State Senate", jurisdiction: "California Senate", stance: "Skeptic", influence: 6, persuadability: 4, why: "Covers inland OC edge; housing + wildfire insurance overlap.", hook: "Homes that are affordable AND insurable", phone: "(916) 651-4032" },
  { id: "pacheco", name: "Blanca Pacheco", title: "Assemblymember, AD-64", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Champion", influence: 6, persuadability: 8, why: "North OC / SE LA border; working-family renters.", hook: "Multigenerational households and ADUs", phone: "(916) 319-2064" },
  { id: "quirksilva", name: "Sharon Quirk-Silva", title: "Assemblymember, AD-67", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Champion", influence: 7, persuadability: 9, why: "Long record on homelessness and supportive housing.", hook: "Permanent supportive housing in Fullerton & Buena Park", phone: "(916) 319-2067" },
  { id: "valencia", name: "Avelino Valencia", title: "Assemblymember, AD-68", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Champion", influence: 6, persuadability: 8, why: "Anaheim / Santa Ana core; former city staffer, knows the zoning code.", hook: "Anaheim workers who can't afford to live near Disneyland", phone: "(916) 319-2068" },
  { id: "ta", name: "Tri Ta", title: "Assemblymember, AD-70", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Persuadable", influence: 6, persuadability: 6, why: "Former Westminster mayor; small-business corridor redevelopment.", hook: "Homes above shops on Bolsa Ave", phone: "(916) 319-2070" },
  { id: "sanchez", name: "Kate Sanchez", title: "Assemblymember, AD-71", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Skeptic", influence: 5, persuadability: 4, why: "South OC / Riverside; suburban growth questions.", hook: "Starter homes so young families don't leave the state", phone: "(916) 319-2071" },
  { id: "dixon", name: "Diane Dixon", title: "Assemblymember, AD-72", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Skeptic", influence: 6, persuadability: 5, why: "Coastal OC; former Newport Beach mayor.", hook: "Newport's own Housing Element commitments", phone: "(916) 319-2072" },
  { id: "petrienorris", name: "Cottie Petrie-Norris", title: "Assemblymember, AD-73", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Champion", influence: 7, persuadability: 8, why: "Irvine / Costa Mesa; budget and utilities influence.", hook: "UCI students and staff priced out of Irvine", phone: "(916) 319-2073" },
  { id: "davies", name: "Laurie Davies", title: "Assemblymember, AD-74", tier: "State Assembly", jurisdiction: "California Assembly", stance: "Persuadable", influence: 5, persuadability: 6, why: "South coast; Republican vote on housing streamlining.", hook: "Workforce housing for Camp Pendleton families & first responders", phone: "(916) 319-2074" },
  { id: "aitken", name: "Ashleigh Aitken", title: "Mayor of Anaheim", tier: "City", jurisdiction: "City of Anaheim", stance: "Champion", influence: 7, persuadability: 8, why: "Largest OC city; controls local zoning and permits.", hook: "Housing near ARTIC and the Platinum Triangle", phone: "(714) 765-5164" },
  { id: "amezcua", name: "Valerie Amezcua", title: "Mayor of Santa Ana", tier: "City", jurisdiction: "City of Santa Ana", stance: "Persuadable", influence: 6, persuadability: 6, why: "County seat; highest renter share in OC.", hook: "Keeping Santa Ana families in Santa Ana", phone: "(714) 647-6900" },
  { id: "agran", name: "Larry Agran", title: "Mayor of Irvine", tier: "City", jurisdiction: "City of Irvine", stance: "Persuadable", influence: 7, persuadability: 7, why: "Irvine's RHNA target is one of the largest in the region.", hook: "Great Park neighborhoods with real affordability", phone: "(949) 724-6233" },
  { id: "hbcouncil", name: "Huntington Beach City Council", title: "City Council (7 members)", tier: "City", jurisdiction: "City of Huntington Beach", stance: "Skeptic", influence: 6, persuadability: 3, why: "Ongoing Housing Element dispute with the State.", hook: "Avoiding state penalties and builder's remedy projects", phone: "(714) 536-5553" },
  { id: "cmcouncil", name: "Costa Mesa City Council", title: "City Council (7 members)", tier: "City", jurisdiction: "City of Costa Mesa", stance: "Persuadable", influence: 5, persuadability: 7, why: "Pro-housing reforms in progress; needs momentum.", hook: "Fairview & Harbor Blvd corridor homes", phone: "(714) 754-5285" },
  { id: "ochfa", name: "OC Housing Finance Trust", title: "Board of Directors", tier: "Agency", jurisdiction: "Joint Powers Authority", stance: "Champion", influence: 6, persuadability: 9, why: "Allocates gap financing to affordable projects countywide.", hook: "Getting shovel-ready projects funded faster", phone: "(714) 480-2730" },
  { id: "ocha", name: "OC Housing Authority", title: "Housing Advisory Committee", tier: "Agency", jurisdiction: "County of Orange", stance: "Persuadable", influence: 5, persuadability: 7, why: "Runs Section 8 vouchers for 10,000+ households.", hook: "Voucher holders who can't find a landlord who'll accept them", phone: "(714) 480-2700" },
  { id: "scag", name: "SCAG Housing Committee", title: "Regional Council", tier: "Agency", jurisdiction: "Southern California Assn. of Govts.", stance: "Persuadable", influence: 7, persuadability: 5, why: "Sets each city's RHNA housing targets.", hook: "Holding cities accountable to their RHNA numbers", phone: "(213) 236-1800" },
];

function genericCounty(county: string): Official[] {
  const short = county.split(",")[0];
  const mk = (i: number, title: string, tier: Tier, jur: string, stance: Stance, inf: number, per: number, why: string, hook: string): Official => ({
    id: `g${i}`, name: title, title: `${short}`, tier, jurisdiction: jur, stance, influence: inf, persuadability: per, why, hook, phone: "(555) 010-" + String(1000 + i * 37).slice(0, 4),
  });
  const s: Stance[] = ["Champion", "Persuadable", "Skeptic"];
  const out: Official[] = [];
  for (let i = 1; i <= 5; i++) out.push(mk(i, `District ${i} Supervisor`, "County", `${short} Board`, s[i % 3], 8 + (i % 3), 4 + i, "Board vote on county housing funds and land.", "Rent burden in this district"));
  for (let i = 1; i <= 4; i++) out.push(mk(10 + i, `State Senator #${i}`, "State Senate", "State Senate", s[(i + 1) % 3], 7, 5 + (i % 4), "State land-use and CEQA votes.", "Permit streamlining"));
  for (let i = 1; i <= 6; i++) out.push(mk(20 + i, `Assemblymember #${i}`, "State Assembly", "State Assembly", s[(i + 2) % 3], 6, 4 + (i % 5), "Housing committee votes.", "Starter homes & ADUs"));
  for (let i = 1; i <= 5; i++) out.push(mk(30 + i, `Largest City #${i} Mayor`, "City", "City Hall", s[i % 3], 6, 5 + (i % 4), "Local zoning & permits.", "Homes near jobs and transit"));
  for (let i = 1; i <= 3; i++) out.push(mk(40 + i, ["Housing Authority", "Housing Trust", "Regional Planning Council"][i - 1], "Agency", "Agency", "Persuadable", 5, 7, "Funding and targets.", "Faster funding for shovel-ready projects"));
  return out;
}

export function getOfficials(county: string): { officials: Official[]; seeded: boolean } {
  if (county.startsWith("Orange County")) return { officials: OC, seeded: true };
  return { officials: genericCounty(county), seeded: false };
}

export const TIERS: Tier[] = ["County", "State Senate", "State Assembly", "City", "Agency"];

export function priority(o: Official) {
  return Math.round(o.influence * 6 + o.persuadability * 4);
}

const personaLine: Record<PersonaId, string> = {
  renter: "I'm one of your constituents, and like a lot of my neighbors, I'm one rent increase away from leaving Orange County.",
  nonprofit: "I'm writing on behalf of our members — thousands of OC residents who'd like to keep living in the county they work in.",
  builder: "We represent builders, trades, and neighbors who are ready to build homes in Orange County — if the rules let us.",
};

export function draftEmail(o: Official, persona: PersonaId, agendaId: AgendaId = "zoning") {
  const ag = getAgenda(agendaId);
  const first = o.tier === "City" && o.name.includes("Council") ? "Councilmembers" : o.name.split(" ").slice(-1)[0];
  const salutation = o.tier === "Agency" || o.name.includes("Council") ? `Dear ${o.name}` : `Dear ${o.title.split(",")[0].replace(/Mayor of .*/, "Mayor")} ${first}`;
  const subjects = [
    `${ag.subject}: ${o.hook.toLowerCase()}`,
    `A quick idea re: ${o.hook.toLowerCase()}`,
    `Homes > hearings (respectfully)`,
  ];
  const subject = subjects[o.name.length % subjects.length];
  const ask = ag.asks[o.tier === "County" || o.tier === "City" || o.tier === "Agency" ? o.tier : "State"];
  const body = `${salutation},

${personaLine[persona]}

You've got real leverage here: ${o.why.charAt(0).toLowerCase() + o.why.slice(1)} So we'll get right to it: ${ag.topic}. ${o.hook} is the kind of problem that gets solved with votes, not panels.

${ag.stat}

Specifically, will you ${ask}?

We'd love 15 minutes with you or your staff. We'll bring data, coffee, and zero PowerPoint transitions.

With respect (and a hard hat),
Build Baby Build`;
  return { subject, body };
}

export function callScript(o: Official, agendaId: AgendaId = "zoning") {
  return `Hi, my name is ___ and I'm a constituent calling for ${o.name}. I'm asking them to support ${getAgenda(agendaId).topic} — specifically around ${o.hook.toLowerCase()}. Could you log my call and let me know their position? Thanks — and thank you for answering the phone, genuinely.`;
}

export type Sentiment = "Supportive" | "Noncommittal" | "Opposed";

const replyBank: Record<Stance, { s: Sentiment; text: string }[]> = {
  Champion: [
    { s: "Supportive", text: "Thanks for reaching out — the office strongly agrees. Our scheduler will follow up to set a meeting next week." },
    { s: "Supportive", text: "Appreciate the hard-hat sign-off. We'd like to co-host a community town hall on this. Can you send dates?" },
  ],
  Persuadable: [
    { s: "Noncommittal", text: "Thank you for your message. We are reviewing the item and will share your comments with the office." },
    { s: "Supportive", text: "This is helpful. Can you send the data on rent burden by district? We may bring this to committee." },
    { s: "Noncommittal", text: "The office is interested in learning more. Please send a one-pager to our housing deputy." },
  ],
  Skeptic: [
    { s: "Opposed", text: "We share the goal of affordability but believe zoning decisions should stay with local communities." },
    { s: "Noncommittal", text: "Your comments have been logged. The office will continue to monitor the issue." },
  ],
};

export function replyFor(o: Official, seed: number) {
  const bank = replyBank[o.stance];
  return bank[seed % bank.length];
}

export const CALL_SNIPPETS = [
  "Staffer: \"I'll make sure the office sees this today.\"",
  "Staffer: \"We've had a lot of calls on housing this week.\"",
  "Staffer: \"Can I get your zip code to log this?\"",
  "Staffer: \"The housing deputy will want to hear this.\"",
  "Staffer: \"Noted — I'll pass it along.\"",
  "Staffer: \"Honestly? Same. My rent went up 12%.\"",
];

export const FOLLOWUP_LINES = [
  "Agent queued follow-up with rent-burden data",
  "Agent drafted rebuttal on local control",
  "Agent sent one-pager to housing deputy",
  "Agent scheduled 2nd call for Tuesday",
  "Agent mobilized 14 constituents in district",
  "Agent drafted public comment for next meeting",
];
