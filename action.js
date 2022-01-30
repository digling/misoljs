var CLS = {};

function loaddata() {
  document.getElementById("settingstoggler").style.display = "table-cell";
  var i, sound;

  var sound_classes_in_text = document.getElementById("sound_classes").value.split("\n");
  var sound_laws_in_text = document.getElementById("sound_laws").value.split("\n");
  var sound_laws = [];
  var sound_classes = [];
  sound_classes_in_text.forEach(function (element) {
    if (element.indexOf("=") != -1 && element[0] != "#") {
      sound_classes.push(element);
    }
  });
  sound_laws_in_text.forEach(function (element) {
    if (element.indexOf(">") != -1 && element[0] != "#") {
      sound_laws.push(element);
    }
  });


  var cls = new SoundClasses(sound_classes, sound_laws);
  cls.assemble_laws();
  
  var scls = document.getElementById("sound_classes_out");
  var txt = '<table class="basictable"><th>Class</th><th>Sounds</th></tr>';
  for (this_cls in cls.classes) {
    txt += '<tr><td>'+this_cls+"</td><td>";
    for (i=0; i<cls.classes[this_cls].length; i++) {
      sound = cls.classes[this_cls][i];
      txt += '<span class="sound">'+sound+'</span>'; 
    }
    txt += "</td></tr>";
  }
  txt += "</table>";
  scls.innerHTML = txt;
  var slaws = document.getElementById("sound_laws_out");
  txt = '<table class="basictable"><tr><th>ID</th><th>Law</th><th>Source</th><th>Target</th></tr>';
  for (i=0; i<Object.keys(cls.raw_laws).length; i++) {
    for (j=0; j<cls.laws2tiers[i+1].length; j++) {
      txt += "<tr><td>"+(i+1)+"</td><td>"+cls.raw_laws[(i+1)]+"</td><td>"+cls.laws2tiers[i+1][j]["source"]+"</td><td>"+cls.laws2tiers[i+1][j]["target"]+"</td></tr>";
    }
  }
  txt += "</table>";
  slaws.innerHTML = txt;
  console.log(cls);
  CLS = cls;
}

function loadsampledata() {

  document.getElementById("sound_laws").value = "C1 > C1\nC3 > C2 / @tone:²¹⁴_\nC3 > C1 / @tone:⁵⁵_\nC3 > C1 / @tone:⁵¹_\nC3 > C1 / @tone:³⁵_\nC2 > C2\nV > V\nTONE > TONE";
  document.getElementById("sound_classes").value = "P = p pʰ b\nK = k kʰ g\nT = t tʰ d\nC1 = p t k\nC2 = pʰ tʰ kʰ\nC3 = b d g\nTONE = ⁵⁵ ³⁵ ²¹⁴ ⁵¹\nV = a e i o u\nYIN = ⁵⁵ ³⁵ ⁵¹\nYANG = ²¹⁴";
  loaddata();
  document.getElementById("tiers").value = "segments\n@tone";
  document.getElementById("sequences").value="p a ⁵⁵\n\nd u ²¹⁴\n\nd u ⁵⁵";
}

function reconstruct() {
  var tiers_in_text = document.getElementById("tiers").value.split("\n");
  var sequences_in_text = document.getElementById("sequences").value.split("\n\n");
  var tiers = [];
  var funcs = [];
  var sequences = [];
  var sequence, i, j, this_sequence;
  var elements;
  var td;
  var rec_segs;
  tiers_in_text.forEach(function(element) {
    if (element != "" && element[0] != "@") {
      tiers.push(element);
    }
    else if (element != "" && element[0] == "@"){
      funcs.push(element.slice(1, element.length));
    }
  });
  sequences_in_text.forEach(function(element) {
    elements = element.split("\n");
    this_sequence = [];
    for (i=0; i<elements.length; i++) {
      if (elements[i][0] != "#") {
        this_sequence.push(elements[i]);
      }
    }
    sequence = {};
    for (i=0; i<this_sequence.length; i++) {
      sequence[tiers[i]] = this_sequence[i].split(" ");
    }
    for (i=0; i<funcs.length; i++) {
      sequence[funcs[i]] = TIERS[funcs[i]](sequence["segments"]);
    }
    sequences.push(sequence);
  });
  var text = '<table class="basictable"><tr><th>Source</th><th>Target</th></tr>';
  var recs;
  var rec_dict;
  var tgt, idx;
  sequences.forEach(function(sequence) {
    recs = CLS.achro_forward(sequence);
    td = "<tr><td>";
    for (i=0; i<sequence["segments"].length; i++) {
      td += '<span class="sound">'+sequence["segments"][i];
      for (j=1; j<tiers.length; j++) {
        td += '<sup class="tier" title="Tier '+tiers[j]+'">'+sequence[tiers[j]][i]+"</sup>";
      }
      td += "</span>";
      //td += '<span style="width:20px;background-color:lightgray;display:table-cell;">.</span>';
    }
    td += "</td><td>";
    for (i=0; i<recs.length; i++) {
      rec_dict = {};
      for (j=0; j<recs[i].length; j++) {
        if (recs[i][j][0] in rec_dict) {
          rec_dict[recs[i][j][0]].push(recs[i][j][1]);
        }
        else {
          rec_dict[recs[i][j][0]] = [recs[i][j][1]];
        }
      }
      rec_segs = [];
      for (tgt in rec_dict) {
        rec_segs.push('<span class="sound">'+tgt+'<sup title="Sound Law Indices" class="lawidx">'+rec_dict[tgt].join(",")+"</sup></span>");
      }
      if (rec_segs.length > 1) {
        td += '<span class="unifiedsound">'+rec_segs.join('<span class="pipe"></span>')+'</span>';
      }
      else {
        td += rec_segs[0];
      }
    }
    td += "</td></tr>";
    text += td;
  });
  text += "</table>";
  document.getElementById("reconstructions_out").innerHTML = text;
}

function togglesettings(){
  var settings = document.getElementById("settings");
  if (settings.style.display == "none") {
    settings.style.display = "flex";
    document.getElementById("settingstoggler").innerHTML = "HIDE CLASSES AND LAWS";
  }
  else {
    settings.style.display = "none";
    document.getElementById("settingstoggler").innerHTML = "SHOW CLASSES AND LAWS";

  }
}
