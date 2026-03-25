-- Database schema for Faculty Management System

CREATE TABLE students (
    libreta VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE
);

CREATE TABLE subjects (
    cod_mat VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(100)
);

CREATE TABLE enrollments (
    libreta VARCHAR(20) REFERENCES students(libreta),
    cod_mat VARCHAR(10) REFERENCES subjects(cod_mat),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    final_grade DECIMAL(4, 2),
    PRIMARY KEY (libreta, cod_mat)
);

-- Initial seed data
INSERT INTO subjects (cod_mat, name, department) VALUES ('62.01', 'Análisis Matemático I', 'Matemática');
INSERT INTO subjects (cod_mat, name, department) VALUES ('75.01', 'Computación', 'Computación');
INSERT INTO students (libreta, first_name, last_name, email) VALUES ('123/24', 'Alan', 'Turing', 'turing@exactas.uba.ar');
INSERT INTO enrollments (libreta, cod_mat) VALUES ('123/24', '75.01');

-- Grant permissions to both owner and user for full operation
GRANT ALL ON ALL TABLES IN SCHEMA public TO aida26_user;