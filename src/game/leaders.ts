// Leader Dialog & Reaction System
// Each leader has a personality that affects their responses

import { LeaderId } from '../components/PixelArt';
import { FactionId } from '../types/game';
import { OperationType } from './military';

export interface LeaderPersonality {
  id: LeaderId;
  factionId: FactionId | string;
  name: string;
  title: string;
  traits: ('aggressive' | 'cautious' | 'diplomatic' | 'unpredictable' | 'calculating' | 'nationalist')[];
  greetings: string[];
  threats: string[];
  negotiations: string[];
  victories: string[];
  defeats: string[];
  reactions: Record<string, string[]>;
}

export const LEADERS: Record<LeaderId, LeaderPersonality> = {
  trump: {
    id: 'trump',
    factionId: 'usa',
    name: 'Donald Trump',
    title: 'President of the United States',
    traits: ['unpredictable', 'nationalist', 'aggressive'],
    greetings: [
      "Look, we have the best Arctic strategy, everyone says so. The best.",
      "America is WINNING in the Arctic. Huge success!",
      "We're gonna make the Arctic great again, believe me.",
    ],
    threats: [
      "If you don't back off, there will be consequences. Big consequences. The biggest you've ever seen.",
      "Bad move. Very bad. We have options - tremendous options.",
      "This is a DISASTER for you. Total disaster. We're watching.",
    ],
    negotiations: [
      "Let's make a deal. I make the best deals.",
      "We can work something out. Something beautiful.",
      "I think we can be friends. Good friends. The best friends.",
    ],
    victories: [
      "We won so big! Nobody wins like America!",
      "Total victory! I predicted this, by the way.",
      "Another win for your favorite President!",
    ],
    defeats: [
      "Fake news! This is all fake. We're actually winning.",
      "Very unfair. The system is rigged.",
      "We'll be back. Bigger and better than ever!",
    ],
    reactions: {
      military_buildup: ["We see what you're doing. Very concerning. Very unfair."],
      treaty_offer: ["Interesting offer. We'll think about it. Maybe."],
      territorial_claim: ["That's OUR territory! America First!"],
      economic_pressure: ["Tariffs! We'll hit you with tariffs like you've never seen!"],
    },
  },

  putin: {
    id: 'putin',
    factionId: 'russia',
    name: 'Vladimir Putin',
    title: 'President of Russian Federation',
    traits: ['calculating', 'aggressive', 'nationalist'],
    greetings: [
      "The Arctic has always been Russia's. This is simply historical fact.",
      "Russia will defend its interests with all means necessary.",
      "We seek stability in the Arctic... on our terms.",
    ],
    threats: [
      "Russia has means of responding that you cannot imagine.",
      "Do not test our resolve. The consequences would be... unfortunate.",
      "We have made our position clear. Further provocation will be met with force.",
    ],
    negotiations: [
      "Perhaps we can find... mutual understanding.",
      "Russia is open to discussions between equals.",
      "There may be room for compromise. Perhaps.",
    ],
    victories: [
      "The Russian bear protects what is his.",
      "This was inevitable. Russia always prevails.",
      "History will remember who stood firm.",
    ],
    defeats: [
      "A temporary setback. Nothing more.",
      "We will remember this. Russia has a long memory.",
      "You have made a powerful enemy today.",
    ],
    reactions: {
      military_buildup: ["Provocative. We will respond proportionally."],
      treaty_offer: ["We will study this proposal carefully."],
      territorial_claim: ["The Arctic is Russian. This is not negotiable."],
      economic_pressure: ["Sanctions? We are used to Western pressure."],
    },
  },

  xi: {
    id: 'xi',
    factionId: 'china',
    name: 'Xi Jinping',
    title: 'President of People\'s Republic of China',
    traits: ['calculating', 'diplomatic', 'cautious'],
    greetings: [
      "China seeks peaceful development of the Polar Silk Road.",
      "We are a near-Arctic state with legitimate interests.",
      "Cooperation benefits all parties. China offers partnership.",
    ],
    threats: [
      "China will not be excluded from Arctic governance.",
      "Attempts to contain China will fail, as they always have.",
      "We have many ways to protect our investments.",
    ],
    negotiations: [
      "China proposes a win-win solution.",
      "Let us find common ground through dialogue.",
      "Investment and infrastructure can benefit all.",
    ],
    victories: [
      "The Polar Silk Road advances as planned.",
      "China's Arctic strategy proceeds successfully.",
      "A victory for international cooperation.",
    ],
    defeats: [
      "China will find alternative paths forward.",
      "This changes nothing in the long term.",
      "We remain committed to our Arctic objectives.",
    ],
    reactions: {
      military_buildup: ["This is counterproductive to regional stability."],
      treaty_offer: ["China welcomes dialogue with all Arctic stakeholders."],
      territorial_claim: ["We respect international law and UNCLOS."],
      economic_pressure: ["Economic coercion is not in anyone's interest."],
    },
  },

  kim: {
    id: 'kim',
    factionId: 'north_korea',
    name: 'Kim Jong Un',
    title: 'Supreme Leader of DPRK',
    traits: ['unpredictable', 'aggressive', 'nationalist'],
    greetings: [
      "The DPRK demands its rightful place in Arctic affairs!",
      "Juche guides our Arctic ambitions!",
      "The imperialists will not exclude us!",
    ],
    threats: [
      "Our missiles can reach anywhere! ANYWHERE!",
      "The enemies of Korea will face total destruction!",
      "You underestimate the power of Juche ideology!",
    ],
    negotiations: [
      "Perhaps... if sufficient inducements are offered...",
      "The DPRK is open to mutually beneficial arrangements.",
      "Sanctions must be lifted. Then we can talk.",
    ],
    victories: [
      "Victory for the Juche ideal!",
      "The world trembles before Korean might!",
      "As I predicted! The imperialists are defeated!",
    ],
    defeats: [
      "Temporary setback caused by traitors!",
      "We will return with ten times the force!",
      "The enemies of Korea will pay for this!",
    ],
    reactions: {
      military_buildup: ["Our nuclear deterrent remains ready!"],
      treaty_offer: ["What concessions are you offering?"],
      territorial_claim: ["Korea claims what Korea deserves!"],
      economic_pressure: ["Sanctions only strengthen our resolve!"],
    },
  },

  starmer: {
    id: 'starmer',
    factionId: 'uk',
    name: 'Keir Starmer',
    title: 'Prime Minister of United Kingdom',
    traits: ['diplomatic', 'cautious', 'calculating'],
    greetings: [
      "Britain remains committed to Arctic security.",
      "We support our NATO allies in the High North.",
      "The UK seeks rules-based order in the Arctic.",
    ],
    threats: [
      "Britain will stand with its allies against aggression.",
      "This crosses a clear red line.",
      "We will respond through NATO frameworks.",
    ],
    negotiations: [
      "Let's find a pragmatic solution.",
      "Britain supports diplomatic resolution.",
      "We're open to constructive dialogue.",
    ],
    victories: [
      "A victory for the rules-based international order.",
      "Britain and its allies have prevailed.",
      "Democracy wins again.",
    ],
    defeats: [
      "We will learn from this setback.",
      "Our commitment to allies remains unchanged.",
      "This isn't over.",
    ],
    reactions: {
      military_buildup: ["Concerning developments. NATO is monitoring."],
      treaty_offer: ["We'll need to consult with allies."],
      territorial_claim: ["International law must be respected."],
      economic_pressure: ["We support targeted sanctions."],
    },
  },

  macron: {
    id: 'macron',
    factionId: 'france',
    name: 'Emmanuel Macron',
    title: 'President of France',
    traits: ['diplomatic', 'calculating', 'cautious'],
    greetings: [
      "France has historic Arctic interests we intend to protect.",
      "European strategic autonomy extends to the High North.",
      "We must find our own path, not simply follow others.",
    ],
    threats: [
      "France will not be intimidated.",
      "Europe must show strength when challenged.",
      "This requires a firm European response.",
    ],
    negotiations: [
      "France proposes a European-led initiative.",
      "Diplomacy remains our preferred approach.",
      "Let us find a solution worthy of great nations.",
    ],
    victories: [
      "A triumph for European values!",
      "France's strategy has proven correct.",
      "This shows what Europe can achieve together.",
    ],
    defeats: [
      "We must reflect and adapt our approach.",
      "France will return stronger.",
      "The European project continues.",
    ],
    reactions: {
      military_buildup: ["Europe must develop its own Arctic capability."],
      treaty_offer: ["France is always open to dialogue."],
      territorial_claim: ["We support international arbitration."],
      economic_pressure: ["Economic tools can be effective."],
    },
  },

  scholz: {
    id: 'scholz',
    factionId: 'germany',
    name: 'Olaf Scholz',
    title: 'Chancellor of Germany',
    traits: ['cautious', 'diplomatic', 'calculating'],
    greetings: [
      "Germany supports stability in the Arctic region.",
      "We must balance energy security with environmental protection.",
      "Careful deliberation is needed here.",
    ],
    threats: [
      "This is deeply concerning to Germany and its allies.",
      "We will need to reconsider our economic relationships.",
      "Germany stands with its NATO partners.",
    ],
    negotiations: [
      "Germany favors a negotiated solution.",
      "We should explore all diplomatic options.",
      "Patience and dialogue are the way forward.",
    ],
    victories: [
      "A positive outcome for all involved.",
      "This shows the value of persistence.",
      "Germany welcomes this development.",
    ],
    defeats: [
      "We must analyze what went wrong.",
      "Germany will adjust its approach.",
      "The situation requires careful reassessment.",
    ],
    reactions: {
      military_buildup: ["We urge all parties to exercise restraint."],
      treaty_offer: ["Germany supports diplomatic engagement."],
      territorial_claim: ["International law must guide these matters."],
      economic_pressure: ["Economic measures require EU coordination."],
    },
  },

  trudeau: {
    id: 'trudeau',
    factionId: 'canada',
    name: 'Justin Trudeau',
    title: 'Prime Minister of Canada',
    traits: ['diplomatic', 'cautious', 'nationalist'],
    greetings: [
      "Canada's Arctic sovereignty is non-negotiable.",
      "The Northwest Passage is Canadian internal waters.",
      "We will protect our Arctic communities and environment.",
    ],
    threats: [
      "Canada will defend its Arctic territory.",
      "This violates Canadian sovereignty.",
      "We will not be pushed around in our own backyard.",
    ],
    negotiations: [
      "Canada seeks cooperative solutions.",
      "Indigenous voices must be part of this discussion.",
      "Let's find common ground on Arctic governance.",
    ],
    victories: [
      "Canada's Arctic interests are secured.",
      "This is good news for Northern communities.",
      "Our Arctic sovereignty is strengthened.",
    ],
    defeats: [
      "This doesn't change our fundamental position.",
      "Canada will continue to assert its rights.",
      "We remain committed to Arctic protection.",
    ],
    reactions: {
      military_buildup: ["This militarization concerns us deeply."],
      treaty_offer: ["Canada is open to bilateral discussions."],
      territorial_claim: ["The Northwest Passage is Canadian!"],
      economic_pressure: ["We prefer engagement to isolation."],
    },
  },

  nato_chief: {
    id: 'nato_chief',
    factionId: 'nato',
    name: 'NATO Secretary General',
    title: 'Secretary General of NATO',
    traits: ['diplomatic', 'cautious', 'calculating'],
    greetings: [
      "NATO remains vigilant in the High North.",
      "Collective defense extends to all our territory.",
      "We seek dialogue but prepare for any eventuality.",
    ],
    threats: [
      "Article 5 is clear and will be honored.",
      "Any attack on a member is an attack on all.",
      "NATO has capabilities that should not be tested.",
    ],
    negotiations: [
      "NATO supports diplomatic solutions.",
      "We are open to confidence-building measures.",
      "Transparency can reduce tensions.",
    ],
    victories: [
      "Alliance solidarity has prevailed.",
      "This demonstrates NATO's continued relevance.",
      "Our collective approach has succeeded.",
    ],
    defeats: [
      "NATO will draw lessons from this.",
      "The Alliance adapts and perseveres.",
      "Our commitment to mutual defense is unchanged.",
    ],
    reactions: {
      military_buildup: ["NATO is monitoring and will respond as needed."],
      treaty_offer: ["This requires consultation with all 32 allies."],
      territorial_claim: ["We support the territorial integrity of allies."],
      economic_pressure: ["NATO supports allied economic measures."],
    },
  },

  eu_president: {
    id: 'eu_president',
    factionId: 'eu',
    name: 'EU Commission President',
    title: 'President of European Commission',
    traits: ['diplomatic', 'cautious', 'calculating'],
    greetings: [
      "The European Union seeks a stable Arctic.",
      "Europe has significant Arctic interests.",
      "We promote sustainable development and cooperation.",
    ],
    threats: [
      "The EU will use all tools at its disposal.",
      "European unity provides significant leverage.",
      "We are prepared to act decisively.",
    ],
    negotiations: [
      "The EU favors multilateral solutions.",
      "Europe is ready to engage constructively.",
      "We can find common interests.",
    ],
    victories: [
      "European values have prevailed.",
      "This shows the strength of European unity.",
      "A positive outcome for international cooperation.",
    ],
    defeats: [
      "The EU will reassess its approach.",
      "European determination remains strong.",
      "We will continue pursuing our objectives.",
    ],
    reactions: {
      military_buildup: ["Europe must strengthen its Arctic presence."],
      treaty_offer: ["The EU welcomes diplomatic engagement."],
      territorial_claim: ["We support member state sovereignty."],
      economic_pressure: ["The EU has significant economic tools."],
    },
  },

  frederiksen: {
    id: 'frederiksen',
    factionId: 'denmark',
    name: 'Mette Frederiksen',
    title: 'Prime Minister of Denmark',
    traits: ['diplomatic', 'cautious', 'nationalist'],
    greetings: [
      "Greenland is part of the Kingdom of Denmark.",
      "We respect Greenlandic self-governance.",
      "Denmark will protect its Arctic territories.",
    ],
    threats: [
      "Greenland is not for sale. Period.",
      "Denmark will defend its territorial integrity.",
      "This is unacceptable interference.",
    ],
    negotiations: [
      "We're open to cooperation on Arctic matters.",
      "Greenland's voice must be heard in these discussions.",
      "Let's find solutions that benefit all.",
    ],
    victories: [
      "Denmark's position is vindicated.",
      "This is good for the Kingdom and Greenland.",
      "Our Arctic policy has succeeded.",
    ],
    defeats: [
      "Denmark will continue its principled stance.",
      "This doesn't change our fundamental position.",
      "We remain committed to Greenland.",
    ],
    reactions: {
      military_buildup: ["We are concerned about Arctic militarization."],
      treaty_offer: ["Denmark values diplomatic solutions."],
      territorial_claim: ["Greenland's future is for Greenlanders to decide."],
      economic_pressure: ["We prefer cooperation to confrontation."],
    },
  },

  store: {
    id: 'store',
    factionId: 'norway',
    name: 'Jonas Gahr Støre',
    title: 'Prime Minister of Norway',
    traits: ['diplomatic', 'cautious', 'calculating'],
    greetings: [
      "Norway is committed to responsible Arctic stewardship.",
      "The High North is Norway's most important strategic area.",
      "We balance NATO membership with Arctic dialogue.",
    ],
    threats: [
      "Norwegian sovereignty in the Arctic is absolute.",
      "We will not accept violations of our waters.",
      "NATO stands behind Norwegian interests.",
    ],
    negotiations: [
      "Norway has long experience in Arctic diplomacy.",
      "Dialogue has served us well with all our neighbors.",
      "Let's find practical solutions.",
    ],
    victories: [
      "Norwegian Arctic policy has proven sound.",
      "This benefits the entire region.",
      "A good outcome for High North stability.",
    ],
    defeats: [
      "Norway will persist in its Arctic engagement.",
      "Our fundamental interests remain unchanged.",
      "We will continue our balanced approach.",
    ],
    reactions: {
      military_buildup: ["We monitor developments carefully."],
      treaty_offer: ["Norway is always open to dialogue."],
      territorial_claim: ["Svalbard is Norwegian. The treaty is clear."],
      economic_pressure: ["We prefer engagement to isolation."],
    },
  },

  stubb: {
    id: 'stubb',
    factionId: 'finland',
    name: 'Alexander Stubb',
    title: 'President of Finland',
    traits: ['diplomatic', 'calculating', 'cautious'],
    greetings: [
      "Finland brings Arctic expertise and NATO solidarity.",
      "We know how to work with all Arctic partners.",
      "Stability in the Arctic benefits everyone.",
    ],
    threats: [
      "Finland will defend every meter of its territory.",
      "NATO's newest member is fully committed.",
      "Our border is Europe's border.",
    ],
    negotiations: [
      "Finland has channels others might lack.",
      "We believe in dialogue even in difficult times.",
      "Let's explore all options.",
    ],
    victories: [
      "Finnish resilience has paid off.",
      "A good outcome for Arctic stability.",
      "Our approach has been validated.",
    ],
    defeats: [
      "Finland has weathered worse.",
      "Our strategic position remains strong.",
      "We will adapt and continue.",
    ],
    reactions: {
      military_buildup: ["We are prepared for any scenario."],
      treaty_offer: ["Finland supports diplomatic efforts."],
      territorial_claim: ["International law must be the foundation."],
      economic_pressure: ["We support EU coordinated measures."],
    },
  },

  modi: {
    id: 'modi',
    factionId: 'india',
    name: 'Narendra Modi',
    title: 'Prime Minister of India',
    traits: ['calculating', 'diplomatic', 'nationalist'],
    greetings: [
      "India seeks its rightful place as an Arctic observer.",
      "Our scientific interests in the Arctic are growing.",
      "India supports international Arctic cooperation.",
    ],
    threats: [
      "India will protect its strategic interests.",
      "We have options beyond traditional alignments.",
      "Do not underestimate India's capabilities.",
    ],
    negotiations: [
      "India is open to partnerships with all nations.",
      "We bring unique expertise to Arctic research.",
      "Let us find mutual benefit.",
    ],
    victories: [
      "India's Arctic strategy advances.",
      "A success for Indian diplomacy.",
      "Our voice is being heard.",
    ],
    defeats: [
      "India will find other paths forward.",
      "Our Arctic ambitions remain unchanged.",
      "This is only a temporary setback.",
    ],
    reactions: {
      military_buildup: ["India monitors global developments closely."],
      treaty_offer: ["India welcomes dialogue with all parties."],
      territorial_claim: ["We respect established boundaries."],
      economic_pressure: ["India pursues its own path."],
    },
  },

  erdogan: {
    id: 'erdogan',
    factionId: 'turkey',
    name: 'Recep Erdogan',
    title: 'President of Türkiye',
    traits: ['aggressive', 'unpredictable', 'nationalist'],
    greetings: [
      "Türkiye demands its voice in Arctic governance!",
      "We will not be excluded from strategic regions!",
      "The Arctic concerns all humanity, not just coastal states!",
    ],
    threats: [
      "Türkiye has ways of making its displeasure known!",
      "Do not test Turkish resolve!",
      "We will take necessary measures!",
    ],
    negotiations: [
      "Türkiye is prepared to engage... on equal terms.",
      "We seek recognition of our legitimate interests.",
      "Let us find arrangements that respect Turkish dignity.",
    ],
    victories: [
      "Türkiye rises to its rightful place!",
      "A victory for Turkish diplomacy!",
      "The world recognizes our importance!",
    ],
    defeats: [
      "Türkiye will remember this treatment!",
      "Temporary setback - our resolve is stronger!",
      "We will return with new approaches!",
    ],
    reactions: {
      military_buildup: ["Türkiye will not be intimidated!"],
      treaty_offer: ["What is being offered to Türkiye?"],
      territorial_claim: ["Türkiye demands to be consulted!"],
      economic_pressure: ["We have our own economic tools!"],
    },
  },

  indigenous_elder: {
    id: 'indigenous_elder',
    factionId: 'indigenous',
    name: 'Arctic Council Elder',
    title: 'Representative of Arctic Indigenous Peoples',
    traits: ['diplomatic', 'cautious', 'calculating'],
    greetings: [
      "This is our homeland. We have lived here for millennia.",
      "The ice speaks to those who listen.",
      "Our voices must be heard in decisions about our lands.",
    ],
    threats: [
      "The world is watching how you treat indigenous peoples.",
      "We have allies in every country who support our rights.",
      "History will judge those who ignore us.",
    ],
    negotiations: [
      "We seek partnership, not domination.",
      "Traditional knowledge can guide sustainable development.",
      "Our communities must benefit from Arctic resources.",
    ],
    victories: [
      "The ancestors are pleased.",
      "A step toward justice for Arctic peoples.",
      "Our persistence has borne fruit.",
    ],
    defeats: [
      "We have endured worse. We will endure this.",
      "The struggle continues.",
      "Our rights do not disappear because others ignore them.",
    ],
    reactions: {
      military_buildup: ["War machines pollute our sacred waters."],
      treaty_offer: ["Indigenous peoples must be at the table."],
      territorial_claim: ["These lands were ours before your nations existed."],
      economic_pressure: ["Our communities suffer when powers clash."],
    },
  },
};

// Get a reaction from a leader based on context
export const getLeaderReaction = (
  leaderId: LeaderId,
  context: 'greeting' | 'threat' | 'negotiation' | 'victory' | 'defeat' | string
): string => {
  const leader = LEADERS[leaderId];
  if (!leader) return "...";

  let pool: string[];

  switch (context) {
    case 'greeting':
      pool = leader.greetings;
      break;
    case 'threat':
      pool = leader.threats;
      break;
    case 'negotiation':
      pool = leader.negotiations;
      break;
    case 'victory':
      pool = leader.victories;
      break;
    case 'defeat':
      pool = leader.defeats;
      break;
    default:
      pool = leader.reactions[context] || leader.greetings;
  }

  return pool[Math.floor(Math.random() * pool.length)];
};

// Get the leader for a faction
export const getLeaderForFaction = (factionId: FactionId): LeaderId | null => {
  const mapping: Partial<Record<FactionId, LeaderId>> = {
    usa: 'trump',
    russia: 'putin',
    china: 'xi',
    canada: 'trudeau',
    denmark: 'frederiksen',
    norway: 'store',
    nato: 'nato_chief',
    indigenous: 'indigenous_elder',
  };
  return mapping[factionId] || null;
};

// Generate a leader response to an operation
export const getLeaderResponseToOperation = (
  leaderId: LeaderId,
  operation: OperationType,
  isTargeted: boolean
): string => {
  const leader = LEADERS[leaderId];
  if (!leader) return "...";

  // Aggressive operations trigger threats, defensive ones get neutral responses
  const aggressiveOps: OperationType[] = ['strike', 'invasion', 'blockade', 'nuclear_alert'];
  const isAggressive = aggressiveOps.includes(operation);

  if (isTargeted && isAggressive) {
    return getLeaderReaction(leaderId, 'threat');
  } else if (isTargeted) {
    return leader.reactions.military_buildup?.[0] || getLeaderReaction(leaderId, 'greeting');
  } else {
    // Observing someone else's operation
    const concerned = leader.traits.includes('cautious') || leader.traits.includes('diplomatic');
    if (isAggressive && concerned) {
      return "This escalation concerns all Arctic stakeholders.";
    }
    return getLeaderReaction(leaderId, 'greeting');
  }
};
