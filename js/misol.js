// noinspection RegExpRedundantEscape

/**
 * Major functions to handle sound change with multi-tiers.
 * **/

/* code from a gist on github https://gist.github.com/jkantr/0bd39a9d4feec00cee3835926649d838*/
const cartesianProduct = (...args) => args.reduce((a, b) => a.map(x => b.map(y => x.concat([y]))).reduce((acc, t) => acc.concat(t), []) , [[]])


function parse_law_string(law_string) {
  var inBracket = false;
  var inSequence = false;
  var i, sg;
  var out = [];
  for (i = 0; i < law_string.length; i += 1) {
    sg = law_string[i];
    if (sg == "[") {
      inBracket = true;
      out.push("");
    }
    else if (sg == "]") {
      inBracket = false;
    }
    else if (sg == " "){
      if (inBracket) {
        out[out.length-1] += sg;
      }
      else {
        inSequence = false;  
      }
    }
    else {
      if (inBracket) {
        out[out.length - 1] += sg;
      }
      else if (inSequence) {
        out[out.length - 1] += sg;
      }
      else if (!inSequence) {
        out.push(sg);
        inSequence = true;
      }
    }
  }
  var sounds = [];
  out.forEach(element => sounds.push(element.trim().split(/\s+/g)));
  return sounds;
}
/* parse a sound law */
function parse_laws(lawstring){
  var law, context, i, j;
  if (lawstring.indexOf("#") !== -1) {
    lawstring = lawstring.slice(0, lawstring.indexOf("#"));
  }
  /* parse the context to get started */
  if (lawstring.indexOf(" / ") !== -1) {
    [law, context] = lawstring.split(" / ");
  }
  else {
    law = lawstring;
    context = "";
  }
  var sources, targets;
  var before, after, context_string, new_context;
  [sources, targets] = law.split(' > ');

  [sources, targets]  = [parse_law_string(sources), parse_law_string(targets)]; 
  var laws = [];
  var source_slice;
  for (i = 0; i < sources.length; i += 1) {
    [before, after] = [[], []];
    source_slice = sources.slice(0, i);
    for (j = 0; j < source_slice.length; j += 1) {
      if (source_slice[j].length > 1){
        before.push("[" + source_slice[j].join(" ") + "]");
      }
      else {
        before.push(source_slice[j][0]);
      }
    }
    before = before.join(" ");
    
    source_slice = sources.slice(i + 1, sources.length);
    for (j = 0; j < source_slice.length; j += 1) {
      if (source_slice[j].length > 1) {
        after.push("[" + source_slice[j].join(" ") + "]");
      }
      else {
        after.push(source_slice[j]);
      }
    }
    after = after.join(" ");
    if (before || after) {
      context_string = [before, "_", after].join(" ").trim();
    }
    else {
      context_string = "_";
    }
    if (context) {
      new_context = context.replace("_", context_string);
    }
    else {
      new_context = context_string;
    }
    laws.push([sources[i].join(" "), targets[i].join(" "), new_context]);
  }
  return laws;
}


/* parse a sound law */
function parse_law(lawstring){
  var law, context;
  if (lawstring.indexOf("#") !== -1) {
    lawstring = lawstring.slice(0, lawstring.indexOf("#"));
  }
  if (lawstring.indexOf(" / ") !== -1) {
    [law, context] = lawstring.split(" / ");
  }
  else {
    law = lawstring;
    context = "";
  }
  var source, target;
  [source, target] = law.split(' > ');
  return [source, target, context];
}

/* parse context */
/* note that we need the space as a semantic marker here to remember the parsing process */
/* when parsing, we should allow for nested structures, such that @tier[a b c]@[a b c] is parsed as 
 * [ [ [ a b c ], [ a b c ] ] ], [ [ tier, segments ] ]
 * */
function parse_rightleft_context(contextstring, misol){
  if (contextstring === "") {
    return [];
  }
  var bracket = false;
  var at = false;
  var i, chr;
  var j, current_sounds;
  var sounds = [];
  var tiers = [];

  var this_sound = '';
  var this_tier = '';
  /* add space to context string */
  if (contextstring[contextstring.length - 1] !== "]") {
    contextstring = contextstring + " ";
  }
  var bracket_closed = false;
  for (i = 0; i < contextstring.length; i += 1) {
    chr = contextstring[i];
    if (chr === "[") {
      at = false;
      bracket = true;
      this_sound = "";
    }
    else if (chr === "@") {
      at = true;
      this_tier = '';
    }
    else if (chr === "]") {
      bracket = false;
      bracket_closed = true;
      current_sounds = this_sound.split(" ");
      this_sound = [];
      for (j = 0; j < current_sounds.length; j += 1) {
        if (typeof misol.classes[current_sounds[j]] == "undefined") {
          misol.classes[current_sounds[j]] = [current_sounds[j]];
          misol.sounds[current_sounds[j]] = {};
          misol.sounds[current_sounds[j]][current_sounds[j]] =  0;
        }
        for (k = 0; k < misol.classes[current_sounds[j]].length; k += 1) {
          this_sound.push(misol.classes[current_sounds[j]][k]);
        }
      }
      sounds.push(this_sound);
      tiers.push(this_tier);
      this_sound = "";
      this_tier = "";
    }
    else if (chr === " ") {
      if (bracket) {
        this_sound = this_sound+" ";
      }
      else {
        if (bracket_closed) {
          bracket_closed = false;
        }
        else {
          if (typeof misol.classes[this_sound] == "undefined") {
            misol.classes[this_sound] = [this_sound];
            misol.sounds[this_sound] = {};
            misol.sounds[this_sound][this_sound] = 0;
          }
          sounds.push(misol.classes[this_sound]);
          tiers.push(this_tier);
          this_sound = "";
          this_tier = "";
        }
      }
    }
    else {
      if (bracket) {
        this_sound = this_sound + chr;
      }
      else if (at) {
        this_tier = this_tier + chr;
      }
      else {
        this_sound = this_sound + chr;
      }
    }
  }
  return [sounds, tiers];
}

/* TODO: add nested regexes by putting stuff in brackets and allowing to add multiple contexts, like @initial[abc]@tone[cde]_ or similar */
function parse_context(contextstring) {
  if (contextstring === "") {
    return [[], [], ["", ""]];
  }
  var right, left, tier, sound;
  // noinspection RegExpRedundantEscape
  var matches;
  // noinspection RegExpRedundantEscape,RegExpSimplifiable
  matches = contextstring.match(/\s{0,1}@{1,1}([^\s]*)\[([^\]]*)\]_\s{0,1}|\s{0,1}()_\s{0,1}/);
  if (matches === null) {
    alert("null matches");
    console.log("NULL", contextstring);
  }
  if (typeof matches[1] != "undefined") {
    tier = matches[1];
    sound = matches[2];
  }
  else {
    tier = "";
    sound = "";
  }
  [left, right] = contextstring.split(/\s{0,1}@{1,1}[^\s]*\[[^\]]*\]_\s{0,1}|\s{0,1}_\s{0,1}/);
  return [left, right, [tier, sound]];
}


class SoundClasses {
  constructor (items, laws, mode){
    /* parse the sound classes */
    this.mode = mode;
    this.raw = {};
    this.classes = {"^": ["^"], "$": ["$"], "-": ["-"], "?": ["?"]};
    this.sounds = {};
    this.bwr_show = "perfect";
    var i, j, k, cls, sounds_, sounds, sound;
    var visited = [];
    for (i = 0; i < items.length; i += 1) {
      [cls, sounds_] = items[i].split(" = ");
      sounds_ = sounds_.split(" ");
      sounds = [];
      if (visited.indexOf(cls) != -1) {
        alert("Line " + (i + 1) + " defines class " + cls + ", but this class has been defined before and will be ignored!");
      }
      else {
        visited.push(cls);
        for (j = 0; j < sounds_.length; j += 1) {
          sound = sounds_[j];
          visited.push(sound);
          if (sound in this.classes){
            for (k = 0; k < this.classes[sound].length; k += 1) {
              sounds.push(this.classes[sound][k]);
            }
          }
          else {
            sounds.push(sound);
          }
        }
        this.classes[cls] = [];
        for (j = 0; sound=sounds[j]; j += 1) {
          this.classes[cls].push(sound);
          if (sound in this.sounds) {
            this.sounds[sound][cls] = j;
          }
          else {
            this.sounds[sound] = {};
            this.sounds[sound][cls] = j;
          }
        }
      }
    }
    for (sound in this.sounds) {
      this.classes[sound] = [sound];
    }

    /* parse the sound laws */
    var source, sources, target, targets, context;
    var law;
    var right, left, self_tier;
    var before, after, k, m, n, idxs;
    this.laws = {};
    this.raw_laws = {};
    var snd, elm;
    var ctxts;
    var all_laws;
    for (i = 0; law = laws[i]; i += 1) {
      this.raw_laws[i + 1] = law;
      all_laws = parse_laws(law);
      for (k = 0; k < all_laws.length; k += 1) {
        [source, target, context] = all_laws[k];
        sources = [];
        targets = [];
        source = source.split(" ");
        target = target.split(" ");
        for (j = 0; elm = source[j]; j += 1) {
          if (typeof this.classes[elm] == "undefined") {
            this.classes[elm] = [elm];
            this.sounds[sound] = {};
            this.sounds[sound][sound] = 0;
          }
          sources = sources.concat(this.classes[elm]);
        }
        for (j = 0; elm = target[j]; j += 1) {
          if (typeof this.classes[elm] == "undefined") {
            this.classes[elm] = [elm];
            this.sounds[sound] = {};
            this.sounds[sound][sound] = 0;
          }
          targets = targets.concat(this.classes[elm]);
        }
        if (sources.length != targets.length) {
          alert("source and target have different lengths in law"+i);
        }
        for (j = 0; j < sources.length; j += 1) {
          [source, target] = [sources[j], targets[j]];
          [left, right, self_tier] = parse_context(context);
          /* reverse the left context */
          if (left != "") {
            before = parse_rightleft_context(left, this);
            before[0] = before[0].reverse();
            before[1] = before[1].reverse(); 
          }
          else {
            before = [[], []];
          }
          if (right != "") {
            after = parse_rightleft_context(right, this);
          }
          else {
            after = [[], []];
          }
          if (source in this.laws) {
            this.laws[source].push([target, before[0], before[1], self_tier, after[0], after[1], i+1]);
          }
          else {
            this.laws[source] = [[target, before[0], before[1], self_tier, after[0], after[1], i+1]];
          }
        }
      }
    }
  }
  assemble_laws () {
    var sound, i, j, k;
    var maxA = 0;
    var maxB = 0;
    this.all_laws = {};
    var claw;
    var right, left, target;
    var tier;
    this.tiers = [];
    for (sound in this.laws) {
      for (i = 0; i < this.laws[sound].length; i += 1) {
        /* add the tier information */
        for (j = 0; j < this.laws[sound][i][2].length; j += 1) {
          tier = this.laws[sound][i][2][j];
          if (tier == "") {
            tier = "segments_left_" + (j + 1);
          }
          else {
            tier = tier+"_left_" + (j + 1);
          }
          if (this.tiers.indexOf(tier) == -1) {
            this.tiers.push(tier);
          }
        }
        for (j = 0; j < this.laws[sound][i][5].length; j += 1) {
          tier = this.laws[sound][i][5][j];
          if (tier == "") {
            tier = "segments_right_" + (j + 1);
          }
          else {
            tier = tier+"_right_" + (j + 1);
          }
          if (this.tiers.indexOf(tier) == -1) {
            this.tiers.push(tier);
          }
        }
        if (this.laws[sound][i][3][0] !== "") {
          if (this.tiers.indexOf(this.laws[sound][i][3][0]+"_self_0") === -1) {
            this.tiers.push(this.laws[sound][i][3][0]+"_self_0");
          }
        }

        if (this.laws[sound][i][1].length > maxA) {
          maxA = this.laws[sound][i][1].length;
        }
        if (this.laws[sound][i][4].length > maxB) {
          maxB = this.laws[sound][i][4].length;
        }
      }
    }
    /* now that we have learned all tiers, we can assemble them for each sound */
    var idxs = [];
    var tier_right, tier_left, tier_self, idx;
    var right_val, left_val;
    
    for (i=maxA; i>0; i--) {
      idxs.push(-maxA);
    }
    idxs.push(0);
    for (i = 1; i < maxB + 1; i += 1) {
      idxs.push(i);
    }
    /* we fill our dictionary for the tier values in the following */
    this.laws2tiers = {};
    var tier_selfs;
    for (sound in this.laws) {
      this.all_laws[sound] = [];
      claw = this.laws[sound];
      for (i = 0; i < claw.length; i += 1) {
        [target, left, tier_left, tier_self, right, tier_right, idx] = claw[i];
        tier = {"source": sound, "target": target, "id": idx};
        /* assign the tier information from our index here, this means, we need to trace the name spaces we used here */
        for (j = left.length - 1; j >= 0; j -= 1) {
          if (typeof left[j] == "undefined") {
            left_val = "Ø";
          }
          else {
            left_val = left[j];
          }

          if (tier_left[j] == "") {
            tier["segments_left_" + (j + 1)] = left_val;
          }
          else {
            tier[tier_left[j]+"_left_"+(j + 1)] = left_val;
          }
        }
        for (j = 0; j < right.length; j += 1) {
          if (typeof right[j] == "undefined") {
            right_val = "Ø";
          }
          else {
            right_val = right[j];
          }
          if (tier_right[j] == "") {
            tier["segments_right_" + (j + 1)] = right_val;
          }
          else {
            tier[tier_right[j] + "_right_" + (j + 1)] = right_val;
          }
        }
        if (tier_self[0] != "") {
          tier[tier_self[0] + "_self_0"] = [];
          tier_selfs = tier_self[1].split(" ");
          for (j = 0; j < tier_selfs.length; j += 1) {
            for (k = 0; k < this.classes[tier_selfs[j]].length; k += 1) {
              tier[tier_self[0]+"_self_0"].push(this.classes[tier_selfs[j]][k]);
            }
          }
        }

        for (j = 0; j < this.tiers.length; j += 1) {
          if (!(this.tiers[j] in tier)) {
            tier[this.tiers[j]] = ["Ø"];
          }
        }
        this.all_laws[sound].push(tier);
        if (idx in this.laws2tiers) {
          this.laws2tiers[idx].push(tier);
        }
        else {
          this.laws2tiers[idx] = [tier];
        }
      }
    }
    /* iterate over all laws to get the target to source array */
    this.target2source = {};
    var sound, tiers, tier;
    for (sound in this.all_laws) {
      tiers = this.all_laws[sound];
      for (i=0; i<tiers.length; i++) {
        tier = tiers[i];
        if (tier["target"] in this.target2source && this.target2source[tier["target"]].indexOf(tier["source"]) == -1) {
          this.target2source[tier["target"]].push(tier["source"]);
        }
        else {
          this.target2source[tier["target"]] = [tier["source"]];
        }
      }
    }
    /* process tiers to identify the basic encoding routine */
  }
  achro_forward(sequence, mark_missing) {
    var missing_marker = (
      (mark_missing)
      ? ["?", "!"]
      : ["", ""]
    );
    console.log(missing_marker)
    /* read in the information about the sequence */
    /* sequence must be encoded as a dictionary {"segments": "t o x t a", "stress": "1 1 1 0 0"} */
    var length = sequence["segments"].length;
    var i, j, k, tier, segment;
    var label, pos, idx;
    var source, target;
    var recs;

    var this_vector;
    var matched;
    var val;
    var output = [];

    for (i = 0; i < length; i += 1) {
      source = sequence["segments"][i];
      this_vector = [];
      for (j = 0; tier = this.tiers[j]; j ++) {
        [label, pos, idx] = tier.split("_");
        idx = parseInt(idx);
        if (pos == "right") {
          if (i + idx == length) {
            segment = "$";
          }
          else if (i + idx > length) {
            segment = "Ø";
          }
          else {
            segment = sequence[label][(i + idx)];
          }
        }
        else if (pos == "left") {
          if (i - idx == -1) {
            segment = "^";
          }
          else if (i - idx < -1) {
            segment = "Ø";
          }
          else {
            segment = sequence[label][(i - idx)];
          }
        }
        else if (pos == "self") {
          segment = sequence[label][i];
        }
        this_vector.push(segment);
      }
      /* now search through all tiers with this sound as source */
      recs = [];
      try {
        for (j = 0; j < this.all_laws[source].length; j += 1) {
          matched = true;
          for (k = 0; k < this.tiers.length; k += 1) {
            val = this.all_laws[source][j][this.tiers[k]];
            if (val.indexOf(this_vector[k]) == -1 && val.indexOf("Ø") == -1) {
              matched = false;
              break;
            }
          }
          if (matched) {
             recs.push([this.all_laws[source][j]["target"], this.all_laws[source][j]["id"]]);
          }
        }
        if (recs.length == 0) {
          recs = [[missing_marker[0] + source, 0]];
        }
      }
      catch {
        recs = [[missing_marker[1] + source, 0]]
      }
      output.push(recs);
    }
    return output;
  }
  achro_backward (sequence, funcs) {
    var i, j;
    var recs = [];
    for (i = 0; i < sequence.length; i ++) {
      if (typeof this.target2source[sequence[i]] != "undefined") {
        recs.push(this.target2source[sequence[i]]);
      }
      else {
        recs.push(["?"]);
      }
    }
    console.log(recs);
    var possibles = cartesianProduct(...recs);
    var selected = [];
    var this_sequence;
    var proposal, matched;
    for (i = 0; i < possibles.length; i ++) {
      this_sequence = {"segments": possibles[i]};
      for (j = 0; j < funcs.length; j ++) {
        this_sequence[funcs[j]] = TIERS[funcs[j]](possibles[i]);
      }
      /* reconstruct */
      proposal = this.achro_forward(this_sequence);
      matched = [];
      for (j = 0; j < proposal.length; j ++) {
        if (proposal[j].length == 1 && proposal[j][0][0] == sequence[j]) {
          matched.push(1)
        }
        else {
          matched.push(0);
          possibles[i][j] = "!"+possibles[i][j]
        }
      }
      if (matched.indexOf(0) == -1) {
        selected.push(possibles[i]);
      }
    }
    if (this.bwr_show == "imperfect"){
      return possibles;
    }
    return selected;
  }
}

var TIERS = {};
TIERS.tone = function(sequence){
  var i, j, s;
  var out = [];
  var elm, matched;
  var lastidx = 0;
  for (i=0; i<sequence.length; i++) {
    elm = sequence[i];
    matched = elm.match(/([¹²³⁴⁵⁰123456789]{1,})/);
    if (matched && matched[1] == elm){
      out.push(elm);
      for (j=lastidx; j<i+1; j++) {
        out[j] = elm;
      }
      lastidx = i+1;
    }
    else {
      out.push(0);
    }
  }
  return out;
};

TIERS.initial = function(sequence){
  var ini = sequence[0];
  var out = [];
  sequence.forEach(function(elm){
    out.push(ini);
  });
  //console.log("sequence", out);
  return out;
}

TIERS.nasal = function(sequence){
  var out = [];
  var i;
  var nasal = "0";
  for (i=0; i<sequence.length; i++) {
    if ("ñmŋȵɳɲɴ".indexOf(sequence[i]) != -1) {
      nasal = "1";
    }
  }
  sequence.forEach(function(elm){
    out.push(nasal);
  });
  return out;
};

TIERS.stress = function(sequence){
  var i, segment;
  var out = [];
  var stressed = false;
  var was_stressed = false;
  for (i=0; segment=sequence[i]; i++) {
    if (segment[0] == "ˈ") {
      stressed = true;
      was_stressed = true;
      out.push("2");
    }
    else if (segment[segment.length-1] == "ˈ") {
      stressed = false;
      out.push("2");
    }
    else if (was_stressed) {
      out.push("1");
    }
    else {
      out.push("0");
    }
  }
  return out;
};



function test(){
  var items = [
    "P = p pʰ b",
    "K = k kʰ g",
    "T = t tʰ d",
    "C1 = p t k",
    "TONES = 1 2 3 4",
    "C2 = pʰ tʰ kʰ",
    "C3 = b d g",
    "V = a e i o u",
    "VV = a: e: i: o: u:",
    "C = C1 C2 C3",
    "r.e = r.e",
    "r = r",
  ];
  
  var laws = [
    "C1 > C2 / @tone[2]_",
    "p > b / V _ V k",
    "i > i",
    "V > V",
    "VV > VV",
    "k > g / V @tone[2]_",
    "r > r.e / _ $",
    "a > a: / _ $",
    "t > d / ^ _",
  ];
  
  var cls = new SoundClasses(items, laws);

  
  var context = "C2 [a e i o u] [o e] _";
  [right, left] = parse_context(context);
  console.log(right+"|");
  console.log(left+"|");
  
  var out = parse_rightleft_context(right, cls);
  console.log(out);
  
  var out = parse_rightleft_context(left, cls);
  console.log(out);
  
  console.log(cls.laws["p"][0]);
  cls.assemble_laws();
  //console.log(cls.all_laws["k"]);
  //console.log(cls.all_laws["r"][0]);
  
  console.log(cls.tiers);
  //console.log(cls.laws["i"]);
  console.log(cls.achro_forward({"segments": ["t", "a"], "tone": ["2", "2"]}));
  console.log(cls.achro_forward({"segments": ["q", "a"], "tone": ["2", "2"]}));

  out2 = parse_rightleft_context("@initial[p t k] P", cls);
  console.log(out2);
  out2 = parse_rightleft_context("@[p t k]@initial[k p d] P", cls);
  console.log(out2);


}

//test()

// var test = [
//   "a > b / _ x", 
//   "a n > ə - / _ x",
//   "[a b] > [c d] / _ x"
// ];
// 
// 
// console.log(parse_law_string("[a b cd] [a b]"));
// console.log(parse_law_string("a  b [ c  d ]"));
// console.log(parse_law_string("a [ c  d ] c"));
// console.log(parse_law_string("a"));
// console.log(parse_law_string("[a  b  ] [ a b]"));
// 
// tests = [
//   "a > b / _ $",
//   "a b > c d",
//   "[a b] > [c d]",
//   "[a e] n > ə - / [a b c] _ x"
// ];
// 
// for (i = 0; i < tests.length; i += 1) {
//   test = tests[i];
//   console.log(test);
//   var laws = parse_laws(test);
//   for (j = 0; j < laws.length; j += 1) {
//     console.log(laws[j]);
//   }
// }
