const displayTableValues = require("./displayData.js");
require('dotenv').config();
const mysql = require('mysql');
const colors = require("colors");
const inquirer = require("inquirer");

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
    showProducts();
    connection.end();
});

function showProducts() {
    connection.query('SELECT * FROM Products', function (err, res) {
        if (err) throw err;
        console.log('----------------------------------------------------------------------------------------------------');
        console.log('_.~"~._.~"~._.~Welcome to BAMazon~._.~"~._.~"~._');
        console.log('----------------------------------------------------------------------------------------------------');
        displayTableValues(res, res.length, {
            "item_id": 0,
            "product_name": undefined,
            "price": 2
        });

        console.log(' ');
        inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "What is the ID of the product you would like to purchase?",
                validate: function (value) {
                    if (isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                type: "input",
                name: "quantity",
                message: "How much would you like to purchase?",
                validate: function (value) {
                    if (isNaN(value)) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        ]).then(ans => {
            var whatToBuy = (ans.id) - 1;
            var howMuchToBuy = parseInt(ans.quantity);
            var grandTotal = parseFloat(((res[whatToBuy].price) * howMuchToBuy).toFixed(2));
            try {
                //check if quantity is sufficient
                let availableQty=res[whatToBuy].stock_quantity;

                if (availableQty >= howMuchToBuy) {
                    //after purchase, updates quantity in Products
                    connection.query("UPDATE Products SET ? WHERE ?", [
                        { stock_quantity: (res[whatToBuy].stock_quantity - howMuchToBuy),
                          product_sales:  (res[whatToBuy].product_sales + howMuchToBuy)
                        },
                        { item_id: ans.id }
                    ], function (err, result) {
                        if (err) throw err;
                        console.log("Success! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 3-5 business days.");
                    });
                }else {
                    console.log("Sorry, there's not enough in stock!");
                }
            } catch (error) {
                displayError(error);
            } finally {
                setTimeout((ans.continue) ? main_menu : askAgain, 2000);
            }
        });
    });
}
function displayError(error) {
    console.log(error.red);
    connection.end();
}
function clearScreen() {
    process.stdout.write("\033c");
}
function askAgain() {
    inquirer.prompt([{
        type: "confirm",
        name: "reply",
        message: "Would you like to purchase another item?"
    }]).then(function (ans) {
        if (ans.reply) {
            clearScreen();
            showProducts();
        } else {
            console.log("See you soon!");
        }
    });
}