# EAST Validation Tool 

The following files were used to create the Validation Tool that was used by the   [EAST libraries](https://blc.org/east-project ) validation project. 

### Google App Script used for each library 
Each library used a distinct  Google App Script that contained these files:
- home.html - home page
- StatScript.html - javascript used by home.html to add in summary stats to page
- Stylesheet.html - css style sheet
- bos.html - 'book on shelf' validation page
- JavaScript.html  - javascript used by bos.html page
- missing.html - catalog check page
- MissingScript - javascsript used on catalog check page
- fix.html - fix entry error page
- FixScript.html - javascript used by fix.html
- Code.gs  - google server side code, mostly connects to the shared productionlibrary which was used by all participants

### Script Properties 
 For each instance of the tool the following scritp properties were defined (under File / Project Properties)
- *libraryName* - used for display purposes only 
- *spreadsheetID* - id of the google sheet with which the tool is to interact
- *catalogHttps* - true/false - whether or not the library's opac supported https.  If true, the catalog check opened the catalog in a frame, otherwise opened in new tab

### Production Library
The production library was a separate single script, with the code shared by all installations of the validation tool.   It had a single code.gs file, and is included here as
- ProductionLibrary-Code.gs

This was associated with each indvidual script under the Resources / Libraries.
 
### Spreadsheet
Included here is a sample of the spreadsheet format expected by the validation tool.  It has three tabs - Working, Stats and Locations
- SampleSheet.xlsx

   