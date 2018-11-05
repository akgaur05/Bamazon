const displayTableValues = require("./displayData.js");
require('dotenv').config();
const colors = require("colors");
var mysql = require('mysql');
var inquirer = require('inquirer');
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

function start(){
  inquirer.prompt([{
    type: "list",
    name: "doThing",
    message: "What would you like to do?",
    choices: ["View Product Sales by Department", "Create New Department", "End Session"]
  }]).then(function(ans){
    switch(ans.doThing){
      case "View Product Sales by Department": viewProductByDept();
      break;
      case "Create New Department": createNewDept();
      break;
      case "End Session": console.log('See you soon!!!');
    }
  });
}

//view product sales by department
function viewProductByDept(){
  //prints the items for sale and their details
  connection.query('SELECT d.department_id, d.department_name, d.over_head_costs,'+"\n"+
  'COALESCE(SUM(p.product_sales), 0) AS product_sales,'+"\n"+
  'COALESCE(SUM(p.product_sales), 0) - over_head_costs AS total_profit'+"\n"+
  'FROM departments AS d'+"\n"+
  'LEFT JOIN products AS p'+"\n"+
  'ON d.department_name = p.department_name'+"\n"+
  'GROUP BY d.department_id'+"\n"+
  'ORDER BY d.department_id', function(err, res){
    if(err) throw err;
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~Product Sales by Department~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('----------------------------------------------------------------------------------------------------')
    displayTableValues(res, res.length, {
        "department_id"  : 0,
        "department_name": undefined,
        "over_head_costs" : 2,
        "product_sales"  : 2,
        "total_profit"   : 2
    });
   /*  for(var i = 0; i<res.length;i++){
      console.log("Department ID: " + res[i].department_id + " | " + "Department Name: " + res[i].department_name + " | " + "Over Head Cost: " + (res[i].over_head_costs).toFixed(2) + " | " + "Product Sales: " + (res[i].product_sales).toFixed(2) + " | " + "Total Profit: " + (res[i].total_profit).toFixed(2));
      console.log('--------------------------------------------------------------------------------------------------')
    } */
    start();
  })
}

  //create a new department
  function createNewDept(){
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~Creating New Department~~~~~~~~~~~~~~~~~~~~~~~~~');
    //prompts to add deptName and numbers. if no value is then by default = 0
    inquirer.prompt([
    {
      type: "input",
      name: "deptName",
      message: "Department Name: "
    }, {
      type: "input",
      name: "overHeadCost",
      message: "Over Head Cost: ",
      default: 0,
      validate: function(val){
        if(isNaN(val) === false){return true;}
        else{return false;}
      }
    }
    ]).then(function(ans){
      connection.query('INSERT INTO Departments SET ?',{
        department_name: ans.deptName,
        over_head_costs: ans.overHeadCost
      }, function(err, res){
        if(err) throw err;
        console.log('\n Department Added.');
      })
      start();
    });
  }
