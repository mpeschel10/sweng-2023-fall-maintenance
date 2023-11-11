-- mariadb --user=AzureDiamond --password=hunter2 -D sweng < maintenance.sql

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255),
    password VARCHAR(8),
    CONSTRAINT PRIMARY KEY (id)
);

INSERT INTO users
    (username, password)
VALUES
    ('mpeschel10', 'password'),
    ('znewman01', 'password')
;

SELECT * FROM users;
