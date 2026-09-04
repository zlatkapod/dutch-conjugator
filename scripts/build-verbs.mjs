/**
 * Generates src/data/verbs.json from scripts/verbs.source.mjs.
 *
 * The source file carries only what needs a human: stems, ablaut, auxiliaries.
 * Everything below is mechanical Dutch orthography, applied once here instead
 * of ~5500 times by hand.
 *
 * Usage: npm run build:verbs   (add --check to verify without writing)
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  WEAK, STRONG, MIXED, PRESENT_OVERRIDES, ZULLEN, FALSE_PREFIXES, EXTRA_NO_GE,
} from './verbs.source.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/verbs.json');

const PERSONS = ['ik', 'jij', 'hijzij', 'wij'];
const VOWELS = 'aeiou';
/** 't kofschip: voiceless finals take -te / -t, everything else -de / -d. */
const KOFSCHIP = ['ch', 't', 'k', 'f', 's', 'p', 'x'];
const UNSTRESSED_PREFIX = /^(be|ge|her|ont|ver|er)/;

/** The bare root of the infinitive, before devoicing: reizen -> reiz, leven -> lev. */
const root = (infinitive) => infinitive.replace(/en$/, '');

/** -te or -de, decided on the *underlying* final consonant, not the spelled stem. */
function dentalSuffix(infinitive) {
  const r = root(infinitive);
  return KOFSCHIP.some((c) => r.endsWith(c)) ? 't' : 'd';
}

/**
 * jij/hij form: stem + t. A stem already ending in t takes nothing (eten ->
 * jij eet), and a stem ending in a bare long vowel doubles it, because closing
 * the syllable forces the vowel to be written twice (gaan: ga -> gaat).
 */
function stemPlusT(stem) {
  if (stem.endsWith('t')) return stem;
  const last = stem.at(-1);
  const beforeLast = stem.at(-2) ?? '';
  if ('aeou'.includes(last) && !VOWELS.includes(beforeLast)) {
    return `${stem}${last}t`;
  }
  return `${stem}t`;
}

/** ge- + stem + d/t, minus the ge- on prefixed verbs, plus a trema where needed. */
function buildParticiple(infinitive, stem, suffix) {
  const body = stem.endsWith(suffix) ? stem : `${stem}${suffix}`;
  const prefixed =
    (UNSTRESSED_PREFIX.test(infinitive) && !FALSE_PREFIXES.includes(infinitive)) ||
    EXTRA_NO_GE.includes(infinitive);
  if (prefixed) return body;
  // ge- before e/i needs a trema so the vowels are not read as one: geëist.
  if (body.startsWith('e')) return `geë${body.slice(1)}`;
  if (body.startsWith('i')) return `geï${body.slice(1)}`;
  return `ge${body}`;
}

const AUX_FORMS = {
  hebben: { ik: 'heb', jij: 'hebt', hijzij: 'heeft', wij: 'hebben' },
  zijn: { ik: 'ben', jij: 'bent', hijzij: 'is', wij: 'zijn' },
};

/** 'hebben|zijn' yields both readings as accepted alternatives. */
function buildPerfect(aux, participle) {
  const auxes = aux.split('|');
  return Object.fromEntries(
    PERSONS.map((p) => [p, auxes.map((a) => `${AUX_FORMS[a][p]} ${participle}`).join('|')]),
  );
}

function buildPresent(infinitive, stem) {
  if (PRESENT_OVERRIDES[infinitive]) return { ...PRESENT_OVERRIDES[infinitive] };
  const t = stemPlusT(stem);
  return { ik: stem, jij: t, hijzij: t, wij: infinitive };
}

/** Past of a weak verb: stem + de(n)/te(n). No de-doubling here - wachtte is correct. */
function weakPast(infinitive, stem) {
  const s = dentalSuffix(infinitive);
  return {
    ik: `${stem}${s}e`,
    jij: `${stem}${s}e`,
    hijzij: `${stem}${s}e`,
    wij: `${stem}${s}en`,
  };
}

const byInfinitive = new Map();
const add = (verb) => {
  if (byInfinitive.has(verb.infinitive)) {
    throw new Error(`duplicate infinitive: ${verb.infinitive}`);
  }
  byInfinitive.set(verb.infinitive, verb);
};

for (const [infinitive, stem, aux, english] of WEAK) {
  const participle = buildParticiple(infinitive, stem, dentalSuffix(infinitive));
  add({
    infinitive,
    english,
    type: 'regular',
    aux,
    forms: {
      present: buildPresent(infinitive, stem),
      past: weakPast(infinitive, stem),
      perfect: buildPerfect(aux, participle),
    },
  });
}

for (const [list, type] of [[STRONG, 'irregular'], [MIXED, 'mixed']]) {
  for (const [infinitive, stem, pastSg, pastPl, participle, aux, english] of list) {
    add({
      infinitive,
      english,
      type,
      aux,
      forms: {
        present: buildPresent(infinitive, stem),
        past: { ik: pastSg, jij: pastSg, hijzij: pastSg, wij: pastPl },
        perfect: buildPerfect(aux, participle),
      },
    });
  }
}

add({
  infinitive: ZULLEN.infinitive,
  english: ZULLEN.english,
  type: 'irregular',
  aux: 'hebben',
  note: ZULLEN.note,
  forms: {
    present: { ...PRESENT_OVERRIDES.zullen },
    past: { ...ZULLEN.past },
    perfect: { ...ZULLEN.perfect },
  },
});

const verbs = [...byInfinitive.values()].sort((a, b) =>
  a.infinitive.localeCompare(b.infinitive, 'nl'),
);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const problems = [];

for (const verb of verbs) {
  for (const tense of ['present', 'past', 'perfect']) {
    for (const person of PERSONS) {
      const value = verb.forms[tense][person];
      if (typeof value !== 'string' || value.trim() === '') {
        problems.push(`${verb.infinitive}.${tense}.${person} is empty`);
      } else if (value !== value.trim().toLowerCase() || /\s{2,}/.test(value)) {
        problems.push(`${verb.infinitive}.${tense}.${person} not normalised: "${value}"`);
      }
    }
  }
  if (!/^[a-zäëïöü]+$/.test(verb.infinitive)) {
    problems.push(`${verb.infinitive}: unexpected characters in infinitive`);
  }
  if (verb.forms.present.wij !== verb.infinitive) {
    problems.push(`${verb.infinitive}: wij-present should equal the infinitive`);
  }
}

/** Spot-check table: forms verified by hand against the rules, not generated. */
const EXPECT = {
  reizen:      ['reis', 'reist', 'reisde', 'reisden', 'gereisd'],
  leven:       ['leef', 'leeft', 'leefde', 'leefden', 'geleefd'],
  wachten:     ['wacht', 'wacht', 'wachtte', 'wachtten', 'gewacht'],
  redden:      ['red', 'redt', 'redde', 'redden', 'gered'],
  antwoorden:  ['antwoord', 'antwoordt', 'antwoordde', 'antwoordden', 'geantwoord'],
  douchen:     ['douch', 'doucht', 'douchte', 'douchten', 'gedoucht'],
  eisen:       ['eis', 'eist', 'eiste', 'eisten', 'geëist'],
  installeren: ['installeer', 'installeert', 'installeerde', 'installeerden', 'geïnstalleerd'],
  bellen:      ['bel', 'belt', 'belde', 'belden', 'gebeld'],
  verven:      ['verf', 'verft', 'verfde', 'verfden', 'geverfd'],
  vertellen:   ['vertel', 'vertelt', 'vertelde', 'vertelden', 'verteld'],
  ontmoeten:   ['ontmoet', 'ontmoet', 'ontmoette', 'ontmoetten', 'ontmoet'],
  overtuigen:  ['overtuig', 'overtuigt', 'overtuigde', 'overtuigden', 'overtuigd'],
  studeren:    ['studeer', 'studeert', 'studeerde', 'studeerden', 'gestudeerd'],
  gaan:        ['ga', 'gaat', 'ging', 'gingen', 'gegaan'],
  staan:       ['sta', 'staat', 'stond', 'stonden', 'gestaan'],
  zien:        ['zie', 'ziet', 'zag', 'zagen', 'gezien'],
  doen:        ['doe', 'doet', 'deed', 'deden', 'gedaan'],
  eten:        ['eet', 'eet', 'at', 'aten', 'gegeten'],
  houden:      ['houd', 'houdt', 'hield', 'hielden', 'gehouden'],
  vinden:      ['vind', 'vindt', 'vond', 'vonden', 'gevonden'],
  vragen:      ['vraag', 'vraagt', 'vroeg', 'vroegen', 'gevraagd'],
  lachen:      ['lach', 'lacht', 'lachte', 'lachten', 'gelachen'],
  zweten:      ['zweet', 'zweet', 'zweette', 'zweetten', 'gezweet'],
  typen:       ['typ', 'typt', 'typte', 'typten', 'getypt'],
};

for (const [infinitive, [ik, jij, pastSg, pastPl, participle]] of Object.entries(EXPECT)) {
  const verb = byInfinitive.get(infinitive);
  if (!verb) {
    problems.push(`spot-check: ${infinitive} missing from dataset`);
    continue;
  }
  const got = [
    verb.forms.present.ik,
    verb.forms.present.jij,
    verb.forms.past.ik,
    verb.forms.past.wij,
    verb.forms.perfect.ik.split('|')[0].split(' ').slice(1).join(' '),
  ];
  const want = [ik, jij, pastSg, pastPl, participle];
  want.forEach((w, i) => {
    if (got[i] !== w) {
      problems.push(`spot-check ${infinitive}: expected "${w}", generated "${got[i]}"`);
    }
  });
}

// Regression check against the previous hand-written dataset.
const drift = [];
try {
  const previous = JSON.parse(readFileSync(OUT, 'utf8'));
  for (const old of previous) {
    const next = byInfinitive.get(old.infinitive);
    if (!next) {
      drift.push(`${old.infinitive}: dropped from the new dataset`);
      continue;
    }
    for (const tense of ['present', 'past', 'perfect']) {
      for (const person of PERSONS) {
        const before = old.forms?.[tense]?.[person];
        const after = next.forms[tense][person];
        if (before !== undefined && before !== after) {
          drift.push(`${old.infinitive}.${tense}.${person}: "${before}" -> "${after}"`);
        }
      }
    }
  }
} catch {
  drift.push('(no previous verbs.json to compare against)');
}

const counts = verbs.reduce((acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + 1 }), {});
console.log(`verbs: ${verbs.length}`, counts);
console.log(`\nchanges vs previous dataset: ${drift.length}`);
drift.forEach((d) => console.log(`  ${d}`));

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.error(`  ${p}`));
  process.exit(1);
}
console.log('\nall checks passed');

if (!process.argv.includes('--check')) {
  writeFileSync(OUT, `${JSON.stringify(verbs, null, 2)}\n`, 'utf8');
  console.log(`wrote ${OUT}`);
}
