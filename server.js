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
    const sql = "SELECT id, name as department FROM departments";
    db.query(sql, (err, rows) => {
        if (err) throw err;

        console.log("\n\nDepartments");
        console.table(rows);
        promptUser();
    });
}

function displayRoles() {
    const sql =
        `SELECT roles.id, roles.title, departments.name AS department
        FROM roles
        INNER JOIN departments ON roles.department_id = departments.id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;

        console.log("\n\nRoles");
        console.table(rows);
        promptUser();
    });
}

function displayEmployees() {
    const sql =
        `SELECT employees.id, 
                employees.first_name,
                employees.last_name,
                departments.name AS department,
                roles.title,
                roles.salary,
                CONCAT (manager.first_name, " ", manager.last_name) AS manager 
        FROM employees
            LEFT JOIN roles ON employees.role_id = roles.id
            LEFT JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees manager ON employees.manager_id = manager.id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;

        console.log("\n\nEmployees");
        console.table(rows);
        promptUser();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'deptName',
            message: "Enter new department name: ",
            validate: deptName => {
                if (!deptName) {
                    // TODO: check against existing depts
                    console.log('Please enter a valid department name');
                    return false;
                } else {
                    return true;
                }
            }
        }
    ])
        .then(answer => {
            const sql = `INSERT INTO departments (name)
                      VALUES ('${answer.deptName}')`;
            db.query(sql, (err, result) => {
                if (err || !result) throw err;

                console.log(`\nSuccessfully added ${answer.deptName}!`);
                displayDepartments();
            });
        });
}