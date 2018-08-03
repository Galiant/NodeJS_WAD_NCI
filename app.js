var express = require("express"); // call express to be used by the application
var app = express();
const path = require('path');
const VIEWS = path.join(__dirname, 'views');
var fs = require('fs');
var session = require('express-session');
var mysql = require('mysql'); // allow access to SQL

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'jade');     // allow the application to use jade templating system
app.use(express.static("scripts")); // allow the application to access the scripts folder contents to use in the application
app.use(express.static("images"));  // allow the application to access the images folder contents to use in the application
app.use(express.static("models"));  // allow the application to access the models folder contents to use in the application

var reviews = require("./models/reviews.json"); // allow the app to access the reviews.json file

app.use(session({ secret: "topsecret" })); // Requird to make the session accessable throughouty the application

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
  console.log("The status of this user is " + req.session.email); // Log out the session value
});

// function to render the products page
app.get('/products', function(req, res){
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products;';
  let query = db.query(sql, (err, res1) => {
    if(err) throw(err);
    
  res.render('products', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
  console.log("The status of this user is " + req.session.email); // Log out the session value
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
  if(req.session.email == "LoggedIn") {
  // res.send("Hello cruel world!"); // This is commented out to allow the index view
  let sql = 'SELECT * FROM products WHERE Id = '+req.params.id+';';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw(err);
    
  res.render('edit', {root: VIEWS, res1}); // use the render command so that response object renders a HTML page
      });
    
  } else {
    res.render('login', {root, VIEWS});
  }
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
    var max;
    for (var i=0; i<reviews.length; i++) {
      if (!max || parseInt(reviews[i][id]) > parseInt(max[id]))
        max = reviews[i];
    }
    return max;
  }
  
  var maxPpg = getMax(reviews, "id"); // This calls the function above and passes the result as a variable called maxPpg.
	newId = maxPpg.id + 1;  // this creates a new variable called newID which is the max Id + 1
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

// Page to render edit reviews
// This function filters the reviews by looking for any review which has an Id the same as the one passed in the url
app.get('/editreviews/:id', function(req, res) {
  function chooseProd(indOne) {
    return indOne.id === parseInt(req.params.id)
  }
  console.log("id of this review is " + req.params.id);
  // declare a variable called indOne which is a filter of reviews based on the filtering function above
  var indOne = reviews.filter(chooseProd);
  // pass the filtered JSON data to the page as indOne
  res.render('editreview' , {indOne:indOne});
  console.log("Edit review page shown");
});

// Create post request to edit the individual review
app.post('/editreviews/:id', function(req, res) {
  var json = JSON.stringify(reviews);
  var keyToFind = parseInt(req.params.id); // Id passed through the url  
  var data = reviews; // declare data as the reviews json file  
  var index = data.map(function(review){review.id}).keyToFind; // use the parameter passed in the url as a pointer to find the correct review to edit
  var x = req.body.name;
  var y = req.body.content;  
  var z = parseInt(req.params.id);
  
  reviews.splice(index, 1, {name: x, content: y, id: z});
  
  json = JSON.stringify(reviews, null, 4);
  
  fs.writeFile('./models/reviews.json', json, 'utf8'); // Write the file back
  
  res.redirect("/reviews");
});

// route to delete review

app.get('/deletereviews/:id', function(req, res) {
  var json = JSON.stringify(reviews);
  var keyToFind = parseInt(req.params.id); // Id passed through the url
  var data = reviews;
  var index = data.map(function(d){d['id']}).indexOf(keyToFind);
  
  reviews.splice(index, 1);
  
  json = JSON.stringify(reviews, null, 4);
  
  fs.writeFile('./models/reviews.json', json, 'utf8'); // Write the file back
  
  res.redirect("/reviews");
  });

// END JSON

// Search function
app.post('/search', function(req, res) {
  let sql = 'SELECT * FROM products WHERE name LIKE "%'+req.body.search+'%";';
  let query = db.query(sql, (err, res1) => {
    if(err)
      throw (err);
    // res.redirect("/error")
    
    res.render('products', {root: VIEWS, res1});
    console.log("Nice search");
  })
});

// ********** Log-in / Log-out and registration functions ************
app.get('/createusertable', function(req, res) {
  let sql = 'CREATE TABLE users (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Email varchar(255), Password varchar(255));';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
  });
  res.send("Table Created.....Users available");
});

// Render register page
app.get('/register', function(req, res) {
  res.render('register', {root: VIEWS});
});

// Stick user into database
app.post('/register', function(req, res) {
  db.query('INSERT INTO users (Name, Email, Password) VALUES ("'+req.body.name+'", "'+req.body.email+'", "'+req.body.password+'")');
  
  req.session.email = "LoggedIn";
  // req.session.who = req.body.name;
  
  res.redirect('/');
});

// Render login page
app.get('/login', function(req, res) {
  res.render('login', {root: VIEWS});
});

app.post('/login', function(req, res) {
  var whichOne = req.body.name; // What does user type in the name text box
  var whichPass = req.body.password; // What does user type in the password text box
  
  let sql2 = 'SELECT name, password FROM users WHERE name = "'+req.body.name+'"';
  let query = db.query(sql2, (err, res2) => {
    if(err) throw(err);
    console.log(res2);
    
    var passx = res2[0].password;
    var passxn = res2[0].name;
    
    req.session.email = "LoggedIn"
    
    if(passx == whichPass) {
      res.redirect("/products");
      console.log("You Logged in as Password " + passx + " and username " + passxn);
    } else {
      res.redirect("login");
    }
  })
});

// Log out route
app.get('/logout', function(req, res) {
  res.render('index', {root: VIEWS});
  req.session.destroy(session.email);
})

// We need to set the requirements for tech application to run
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log("App is running ........ Yesssssssssss!");
});