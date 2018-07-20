var express = require("express"); // call express to be used by the application
var app = express();
const path = require('path');
const VIEWS = path.join(__dirname, 'views');

var mysql = require('mysql'); // allow access to SQL

app.set('view engine', 'jade');     // allow the application to use jade templating system
app.use(express.static("scripts")); // allow the application to access the scripts folder contents to use in the application
app.use(express.static("images"));  // allow the application to access the images folder contents to use in the application

// function to set up a simple hello response

const db = mysql.createConnection({
  host: 'den1.mysql4.gear.host',
  user: 'wadncid',
  password: 'Antonijo234@',
  database: 'wadncid'
});

db.connect((err) => {
  if(err) {
    console.log("Connection Refused.....Please check login details!");
    // throw(err);
  } else {
    console.log("Well done. You are connected.....");
  }
});

// Create a Database Table
app.get('/createtable', function(req, res) {
  let sql = 'CREATE TABLE products(Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Price int, Image varchar(255), Activity varchar(255));';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
  });
  res.send("Table Created.....");
});
// End create table

// SQL Insert Data Example
app.get('/insert', function(req, res) {
  let sql = 'INSERT INTO products (Name, Price, Image, Activity) VALUES ("Polar M400", 199, "polarM400.png", "Running");';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
  });
  res.send("Item Created.....");
});
// End SQL Insert Data Example

// SQL QUERY Just for show Example
app.get('/queryme', function(req, res) {
  let sql = 'SELECT * FROM products;';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
  });
  res.send("Look in the console.....");
});
// SQL QUERY Just for show Example

// function to render the home page
app.get('/', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  res.render('index', {root: VIEWS});
  console.log("Now you are at home page!");
});

// function to render the products page
app.get('/products', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products;';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.render('products', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are on products page!");
});

// function to render the item page
app.get('/item/:id', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products WHERE Id = "'+req.params.id+'";';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.render('item', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are on item page!");
});



// We need to set the requirements for tech application to run
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log("App is running ........ Yesssssssssss!");
});