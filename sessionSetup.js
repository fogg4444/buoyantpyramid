// Each of these commands will run in a new tab!
var commandsList = [];

commandsList[0] = 'npm install; bower install; cd ./compression_server; npm install; cd ..';
commandsList[1] = 'pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start; psql;  drop table users cascade; drop table groups cascade; drop table users; drop table groups; drop table "userGroups"; drop table playlists; drop table songs cascade; drop table "playlistSongs";';
commandsList[2] = 'gulp';
commandsList[3] = 'cd ./compression_server; npm start';
commandsList[4] = 'chrome https://github.com/BuoyantPyramid/buoyantpyramid http://localhost:5000';


var exec = require('child_process').exec;
var dir = __dirname;

for ( var i = 0; i < commandsList.length; i++ ) {

  var thisCommand = commandsList[i];
  
  (function (thisCommand) {
    setTimeout(function() {
      // console.log(thisCommand);
      exec('runInTab ' + thisCommand);
    }, i * 1000);
  })(thisCommand);
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


