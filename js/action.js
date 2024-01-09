var LAWS = {};
LAWS["layers"] = {};
LAWS["layer_lables"] = [];
LAWS["base"] = {};

var SETTINGS = {};
SETTINGS["bwr_show"] = "perfect";

function loaddata() {
  document.getElementById("settingstoggler").style.display = "table-cell";
  var i, sound;

  var sound_classes_in_text = document.getElementById("sound_classes").value.split("\n");
  var sound_laws_in_text = document.getElementById("sound_laws").value.split("\n");
  var sound_laws = [];
  var sound_law_idx;
  var sound_law_layers = [];
  var sound_classes = [];
  sound_classes_in_text.forEach(function (element) {
    if (element.indexOf("=") != -1 && element[0] != "#") {
      sound_classes.push(element);
    }
  });
  sound_laws_in_text.forEach(function (element) {
    if (element.trim()[0] == "=" && element.trim()[element.trim().length -1] == "=") {
      sound_laws.push([]);
      sound_law_layers.push(element.trim().slice(2, element.trim().length - 2).trim());
      if (typeof sound_law_idx == "undefined") {
        sound_law_idx = 0;
      }
      else {
        sound_law_idx += 1;
      }
    }
    if (element.indexOf(">") != -1 && element[0] != "#") {
      if (sound_law_layers.length == 0) {
        sound_law_layers.push(["Target"]);
        sound_laws.push([]);
        sound_law_idx = 0;
      }
      sound_laws[sound_law_idx].push(element);
    }
  });
  
  var cls;
  for (i = 0; i < sound_law_layers.length; i += 1) {
    cls = new SoundClasses(sound_classes, sound_laws[i]);
    cls.assemble_laws();
    LAWS["layers"][sound_law_layers[i]] = cls;
  }
  console.log(LAWS, sound_law_layers);
  LAWS["layer_labels"] = sound_law_layers;
  LAWS["raw_laws"] = sound_laws;
  LAWS["base"] = LAWS["layers"][LAWS["layer_labels"][0]];
    
  var scls = document.getElementById("sound_classes_out");
  var txt = '<table class="basictable"><th>Class</th><th>Sounds</th></tr>';
  for (this_cls in LAWS["base"].classes) {
    txt += '<tr><td>'+this_cls+"</td><td>";
    for (i = 0; i < LAWS["base"].classes[this_cls].length; i += 1) {
      sound = LAWS["base"].classes[this_cls][i];
      txt += '<span class="sound">'+sound+'</span>'; 
    }
    txt += "</td></tr>";
  }
  txt += "</table>";
  scls.innerHTML = txt;
  var slaws = document.getElementById("sound_laws_out");
  txt = '<table class="basictable"><tr><th>ID</th><th>Law</th><th>Source</th><th>Target</th><th>Layer</th></tr>';
  for (sound_law_idx = 0; sound_law_idx < sound_law_layers.length; sound_law_idx += 1){
    cls = LAWS["layers"][sound_law_layers[sound_law_idx]];
    for (i = 0; i < Object.keys(cls.raw_laws).length; i += 1) {
      for (j = 0; j < cls.laws2tiers[i + 1].length; j += 1) {
        txt += "<tr><td>" + (i + 1) + "</td><td>" + cls.raw_laws[(i + 1)] + "</td><td>" 
          + cls.laws2tiers[i+1][j]["source"] + "</td><td>" 
          + cls.laws2tiers[i+1][j]["target"] + "</td><td>" 
          + sound_law_layers[sound_law_idx] + "</tr>";
      }
    }
  }
  txt += "</table>";
  slaws.innerHTML = txt;
  console.log(LAWS);
}

function loadsampledata() {

  document.getElementById("sound_laws").value = "C1 > C1\nC3 > C2 / @tone[²¹⁴]_\nC3 > C1 / @tone[⁵⁵ ⁵¹ ³⁵]_\nC2 > C2\nV > V\nTONE > TONE\nRHYME > [V V V]";
  document.getElementById("sound_classes").value = "P = p pʰ b\nK = k kʰ g\nT = t tʰ d\nC1 = p t k\nC2 = pʰ tʰ kʰ\nC3 = b d g\nTONE = ⁵⁵ ³⁵ ²¹⁴ ⁵¹\nV = a e i o u\nYIN = ⁵⁵ ³⁵ ⁵¹\nYANG = ²¹⁴\nGAP = - - -\nRHYMEP = a.p e.p i.p o.p u.p\nRHYMET = a.t e.t i.t o.t u.t\nRHYMEK = a.k e.k i.k o.k u.k\nRHYME = RHYMEP RHYMET RHYMEK";
  loaddata();
  document.getElementById("tiers").value = "segments\n@tone";
  document.getElementById("sequences").value="p a ⁵⁵\n\nd u ²¹⁴\n\nd u ⁵⁵";
}

function backwards() {
  document.getElementById("reconstructions-bw").style.display = "flex";
  var strict_mode = (
    (document.getElementById("reconstruction-mode-bw").options[0].selected)
    ? true
    : false
  );
  var mark_missing = (
    (document.getElementById("reconstruction-handling-bw").options[0].selected)
    ? true
    : false
  );
  var tiers_in_text = document.getElementById("tiersbw").value.split("\n");
  var funcs = [];
  tiers_in_text.forEach(function(element) {
    if (element != "") {
      funcs.push(element);
    }
  });

  var sequences_in_text = document.getElementById("sequencesbw").value.split("\n");
  var sequences = [];
  sequences_in_text.forEach(function(elm) {
    if (elm[0] != "#") {
      sequences.push(elm.split(" "));
    }
  });

  var txt = '<table class="basictable"><tr><th>NO.</th><th>TARGET</th><th>SOURCE</th></tr>';
  var recs;
  var count = 1;
  sequences.forEach(function(elm) {
    recs = LAWS["base"].achro_backward(
      elm, funcs, mark_missing, strict_mode, 
      SETTINGS.bwr_show == "imperfect" ? false : true
    );
    if (recs.length == 0) {
      txt += '<tr><td>'+count+'</td><td>';
      txt += '<span class="sound">'+elm.join('</span><span class="sound">')+"</span>";
      txt += '</td><td><span style="color:red">?</span></td></tr>';
    }
    txt += "<tr>";
    for (i = 0; i < recs.length; i += 1) {
      txt += "<td>"+count+"</td><td>";
      txt += '<span class="sound">'+elm.join('</span><span class="sound">')+"</span>";
      txt += "</td><td>";
      txt += '<span class="sound">'+recs[i].join('</span><span class="sound">')+"</span>";
      txt += "</td></tr>";
    }
    count += 1;
  });
  txt += "</table>";

  document.getElementById("reconstructions_bw_out").innerHTML = txt;
  highlight_errors()
}

function highlight_errors(){
  var sounds = document.getElementsByClassName("sound");
  for (i=0; i<sounds.length; i++) {
    if (["?", "!"].indexOf(sounds[i].innerHTML[0]) != -1) {
      sounds[i].style.border = "2px solid red";
    }
    else if (sounds[i].innerHTML[0] == "-") {
      sounds[i].className = "gap";
    }
  }
}


function reconstruct() {
  document.getElementById("lawidxtoggler").style.display = "table-cell";
  document.getElementById("reconstructions").style.display = "flex";
  /* determine reconstruction mode */
  var strict_mode = (
    (document.getElementById("reconstruction-mode").options[0].selected)
    ? true
    : false
  );
  var mark_missing = (
    (document.getElementById("reconstruction-handling").options[0].selected)
    ? true
    : false
  );

  var tier_text = document.getElementById('tiers').value;
  if (tier_text.trim() == "") {
    tier_text = "segments";
  }
  var tiers_in_text = tier_text.split("\n");
  var sequences_in_text = document.getElementById("sequences").value.split("\n\n");
  var tiers = [];
  var funcs = [];
  var sequences = [];
  var desequences = {};
  var s, t;
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
    for (i = 0; i < elements.length; i += 1) {
      if (i == 0) {
        if (elements[i].indexOf(" > ") != -1){
          [s, t] = elements[i].split(" > ");
          desequences[s] = t;
          elements[i] = s;
        }
      }
      if (elements[i][0] != "#") {
        this_sequence.push(elements[i]);
      }
    }
    sequence = {};
    for (i = 0; i < this_sequence.length; i += 1) {
      sequence[tiers[i]] = this_sequence[i].split(" ");
    }
    for (i = 0; i < funcs.length; i += 1) {
      sequence[funcs[i]] = TIERS[funcs[i]](sequence["segments"]);
    }
    sequences.push(sequence);
  });
  var text = '<table class="basictable"><tr><th>Source</th><th>'
    + LAWS["layer_labels"].join("</th><th>") + "</th>";
  if (Object.keys(desequences).length != 0) {
    text += "<th>Expected</th>";
  }
  text += "</tr>";
  var recs;
  var rec_dict;
  var tgt, idx;
  sequences.forEach(function(sequence) {
    recs = LAWS["base"].achro_forward(sequence, mark_missing);
    td = "<tr><td>";
    for (i = 0; i < sequence["segments"].length; i += 1) {
      td += '<span class="sound">'+sequence["segments"][i];
      for (j = 1; j < tiers.length; j += 1) {
        td += '<sup class="tier" title="Tier '+tiers[j]+'">'+sequence[tiers[j]][i]+"</sup>";
      }
      td += "</span>";
      //td += '<span style="width:20px;background-color:lightgray;display:table-cell;">.</span>';
    }
    td += "</td><td>";
    for (i = 0; i < recs.length; i += 1) {
      rec_dict = {};
      for (j = 0; j < recs[i].length; j += 1) {
        if (recs[i][j][0] in rec_dict) {
          rec_dict[recs[i][j][0]].push(recs[i][j][1]);
        }
        else {
          rec_dict[recs[i][j][0]] = [recs[i][j][1]];
        }
      }
      rec_segs = [];
      /* different output depending on mode strict or ordered */
      if (strict_mode) {
        for (tgt in rec_dict) {
          rec_segs.push('<span class="sound">'+tgt+'<sup onclick="show_laws(this);" style="display:none" title="Sound Law Indices" class="lawidx">'+rec_dict[tgt].join(",")+"</sup></span>");
        }
        if (rec_segs.length > 1) {
          td += '<span class="unifiedsound">'+rec_segs.join('<span class="pipe"></span>')+'</span>';
        }
        else {
          td += rec_segs[0];
        }
      }
      else {
        for (tgt in rec_dict) {
          rec_segs.push('<span class="sound">' + tgt + '<sup onclick="show_laws(this);" style="display:none" title="Sound Law Indices" class="lawidx">' + rec_dict[tgt][0] + "</sup></span>");
        }
        td += rec_segs[0];
      }
    }
    td += "</td>";
    /* compare against attested sequences */
    if (Object.keys(desequences).length != 0) {
      t = desequences[sequence["segments"].join(" ")];
      if (typeof t == "undefined") {
        t = ["?"];
      }
      else {
        t = t.trim().split(" ");
        for ( i = 0; i < recs.length; i += 1) {
          if (recs[i][0][0] != t[i]) {
            t[i] = "?"+t[i];
          }
        }
      }
      td += '<td><span class="sound">'+t.join('</span><span class="sound">')+'</span></td>';
    }
    td += "</tr>";
    text += td;
  });
  text += "</table>";
  document.getElementById("reconstructions_out").innerHTML = text;
  highlight_errors()
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

function togglelawidxs(){
  var i, element;
  var docs = document.getElementsByClassName("lawidx");
  for (i=0; element=docs[i]; i++) {
    if (element.style.display == "none") {
      element.style.display = "inline";
    }
    else {
      element.style.display = "none";
    }
  }
  
  var lawidx = document.getElementById("lawidxtoggler");
  if (lawidx.innerHTML == "SHOW LAW IDS") {
    lawidx.innerHTML = "HIDE LAW IDS";
  }
  else {
    lawidx.innerHTML = "SHOW LAW IDS";
  }
}

function toggle_bwr(node){
  if (node.innerHTML == "SHOW IMPERFECT"){
    node.innerHTML = "SHOW PERFECT";
    SETTINGS.bwr_show = "imperfect";
  }
  else {
    node.innerHTML = "SHOW IMPERFECT";
    SETTINGS.bwr_show = "perfect";
  }

}


function filter_data(node, where, what) {
  var div = document.getElementById(where);
  /* determine the node value */
  var value = node.value.trim();
  var row, cell, i;
  var tab = div.childNodes[0].rows;
  for (i = 1; i < tab.length; i += 1) {
    row = tab[i];
    cell = row.cells[what];
    if (cell.innerText.replace(/\s+/g, " ").indexOf(value) == -1) {
      row.style.visibility = "collapse";
    }
    else {
      row.style.visibility = "visible";
    }
  }
}

function export_data(){
  var download = document.getElementById('download');
  var text = "";
  text +=  "# CLASSES\n\n"+document.getElementById("sound_classes").value;
  text += "\n# LAWS\n\n"+ document.getElementById("sound_laws").value;
  text += "\n# FORWARD\n\n## TIERS\n\n";
  text += document.getElementById("tiers").value;
  text += "\n\n## WORDS\n\n"
  text += document.getElementById("sequences").value;
  text += "\n# BACKWARD\n\n## TIERS\n\n";
  text += document.getElementById("tiersbw").value;
  text += "\n\n## WORDS\n\n"
  text += document.getElementById("sequencesbw").value;

  var dataset = document.getElementById("datasetid").value;
  if (dataset.length == 0) {
    dataset = "dummy";
  }
  download.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
  download.innerHTML = dataset+".txt";
  download.style.backgroundColor = "lightgray";
  download.style.color = "darkblue";
  download.setAttribute('download', dataset+".txt");
}


function read_file(event){
  var input = event.target;
  
  var reg = new RegExp("\n|\r\n");
  var reader = new FileReader();
  reader.fileName = input.files[0].name;
  reader.onload = function(){
    var i;
    var rows = reader.result.split(reg);
    var blocks = {};
    var active = "";
    var activeb = "";
    for (i=0; i<rows.length; i++) {
      if (rows[i].indexOf("# CLASSES") == 0){
        blocks["CLASSES"] = "";
        active = "CLASSES";
      }
      else if (rows[i].indexOf("# LAWS") == 0){
        blocks["LAWS"] = "";
        active = "LAWS";
      }
      else if (rows[i].indexOf("# FORWARD") == 0){
        active = "FORWARD";
        activeb = "";
        blocks[active] = {};
      }
      else if (rows[i].indexOf("# BACKWARD") == 0){
        active = "BACKWARD";
        activeb = "";
        blocks[active] = {};
      }
      else if (rows[i].indexOf("## WORDS") == 0){
        activeb = "WORDS";
        blocks[active][activeb] = "";
      }
      else if (rows[i].indexOf("## TIERS") == 0){
        activeb = "TIERS";
        blocks[active][activeb] = "";
      }
      else {
        if ((active == "LAWS" || active == "CLASSES")){
          blocks[active] += rows[i]+"\n";
        }
        else if ((active == "FORWARD" || active == "BACKWARD") && activeb != ""){
          blocks[active][activeb] += rows[i]+"\n";
        }
      }
    }
    console.log(blocks);
    if ("CLASSES" in blocks){
      document.getElementById("sound_classes").value = blocks["CLASSES"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    if ("LAWS" in blocks){
      document.getElementById("sound_laws").value = blocks["LAWS"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    if ("FORWARD" in blocks && "TIERS" in blocks["FORWARD"]) {
      document.getElementById("tiers").value = blocks["FORWARD"]["TIERS"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    if ("FORWARD" in blocks && "WORDS" in blocks["FORWARD"]) {
      document.getElementById("sequences").value = blocks["FORWARD"]["WORDS"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    if ("BACKWARD" in blocks && "TIERS" in blocks["BACKWARD"]) {
      document.getElementById("tiersbw").value = blocks["BACKWARD"]["TIERS"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    if ("BACKWARD" in blocks && "WORDS" in blocks["BACKWARD"]) {
      document.getElementById("sequencesbw").value = blocks["BACKWARD"]["WORDS"].replace(/^\n*/, "").replace(/\n*$/, "");
    }
    var f = document.getElementById("fileloaded");
    f.style.display = "inline";
    f.style.backgroundColor = "lightgray";
    f.innerHTML = reader.fileName;
  };
  reader.readAsText(input.files[0]);
}


function show_laws(node){
  var laws = node.innerText.split(",");
  var i;
  var law_string = "";
  var law;
  for (i = 0; i < laws.length; i += 1) {
    law = (
      (parseInt(laws[i]) == 0) 
      ? "[no sound law defined]" 
      : LAWS["base"].raw_laws[parseInt(laws[i])]
    );
    law_string += "<tr><td>" + laws[i] + "</td><td>" 
      + law 
      + "</td></tr>";
  }
  var falert = document.createElement("div");
  falert.id = "fake";
  falert.className = 'fake_alert';
  law_string = '<div class="message"><p><b>Sound Laws Matching the Segment</b></p><p><table class="soundlawtable"><tr><th>ID</th><th>Sound Law</th></tr>' + law_string + '</table></p>' 
    + '<button class="mybutton" onclick="document.getElementById('+ "'" + 'fake' + "'" + ').remove();">OK</button></div>';
  document.body.appendChild(falert);
  falert.innerHTML = law_string;
  document.onkeydown = function(event){document.getElementById("fake").remove();};
}



