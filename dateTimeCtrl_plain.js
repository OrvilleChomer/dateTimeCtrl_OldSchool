/*****************************************************************************************************************

  dateTimeCtrl_plain.js
  
  Refactored code to work in a legacy, non-module way...
  
  eventually, give option to pick another month/year when date value is 
  blank other than the Current month/year as a starting point on the calendar.
  
  Created:                  September 2019
  Developer:                Orville Paul Chomer
  Twitter:                  @orvilleChomer
  Glitch Profile:           https://glitch.com/@OrvilleChomer
  CodePen Profile:          https://codepen.io/orvilleChomer
  Web Site:                 http://chomer.com
  Github:                   https://github.com/OrvilleChomer
  Project Github Repo:      https://github.com/OrvilleChomer/dateTimeCtrl_OldSchool
  
  Add the following line somewhere inside the BODY tag of your web page that is going to
  use this library (this will use Github as a CDN):
  
     <script src='https://orvillechomer.github.io/dateTimeCtrl_OldSchool/dateTimeCtrl_plain.js'></script>
     
  For more information on how to use this date/time control in your code go to:
  
     https://github.com/OrvilleChomer/dateTimeCtrl_plain
     
     check out the:   README.md     file
     
     
  Page on my web site about this date control: 
  
     http://chomer.com/freeware/javascript-oldSchool-date-time-control-info/
  
  
  Try this test page out on Glitch:    https://keen-blender.glitch.me/

       Generating date control on this page is not automatic just to make my debugging of the control easier!
       
       
  Try out the control with this Pen on CodePen:
     ddddd
     
  Key functions:
  
     dtCtrl.newCtrlMarkup        - creates new date control and returns HTML markup for it
     calSelDate()                - called when user selects a date on the calendar
     dtCtrl.activateControls     - wires up all the event handling on any date controls added to the DOM
     dtCtrl.calPrev              - called when [<] button on calendar popup is picked
     dtCtrl.calendarPopupClicked - called when date control's [...] button is clicked to bring up calendar popup
     dtCtrl.calNext              - called when [>] button on calendar popup is picked
     dtCtrl.calSetDateTime       - called when [SET] button is clicked on popup
     dtCtrl.calToday             - called when [Today] button is clicked on popup
     buildCalendarPopup()        - Builds HTML markup for calendar popup and adds it to the DOM.
     formattedDate()             - Takes the input of a Date object and returns a formatted string of date
     
 ****************************************************************************************************************/

const gblDateCtrlInfoByFieldName = [];
const gblDateCtrlInfoByIndex = [];
const gblDateCtrlState = {};


 /****************************************************************************
  returns my lame attempt at a singleton in JavaScript! :P
  ****************************************************************************/
  function DateTimeCtrl() {
    console.log("DateTimeCtrl constructor called");
    const dtCtrl = this;
    const Q = '"';
    const dateTimeCtrlVersion = "1.0";
    
    dtCtrl.ctrlVersion = dateTimeCtrlVersion;
    
    const cssSelectors = {};
    defineCssSelectors();
    
    if (typeof gblDateCtrlState.configured === "undefined") {
      genCtrlStylesIfNeeded();
      gblDateCtrlState.configured = true;
    } // end if
    
   /****************************************************************************
   
   .dateValue - selected date/time value (string) if none selected yet, it is blank!
   
    ****************************************************************************/
    dtCtrl.newCtrlMarkup = function(params) {
      const ctrl = {};
      ctrl.field = params.field;
      setPropValue(ctrl,params,{type:'string',propName:'dateValue'})
      setPropValue(ctrl,params,{type:'string',propName:'pickDateCaption',defValue:'Pick Date'});
      setPropValue(ctrl,params,{type:'boolean',propName:'editTime'});
      let sDef = "Form Date";
      
      if (ctrl.editTime === true) {
        sDef = "Form Date and Time";
      } // end if
      
      setPropValue(ctrl,params,{type:'string',propName:'formCaption',defValue:sDef});
      
      gblDateCtrlInfoByFieldName[ctrl.field] =  ctrl;
      gblDateCtrlInfoByIndex.push(ctrl);
      
      let s = [];
      
      s.push("<div>"); // control container wrapper - open
        s.push("<div class='datetimeCtrlCtr' >"); // control container - open
      
        // data that is Saved goes in this INPUT tag
        s.push("<input ");
        s.push("type='hidden' ");
        s.push("id='frmItm"+ctrl.field+"' ");            
        s.push(">");
      
        // data that is Displayed nicely formatted goes in this INPUT tag
        s.push("<input ");
        s.push("class='dateTime' readonly ");
        s.push("id='frmItm"+ctrl.field+"_vw' ");
        s.push("style="+Q);

        s.push(Q);
        s.push(">");
      
        // elipsis button...
        s.push("<button ");
        s.push("data-field="+Q+ctrl.field+Q+" ");
        s.push("class='dateTimeButton' ");
        s.push("id='frmItm"+ctrl.field+"_btn' ");
        
        s.push(">...</button>");
      
        s.push("</div>"); // control container  - close
      s.push("</div>"); // control container wrapper - close
      
      return s.join("");
    } // newCtrlMarkup() method

    
    
   /****************************************************************************
      in the JavaScript code using this date control...
      call this AFTER adding all date controls to the form!
  
      once this is done, any date controls added will work as they should.
    ****************************************************************************/    
    dtCtrl.activateControls = function() {
      const nMax = gblDateCtrlInfoByIndex.length;
      for (let n=0;n<nMax;n++) {
        const ctrl = gblDateCtrlInfoByIndex[n];
        const hiddenNd = document.getElementById("frmItm"+ctrl.field);
        const dateTimeNd = document.getElementById("frmItm"+ctrl.field+"_vw");
        const dateTimeButtonNd = document.getElementById("frmItm"+ctrl.field+"_btn");
        
        dateTimeButtonNd.addEventListener('click', dtCtrl.calendarPopupClicked); // capture elipsis button being clicked
        
        // ok, we are doing a little bit More than attaching events... :)
        ctrl.hiddenInput = hiddenNd;
        ctrl.dateTimeInput = dateTimeNd;
        ctrl.dateTimeButton = dateTimeButtonNd;
        
        if (ctrl.dateValue !== "") {
          hiddenNd.value = ctrl.dateValue;
          dateTimeNd.value = formattedDateTime(ctrl);
          ctrl.hasValue = true;
        } // end if
        
      } // next n
      
    } // activateControls method
    
    
   /****************************************************************************
      Is run when the user clicks the [<] button on the calendar popup
      called by Public function with same name
    ****************************************************************************/    
    dtCtrl.calPrev = function(event) {
      const btn = event.target;
      const sField = btn.dataset.field;
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      let nMonth = ctrl.pickDate.getMonth();
      let nYear = ctrl.pickDate.getFullYear();
      
      nMonth = nMonth - 1;
      
      if (nMonth<0) {
        nMonth = 11;
        nYear = nYear - 1;
        ctrl.pickDate.setFullYear(nYear);
      } // end if
      
      ctrl.pickDate.setMonth(nMonth);
      
      savePendingSelTime(ctrl);
      
      buildCalendarPopup(ctrl);
    } // end of calPrev()
    
   /****************************************************************************
      is run when the user clicks the [...] button on the date control
      in order to bring up the calendar popup!
      called by Public function with same name
    ****************************************************************************/    
    dtCtrl.calendarPopupClicked = function(event) {
      const elipsesBtn = event.target;
      const sField = elipsesBtn.dataset.field;
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      let pickDate = new Date();
      
      pickDate.setHours(14); // 3 PM  (base 0)
      pickDate.setMinutes(0);
      
      if (ctrl.dateValue !== "") {
        pickDate = new Date(ctrl.dateValue);
        ctrl.selDateTime = new Date(ctrl.dateValue);
        ctrl.selMonth = ctrl.selDateTime.getMonth();
        ctrl.selDate = ctrl.selDateTime.getDate();
        ctrl.selYear = ctrl.selDateTime.getFullYear();
        ctrl.hasValue = true;
      } else {
        ctrl.hasValue = false;
      } // end if
      
      ctrl.pendingSelDatePicked = false;
      ctrl.pendingSelDate = "";
      ctrl.pickDate = pickDate;
      
      buildCalendarPopup(ctrl);
    } // end of calendarPopupClicked()
    
    
    
   /****************************************************************************
      Is run when the user clicks the [>] button on the calendar popup
      called by Public function with same name
    ****************************************************************************/    
    dtCtrl.calNext = function(event) {
      const btn = event.target;
      const sField = btn.dataset.field;
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      let nMonth = ctrl.pickDate.getMonth();
      let nYear = ctrl.pickDate.getFullYear();
      
      nMonth = nMonth + 1;
      
      if (nMonth>11) {
        nMonth = 0;
        nYear = nYear + 1;
        ctrl.pickDate.setFullYear(nYear);
      } // end if
      
      ctrl.pickDate.setMonth(nMonth);
      
      savePendingSelTime(ctrl);
      
      buildCalendarPopup(ctrl);
    } // end of calNext()
    
    
    
    
   /****************************************************************************
      Is run when the user clicks the [SET] button on the calendar popup
      called by Public function with same name
    ****************************************************************************/    
    dtCtrl.calSetDateTime = function(event) {
      const btn = event.target;
      const sField = btn.dataset.field;
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      const sMsg = [];
      
      if (!ctrl.pendingSelDatePicked && ctrl.dateValue !== "") {
        const selDate = new Date(ctrl.dateValue);
        ctrl.pendingSelDate = selDate;
        ctrl.pendingSelDatePicked = true;
      } // end if
      
      if (ctrl.pendingSelDatePicked) {
        const selDate = new Date();
        const pendingSelDate = ctrl.pendingSelDate;
        selDate.setMonth(pendingSelDate.getMonth());
        selDate.setDate(pendingSelDate.getDate());
        selDate.setFullYear(pendingSelDate.getFullYear());
        
        if (ctrl.editTime === true) {
          const calHourEntryNd = document.getElementById("calHourEntry");
          const calMinuteEntryNd = document.getElementById("calMinuteEntry");
          const calAmPmSelectNd = document.getElementById("calAmPmSelect");
          
          let nHours = calHourEntryNd.value - 0;
          let nMinutes = calMinuteEntryNd.value - 0;
          const sAMPM = calAmPmSelectNd.value;
          
          if (nHours < 1 || nHours > 12) {
            sMsg.push("Invalid hour value. (Needs to be between 1 and 12)");
          } // end if
          
          if (nMinutes < 0 || nMinutes > 59) {
            sMsg.push("Invalid minute value. (Needs to be between 00 and 59)");
          } // end if
          
          if (sAMPM === "AM" && nHours===12) {
            nHours = 0; // 12 AM (midnight)
          } // end if
          
          if (sAMPM === "PM" & nHours < 12) {
            nHours = nHours + 12; // convert 12 hour time into 24 hour time that date variable uses
          } // end if
          
          
          selDate.setHours(nHours);
          selDate.setMinutes(nMinutes);
          selDate.setSeconds(0); // get rid of any seconds
        } // end if
        
        if (sMsg.length > 0) {
          sMsg.push("");
          sMsg.push("SET Canceled");
          alert(sMsg.join("\n"));
          return;
        } // end if
       
        ctrl.selDate = selDate;
        ctrl.dateValue = selDate + ""; // date value cast as a string
        ctrl.pendingSelDate = undefined;
        ctrl.pendingSelDatePicked = false;
        ctrl.hasValue = true;
        ctrl.hiddenInput.value = ctrl.dateValue; 
       
        ctrl.dateTimeInput.value = formattedDateTime(ctrl); // displayed read only
      } // end if
      
      
      hideCalendarCtl();
      
    } // end of calSetDateTime()
    
    
    
    
   /****************************************************************************
      Is run when the user clicks the [Today] button on the calendar popup
      called by Public function with same name
    ****************************************************************************/    
    dtCtrl.calToday = function(event) {
      const btn = event.target;
      const sField = btn.dataset.field;
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      const todaysDate = new Date();
      
      ctrl.pickDate.setMonth(todaysDate.getMonth());
      ctrl.pickDate.setDate(todaysDate.getDate());
      ctrl.pickDate.setFullYear(todaysDate.getFullYear());
      savePendingSelTime(ctrl);
      
      buildCalendarPopup(ctrl);
    } // end of calToday()
        
    
    
    
    /****************************************************************************
      can return a ctrl object based on a valid field name
    ****************************************************************************/   
    dtCtrl.getCtrl = function(sField) {
      const ctrl = gblDateCtrlInfoByFieldName[sField];
      return ctrl;
      
    } // end of getCtrl method
    
    
    
    
   /****************************************************************************
      Build and display the calendar popup based on values in ctrl object
      Private function
      
      pickDate is like the navigation date which may or may not match the 
      current date value
      
      // width is 414 on iPhone Plus
      // width is 320 on regular iPhone
      // width is 1579 on a Mac
    ****************************************************************************/      
    function buildCalendarPopup(ctrl) {
      let s=[];
      let nTop;
      let nLeft;
      let nPageWidth = window.innerWidth;
      let nPageHeight = window.innerHeight;
      let sCaption = "Select Date";
      let pickDate = ctrl.pickDate; // where we are pointing and poking around!  :P
      let todaysDate = new Date();
      let bFoundSelDate = false;
      let sCssExt = "";
      
      
      let nYear = pickDate.getFullYear();
      const nStartWeekDay = getStartWeekDayForMonth(pickDate);
      const nTotDaysInMonth = getTotalDaysInMonth(pickDate);
      const sMonthName = getFullMonthName(pickDate);
      
      // portrait
      let nPopupOffset = Math.floor(nPageWidth * .05);
      let nPopupWidth = nPageWidth - (nPopupOffset * 2);
      //let nPopupHeight = nPopupWidth + Math.floor(nPopupWidth * .1);
      let nPopupHeight = nPopupWidth;
      let nBlockSize = Math.floor(nPopupWidth / 7.5);
  
          // landscape
      if (nPageWidth > nPageHeight) {
        nPopupOffset = Math.floor(nPageHeight * .05);
        nPopupHeight = nPageHeight - (nPopupOffset * 2);
        nPopupWidth = nPopupHeight;
        nBlockSize = Math.floor(nPopupHeight / 7.5);
        //nPopupHeight = nPopupHeight + Math.floor(nPopupHeight * .1);
      } // end if
      
      if (nPageWidth <500) {
        sCssExt = "_s"; // css selector extension for "small" displays
      } // end if
      
      if (typeof ctrl.pickDateCaption === "string") {
        sCaption = ctrl.pickDateCaption;
      } // end if
      
      
      // show "custom" caption for the date/time field being edited:
      s.push("<div class='calCaption"+sCssExt+"' ");
      s.push("style="+Q);
      s.push("width:"+(nPopupWidth-20)+"px;")
      s.push(Q);
      s.push(">");
      s.push(sCaption);
    //  s.push("width: "+nPageWidth);
      s.push(":</div>"); // calCaption
      
      
      // close button
      s.push("<button "); 
      s.push("class='closeBtn' ");
      s.push("id='calPopupCloseBtn' ");
      s.push("onclick="+Q);
      s.push("hideCalendarCtl()"+Q+" ");
      s.push(">");
      s.push("✖</button>"); 
      
      s.push("<div class='calMonthYear' "); // 50 top
      if (nPageWidth < 400) {
        s.push("style="+Q+"top:40px;"+Q);
      } // end if
      s.push(">");
      s.push("<span class='calMonthName"+sCssExt+"'>"+sMonthName+"&nbsp;</span>");
      
      if (nPageWidth < 400) {
        s.push("<br>");
      } // end if
      
      s.push("<span class='calYear"+sCssExt+"'>"+pickDate.getFullYear()+"</span>");
      s.push("</div>"); // calMonthYear

      s.push("<button class='calPrevBtn"+sCssExt+"' id='calPopupPrevBtn' ");    
      s.push("data-field="+Q+ctrl.field+Q+" ");
      s.push("title='previous month' ");
      s.push(">");
      s.push("&lt;</button>");


      // Today button
      s.push("<button class='calTodayBtn"+sCssExt+"' id='calPopupTodayBtn' ");   
      s.push("data-field="+Q+ctrl.field+Q+" ");
      s.push("title='jump to today' ");    
      s.push(">");
      s.push("Today</button>");


      // next month button
      s.push("<button class='calNextBtn"+sCssExt+"' id='calPopupNextBtn' ");    
      s.push("data-field="+Q+ctrl.field+Q+" ");
      s.push("title='next month' ");
      s.push(">");
      s.push("&gt;</button>");

      // *** build day of week header for the calendar...
      nTop = 90;
      const sDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      nLeft = 20;
      for (let n=0;n<7;n++) {
        s.push("<div class='calWeekday' ");
        s.push("style="+Q);
        s.push("left:"+(nLeft)+"px;");
        s.push("top:"+(nTop)+"px;");
        s.push("width:"+(nBlockSize)+"px;");
        s.push("height:"+(nBlockSize)+"px;");

        if (n===0 || n===6) {
          s.push("color:gray;");
        } // end if

        s.push(Q);
        s.push(">");
        s.push(sDays[n]);
        s.push("&nbsp;</div>");
        nLeft = nLeft + nBlockSize - 1;
      } // next n
      
      
      // *** BUILD ACTUAL CALENDAR SQUARES:
      let weekDate = 0;
      nTop = nTop + 20;
      
      for (let n=0;n<6;n++) {
      
        nLeft = 20;
        for (let n2=0;n2<7;n2++) {
          let sClass = "calBlock1 calDateBlock"; //  calDateBlock is programatically used not visually

          if (n2===0 || n2===6) {
            sClass = "calBlock2 calDateBlock";
          } // end if

          if (weekDate===0) {
            if (nStartWeekDay===n2) {
              weekDate = weekDate + 1;
            } // end if
          } else {
            weekDate = weekDate + 1;
          } // end if/else
          
          if (weekDate===0 || weekDate > nTotDaysInMonth) {
            sClass = "calBlockEmpty";
          } else {
            // was the date previously selected and Set...
            if (ctrl.hasValue) {
              // and does the selected date match the current date block?
              if (ctrl.selMonth === pickDate.getMonth() &&
                  ctrl.selDate === weekDate &&
                  ctrl.selYear === pickDate.getFullYear()) {
                sClass = "calBlockSel calDateBlock";
                bFoundSelDate = true;
              } // end if
            } // end if (hasValue)
            
            if (!bFoundSelDate) {
              // was the date previously selected while the popup was still up...
              // (user navigated to different month or pressed the [Today] button)
              
              if (ctrl.pendingSelDatePicked) {
                if (ctrl.pendingSelMonth === pickDate.getMonth() &&
                    ctrl.pendingSelDateNum === weekDate &&
                    ctrl.pendingSelYear === pickDate.getFullYear()) {
                  sClass = "calBlockSel calDateBlock";
                  bFoundSelDate = true;
                } // end if
              } // end if (ctrl.pendingSelDatePicked)
              
            } // end if (!bFoundSelDate) 
            
          } // end if
          
          s.push("<div class='"+sClass+"' ");

          s.push("style="+Q);
          s.push("left:"+(nLeft)+"px;");
          s.push("top:"+(nTop)+"px;");
          s.push("width:"+(nBlockSize)+"px;");
          s.push("height:"+(nBlockSize)+"px;");        
          s.push(Q);
          
          if (weekDate>0 && weekDate <= nTotDaysInMonth) {
            s.push(" ");
            s.push("data-field="+Q+ctrl.field+Q+" ");
            s.push("data-weekday="+Q+n2+Q+" ");
            s.push("data-month="+Q+pickDate.getMonth()+Q+" ");
            s.push("data-date="+Q+(weekDate)+Q+" ");
            s.push("data-year="+Q+pickDate.getFullYear()+Q+" ");   
            
          } // end if
          
          
          s.push(">");

          

          if (weekDate>0 && weekDate <= nTotDaysInMonth) {
            // display any info for actual date...
            let bIsToday = false;
            let testDate = new Date();
            testDate.setFullYear(nYear);
            testDate.setMonth(pickDate.getMonth());
            testDate.setDate(weekDate);

            if (todaysDate.getDate() === testDate.getDate() &&
                todaysDate.getMonth() === testDate.getMonth() &&
                todaysDate.getFullYear() === testDate.getFullYear()) {
                bIsToday = true;
            } // end if

            s.push("<div ");

            if (bIsToday) {
              s.push("class='calToday' ");
              s.push("title='Today\'s Date ");
            } else {
              s.push("class='calOtherDays' ");
            } // end if

            let nDateRight = 6;
            let nDateTop = 3;
            
            if (nPageWidth < 400) {
              nDateRight = 2;
              nDateTop = 1;
            } // end if
            
            s.push("style="+Q);
            s.push("position:absolute;");
            s.push("right:"+(nDateRight)+"px;");
            s.push("top:"+(nDateTop)+"px;");

            if (!bIsToday) {
              if (n2===0 || n2===6) {
                s.push("color:gray;");
              } // end if
            } // end if

            s.push(Q);
            s.push(">");
            s.push(""+(weekDate)); // a number from 1 to 31 !!!
            s.push("</div>");
          } // end if

          s.push("</div>"); // end of calBlock
          nLeft = nLeft + nBlockSize - 1;
        } // next n2 (day)
        nTop = nTop + nBlockSize - 1;
      } // next n (week)
  
      /****************************************************************************
       Calendar Popup's Date/Time Box
        - Only displays if a date was picked previously or above in calendar
          otherwise it is invisible.
        - Displays the Date Picked (Read Only)
        - Allows the editing of the time... hours / minutes / AM/PM
        - And displays a [SET] button which will set the control to the date/time displayed 
          and hide the calendar popup
      ****************************************************************************/
      nTop = nTop + 10;    
      
      if (nTop + 100 > nPopupHeight) {
        nPopupHeight = nTop + 100;
      } // end if
      
      s.push("<div id='calDateTimeBox' ");
      s.push("style="+Q);
      s.push("top:"+(nTop)+"px;");
      s.push("width:"+(nBlockSize * 7 - 6)+"px;");
      s.push(Q);
      s.push(">");     
      
        s.push("<input id='calDateDsp' value='' readonly ");
        s.push(">");
        
        if (ctrl.editTime === true) {
          s.push("<span class='calAt' ");
          s.push(">@</span>");

          let nHours = pickDate.getHours();
          let sAMSelected = " selected";
          let sPMSelected = "";
          let sMinutes = pickDate.getMinutes()+"";

          if (sMinutes.length === 1) {
            sMinutes = "0"+sMinutes;
          } // end if

          if (nHours > 11) {            
            sAMSelected = "";
            sPMSelected = " selected";
            if (nHours > 12) {           
              nHours = nHours - 12;
            } // end if
          } // end if
          
          if (nHours === 0) {   
            nHours = 12;  // 12 AM
          } // end if
          
          s.push("<input id='calHourEntry' value='"+(nHours)+"' maxlength='2' ");
          s.push(">");

          s.push("<span class='calColonSep' ");
          s.push(">:</span>");

          s.push("<input id='calMinuteEntry' value='"+sMinutes+"' maxlength='2' ");
          s.push(">");

          s.push("<select id='calAmPmSelect' ");
          s.push(">");
            s.push("<option value='AM'"+sAMSelected+">AM</option>");
            s.push("<option value='PM'"+sPMSelected+">PM</option>");
          s.push("</select>");
        } // end if (ctrl.editTime === true)
      
        // SET button should be there... even if user is not editing the time value!
        s.push("<button id='calSetDateBtn' class='calSetDateBtn"+sCssExt+"' ");
        s.push("data-field="+Q+ctrl.field+Q+" ");
        s.push(">SET</button>");
      
      s.push("</div>"); // end of date/time display and time edit and SET button!
      // ####################################################################################
      
      
      
      
      s.push("</div>"); // end of calWrapper      
      
      let calPopupNd = document.getElementById("calPopup");
      
      if (calPopupNd == null) {
        calPopupNd = document.createElement("div");
        calPopupNd.id = "calPopup";
        calPopupNd.style.position = "absolute";
        calPopupNd.style.zIndex = "200"; // calendar popup appears Above the Tint layer
        document.body.appendChild(calPopupNd);   
      } // end if
      
      // position our popup on the display:
      calPopupNd.style.left = (nPopupOffset)+"px";
      calPopupNd.style.top = (nPopupOffset)+"px";
      calPopupNd.style.width = (nPopupWidth)+"px";
      calPopupNd.style.height = (nPopupHeight)+"px";
      
      calPopupNd.innerHTML = s.join(""); // Render our calendar...
      
      if (ctrl.hasValue) {
        let calDateDspNd = document.getElementById("calDateDsp");
        const dt = new Date(ctrl.dateValue);      
        const sDate = formattedDate(dt);
        calDateDspNd.value = sDate;
      } // end if (ctrl.hasValue)
      
      if (ctrl.pendingSelDatePicked) {
        // override prev selected date if something has been picked this popup session
        let calDateDspNd = document.getElementById("calDateDsp");
        const sDate = formattedDate(ctrl.pendingSelDate);
        calDateDspNd.value = sDate;
        
        const calHourEntryNd = document.getElementById("calHourEntry");
        const calMinuteEntryNd = document.getElementById("calMinuteEntry");
        const calAmPmSelectNd = document.getElementById("calAmPmSelect");
      
        calHourEntryNd.value = ctrl.pendingSelHour;
        calHourEntryNd.value = ctrl.pendingSelMinute;
        calHourEntryNd.value = ctrl.pendingSelAmPm;
      } // end if
      
      calPopupNd.style.display = "block";
      
      const calDateTimeBoxNd = document.getElementById("calDateTimeBox");
      calDateTimeBoxNd.style.display = "none";
      
      if (ctrl.dateValue !== "" || ctrl.pendingSelDate) {
        calDateTimeBoxNd.style.display = "block";
      } else {
        if (ctrl.editTime === false) {
          calDateTimeBoxNd.style.display = "block";
        } // end if
        
      } // end if/else
      
      
      // attach event handlers to controls on the calendar popup:
      // --------------------------------------------------------      
      const calPopupCloseBtnNd = document.getElementById("calPopupCloseBtn");
      const calPopupPrevBtnNd = document.getElementById("calPopupPrevBtn");
      const calPopupTodayBtnNd = document.getElementById("calPopupTodayBtn");
      const calPopupNextBtnNd = document.getElementById("calPopupNextBtn");
      const calSetDateBtnNd = document.getElementById("calSetDateBtn");
      const calHourEntryNd = document.getElementById("calHourEntry");
      const calMinuteEntryNd = document.getElementById("calMinuteEntry");
      
      calPopupCloseBtnNd.addEventListener('click', hideCalendarCtl);
      calPopupPrevBtnNd.addEventListener('click', dtCtrl.calPrev);
      calPopupTodayBtnNd.addEventListener('click', dtCtrl.calToday);
      calPopupNextBtnNd.addEventListener('click', dtCtrl.calNext);
      calSetDateBtnNd.addEventListener('click', dtCtrl.calSetDateTime);
      calHourEntryNd.addEventListener('keydown', checkHourMinuteInput);
      calMinuteEntryNd.addEventListener('keydown', checkHourMinuteInput);
      
      
      const calDateBlocks = document.getElementsByClassName("calDateBlock");
      const nMax = calDateBlocks.length;
      for (let n=0;n<nMax;n++) {
        const calDateBlock = calDateBlocks[n];
        calDateBlock.addEventListener('click', calSelDate);
      } // next n
      // --------------------------------------------------------   
      
      
      // setup tint layer between popup and normal display:
      let tintNd = document.getElementById("tint");
      if (tintNd == null) {
        tintNd = document.createElement("div");
        tintNd.id = "tint";
        tintNd.style.background = "black";
        tintNd.style.opacity = ".6";
        tintNd.style.position = "absolute";
        tintNd.style.left = "0px";
        tintNd.style.top = "0px";
        tintNd.style.zIndex = "100";  // tint layer appears Above regular page, but Below any popup (like calPopup)
        document.body.appendChild(tintNd); 
      } // end if
      
      tintNd.style.width = (nPageWidth)+"px";
      tintNd.style.height = (nPageHeight)+"px";      
      tintNd.style.display = "block";
    } // end of function buildCalendarPopup()
    
  
   
    


 /****************************************************************************
  Private function
  User clicked on date block for a date on the calendar...
  ****************************************************************************/
  function calSelDate(event) {
    
    // *** UNSELECT ANY PREVIOUS VISIBLE DATE:
    // if there is a calendar date on the current calendar that is selected,
    // Unselect it (via css classes)
    const calSelBlocks = document.getElementsByClassName("calBlockSel");
    let nMax = calSelBlocks.length; // really should only be 0 or 1
    for(let n=0;n<nMax;n++) {
      const oldCalSelBlock = calSelBlocks[0];
      const nWeekday = oldCalSelBlock.dataset.weekday - 0;
      let sClass = "calBlock1 calDateBlock"; //  calDateBlock is programatically used not visually

          if (nWeekday===0 || nWeekday===6) {
            // formatting for weekend dates (Sunday and Saturday)
            oldCalSelBlock.className = "calBlock2 calDateBlock";
          } else {
            // formatting for all the other days of the week...
            oldCalSelBlock.className = "calBlock1 calDateBlock";
          } // end if
      
    } // next n
    
    
    // *** SELECT DATE PICKED BY USER:
    const calDateDspNd = document.getElementById("calDateDsp");
    
    let dateBlock = event.target;    

    if (dateBlock.className === "calToday" || dateBlock.className === "calOtherDays") {
      dateBlock = dateBlock.parentElement;
    } // end if
    
    const dtCtrl = new DateTimeCtrl();    
    const sField = dateBlock.dataset.field;    
    const nMonth = dateBlock.dataset.month - 0;
    const nDate = dateBlock.dataset.date - 0;
    const nYear = dateBlock.dataset.year - 0;
    const ctrl = dtCtrl.getCtrl(sField);
    
    const pendingSelDate = new Date();
    const pickDate = ctrl.pickDate;
    pendingSelDate.setMonth(nMonth);
    pendingSelDate.setDate(nDate);
    pendingSelDate.setFullYear(nYear);
    pendingSelDate.setHours(pickDate.getHours());
    pendingSelDate.setMinutes(pickDate.getMinutes());
    pendingSelDate.setSeconds(0); // get rid of any seconds
    ctrl.pendingSelDate = pendingSelDate;
    ctrl.pendingSelDatePicked = true;
    
    ctrl.pendingSelMonth = nMonth;
    ctrl.pendingSelDateNum = nDate; // added Num so as to not wipe out the date value of the 'pendingSelDate' property!
    ctrl.pendingSelYear = nYear;
    
    dateBlock.className = "calBlockSel calDateBlock"; // show the date the user picked with a selection highlight color

    calDateDspNd.value = formattedDate(pendingSelDate); // show the date picked in a formatted manner
    
    // once a date has been selected, unhide area where user can put in a time and/or click SET button:
    const calDateTimeBoxNd = document.getElementById("calDateTimeBox");
    calDateTimeBoxNd.style.display = "block";
        
  } // end of function calSelDate()
    
    
    
    
  /****************************************************************************
      Private function
      Will not allow the entry of non-integer characters into text box
      has to be captured by "keydown" event... "keyup" will not work 
      since by then it is too late!
    ****************************************************************************/         
    function checkHourMinuteInput(event) {
      const kc = event.keyCode;
      const BACKSPACE = 8; // don't have to worry about the Tab key!
      
      let sChar = String.fromCharCode(kc);
      const sValidChars = "0123456789";
      
      // handle numbers entered from numeric keypad on keyboard:
      if (kc > 95 && kc < 106) {
        sChar = (kc - 96)+"";
      } // end if
      
      if (sValidChars.indexOf(sChar) === -1 && kc !== BACKSPACE) {
        // not a correct character... don't allow it to be accepted as part of the input!
        event.stopPropagation();
        event.preventDefault();  
        event.returnValue = false;
        event.cancelBubble = true;
        return false;
      } // end if
      
    } // end of function  checkHourMinuteInput()
    
    
    
    
  /****************************************************************************
      Private function
      I've got to think this through some more!
    ****************************************************************************/     
    function defineCssSelectors() {
      cssSelectors["#calAmPmSelect"] = "calAmPmSelect";
    } // end of function defineCssSelectors()
    
    
    
    
  /****************************************************************************
      Private function
    ****************************************************************************/     
    function formattedDate(dt) {
      
      if (typeof dt === "undefined") {
        return "";
      } // end if
      
      let sMonth = (dt.getMonth()+1)+"";
      
      if (sMonth.length ===1) {
        sMonth = "0" + sMonth;
      } // end if
      
      let sDay = (dt.getDate())+"";
      
      if (sDay.length ===1) {
        sDay = "0" + sDay;
      } // end if
      
      let sDate = sMonth + "/" + sDay + "/"+dt.getFullYear();
      return sDate;
    } // end of function formattedDate()
    
    
    
    
    
   /****************************************************************************
      Private function
    ****************************************************************************/      
    function formattedDateTime(ctrl) {
      let sDate = "";
      
      if (ctrl.dateValue === "") {
        return "";
      } // end if
      
      const dt = new Date(ctrl.dateValue);
      
      sDate = formattedDate(dt);
      
      if (ctrl.editTime) {
        sDate = sDate + " @ " + formattedTime(dt);
      } // end if (ctrl.editTime)
      
      return sDate;
    } // end of function formattedDateTime()
    
    
    
    
  /****************************************************************************
      Nicely formatted time (hours and minutes... no seconds)!
      Private function
    ****************************************************************************/     
    function formattedTime(dt) {
      let sAMPM = " AM";
      let nHour = dt.getHours();
      
      if (nHour > 11) {
        sAMPM = " PM";
        
        if (nHour > 12) {
          nHour = nHour - 12;
        } // end if
      } // end if
      
      if (nHour === 0) {
        nHour = 12; // 12 AM (midnight)
      } // end if
      
      let sMinutes = dt.getMinutes()+"";
      if (sMinutes.length ===1) {
        sMinutes = "0" + sMinutes;
      } // end if
      
      let sTime = (nHour)+":"+sMinutes+sAMPM;
      
      return sTime;
    } // end of function formattedTime()
    
    
    
    
   /****************************************************************************
      Private function
    ****************************************************************************/
    function genCtrlStylesIfNeeded() {
      let s=[];
      let dateCtrlStyle = document.getElementById("chomerDateTimeCtrlStyles");
      
      if (dateCtrlStyle != null) {
        return; // already there, no need to add
      } // end if
      
      const sFont = '  font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;';
      
      s.push("#calAmPmSelect {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  top:8px;");
      s.push(sFont);
      s.push("  left:225px;");
      s.push("  font-size:12pt;");
      s.push("  height:30px;");
      s.push("}");
      
      s.push(".calAt {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  top:9px;");
      s.push("  left:126px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  background:white;");
      s.push("}");
      
      
      s.push(".calBlock1 {");
      s.push("  position:absolute;");
      s.push("  padding:0;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  border:solid silver .5px;");
      s.push(sFont);
      s.push("  background:white;");
      s.push("}");

      s.push(".calBlock2 {");
      s.push("  position:absolute;");
      s.push("  padding:0;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  border:solid silver .5px;");
      s.push(sFont);
      s.push("  background:#f2f2f2;");
      s.push("}");
      
     /* s.push(".calBlockSel {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  border:solid silver .5px;");
      s.push("  background:#0099cc;");      
      s.push("}");
      */

      s.push(".calBlock1:hover {");
      s.push("  background:#e6e6ff;");
      s.push("  cursor:pointer;");
      s.push("}");

      s.push(".calBlock2:hover {");
      s.push("  background:#e6e6ff;");
      s.push("  cursor:pointer;");
      s.push("}");
      
      s.push(".calBlockSel:hover {");      
      s.push("  background:#0099cc;"); // lightyellow
      s.push("  background: linear-gradient(to bottom, #ffd9b3 0%, #e6e6ff 90%);");
      s.push("  cursor:pointer;");
      s.push("}");      
      
      s.push(".calBlockEmpty {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  border:solid silver .5px;");
      s.push("  background:#ebebe0;");
      s.push("}");
      

      s.push(".calBlockSel {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  padding:0;");
      s.push("  box-sizing:border-box;");
      s.push("  border:solid silver .5px;");
      s.push(sFont);
      s.push("  background:#ffd9b3;");
      s.push("}");


      s.push(".calBtn {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  height:35px;");
      s.push("  top:6px;");
      s.push(sFont);
      s.push("  cursor:pointer;");
      s.push("}");

      // normal calendar caption:
      s.push(".calCaption {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  left:20px;");
      s.push("  top:8px;");
      s.push("  width: 300px;");
      s.push(sFont);
      s.push("  font-size:24pt;");
      s.push("  color:#0066cc;");
      s.push("}"); 
      
      // small calendar caption:
      s.push(".calCaption_s {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  left:20px;");
      s.push("  top:8px;");
      s.push("  width: 300px;");
      s.push(sFont);
      s.push("  font-size:15pt;");
      s.push("  color:#0066cc;");
      s.push("}"); 
      
      
      s.push(".calColonSep {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  left:180px;");
      s.push("  top:6px;");
      s.push("  width: 300px;");
      s.push(sFont);    
      s.push("  font-size:16pt;");
      s.push("}"); 
      
      
      s.push("#calDateDsp {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  left:0px;");
      s.push("  top:3px;");
      s.push("  width: 120px;");
      s.push("  text-align:center;");
      s.push(sFont);
      s.push("  font-size:12pt;");
      s.push("}"); 
      
      s.push("#calDateTimeBox {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  left:20px;");
      s.push("  width: 300px;");
      s.push("  height:85px;");
      s.push("  border:solid white 1px;");
      s.push("  border-radius:5px;");
      s.push("}"); 
      
      s.push("#calHourEntry {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  text-align:center;");
      s.push(sFont);
      s.push("  left:148px;");
      s.push("  top:3px;");
      s.push("  width: 32px;");
      s.push("  border:solid silver 1px;");
      s.push("  border-radius:5px;");
      s.push("}"); 
      
      
      // next button normal display...
      s.push(".calNextBtn {"); 
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  overflow:hidden;");
      s.push("  height:35px;");
      s.push("  top:45px;");
      s.push("  right:48px;");
      s.push("  width:35px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");  
      
      // next button for small display...
      s.push(".calNextBtn_s {"); 
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  padding-left:0px;");
      s.push("  padding-right:0px;");
      s.push("  text-align:center;");
      s.push("  height:35px;");
      s.push("  top:45px;");
      s.push("  right:6px;");
      s.push("  width:30px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  overflow:hidden;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");  
      
      
      s.push("#calMinuteEntry {"); 
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  top:3px;");
      s.push("  left:187px;");
      s.push("  width:32px;");
      s.push(sFont);
      s.push("  border-radius:5px;");
      s.push("  border:solid silver 1px;");
      s.push("}"); 
      
      
      s.push(".calMonthName {"); 
      s.push("  font-weight:bold;"); 
      s.push(sFont);
      s.push("  font-size:24pt;"); 
      s.push("}");
      
      s.push(".calMonthName_s {"); 
      s.push("  font-weight:bold;"); 
      s.push(sFont);
      s.push("  font-size:15pt;"); 
      s.push("}");

      s.push(".calMonthYear {"); 
      s.push("  position:absolute;"); 
      s.push("  left:20px;"); 
      s.push("  top:50px;"); 
      s.push("  width: 300px;"); 
      s.push(sFont);
      s.push("}"); 
      
      s.push(".calOtherDays {");
      s.push("  width:30px;");
      s.push("  height:30px;");
      s.push("  overflow:hidden;");
      s.push("  text-align:center;");
      s.push("  line-height:30px;");
      s.push(sFont);
      s.push("}");
      
      
      s.push("#calPopup {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  display:none;");
      s.push("  z-index:950;");
      s.push("  background:white;");
      s.push("  width:600px;");
      s.push("  height:700px;");
      s.push("  border:solid silver 3px;");
      s.push("  border-radius:6px;");
      s.push("}");

      // normal prev button
      s.push(".calPrevBtn {"); 
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  overflow:hidden;");
      s.push("  height:35px;");
      s.push(sFont);
      s.push("  top:45px;");
      s.push("  right:162px;");
      s.push("  width:35px;");
      s.push("  font-size:16pt;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");  
      
      
      // small prev button
      s.push(".calPrevBtn_s {"); 
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  overflow:hidden;");
      s.push("  padding-left:0px;");
      s.push("  padding-right:0px;");
      s.push("  text-align:center;");
      s.push("  height:35px;");
      s.push(sFont);
      s.push("  top:45px;");
      s.push("  right:115px;");
      s.push("  width:30px;");
      s.push("  font-size:16pt;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");
      
      s.push(".calToday {");
      s.push("  background:red;");
      s.push("  width:30px;");
      s.push("  height:30px;");
      s.push("  border-radius:50%;");
      s.push("  font-weight:bold;");
      s.push(sFont);
      s.push("  color:white;");
      s.push("  text-align:center;");
      s.push("  line-height:30px;");
      s.push("}");

      
      
      s.push(".calSetDateBtn {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  top:3px;");
      s.push("  left:320px;");
      s.push("  cursor:pointer;");
      //s.push("  width: 300px;");
      s.push("  height:35px;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("}"); 
      
      // SET date button for small screen
      s.push(".calSetDateBtn_s {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  top:45px;");
      s.push("  left:-2px;");
      s.push("  cursor:pointer;");
      //s.push("  width: 300px;");
      s.push("  height:35px;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  font-weight:bold;");
      s.push("}"); 
      
      
      
      // normal Today button...
      s.push(".calTodayBtn {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  overflow:hidden;");
      s.push("  height:35px;");
      s.push("  top:45px;");
      s.push("  right:85px;");
      s.push("  width:75px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");
      
      // small Today button...
      s.push(".calTodayBtn_s {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  overflow:hidden;");
      s.push("  padding-left:0px;");
      s.push("  padding-right:0px;");
      s.push("  text-align:center;");
      s.push("  height:35px;");
      s.push("  top:45px;");
      s.push("  right:38px;");
      s.push("  width:75px;");
      s.push(sFont);
      s.push("  font-size:16pt;");
      s.push("  background:#f2f2f2;");
      s.push("  border-radius:3px;");
      s.push("  border:solid gray 1px;");
      s.push("  cursor:pointer;");
      s.push("}");
      
      
      s.push(".calWeekday {");
      s.push("  position:absolute;");
      s.push("  text-align:right;");
      s.push(sFont);    
      s.push("}");
      
      
      /* (.calWrapper)
         allows to easily offset calendar itself Down
         in the popup leaving room above it for 
         information telling the user what they're selecting: */
      s.push(".calWrapper {");
      s.push("  position:absolute;");
      s.push("  left:0px;");
      s.push("  top:64px;");
      s.push("}");
      
      

      s.push(".calYear {");
      s.push(sFont);
      s.push("  font-size:24pt;");
      s.push("}");

      s.push(".closeBtn {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  top:3px;");
      s.push("  right:5px;");
      s.push("  width:35px;");
      s.push("  height:35px;");
      s.push("  border-radius:3px;");
      s.push("  border:solid #490a09 1px;");
      s.push("  color:white;");
      s.push("  text-shadow: -1px -1px gray;");
      //background: linear-gradient(to bottom, #808080, #3fada8);
      s.push("  background: linear-gradient(to bottom, #dc9589 0%, #a64231 49%, #973c2d 50%, #e97f3f 94%, #dfbb58 100%);");
      s.push("  padding:0px;");
      s.push(sFont);
      s.push("  font-size:20pt;");
      s.push("  line-height:20px;");
      s.push("  cursor:pointer;");
      s.push("}");    
      
      // used for calendar control on input form:
      s.push(".dateTime {");
      s.push("  position:absolute;");
      s.push("  box-sizing:border-box;");
      s.push("  left:0px;");
      s.push("  top:0px;");
      s.push("  width:160px;");
      s.push("  background:white;");
      s.push("  height:28px;");
      s.push("  font-size:10pt;");
      s.push(sFont);      
      s.push("  border-radius:5px 0px 0px 5px;");
      s.push("  border:solid gray 1px;");
      s.push("  margin-right:0px;");
      s.push("  margin-top:2px;");
      s.push("}");

      s.push(".dateTimeButton {");
      s.push("  position:absolute;");
      s.push("  overflow:hidden;");
      s.push("  box-sizing:border-box;");
      s.push("  left:159px;");
      s.push("  top:0px;");
      s.push("  width:120px;");
      s.push("  background:#f2f2f2;");
      s.push("  border:solid gray 1px;");
      s.push("  border-radius:0px 5px 5px 0px;");
      s.push("  margin-left:0px;");
      s.push("  margin-top:2px;");
      s.push("  box-shadow:none;");
      s.push("  width:30px;");
      s.push("  font-weight:bold;");
      s.push("  height:28px;");
      s.push("  cursor:pointer;");
      s.push("}");

      s.push(".datetimeCtrlCtr {");
      s.push("  position:relative;");
      s.push("  left:0px;");
      s.push("  top:0px;");
      s.push("  height:32px;");
      s.push("}");
      
      dateCtrlStyle = document.createElement("style");
      dateCtrlStyle.id = "chomerDateTimeCtrlStyles";
      dateCtrlStyle.innerHTML = s.join("\n");
      
      document.body.appendChild(dateCtrlStyle); 
    } // end of function  genCtrlStylesIfNeeded()
    
    
    
    
  /*************************************************************************
    Private function
  *************************************************************************/
  function getFullMonthName(dt) {
    const nMonth = dt.getMonth();
    const sMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    return sMonthNames[nMonth];
  } // end of function getFullMonthName(dt)
    
    
    /****************************************************************************
      what day of the week does the 1st begin on...
      Private function
    ****************************************************************************/
    function getStartWeekDayForMonth(dt) {
      const firstDateInMonth = new Date();
      firstDateInMonth.setDate(1);
      firstDateInMonth.setMonth(dt.getMonth());
      firstDateInMonth.setFullYear(dt.getFullYear());
      return firstDateInMonth.getDay();
    } // end of function  getLastDateInMonth()
    
    
    

  /*************************************************************************
    return total number of days in a month
    Private function
  *************************************************************************/
  function getTotalDaysInMonth(dt) {
    let nYear = dt.getFullYear();
    let nMonth = dt.getMonth()+1;

    if (nMonth>11) {
      nMonth = 1;
      nYear = nYear + 1;
    } // end if

    let firstDateOfNextMonth = new Date();
    firstDateOfNextMonth.setFullYear(nYear);
    firstDateOfNextMonth.setDate(1);
    firstDateOfNextMonth.setMonth(nMonth);
    const nMsInDay = 1000 * 60 * 60 * 24;
    let lastDateOfCurrentMonth = new Date();
    lastDateOfCurrentMonth.setTime(firstDateOfNextMonth.getTime()-nMsInDay);

    return lastDateOfCurrentMonth.getDate();
  }// end of function getTotalDaysInMonth()

    
 /****************************************************************************
   Private function
   called to hide the calendar popup and the tint panel
  ****************************************************************************/
  function hideCalendarCtl(event) {
    const calPopupNd = document.getElementById("calPopup");
    calPopupNd.innerHTML = "";
    calPopupNd.style.display = "none";
    const tintNd = document.getElementById("tint");
    
    if (tintNd) {
      tintNd.style.display = "none";
    } // end if
  } // end of function hideCalendarCtl()    
    
    
    
    
   /****************************************************************************
      Private function
      called before redrawing popup as user moves from month to month...
    ****************************************************************************/    
    function savePendingSelTime(ctrl) {
      if (!ctrl.pendingSelDatePicked) {
        return; // no changes to possibly save
      } // end if
      
      const calHourEntryNd = document.getElementById("calHourEntry");
      const calMinuteEntryNd = document.getElementById("calMinuteEntry");
      const calAmPmSelectNd = document.getElementById("calAmPmSelect");
      
      ctrl.pendingSelHour = calHourEntryNd.value;
      ctrl.pendingSelMinute = calMinuteEntryNd.value;
      ctrl.pendingSelAmPm = calAmPmSelectNd.value;
    } // end of function savePendingSelTime() 
    
    
    
    
   /****************************************************************************
      Private function
    ****************************************************************************/
    function setPropValue(ctrl,inputParams,params) {
      const sType = params.type;
      const sPropName = params.propName;
      let defValue;
      
      if (sType === "boolean") {
        defValue = false;
      } // end if
      
      if (sType === "string") {
        defValue = "";
      } // end if
      
      if (sType === "number") {
        defValue = 0;
      } // end if
      
      if (sType === "date") {
        defValue = new Date();
      } // end if
      
      if (sType === "date") {
        if (params.defValue instanceof Date) {
          defValue = params.defValue;
        } // end if
      } else if (typeof params.defValue === sType) {
        defValue = params.defValue;
      } // end if
      
      ctrl[sPropName] = defValue;
      
      if (sType === "date") {
        if (inputParams[sPropName] instanceof Date) {
          ctrl[sPropName] = inputParams[sPropName];
        } // end if
        return;
      } // end if
      
      if (typeof inputParams[sPropName] === sType) {
        ctrl[sPropName] = inputParams[sPropName];
      } // end if
      
    } // end of function setPropValue()
    
    
    
  } // end of function DateTimeCtrl()


