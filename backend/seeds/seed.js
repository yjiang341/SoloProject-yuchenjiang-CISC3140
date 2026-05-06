const { Client } = require('pg');

console.log(Client);

const client = new Client(
{
  user: 'postgres',
  host: 'localhost',
  database: 'my_database',
  password: 'password',
  port: 5432,
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to the database');

    await client.query(`
      DROP TABLE IF EXISTS students;
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        email VARCHAR(50) NOT NULL,
        GPA DECIMAL(3, 2),
        age INT(3)
      );
    `);

    await client.query(`
      INSERT INTO students (name, email, GPA, age) 
      VALUES
      ('Alice', 'alice@example.com', 3.5, 20),
      ('Bob', 'bob@example.com', 3.8, 22);
    `);
      
    console.log('Tables created');
    await client.end();
  } catch (err) {
    console.error('Error executing query', err.stack);
    await client.end();
  }
}

seed();