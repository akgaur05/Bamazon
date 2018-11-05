const displayTableValues = require("./displayData.js");
require('dotenv').config();
var mysql = require('mysql');
var inquirer = require('inquirer');
const colors = require("colors");

//create connection to db
var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.port,
    user: process.env.user,
    password: process.env.password,
    database: "bamazon"
});
connection.connect(function (error) {
    try {
        if (error) throw "Error: Connection to bamazon_db failed.\n";
    } catch (error) {
        displayError(error);
    }
    console.log("connected as id " + connection.threadId);
    start();
});

function start() {
    inquirer.prompt([{
        type: "list",
        name: "doThing",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "End Session"]
    }]).then(function (ans) {
        switch (ans.doThing) {
            case "View Products for Sale": viewProducts();
                break;
            case "View Low Inventory": viewLowInventory();
                break;
            case "Add to Inventory": addToInventory();
                break;
            case "Add New Product": addNewProduct();
                break;
            case "End Session": console.log('SEE YOU SOON!!!!');
        }
    });
}

function viewProducts() {
    clearScreen();
    console.log('~~~~~~~~~~~~~~~~ Viewing Products ~~~~~~~~~~~~~~~~');
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        console.log('----------------------------------------------------------------------------------------------------');
        displayTableValues(res, res.length, {
            "item_id": 0,
            "product_name": undefined,
            "price": 2
        });
        console.log('----------------------------------------------------------------------------------------------------');
        start();
    });
}

// I have changed the requirement here!!! I have tried to find out the items that have lowest quantity and displaying only 1 result.
function viewLowInventory() {
        clearScreen();
        let flag=0;
        connection.query('SELECT  item_id,product_name,price FROM products order by stock_quantity LIMIT 1', function (err, res) {
        if (err) throw err;
        console.log("----------------------------------------------------------------------------------------------------");
        for (var i = 0; i < res.length; i++) {
                flag=1;
                console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].product_name + " | " + "Price: " + res[i].price);
        }
        if(!flag){
            console.log("No low Inventory found!!");
        }
        console.log("----------------------------------------------------------------------------------------------------");
        start();
    });
}

function addToInventory(){
    clearScreen();
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Adding to Inventory~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    connection.query('SELECT * FROM Products', function(err, res){
    if(err) throw err;
    var itemArray = [];
    //pushes each item into an itemArray
    for(var i=0; i<res.length; i++){
      itemArray.push(res[i].product_name);
    }
  
    inquirer.prompt([{
      type: "list",
      name: "product",
      choices: itemArray,
      message: "Which item would you like to add inventory?"
    }, {
      type: "input",
      name: "qty",
      message: "How much would you like to add?",
      validate: function(value){
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
      }]).then(function(ans){
        var currentQty;
        for(var i=0; i<res.length; i++){
          if(res[i].product_name === ans.product){
            currentQty = res[i].stock_quantity;
          }
        }
        connection.query('UPDATE Products SET ? WHERE ?', [
          {stock_quantity: currentQty + parseInt(ans.qty)},
          {product_name: ans.product}
          ], function(err, res){
            if(err) throw err;
            console.log('The quantity was updated.');
            start();
          });
        })
    });
}

function addNewProduct(){
    clearScreen();
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Adding New Product~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        var deptNames = [];
      
        //grab name of departments
       connection.query('SELECT DISTINCT(department_name) FROM products', function(err, res){
          if(err) throw err;
          for(var i = 0; i<res.length; i++){
            deptNames.push(res[i].department_name);
          }
        }) 
      
        inquirer.prompt([{
          type: "input",
          name: "product",
          message: "Product: ",
          validate: function(value){
            if(value){return true;}
            else{return false;}
          }
        }, {
          type: "list",
          name: "department",
          message: "Department: ",
          choices: deptNames
        }, {
          type: "input",
          name: "price",
          message: "Price: ",
          validate: function(value){
            if(isNaN(value) === false){return true;}
            else{return false;}
          }
        }, {
          type: "input",
          name: "quantity",
          message: "Quantity: ",
          validate: function(value){
            if(isNaN(value) == false){return true;}
            else{return false;}
          }
        }]).then(function(ans){
          connection.query('INSERT INTO Products SET ?',{
            product_name: ans.product,
            department_name: ans.department,
            price: ans.price,
            stock_quantity: ans.quantity
          }, function(err, res){
            if(err) throw err;
            console.log('\n Another item was added to the store.');
          })
          start();
        });
      }

function displayError(error) {
    console.log(error.red);
    connection.end();
}
function clearScreen() {
    process.stdout.write("\033c");
}