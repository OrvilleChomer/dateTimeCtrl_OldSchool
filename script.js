
/***********************************************************************************************
  Little page to do some really basic testing of:   dateTimeCtrl_plain.js
  
  See the comments at the top of the:   dateTimeCtrl_plain.js     
  file for a lot more information...
       
  
 ***********************************************************************************************/

function pageSetup() {
  // hmmm... in this example, not much to do
} // end of function pageSetup()





function genCtrl() {
  const sampleCtrlNd = document.getElementById("sampleCtrl");
  const dtCtrl = new DateTimeCtrl();
  const s= [];
  
  s.push("<span class='lblApptDate'>");
  s.push("Appointment Date:");
  s.push("</span>");
  s.push("<div class='inpApptDate'>");
  s.push(dtCtrl.newCtrlMarkup({field:"apptDate",pickDateCaption:"Pick Appointment Date",editTime:true}));
  s.push("</div>");
  s.push("<span class='lblPrefillDate'>");
  s.push("Pre-filled Out Date:");
  s.push("</span>");
  s.push("<div class='inpPrefillDate'>");
  s.push(dtCtrl.newCtrlMarkup({field:"prefillDate",pickDateCaption:"Pick Prefill Date",editTime:true,dateValue:"Thu Jul 18 2019 07:45:10 GMT-0500 (CDT)"}));
  s.push("</div>");
  sampleCtrlNd.innerHTML = s.join("");
  
  dtCtrl.activateControls();
} // end of function genCtrl()

function test() {
  const tmpNd = document.getElementById("tmp");
  const frmItmapptDateNd = document.getElementById("frmItmapptDate");
  tmpNd.value = frmItmapptDateNd.value;
}
