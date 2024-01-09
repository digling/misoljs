
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


var test = [
  "a > b / _ x", 
  "a n > ə - / _ x",
  "[a b] > [c d] / _ x"
];


console.log(parse_law_string("[a b cd] [a b]"));
console.log(parse_law_string("a  b [ c  d ]"));
console.log(parse_law_string("a [ c  d ] c"));
console.log(parse_law_string("a"));
console.log(parse_law_string("vowels"))
console.log(parse_law_string("[abc b  ] [ a b]"));

tests = [
  "a > b / _ $",
  "a b > c d",
  "[alle b] > [c d]",
  "[a e] n > ə - / [alle b c] _ x",
  "vowels > vowels",
  "a m a > e m e / _ $"
];

for (i = 0; i < tests.length; i += 1) {
  test = tests[i];
  console.log(test);
  var laws = parse_laws(test);
  for (j = 0; j < laws.length; j += 1) {
    console.log(laws[j]);
  }
}
