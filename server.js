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
            message: 'Please select an option',
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
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'dept',
                message: "Enter new department name: ",
                validate: dept => {
                    if (!dept) {
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
                      VALUES ('${answer.dept}')`;
            db.query(sql, (err, result) => {
                if (err || !result) throw err;

                console.log(`\nSuccessfully added ${answer.dept}!`);
                displayDepartments();
            });
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: "Enter new role name: ",
                validate: title => {
                    if (!title) {
                        // TODO: check against existing roles
                        console.log('Please enter a valid role name');
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: "Enter the salary for the new role: ",
                validate: salary => {
                    if (!salary || isNaN(salary)) {
                        console.log('Please enter a valid salary');
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'list',
                name: 'dept',
                message: "Which department does this role belong to?: ",
                choices: getDeptList
            }
        ])
        .then(async answer => {
            const params = [answer.title, answer.salary, await getDeptId(answer.dept)];
            const sql = `INSERT INTO roles (title, salary, department_id)
                    VALUES (?, ?, ?)`;
            db.query(sql, params, (err, result) => {
                if (err || !result) throw err;

                console.log(`\nSuccessfully added ${answer.title}!`);
                displayRoles();
            });
        });
}

function addEmployee() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "Enter employee's first name: ",
            },
            {
                type: 'input',
                name: 'lastName',
                message: "Enter employees last name: ",
            },
            {
                type: 'list',
                name: 'role',
                message: "Select the employee's role: ",
                choices: getRoleList
            },
            {
                type: 'list',
                name: 'manager',
                message: "Select the employee's manager: ",
                choices: getManagerList
            }
        ])
        .then(async answer => {
            const params = [answer.firstName, answer.lastName, await getRoleId(answer.role), await getEmployeeId(answer.manager)];
            console.log(params);
            const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;
            db.query(sql, params, (err, result) => {
                if (err || !result) throw err;

                console.log(`\nSuccessfully added ${answer.first_name} ${answer.last_name}!`);
                displayEmployees();
            });
        });
}

function updateEmployeeRole() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Select the employee to modify: ",
                choices: getEmployeeList
            },
            {
                type: 'list',
                name: 'role',
                message: "Select the employee's new role: ",
                choices: getRoleList
            },
        ])
        .then(async answer => {
            const sql = `UPDATE employees SET employees.role_id = ${await getRoleId(answer.role)}
                        WHERE employees.id =  ${await getEmployeeId(answer.employee)}`;
            db.query(sql, (err, result) => {
                if (err || !result) throw err;

                console.log(`\nSuccessfully updated ${answer.first_name} ${answer.last_name}!`);
                displayEmployees();
            });
        });
}

function getDeptList() {
    const sql = "SELECT departments.name as department FROM departments";
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.department));
        });
    });
}

function getDeptId(name) {
    const sql = `SELECT id
                FROM departments
                WHERE departments.name = '${name}'`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err || !rows) reject(err);
            console.log(rows[0].id);
            resolve(rows[0].id);
        });
    });
}

function getRoleList() {
    const sql = "SELECT title FROM roles";
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.title));
        });
    });
}

function getRoleId(title) {
    const sql = `SELECT id
                FROM roles
                WHERE roles.title= '${title}'`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err || !rows) reject(err);
            console.log(rows[0].id);
            resolve(rows[0].id);
        });
    });
}

function getManagerList() {
    const sql = "SELECT first_name, last_name FROM employees WHERE role_id=1";
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.first_name + " " + row.last_name));
        });
    });
}

function getEmployeeList() {
    const sql = "SELECT first_name, last_name FROM employees";
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.first_name + " " + row.last_name));
        });
    });
}

function getEmployeeId(fullname) {
    const splitName = fullname.split(' ');
    const sql = `SELECT id
                FROM employees
                WHERE employees.first_name = '${splitName[0]}'
                    AND employees.last_name = '${splitName[1]}'`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err || !rows) reject(err);
            console.log(rows[0].id);
            resolve(rows[0].id);
        });
    });
}