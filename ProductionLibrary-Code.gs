//===================================================================================================

function getFixData(sheet) { // get next numberToCheck  items to check
  var lock = LockService.getScriptLock();
  //var numberToCheck = 10 ; // how large do we want the check sets to be?
  if (lock.tryLock(30000))  {
 
    //Logger.log(sheet.getName()); // just a test to see if we get the sheet we wanted    
    
    var data = sheet.getDataRange().getValues(); // gets the whole sheet, returns object[][]
    var dataLength = sheet.getDataRange().getLastRow(); // not sure why data.length object is undefined
    var count = 1 ;
    var fullDataSet = [] ;
    var updateRows = [] ;  

    for (var i = 0; i < dataLength; i++) {        
        var row = data[i] ;  // Logger.log(data[i]);  -- this is the array of that row
       
        // This one for SCS list
        var patt = new RegExp("\\*"); // enums with * came from item and are repeated in data
        var enum = row[5] ;

        if (patt.exec(enum)) { //if (row[5] has * don't bother with it 
          //Logger.log("got row: " + i + " enum: " + enum) ;
          enum = "" ;
        }
        
      var barcode = row[1] ;
      var barcode = String(barcode).replace(/\s?/g, ''); //strip spaces from barcode
      fullDataSet.push([row[3],row[6],row[11], i, barcode, row[2], enum]) ; // pass back call #, title, bib link, original row number, barcode, location, enum
      // try pusing with title as key and sorting
      var rowNumber = i + 1 ; // note i indexed at 0 while rows indexed at 1         
    } // end for data.length
  } // end if got the lock
  else {
    //alert("Failed to lock data file.  Try again soon.") ;"The time is: " + now.toString());
    GmailApp.sendEmail("samato@blc.org", "epic fail", "lock acquisition fail on getData script for: " + libraryName);
    FullDataSet = "ERROR: failed to lock file for updating.  Try again." ;
  }
  
  lock.releaseLock();
  
  // Logger.log(fullDataSet);
  
 // var sorted = [];
 // Object.keys(fullDataSet).sort().forEach(function(key) {
  //  sorted[key] = fullDataSet[key];
  //});
  
  fullDataSet.sort(compareTitleColumn);

  
  return fullDataSet ;
  //return sorted ;
} // end getData

//===================================================================================================

function getData(user,numberToCheck, location, sheet, libraryName, line) { 
  
  // get next numberToCheck  items , starting at line, in location
  var lock = LockService.getScriptLock();
  //var numberToCheck = 10 ; // how large do we want the check sets to be?
  if (lock.tryLock(30000))  {
 
    //Logger.log(sheet.getName()); // just a test to see if we get the sheet we wanted    
    
    var data = sheet.getDataRange().getValues(); // gets the whole sheet, returns object[][]
    var dataLength = sheet.getDataRange().getLastRow(); // not sure why data.length object is undefined

    var count = 1 ;
    var nextDataSet = [] ;
    var updateRows = [] ;  
    var updateUser = [] ; // column O
    var updateInProcess = [] ; // column A
    var previousRow = 0 ; // set to zero for first loop 

    for (var i = line-1; i < dataLength; i++) {
      if (count > numberToCheck) { break; } //  ****NEED TO ADD IN OR END OF SHEET HERE******
      
      if ( (data[i][0] == '') && (data[i][2] == location) ) { // return only rows with empty status and requested location
        
        var row = data[i] ;  // Logger.log(data[i]);  -- this is the array of that row
       
        // This one for SCS list
        var patt = new RegExp("\\*"); // enums with * came from item and are repeated in data
        var enum = row[5] ;

        if (patt.exec(enum)) { //if (row[5] has * don't bother with it 
          //Logger.log("got row: " + i + " enum: " + enum) ;
          enum = "" ;
        }
        
        var barcode = row[1] ;
        var barcode = String(barcode).replace(/\s?/g, ''); //strip spaces from barcode
        nextDataSet.push([row[3],row[6],row[11], i, barcode, row[2], enum]) ; // pass back call #, title, bib link, original row number, barcode, location, enum
        
        var rowNumber = i + 1 ; // note i indexed at 0 while rows indexed at 1 
        updateRows.push(rowNumber); //push on rows to update
        updateUser.push(user) ;  
        updateInProcess.push('InProcess') ;
        ++count ; // we got one to check
        
      } // end if present column blank
    } // end for data.length
    updateSheetColumn(updateRows, updateUser, "O", sheet);  // initials go in M
    updateSheetColumn(updateRows, updateInProcess, "A", sheet);  // Status goes in A
  } // end if got the lock
  else {
    //alert("Failed to lock data file.  Try again soon.") ;"The time is: " + now.toString());
    GmailApp.sendEmail("samato@blc.org", "epic fail", "lock acquisition fail on getData script for: " + libraryName);
    nextDataSet = "ERROR: failed to lock file for updating.  Try again." ;
  }
  
  lock.releaseLock();
  //  Logger.log("returning:  " + nextDataSet) ;
  
  var returnData = [location, nextDataSet];
  // Logger.log(returnData);
  return returnData ;
} // end getData

//===================================================================================================
function getMissing(sheet, libraryName) { // get next numberToCheck  items to check
  var lock = LockService.getScriptLock();
  //var numberToCheck = 10 ; // how large do we want the check sets to be?
  
  if (lock.tryLock(30000))  {
 
    var data = sheet.getDataRange().getValues(); // gets the whole sheet, returns object[][]
    var dataLength = sheet.getDataRange().getLastRow(); // not sure why data.length object is undefined
    var count = 1 ;
    var nextDataSet = [] ;
    var updateRows = [] ;  
    var updateInProcess = [] ; // column A
    var previousRow = 0 ; // set to zero for first loop 
    

    for (var i = 0; i < dataLength; i++) {      
      if ( (data[i][0] == 'NotOnShelf')) { // return only rows with NotOnShelf status
        
        var row = data[i] ;  // Logger.log(data[i]);  -- this is the array of that row
       
        // This one for SCS list
        var patt = new RegExp("\\*"); // enums with * came from item and are repeated in data
        var enum = row[5] ;

        if (patt.exec(enum)) { //if (row[5] has * don't bother with it 
          //Logger.log("got row: " + i + " enum: " + enum) ;
          enum = "" ;
        }
        
        //var catalogLink = getCatalogLink(ils, ilsurl, row[10]) ;
        nextDataSet.push([row[3],row[6],row[11], i, row[1], row[2], enum]) ; // pass back call #, title, bib link, original row number, barcode, location, enum
        
        var rowNumber = i + 1 ; // note i indexed at 0 while rows indexed at 1 
        updateRows.push(rowNumber); //push on rows to update
        updateInProcess.push('NotOnShelfInProcess') ;
        ++count ; // we got one to check
        
      } // end if present column blank
    } // end for data.length
    updateSheetColumn(updateRows, updateInProcess, "A", sheet);  // Status goes in A
 
 } // end if got the lock
  else {
    //alert("Failed to lock data file.  Try again soon.") ;
    GmailApp.sendEmail("samato@blc.org", "epic fail", "lock acquisition fail on a missing script: " + libraryName);
    nextDataSet = "ERROR: failed to lock file for updating.  Try again." ;
    Logger.log("Lock Error") ;
  }
  lock.releaseLock();
  //Logger.log("returning:  " + nextDataSet) ;

  return nextDataSet ;
  
} // end getMissing

//===================================================================================================
function updateSheetColumn(rows, newValues, column, sheet) { //update entire sheet - one call -  So much faster!
  //docs at:   https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
  //http://googleappsdeveloper.blogspot.com/2011/10/concurrency-and-google-apps-script.html
  var lock = LockService.getScriptLock();
  
  if (lock.tryLock(30000))  {
    var maxRows = String(sheet.getMaxRows()); // get number of rows in sheet, grab entire column
    var sheetRange = column + "2:" + column + maxRows ;
    var allRange = sheet.getRange(sheetRange);// e.g. sheet.getRange("A2:A6001") 
    var distValues = allRange.getValues();    // values currently in the column A2 - A6001, indexed 0 - 5999

    for (index = 0; index < rows.length; ++index) {  
      Logger.log("COLUMN: " + column + " ROW:  " + rows[index] +  " distValues: " +  distValues[rows[index]] +  " NewValues: " + newValues[rows[index]]) ;
      distValues[rows[index]-2] = newValues[index] ; // update values in rows that have new values, not index off by 2 compared to row #
    }// end for index of rows
  
    var updateValues = [] ; // create new array for update [][]
    for (counter = 0; counter < distValues.length; ++counter) {   updateValues[counter] = new Array(1); } ; 
    for (counter = 0; counter < distValues.length; ++counter) {      
      updateValues[counter][0] = distValues[counter];  
    } 
  
    allRange.setValues(updateValues) ; // actually update the sheet
  } // end got lock
  else {
    Logger.log("Failed to get lock") ;
    GmailApp.sendEmail("samato@blc.org", "script lock error", "lock acquisition fail on a script!");
  }
  lock.releaseLock();
} // end updateSheetColumn
//===================================================================================================

function sortByNumber(a,b) { // using this to sort array by int rather than lexically
    return a - b;
}

//===================================================================================================

function compareTitleColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

//===================================================================================================

function processBosForm(formObject, sheet) { //https://developers.google.com/apps-script/guides/html/communication#forms
  var formResults = formObject ;
  var myData = {};
  //Logger.log(formResults);//{=[31839001545841, 31839001544455, 31839001545544], condition-20=2, status-21=out, condition-21=3, status-20=missing, status-19=present, condition-19=1, barcode=[, , ]}

  for (var field in formResults) {
    if (formResults.hasOwnProperty(field)) {
      var fieldTypeAndRow  = field.split("-"); //condition-20
      //Logger.log('Field: ' + fieldTypeAndRow[0] + " " + fieldTypeAndRow[1] + " " + fieldTypeAndRow.length +  " " + formResults[field]) ;
      var row = parseInt(fieldTypeAndRow[1]) +1 ;
      if (!myData[row]) { myData[row] = {} ; } // initialize
      var column = fieldTypeAndRow[0] ; // condition, status, barcode, barcodedist 
      myData[row][column] = formResults[field] ;
      //Logger.log('row: ' + row + ' column: *' + column + '* = ' + myData[row][column] ) ;
    } // if hasOwnProperty
  } // end for field in formResults
  
  keys = [];
  
  for (k in myData) {
    if (myData.hasOwnProperty(k)) {
      keys.push(parseInt(k));  // make sure it is an int, actually default sort was problem.
    }
  }

  keys.sort(sortByNumber);
  var len = keys.length;
  var d = new Date();
  var dateStamp = d.getFullYear().toString() +  "-" + d.getMonth().toString() +   "-" + d.getDate().toString() + " " + d.getHours().toString() + ":" + d.getMinutes().toString() + ":" +
d.getSeconds().toString();
  var barcodeChecked ;
  var updateRows = [] ;
  var updateStatuses = [] ;
  var updateConditions = [] ;
  var updateBarcodeChecked = [] ;
  var updateDate = [] ;
  var previousRow = 0 ;
  var status = "" ;
  var condition = "" ;
  var timeStamp = "" ;
              
  for (i = 0; i < len; i++) {
    updateRow = keys[i];
    //Logger.log('UpdateRow:  ' + updateRow + " i: " + i + ' len: ' + len);
    
    if (myData[updateRow]['barcode'] == myData[updateRow]['barcodedist']) {
      barcodeChecked = 'yes' ;
    } else {
      barcodeChecked = 'no' ;
    }
    
    if (myData[updateRow]['status'] == "notvalidated") {// if notvalidated reset this row to check again
      status         = "" ; // A
      condition      = "" ; // P
      barcodeChecked = "" ; // Q
      timeStamp      = "" ; // R
    } else { 
      status = myData[updateRow]['status'] ;
      condition = myData[updateRow]['condition'] ;
      timeStamp = dateStamp ; 
    } // otherwise use the status given
    // load up the arrays
    updateRows.push(updateRow);
    updateStatuses.push(status) ; //myData[updateRow]['status']
    updateConditions.push(condition);//myData[updateRow]['condition']
    updateBarcodeChecked.push(barcodeChecked) ;
    updateDate.push(timeStamp) ;
  } //  end for each row
  
  updateSheetColumn(updateRows, updateStatuses, "A", sheet) ; // column A is status
  updateSheetColumn(updateRows, updateConditions, "P", sheet) ; // column P is condition
  updateSheetColumn(updateRows, updateBarcodeChecked, "Q", sheet) ; // column Q  is 'barcode validated?'
  updateSheetColumn(updateRows, updateDate, "R", sheet) ; // column R is time validated
    
} // end ProcessBosForm

//===================================================================================================

function processMissingForm(formObject, sheet) { //https://developers.google.com/apps-script/guides/html/communication#forms
  var formResults = formObject ;
  var myData = [];
  //Logger.log(formResults);// 
  
  for (var field in formResults) {
    if (formResults.hasOwnProperty(field)) {
      var fieldTypeAndRow  = field.split("-"); //status-20
      //Logger.log('Field: ' + fieldTypeAndRow[0] + " " + fieldTypeAndRow[1] + " Result: " + formResults[field]) ;
      
      if (formResults[field] !== "") {
        var row = parseInt(fieldTypeAndRow[1]) +1 ;
        myData[row] = formResults[field];
      } // end if has value
    } // if hasOwnProperty
  } // end for field in formResults
  
  keys = [];  
  for (k in myData) {
    if (myData.hasOwnProperty(k)) {
      keys.push(parseInt(k));  // make sure it is an int, actually default sort was problem.
    }
  }

  keys.sort(sortByNumber); // sorting by row number

  var len = keys.length;
  var d = new Date();
  var dateStamp = d.getFullYear().toString() +  "-" + d.getMonth().toString() +   "-" + d.getDate().toString() + " " + d.getHours().toString() + ":" + d.getMinutes().toString() + ":" +
d.getSeconds().toString();
 
  var updateRows = [] ;
  var updateStatuses = [] ;
 
  var updateDate = [] ;
  var previousRow = 0 ;
  var status = "" ;
 
  var timeStamp = "" ;
              
  for (i = 0; i < len; i++) {
    updateRow = keys[i];
    status = myData[updateRow];
    timeStamp = dateStamp ; 
   
    // load up the arrays
    updateRows.push(updateRow);
    updateStatuses.push(status) ; //myData[updateRow]
    updateDate.push(timeStamp) ;
  } //  end for each row
   
  updateSheetColumn(updateRows, updateStatuses, "A", sheet) ; // column A is status
  updateSheetColumn(updateRows, updateDate, "R", sheet) ; // column P is time validated
    
} // end ProcessMissingForm

//===================================================================================================

function processFixForm(formObject, sheet) { //https://developers.google.com/apps-script/guides/html/communication#forms
  var formResults = formObject ;
  var myData = [];
  //Logger.log(formResults);// 
  
  for (var field in formResults) {
    if (formResults.hasOwnProperty(field)) {
      var fieldTypeAndRow  = field.split("-"); //status-20
      
      if (formResults[field] !== "") {
        //Logger.log('Field: ' + fieldTypeAndRow[0] + " " + fieldTypeAndRow[1] + " Result: " + formResults[field]) ;
        var row = parseInt(fieldTypeAndRow[1]) +1 ;
        myData[row] = formResults[field];
      } // if has value
    } // if hasOwnProperty
  } // end for field in formResults
 
  keys = [];  
  for (k in myData) {
    if (myData.hasOwnProperty(k)) {
      keys.push(parseInt(k));  // make sure it is an int, actually default sort was problem.
    }
  }

  keys.sort(sortByNumber); // sorting by row number

  var len = keys.length;
  var d = new Date();
  var dateStamp = d.getFullYear().toString() +  "-" + d.getMonth().toString() +   "-" + d.getDate().toString() + " " + d.getHours().toString() + ":" + d.getMinutes().toString() + ":" +
d.getSeconds().toString();
 
  var updateRows = [] ;
  var updateStatuses = [] ;
 
  var updateDate = [] ;
  var status = "" ;
 
  var timeStamp = "" ;
              
  for (i = 0; i < len; i++) {
    updateRow = keys[i];
    status = myData[updateRow];
    timeStamp = dateStamp ; 
   
    // load up the arrays
    updateRows.push(updateRow);
    updateStatuses.push(status) ; //myData[updateRow]
    updateDate.push(timeStamp) ;
  } //  end for each row
   
  updateSheetColumn(updateRows, updateStatuses, "A", sheet) ; // column A is status
  updateSheetColumn(updateRows, updateDate, "R", sheet) ; // column P is time validated
  
} // end ProcessFixForm

//===================================================================================================


function clear(sheet, clearvalue) { // reset any columns that are inProcess
  var lock = LockService.getScriptLock();
  var dataLength = sheet.getDataRange().getLastRow(); // get # of rows
  var checkRange = "A1:" + "A" + dataLength ;
  var localCounter;
  var clearRows = [] ;
  var clearRowsValues = [] ;

  if (lock.tryLock(30000))  {  
    var aData = sheet.getRange(checkRange).getValues(); // gets column A, returns object[][]   
  } // end lock
  else {
    GmailApp.sendEmail("samato@blc.org", "script lock error", "lock acquisition fail on a script clear!");
    return("ERROR getting lock on clear sheet") ;
  }
  lock.releaseLock();
     
  for (localCounter = 0; localCounter < aData.length; ++localCounter) {   
     if (aData[localCounter] == clearvalue) { // should be NotOnShelfInProcess or InProcess 
       clearRows.push(localCounter+1) ; // rows start at 1, not 0 like counter
       
       if (clearvalue === "NotOnShelfInProcess") {
         clearRowsValues.push("NotOnShelf") ;// NotOnShelfInProcess get set back to NotOnShelf
       } else {
          clearRowsValues.push("") ; // inProcess items get set back to blank
       }
     } // if InProcess
  } // end for each row, 
  //clear inprocess, initials, condition, barcodeval, timestamp
  //Logger.log(clearvalue) ;
  switch (clearvalue) {
    case ('InProcess'):
      updateSheetColumn(clearRows, clearRowsValues, "A", sheet) ; 
      updateSheetColumn(clearRows, clearRowsValues, "O", sheet) ; 
      updateSheetColumn(clearRows, clearRowsValues, "P", sheet) ; 
      updateSheetColumn(clearRows, clearRowsValues, "Q", sheet) ; 
      updateSheetColumn(clearRows, clearRowsValues, "R", sheet) ; 
      break ;
    case ('NotOnShelfInProcess') : 
      updateSheetColumn(clearRows, clearRowsValues, "A", sheet) ; 
      break ;
  }
} // end clear if in process
  
//===================================================================================================

function getStatsValue(stats) {
  var statsRange = "B1:B30" ;
  var statsData = stats.getRange(statsRange).getValues() ;// gets just the range from stats sheet
  return(statsData) ;
}    

//===================================================================================================

function getLocsStatsValue(locs) {
  var locsRangeStart = "A2" ;
  var locsRangeEnd   =  "N" + locs.getLastRow();
  var locsStats = locs.getRange(locsRangeStart + ":" + locsRangeEnd).getValues() ;
  return(locsStats) ;
}

//=================================================================================================

function getLocations(locs) {
  var locsRangeStart = "A2" ;
  var locsRangeEnd   =  "A" + locs.getLastRow();
  var locations = locs.getRange(locsRangeStart + ":" + locsRangeEnd).getValues() ;
 return (locations) 
} // end getLocations

//===================================================================================================
