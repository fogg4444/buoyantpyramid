// Each of these commands will run in a new tab!
var commandsList = ['ls -a', 'ls -a'];


var exec = require('child_process').exec;
var dir = __dirname;

for( var i = 0; i < commandsList.length; i++ ) {
  var thisCommand = commandsList[i];
  setTimeout(function(){
    console.log(thisCommand);
    exec('runInTab ' + thisCommand);
  }, i*1000);
}



// Save below script to     /usr/local/bin as "runInTab"
// ensure this is executeable
// add commands to list below and run 'node sessionSetup.js'
// Hope this works...
//////////////////////////////////////////////////////////////////////////

// #!/usr/bin/env osascript

// on run argv
//     set AppleScript's text item delimiters to {" "}
//     tell application "iTerm"
//         make new terminal
//         tell the current terminal
//             activate current session
//             launch session "Default Session"
//             tell the last session
//                 write text argv as string
//             end tell
//         end tell
//     end tell
// end run

////////////////////////////////////////////////////////////////////////////


