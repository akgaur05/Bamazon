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
    console.log('~~~~~~~~~~~~~~~~ Viewing Products ~~~~~~~~~~~~~~~~');
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        console.log('----------------------------------------------------------------------------------------------------');
        displayTableValues(res, 10, {
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

}

function addNewProduct(){

}


function displayError(error) {
    console.log(error.red);
    connection.end();
}
function clearScreen() {
    process.stdout.write("\033c");
}