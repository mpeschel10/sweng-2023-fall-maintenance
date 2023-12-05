-- mariadb --user=AzureDiamond --password=hunter2 -D sweng < maintenance.sql

DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(8),
    kind SET('TENANT', 'MAINTENANCE', 'MANAGER') NOT NULL,
    CONSTRAINT PRIMARY KEY (id)
);

CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255),
    phone CHAR(11),
    email VARCHAR(255),
    in_date BIGINT,
    out_date BIGINT,
    apartment VARCHAR(255),
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO users
    (username, password, kind)
VALUES
    ('mpeschel10', 'password', 'MANAGER'),
    ('jcarson99', 'password', 'MAINTENANCE'),
    ('tlindsay4421', 'password', 'TENANT'),
    ('gmarx303', 'password', 'TENANT'),
    ('znewman01', 'password', 'TENANT')
;

CREATE TABLE requests (
    id INT AUTO_INCREMENT,
    tenant INT,
    apartment VARCHAR(255),
    location VARCHAR(1027),
    description VARCHAR(4095),
    datetime BIGINT,
    photo VARCHAR(2047),
    status SET('PENDING', 'COMPLETE') DEFAULT 'PENDING' NOT NULL,
    CONSTRAINT PRIMARY KEY (id),
    CONSTRAINT FOREIGN KEY (tenant) REFERENCES users (id)
);

INSERT INTO requests
    (tenant, apartment, location, description, datetime, photo, status)
VALUES
    (1, '255a', 'Kitchen ceiling', 'Ugly stain', 1699825975, '/uploads/kitchen.png', 'PENDING'),
    (1, '12j', 'Sitting room', 'Curtains really need to be cleaned', 1699919329, '/uploads/shades.png', 'PENDING'),
    (1, '469', 'Sidewalk', 'Needs edging', 1699919420, '/uploads/sidewalk_needs_edging.png', 'COMPLETE'),
    (1, 'West building', 'Bathroom/living room', 'Hot water tap not working', 1699919426, '/uploads/hot_tap_not_working.png', 'PENDING')
;


SELECT * FROM users;
SELECT * FROM requests;
