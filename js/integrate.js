var update = '30.12.2023';
var footertext = '<div class="footerchild"> <a href="https://cordis.europa.eu/project/rcn/206320_en.html"><img src="https://digling.org/calc/img/eu-logo.png" alt="erc-logo" style="width:280px;"/></a></div> <div class="footerchild"> <p> Last updated on {last_update}.  </p> <p> <a rel="license" href="https://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png"></a><br><span xmlns:dct="https://purl.org/dc/terms/" href="https://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">This website</span> by <span xmlns:cc="https://creativecommons.org/ns#" property="cc:attributionName">Johann-Mattis List</span> is licensed under a <a rel="license" href="https://creativecommons.org/licenses/by/4.0/" style="color:white">Creative Commons Attribution 4.0 International License</a>.  </p><p><a style="color:white;" href="https://uni-passau.de/impressum/">IMPRINT</a></p> </div> <div class="footerchild"> <a href="https://www.shh.mpg.de/375796/calc"> <img src="http://digling.org/calc/img/max-planck-logo.svg" alt="mpi-logo" style="width:100px;"/></a><a href="https://www.uni-passau.de"><img src="https://www.uni-passau.de/typo3conf/ext/upatheme/Resources/Public/img/logo.svg" alt="passau-logo" style="width:200px;"/></a></div>';

footertext = footertext.replace("{last_update}", update);

var footerNodes = document.getElementsByClassName("footer");
var i, node;
for (i = 0; i < footerNodes.length; i += 1) {
  footerNodes[i].innerHTML = footertext;
}
