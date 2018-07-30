var express = require("express"); // call express to be used by the application
var app = express();
const path = require('path');
const VIEWS = path.join(__dirname, 'views');
var fs = require('fs');

var mysql = require('mysql'); // allow access to SQL

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'jade');     // allow the application to use jade templating system
app.use(express.static("scripts")); // allow the application to access the scripts folder contents to use in the application
app.use(express.static("images"));  // allow the application to access the images folder contents to use in the application
app.use(express.static("models"));  // allow the application to access the models folder contents to use in the application

var reviews = require("./models/reviews.json"); // allow the app to access the reviews.json file

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
    if(err) throw(err);
    
  res.render('products', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are on products page!");
});

// function to render the item page
app.get('/item/:id', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products WHERE Id = '+req.params.id+';';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.render('item', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are on item page!");
});

// function to render the create page
app.get('/create', function(req, res){
    
  res.render('create', {root: VIEWS});
  console.log("Now you are ready to create!");
});

// function to add data to database based on button press
app.post('/create', function(req, res){
 var name = req.body.name
 let sql = 'INSERT INTO products (Name, Price, Image, Activity) VALUES ("'+name+'", '+req.body.price+', "'+req.body.image+'", "'+req.body.activity+'");';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    console.log("The name of product is " + name);
});
 res.render('index', {root: VIEWS});
});

// function to edit data added to database based on button press and form
app.get('/edit/:id', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products WHERE Id = '+req.params.id+';';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.render('edit', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are on the edit product page!");
});

app.post('/edit/:id', function(req, res) {
  let sql = 'UPDATE products SET Name = "'+req.body.newname+'", Price = "'+req.body.newprice+'", Image = "'+req.body.newimage+'", Activity = "'+req.body.newactivity+'" WHERE Id = '+req.params.id+';'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
  })
  res.redirect("/item/" + req.params.id);
});

// function to delete data added to database based on button press and form
app.get('/delete/:id', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'DELETE FROM products WHERE Id = '+req.params.id+';';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.redirect('/products'); // use the render command so that response object renders a HTML page
      });
  console.log("Now you are delete product!");
});

// From here on is JSON data manipulation
app.get('/reviews', function(req, res) {
  res.render('reviews', {reviews:reviews}
  );
  console.log("Reviews on Show");
});

// route to render add JSON page
app.get('/add', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  res.render('add', {root: VIEWS});
  console.log("Now you are at leaving feedback!");
});

//post request to add JSON review
app.post('/add', function(req, res) {
  var count = Object.keys(reviews).length;  // Tells us how many products we have its not needed but is nice to show how we can do this
  console.log(count);
  
  // This will look for the current largest id in the reviews JSON file this is only needed if you want the reviews to have an auto ID which is a good idea 
  function getMax(reviews, id) {
    var max
    for (var i=0; i<reviews.length; i++) {
      if (!max || parseInt(reviews[i][id]) > parseInt(max[id]))
        max = reviews[id];
    }
    return max;
  }
  var maxPpg = getMax(reviews, "id"); // This calls the function above and passes the result as a variable called maxPpg.
	newId = maxPpg.id + 1;  // this creates a nwe variable called newID which is the max Id + 1
	console.log(newId); // We console log the new id for show reasons only
	
	// create a new product based on what we have in our form on the add page 
	
	var review = {
		name: req.body.name, // name called from the add.jade page textbox
		id: newId, // this is the variable created above
		content: req.body.content, // content called from the add.jade page textbox
	};
	console.log(review); // Console log the new product 
	var json  = JSON.stringify(reviews); // Convert from object to string
	
	// The following function reads the json file then pushes the data from the variable above to the reviews JSON file. 
	fs.readFile('./models/reviews.json', 'utf8', function readFileCallback(err, data){
		if (err){
      throw(err);
	 } else {
		reviews.push(review); // add the information from the above variable
		json = JSON.stringify(reviews, null , 4); // converted back to JSON the 4 spaces the json file out so when we look at it it is easily read. So it indents it. 
		fs.writeFile('./models/reviews.json', json, 'utf8'); // Write the file back
		
	}});
	res.redirect("/reviews")
});

// END JSON

// We need to set the requirements for tech application to run
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log("App is running ........ Yesssssssssss!");
});