/**
 * Major functions to handle sound change with multi-tiers.
 * **/

/* code from a gist on github https://gist.github.com/jkantr/0bd39a9d4feec00cee3835926649d838*/
const cartesianProduct = (...args) => args.reduce((a, b) => a.map(x => b.map(y => x.concat([y]))).reduce((acc, t) => acc.concat(t), []) , [[]])



/* parse a sound law */
function parse_law(lawstring){
  var law, context;
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
    return [[], []];
  }
  var right, left;
  var sound;
  /* TODO add the sound here */
  //[right, left] = contextstring.split(/\s*@*[^\s]*_\s*/);
  [right, left] = contextstring.split(/\s*_\s*/);
  return [right, left];

}


class SoundClasses {
  constructor (items, laws){
    /* parse the sound classes */
    this.classes = {};
    this.sounds = {};
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
    var right, left;
    var before, after, k, m, n, idxs;
    this.laws = {};
    var snd;
    var ctxts;
    for (i=0; law=laws[i]; i++) {
      [source, target, context] = parse_law(law);
      console.log(source, target, context);
      [sources, targets] = [this.classes[source], this.classes[target]];
      if (sources.length != targets.length) {
        //alert("source and target have different lengths in law"+i);
        console.log('wrong lengths');
      }
      for (j=0; j<sources.length; j++) {
        [source, target] = [sources[j], targets[j]];
        [right, left] = parse_context(context);
        before = parse_rightleft_context(right, this.classes);
        after = parse_rightleft_context(left, this.classes);
        idxs = [];
        for (k=0; k<before.length; k++) {
          idxs.push(-(k+1));
        }
        idxs.push(0);
        for (k=0; k<after.length; k++) {
          idxs.push(k+1);
        }
        if (source in this.laws) {
          this.laws[source].push([target, before[0], before[1], after[0], after[1]]);
        }
        else {
          this.laws[source] = [[target, before[0], before[1], after[0], after[1]]];
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
        for (j=0; j<this.laws[sound][i][4].length; j++) {
          tier = this.laws[sound][i][4][j];
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

        if (this.laws[sound][i][1].length > maxA) {
          maxA = this.laws[sound][i][1].length;
        }
        if (this.laws[sound][i][3].length > maxB) {
          maxB = this.laws[sound][i][3].length;
        }
      }
    }
    var idxs = [];
    var tier_right, tier_left;
    
    for (i=maxA; i>0; i--) {
      idxs.push(-maxA);
    }
    idxs.push(0);
    for (i=1; i<maxB+1; i++) {
      idxs.push(i);
    }
    /* here, we need to assemble our tiers according to their order, which we have determined from the data in the step before TODO */
    for (sound in this.laws) {
      this.all_laws[sound] = [];
      claw = this.laws[sound];
      for (i=0; i<claw.length; i++) {
        [target, right, tier_right, left, tier_left] = claw[i];
        tier = {};
        /* assign the tier information from our index here, this means, we need to trace the name spaces we used here */
        //for (j=maxA; j>left.length; j++) {
        //  tier.push(["Ø"]);
        //}
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
            tier["segments_left_"+(j+1)] = right[j];
          }
          else {
            tier[tier_right[j]+"_left_"+(j+1)] = right[j];
          }
        }
        for (j=0; j<this.tiers.length; j++) {
          if (!(this.tiers[j] in tier)) {
            tier[this.tiers[j]] = ["Ø"];
          }
        }
        this.all_laws[sound].push(tier);
      }
    }
  }
}



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
  "C = C1 C2 C3"
];

var laws = [
  "p > b / V _ V k",
  "k > g / V _ @tone:2"
];

var cls = new SoundClasses(items, laws);
//console.log(cls)

var context = "C2 [a e i o u] [o e] _";
[right, left] = parse_context(context);
console.log(right+"|");
console.log(left+"|");

var out = parse_rightleft_context(right, cls.classes);
console.log(out);

var out = parse_rightleft_context(left, cls.classes);
console.log(out);

console.log(cls.laws["p"][0]);
cls.assemble_laws()
console.log(cls.all_laws["k"])
console.log(cls.tiers);
//console.log(cartesianProduct(...out));

/* TODO: bug in "V _" context */
