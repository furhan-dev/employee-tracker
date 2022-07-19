const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table');

mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'employee_db',
    },
    console.log("Connected to the employee_db database")
);

connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    promptUser()
});

function promptUser() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choices',
            message: 'Please select an option?',
            choices: ['View all departments',
                'View all roles',
                'View all employees',
                'Add department',
                'Add role',
                'Add employee',
                'Update employee role',
                'Quit']
        }
    ])
        .then((answers) => {
            const { choices } = answers;

            switch (choices) {
                case "View all departments":
                    displayDepartments();
                    break;
                case "View all roles":
                    displayRoles();
                    break;
                case "View all employees":
                    displayEmployees();
                    break;
                case "Add department":
                    addDepartment();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Update employee role":
                    updateEmployeeRole();
                    break;
                case "Update employee role":
                    connection.end()
                    break;
            }
        });
};