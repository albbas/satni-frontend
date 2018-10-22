import xpath from 'xpath';
import {DOMParser} from 'xmldom';
import { List, Set } from 'immutable';

const num = Set.of('Sg', 'Pl');

const verbSet = Set.of(
  'V Ind Prs ConNeg',
  'V Ind Prt ConNeg',
  'V PrfPrc'
);

const verbNumber = List.of(
  'Sg1', 'Sg2', 'Sg3',
  'Du1', 'Du2', 'Du3',
  'Pl1', 'Pl2', 'Pl3'
);

const verbDict = {
  'sma': {
    'V Ind Prs ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V Ind Prt ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V PrfPrc': [
      'lean', 'leat', 'lea',
      'ledne', 'leahppi', 'leaba',
      'leat', 'lehpet', 'leat'
    ]
  },
  'sme': {
    'V Ind Prs ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V Ind Prt ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V PrfPrc': [
      'lean', 'leat', 'lea',
      'ledne', 'leahppi', 'leaba',
      'leat', 'lehpet', 'leat'
    ]
  },
  'smj': {
    'V Ind Prs ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V Ind Prt ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V PrfPrc': [
      'lean', 'leat', 'lea',
      'ledne', 'leahppi', 'leaba',
      'leat', 'lehpet', 'leat'
    ]
  },
  'smn': {
    'V Ind Prs ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V Ind Prt ConNeg': [
      'in', 'it', 'ii',
      'ean', 'eahppi', 'eaba',
      'eat', 'ehpet', 'eai'
    ],
    'V PrfPrc': [
      'lean', 'leat', 'lea',
      'ledne', 'leahppi', 'leaba',
      'leat', 'lehpet', 'leat'
    ]
  }
};

export const toJson = (text) => {
  // eXist sometimes sends misformed json, correct it here
  return JSON.parse(
    text.indexOf('{') === 0 ?
    '[' + text.slice(text.indexOf('{') + 1, text.lastIndexOf('}')) + ']' :
    text);
};

export const removeDuplicates = (existTerms) => {
  const foundTermWikiRef = [];

  return existTerms.filter((term) => {
    if (term.dict === 'termwiki') {
      if (!foundTermWikiRef.includes(term.termwikiref)) {
        foundTermWikiRef.push(term.termwikiref);
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  });
};

export const normaliseArticles = (existTerms) => {
  return removeDuplicates(existTerms).map((existTerm) => {
    if (existTerm.termwikiref === '-1') {
      return normaliseDict(existTerm);
    } else if (existTerm.dict === 'termwiki') {
      return normaliseTermWiki(existTerm);
    } else {
      return normaliseSDTerm(existTerm);
    }
  });
};

export const translationStems = (tg) => {
  let stems = [];

  if (tg.t instanceof Object && tg.t instanceof Array) {
    tg.t.forEach((tr) => {
      stems.push({
        'lemma': tr['#text'],
        'lang': tg['xml:lang'],
        'pos': tr.pos
      });
    });
  } else {
    stems.push({
      'lemma': tg.t['#text'],
      'lang': tg['xml:lang'],
      'pos': tg.t.pos
    });
  }

  return stems;
};

export const translationExamples = (xg) => {
  let examples = [];
  if (xg instanceof Object && xg instanceof Array) {
    xg.forEach((x) => {
      examples.push({'x': x.x, 'xt': x.xt});
    });
  } else {
    examples.push({'x': xg.x, 'xt': xg.xt});
  }

  return examples;
};

export const normaliseDict = (existDict) => {
  let translations = translationStems(existDict.tg);
  translations.unshift({
    'lemma': existDict.term,
    'lang': existDict.lang,
    'pos': existDict.pos
  });

  let examples = existDict.tg.xg ? translationExamples(existDict.tg.xg) : [];

  return {
    translations,
    examples,
    termwikiref: existDict.termwikiref,
    dict: existDict.dict
  };
};

const term2dict = {
  'se': 'sme',
  'sme': 'sme',
  'fi': 'fin',
  'fin': 'fin',
  'nb': 'nob',
  'nor': 'nob',
  'nob': 'nob',
  'nn': 'nno',
  'nno': 'nno',
  'sv': 'swe',
  'swe': 'swe',
  'smn': 'smn',
  'sma': 'sma',
  'smj': 'smj',
  'lat': 'lat',
  'en': 'eng',
  'eng': 'eng'
};

const normaliseTranslationGroup = (existTerm) => {
  const terms = [];
  const tg = existTerm.tg;

  if (tg instanceof Object && tg instanceof Array) {
    tg.forEach((tg) => {
      let stem = {};
      try {
        stem['lemma'] = tg.t['#text'].trim();
      } catch (TypeError) {
        stem['lemma'] = tg.t.trim();
      }
      stem['lang'] = term2dict[tg['xml:lang']];
      stem['pos'] = tg.t.pos;

      if (stem['lemma']) {
        if (stem['lemma'] === existTerm.term.trim()) {
          terms.unshift(stem);
        } else {
          terms.push(stem);
        }
      }
    });
  } else {
    let stem = {};
    try {
      stem['lemma'] = tg.t['#text'].trim();
    } catch (TypeError) {
      stem['lemma'] = tg.t.trim();
    }
    stem['lang'] = term2dict[tg['xml:lang']];
    stem['pos'] = tg.t.pos;
    terms.push(stem);
  }

  return terms;
};

export const normaliseTermWiki = (existTerm) => {
  return {
    stems: normaliseTranslationGroup(existTerm),
    termwikiref: existTerm.termwikiref,
    dict: existTerm.dict
  };
};

const sdTranslationStems = (t, lang, pos) => {
  let stems = [];

  if (t instanceof Object && t instanceof Array) {
    t.forEach((tr) => {
      stems.push({
        'lemma': tr.trim(),
        'lang': lang,
        'pos': pos
      });
    });
  } else {
    stems.push({
      'lemma': t.trim(),
      'lang': lang,
      'pos': pos
    });
  }

  return stems;
};

export const normaliseSDTerm = (existTerm) => {
  const terms = [];

  existTerm.tg.forEach((tg) => {
    let stems = sdTranslationStems(tg.t, term2dict[tg['xml:lang']], existTerm.pos);

    stems.forEach((stem) => {
      if (stem['lemma'] === existTerm.term.trim()) {
        terms.unshift(stem);
      } else {
        terms.push(stem);
      }
    }
  );
  });

  return {
    stems: terms,
    dict: existTerm.dict
  };
};

export const normaliseNounParadigm = (html) => {
  const doc = new DOMParser().parseFromString(html);
  const tables = xpath.select('.//table', doc);
  const tableRows = xpath.select('.//tr', tables[1]);
  const want = {};
  let splits = [];

  tableRows.forEach((tr) => {
    const idText = xpath.select('.//td', tr)[1].firstChild.data;
    const wordForms = xpath.select('.//font[@color="red"]', tr)
        .map((font) => font.firstChild.data);

    splits = idText.split(' ');
    if (splits.length < 4) {
      if (splits.length === 3) {
        if (!want[splits[2]]) {
          want[splits[2]] = {};
        }
        want[splits[2]][splits[1]] = wordForms;
      } else {
        want[splits[1] + '_both'] = wordForms;
      }
    }
  });

  return want;
};

export const normaliseAdjParadigm = (html) => {
  const doc = new DOMParser().parseFromString(html);
  const tables = xpath.select('.//table', doc);
  const tableRows = xpath.select('.//tr', tables[1]);
  const want = {};
  let splits = [];

  tableRows.forEach((tr) => {
    const idText = xpath.select('.//td', tr)[1].firstChild.data;
    const wordForms = xpath.select('.//font[@color="red"]', tr)
        .map((font) => font.firstChild.data);

    splits = idText.split(' ');
    if (
      (splits.length === 3 && num.has(splits[1]))
      || (splits.length === 2)
    ) {
      splits.splice(1, 0, 'Positive');
    }

    if (splits.length === 3) {
      if (splits[2] === 'Attr') {
        if (!want[splits[2]]) {
          want[splits[2]] = {};
        }
        want[splits[2]][splits[1]] = wordForms;
      } else {
        splits.splice(2, 0, 'Both');
      }
    }

    if (splits.length === 4) {
      if (!want[splits[2]]) {
        want[splits[2]] = {};
      }
      if (!want[splits[2]][splits[3]]) {
        want[splits[2]][splits[3]] = {};
      }
      want[splits[2]][splits[3]][splits[1]] = wordForms;
    }
  });

  return want;
};

export const normaliseVerbParadigm = (html) => {
  const doc = new DOMParser().parseFromString(html);
  const tables = xpath.select('.//table', doc);
  const tableRows = xpath.select('.//tr', tables[1]);
  const want = {};
  let splits = [];

  tableRows.forEach((tr) => {
    const idText = xpath.select('.//td', tr)[1].firstChild.data;
    const wordForms = xpath.select('.//font[@color="red"]', tr)
        .map((font) => font.firstChild.data);

    if (verbSet.has(idText)) {
      want[idText] = {};
      verbNumber.forEach((number, i) => {
        want[idText][number] = wordForms.map((word) => `(${verbDict['sme'][idText][i]}) ${word}`);
      });
    } else {
      splits = idText.split(' ');
      if (splits.length === 4 && splits[3] !== 'ConNeg') {
        if (!want[splits[2]]) {
          want[splits[2]] = {};
        }
        want[splits[2]][splits[3]] = wordForms;
      }
    }
  });

  return want;
};
