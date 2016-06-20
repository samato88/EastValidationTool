// get script properties for library name and sheet

var scriptProperties = PropertiesService.getScriptProperties();
var libraryName = scriptProperties.getProperty('libraryName');  
var sheetID     = scriptProperties.getProperty('spreadsheetID') ;
var catalogHttps       = scriptProperties.getProperty('catalogHttps') ;

var sheet = SpreadsheetApp.openById(sheetID).getSheets()[0] ;
var stats = SpreadsheetApp.openById(sheetID).getSheets()[1] ;
var locs  = SpreadsheetApp.openById(sheetID).getSheets()[2] ;


function doGet(e) {

  //Logger.log( Utilities.jsonStringify(e) );
  if (!e.parameter.page) {  // When no specific page requested, return "home" page
    return HtmlService
         .createTemplateFromFile('home')
         .evaluate().setTitle('Validation Study:' + libraryName)
         .setSandboxMode(HtmlService.SandboxMode.IFRAME); // IFRAME
  }  // else, use page parameter to pick an html file from the script
    return HtmlService
         .createTemplateFromFile(e.parameter['page'])
         .evaluate().setTitle('Validation Study:' + libraryName)
         .setSandboxMode(HtmlService.SandboxMode.IFRAME); // IFRAME
}

function getScriptUrl() { //Get the URL for the Google Apps Script running as a WebApp.
 var url = ScriptApp.getService().getUrl();
 return url;
}

function getFixData() { // get next numberToCheck  items to check
  try {
    fullDataSet = ProductionLibrary.getFixData(sheet) ;
    return fullDataSet ; // first element is loc, second is dataset
  } catch(e) {
   return (e, "ERROR Getting Full Data Set. Try again Soon. " + e) ; 
  }
} // end getFixData

function getData(user,numberToCheck, loc, line) { // get next numberToCheck  items to check
  try {
    nextDataSet = ProductionLibrary.getData(user, numberToCheck, loc, sheet, libraryName, line) ;
    return nextDataSet ; // first element is loc, second is dataset
  } catch(e) {
   return (e, "ERROR Getting Data for Validation. Try again Soon. " + e) ; 
  }
} // end getData

function processFixForm(formObject) { //https://developers.google.com/apps-script/guides/html/communication#forms
  try {
    ProductionLibrary.processFixForm(formObject, sheet) ;
  } catch(e) {
     return (e, "ERROR submitting data.  Reload page to try again. " + e) ; 
  } // end catch(e)
} // end ProcessForm

function processBosForm(formObject) { //https://developers.google.com/apps-script/guides/html/communication#forms
  try {
    ProductionLibrary.processBosForm(formObject, sheet) ;
  } catch(e) {
     return (e, "ERROR submitting data.  Reload page to try again. " + e) ; 
  } // end catch(e)
} // end ProcessForm

function processMissingForm(formObject) { //https://developers.google.com/apps-script/guides/html/communication#forms
  try {
    ProductionLibrary.processMissingForm(formObject, sheet) ;
  } catch(e) {
    return (e, "ERROR submitting data.  Reload page to try again. " + e) ;
  }
} // end ProcessForm

function clear() { // reset any columns that are inProcess
  try {
    ProductionLibrary.clear(sheet, "InProcess") ;
  } catch(e) {
    Logger.log(e) ;
    return (e, "ERROR") ; 
  }
} // end clear if in process

function clearMissing() { // reset any columns that are inProcess
  try {
    ProductionLibrary.clear(sheet, "NotOnShelfInProcess") ;
  } catch(e) {
    //Logger.log(e) ;
    return (e, "ERROR") ; 
  }
} // end clear if in process

function getStatsValue() {
  var statsData = ProductionLibrary.getStatsValue(stats) ;
  return(statsData) ;
}    

function getLocsStatsValue() {
  var locStats = ProductionLibrary.getLocsStatsValue(locs);
  return(locStats) ;
}

function getLocations() {
  var locationsList = ProductionLibrary.getLocations(locs) ;
  return(locationsList) ;
}

function getMissing() { // get any items listed as missing
try {
    nextDataSet = ProductionLibrary.getMissing(sheet,libraryName) ;
    return nextDataSet ;   
  } catch(e) {
    //Logger.log(e) ;
    return ("ERROR Getting Data for Not On Shelf Items" + e, e) ; 
  }
} // end getMissing

function getSheetID() { return sheetID ; }
function getCatalogHttps()   { 
  Logger.log("Value here:" + catalogHttps) ;
  return catalogHttps ; 
}
                           
 