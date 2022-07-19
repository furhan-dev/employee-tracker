INSERT INTO departments (name)
VALUES ("Sales"),
    ("HR"),
    ("Finance");

INSERT INTO roles (title, salary, department_id)
VALUES ("Manager", 200000, 1),
    ("Salesperson", 100000, 1),
    ("Accountant", 150000, 3),
    ("HR Rep", 85000, 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Michael", "Scott", 1, NULL),
    ("Dwight", "Schrute", 2, 1),
    ("Jim", "Halpert", 2, 1),
    ("Toby", "Flenderson", 4, NULL),
    ("Kevin", "Malone", 3, 1);
