import inquirer from 'inquirer';
import mysql from 'mysql2';

const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'employee_db',
    },
    console.log("Connected to the employee_db database")
);

db.connect(err => {
    if (err) throw err;
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
                case "Quit":
                    console.log("Goodbye!");
                    db.end()
                    break;
            }
        });
};

function displayDepartments() {
    const query = "SELECT id as id, name as department FROM departments";
    db.query(query, (err, rows) => {
        if (err) throw err;

        console.log("\nDepartments");
        console.table(rows);
        promptUser();
    });
}