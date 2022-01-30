var CLS = {};

function loaddata() {
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

  document.getElementById("sound_laws").value = "C1 > C1\nC3 > C2 / @tone:²¹⁴_\nC3 > C1 / @tone:⁵⁵_\nC3 > C1 / @tone:⁵¹_\nC3 > C1 / @tone:³⁵_\nC2 > C2\nV > V\n";
  document.getElementById("sound_classes").value = "P = p pʰ b\nK = k kʰ g\nT = t tʰ d\nC1 = p t k\nC2 = pʰ tʰ kʰ\nC3 = b d g\nTONE = ⁵⁵ ³⁵ ²¹⁴ ⁵¹\nV = a e i o u";
  loaddata();
  document.getElementById("tiers").value = "segments\ntone";
  document.getElementById("sequences").value="p a\n⁵⁵ ⁵⁵\n\nd u\n²¹⁴ ²¹⁴\n";
}

function reconstruct() {
  var tiers_in_text = document.getElementById("tiers").value.split("\n");
  var sequences_in_text = document.getElementById("sequences").value.split("\n\n");
  var tiers = [];
  var sequences = [];
  var sequence, i, j, this_sequence;
  var elements;
  var td;
  var rec_segs;
  tiers_in_text.forEach(function(element) {
    if (element != "") {
      tiers.push(element);
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
    sequences.push(sequence);
  });
  var text = '<table class="basictable"><tr><th>Source</th><th>Target</th></tr>';
  var recs;
  sequences.forEach(function(sequence) {
    recs = CLS.anachronical_reconstruction(sequence);
    td = "<tr><td>";
    for (i=0; i<sequence["segments"].length; i++) {
      for (j=0; j<tiers.length; j++) {
        td += '<span class="sound">'+sequence[tiers[j]][i]+"</span>";
      }
      td += '<span style="width:20px;background-color:lightgray;display:table-cell;">.</span>';
    }
    td += "</td><td>";
    for (i=0; i<recs.length; i++) {
      rec_segs = [];
      for (j=0; j<recs[i].length; j++) {
        rec_segs.push('<span class="sound">'+recs[i][j][0]+'<sup>'+recs[i][j][1]+"</sup></span>");
      }
      td += rec_segs.join('<span style="width:10px;background-color:lightgray;display:table-cell;">|</span>');
    }
    td += "</td></tr>";
    text += td;
  });
  text += "</table>";
  document.getElementById("reconstructions_out").innerHTML = text;
}
