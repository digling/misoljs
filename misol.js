/**
 * Major functions to handle sound change with multi-tiers.
 * **/

/* code from a gist on github https://gist.github.com/jkantr/0bd39a9d4feec00cee3835926649d838*/
const cartesianProduct = (...args) => args.reduce((a, b) => a.map(x => b.map(y => x.concat([y]))).reduce((acc, t) => acc.concat(t), []) , [[]])



/* parse a sound law */
function parse_law(lawstring){
  var law, context;
  if (lawstring.indexOf("#") != -1) {
    lawstring = lawstring.slice(0, lawstring.indexOf("#"));
  }
  if (lawstring.indexOf(" / ") != -1) {
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
function parse_rightleft_context(contextstring, classes){
  if (contextstring == "") {
    return [];
  }
  var bracket = false;
  var at = false;
  var space = false;
  var i, chr;
  var j, sound_in_class, current_sounds;
  var sounds = [];
  var tiers = [];

  var this_sound = '';
  var this_tier = '';
  var current_sound;
  /* add space to context string */
  if (contextstring[contextstring.length-1] != "]") {
    contextstring = contextstring + " ";
  }
  var bracket_closed = false;
  for (i=0; chr=contextstring[i]; i++) {
    if (chr == "[") {
      bracket = true;
      this_sound = "";
    }
    else if (chr == "@") {
      at = true;
      this_tier = '';
    }
    else if (chr == "]") {
      bracket = false;
      bracket_closed = true;
      current_sounds = this_sound.split(" ");
      this_sound = [];
      for (j=0; j<current_sounds.length; j++) {
        for (k=0; k<classes[current_sounds[j]].length; k++) {
          this_sound.push(classes[current_sounds[j]][k]);
        }
      }
      sounds.push(this_sound);
      tiers.push(this_tier);
      this_sound = "";
      this_tier = "";
    }
    else if (chr == " ") {
      if (bracket) {
        this_sound = this_sound+" ";
      }
      else {
        if (bracket_closed) {
          bracket_closed = false;
        }
        else {
          sounds.push(classes[this_sound]);
          tiers.push(this_tier);
          this_sound = "";
          this_tier = "";
        }
      }
    }
    else if (chr == ":" && at) {
      at = false;
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

function parse_context(contextstring) {
  if (contextstring == "") {
    return [[], [], ["", ""]];
  }
  var right, left;
  var matches = contextstring.match(/\s{0,1}@{1,1}([^\s]*):{1,1}([^\s]*)_\s{0,1}|\s{0,1}()_\s{0,1}/);
  if (matches === null) {
    console.log("NULL", contextstring);
  }
  if (typeof matches[1] != "undefined") {
    var tier = matches[1];
    var sound = matches[2];
  }
  else {
    var tier = "";
    var sound = "";
  }
  [left, right] = contextstring.split(/\s{0,1}@{1,1}[^\s]*:{1,1}[^\s]*_\s{0,1}|\s{0,1}_\s{0,1}/);
  return [left, right, [tier, sound]];
}


class SoundClasses {
  constructor (items, laws){
    /* parse the sound classes */
    this.raw = {};
    this.classes = {"^": ["^"], "$": ["$"], "-": ["-"], "?": ["?"]};
    this.sounds = {};
    this.bwr_show = "perfect";
    var i, j, k, cls, sounds_, sounds, sound;
    for (i=0; i<items.length; i++) {
      [cls, sounds_] = items[i].split(" = ");
      sounds_ = sounds_.split(" ");
      sounds = [];
      for (j=0; sound=sounds_[j]; j++) {
        if (sound in this.classes){
          for (k=0; k<this.classes[sound].length; k++) {
            sounds.push(this.classes[sound][k]);
          }
        }
        else {
          sounds.push(sound);
        }
      }
      this.classes[cls] = [];
      for (j=0; sound=sounds[j]; j++) {
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
    for (i=0; law=laws[i]; i++) {
      this.raw_laws[i+1] = law;
      [source, target, context] = parse_law(law);
      sources = [];
      targets = [];
      source = source.split(" ");
      target = target.split(" ");
      for (j=0; elm=source[j]; j++) {
        sources = sources.concat(this.classes[elm]);
      }
      for (j=0; elm=target[j]; j++) {
        targets = targets.concat(this.classes[elm]);
      }
      //[sources, targets] = [this.classes[source], this.classes[target]];
      if (sources.length != targets.length) {
        alert("source and target have different lengths in law"+i);
      }
      for (j=0; j<sources.length; j++) {
        [source, target] = [sources[j], targets[j]];
        [left, right, self_tier] = parse_context(context);
        if (left != "") {
          before = parse_rightleft_context(left, this.classes);
        }
        else {
          before = [[], []];
        }
        if (right != "") {
          after = parse_rightleft_context(right, this.classes);
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
      for (i=0; i<this.laws[sound].length; i++) {
        /* add the tier information */
        for (j=0; j<this.laws[sound][i][2].length; j++) {
          tier = this.laws[sound][i][2][j];
          if (tier == "") {
            tier = "segments_left_"+(j+1);
          }
          else {
            tier = tier+"_left_"+(j+1);
          }
          if (this.tiers.indexOf(tier) == -1) {
            this.tiers.push(tier);
          }
        }
        for (j=0; j<this.laws[sound][i][5].length; j++) {
          tier = this.laws[sound][i][5][j];
          if (tier == "") {
            tier = "segments_right_"+(j+1);
          }
          else {
            tier = tier+"_right_"+(j+1);
          }
          if (this.tiers.indexOf(tier) == -1) {
            this.tiers.push(tier);
          }
        }
        if (this.laws[sound][i][3][0] != "") {
          if (this.tiers.indexOf(this.laws[sound][i][3][0]+"_self_0") == -1) {
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
    
    for (i=maxA; i>0; i--) {
      idxs.push(-maxA);
    }
    idxs.push(0);
    for (i=1; i<maxB+1; i++) {
      idxs.push(i);
    }
    /* we fill our dictionary for the tier values in the following */
    this.laws2tiers = {};
    for (sound in this.laws) {
      this.all_laws[sound] = [];
      claw = this.laws[sound];
      for (i=0; i<claw.length; i++) {
        [target, left, tier_left, tier_self, right, tier_right, idx] = claw[i];
        tier = {"source": sound, "target": target, "id": idx};
        /* assign the tier information from our index here, this means, we need to trace the name spaces we used here */
        for (j=left.length-1; j>=0; j--) {
          if (tier_left[j] == "") {
            tier["segments_left_"+(j+1)] = left[j];
          }
          else {
            tier[tier_left[j]+"_left_"+(j+1)] = left[j];
          }
        }
        for (j=0; j<right.length; j++) {
          if (tier_right[j] == "") {
            tier["segments_right_"+(j+1)] = right[j];
          }
          else {
            tier[tier_right[j]+"_right_"+(j+1)] = right[j];
          }
        }
        if (tier_self[0] != "") {
          tier[tier_self[0]+"_self_0"] = this.classes[tier_self[1]];
        }

        for (j=0; j<this.tiers.length; j++) {
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
  achro_forward(sequence) {
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

    for (i=0; i<length; i++) {
      source = sequence["segments"][i];
      this_vector = [];
      for (j=0; tier=this.tiers[j]; j++) {
        console.log(sequence);
        [label, pos, idx] = tier.split("_");
        console.log(label, pos, idx);
        idx = parseInt(idx);
        if (pos == "right") {
          if (i+idx > length-1) {
            segment = "$";
          }
          else {
            segment = sequence[label][(i+idx)];
          }
        }
        else if (pos == "left") {
          if (i-idx < 0) {
            segment = "^";
          }
          else {
            consolelog(sequene, label);
            segment = sequence[label][(i-idx)];
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
        for (j=0; j<this.all_laws[source].length; j++) {
          matched = true;
          for (k=0; k<this.tiers.length; k++) {
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
          recs = [["?"+source, 0]];
        }
      }
      catch {
        recs = [['!'+source, 0]]
      }
      output.push(recs);
    }
    return output;
  }
  achro_backward (sequence, funcs) {
    var i, j;
    var recs = [];
    for (i=0; i<sequence.length; i++) {
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
    for (i=0; i<possibles.length; i++) {
      this_sequence = {"segments": possibles[i]};
      for (j=0; j<funcs.length; j++) {
        this_sequence[funcs[j]] = TIERS[funcs[j]](possibles[i]);
      }
      /* reconstruct */
      proposal = this.achro_forward(this_sequence);
      matched = [];
      for (j=0; j<proposal.length; j++) {
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
  console.log("sequence", out);
  return out;
}



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
    "C1 > C2 / @tone:2_",
    "p > b / V _ V k",
    "i > i",
    "V > V",
    "VV > VV",
    "k > g / V @tone:2_",
    "r > r.e / _ $",
    "a > a: / _ $",
    "t > d / ^ _",
  ];
  
  var cls = new SoundClasses(items, laws);
  
  var context = "C2 [a e i o u] [o e] _";
  [right, left] = parse_context(context);
  console.log(right+"|");
  console.log(left+"|");
  
  var out = parse_rightleft_context(right, cls.classes);
  console.log(out);
  
  var out = parse_rightleft_context(left, cls.classes);
  console.log(out);
  
  console.log(cls.laws["p"][0]);
  cls.assemble_laws();
  console.log(cls.all_laws["k"]);
  console.log(cls.all_laws["r"][0]);
  
  console.log(cls.tiers);
  console.log(cls.laws["i"]);
  console.log(cls.achro_forward({"segments": ["t", "a"], "tone": ["2", "2"]}));
  console.log(cls.achro_forward({"segments": ["q", "a"], "tone": ["2", "2"]}));

}

//test()
