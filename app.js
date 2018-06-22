var express = require("express"); // call express to be used by the application
var app = express();

const path = require('path');
const VIEWS = path.join(__dirname, 'views');

// function to set up a simple hello response

app.get('/', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  res.sendFile('index.html', {root: VIEWS});
  console.log("Now you are home!");
});


// We need to set the requirements for tech application to run
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log("App is running ........ Yesssssssssss!");
});