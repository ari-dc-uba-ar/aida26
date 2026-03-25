import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: 'aida26_user',
    host: 'localhost',
    database: 'aida26_db',
    password: 'CambiaEsta!',
    port: 5432,
});

// Test database connection on startup
// Zero tolerance: If the connection fails, the process exits immediately.
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('=========================================================');
        console.error('FATAL ERROR: DATABASE CONNECTION FAILED');
        console.error('The backend cannot function without the database.');
        console.error('Please check your credentials and ensure PostgreSQL is running.');
        console.error('Details:', err.message);
        console.error('=========================================================');
        process.exit(1); 
    }
    console.log('Successfully connected to the database.');
});

// Middleware to log requests (Zero tolerance for silent failures)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Welcome route to confirm API is running
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>🚀 SIA API is running</h1>
            <p>You are accessing the <b>Backend</b> port (3000).</p>
            <p>To see the UI/CRUD, open: <a href="http://localhost:5173">http://localhost:5173</a></p>
        </div>`);
});

/**
 * Generic CRUD helper for simple tables
 */
const setupCrud = (path: string, table: string, pkField: string) => {
    // Get all
    app.get(`/${path}`, async (req: Request, res: Response) => {
        const result = await pool.query(`SELECT * FROM ${table}`);
        res.json(result.rows);
    });

    // Delete
    app.delete(`/${path}/:id`, async (req: Request, res: Response) => {
        await pool.query(`DELETE FROM ${table} WHERE ${pkField} = $1`, [req.params.id]);
        res.sendStatus(204);
    });

    // Create
    app.post(`/${path}`, async (req: Request, res: Response) => {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    });

    // Update
    app.put(`/${path}/:id`, async (req: Request, res: Response) => {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        const query = `UPDATE ${table} SET ${setClause} WHERE ${pkField} = $${fields.length + 1} RETURNING *`;
        const result = await pool.query(query, [...values, req.params.id]);
        if (result.rowCount === 0) return res.sendStatus(404);
        res.json(result.rows[0]);
    });
};

// Setup CRUDs
setupCrud('students', 'students', 'libreta');
setupCrud('subjects', 'subjects', 'cod_mat');

// Special handling for composite PK in enrollments
app.get('/enrollments', async (req, res) => {
    const result = await pool.query(`
        SELECT e.*, s.first_name, s.last_name, m.name as subject_name 
        FROM enrollments e
        JOIN students s ON e.libreta = s.libreta
        JOIN subjects m ON e.cod_mat = m.cod_mat
    `);
    res.json(result.rows);
});

app.delete('/enrollments/:libreta/:cod_mat', async (req, res) => {
    await pool.query(
        'DELETE FROM enrollments WHERE libreta = $1 AND cod_mat = $2',
        [req.params.libreta, req.params.cod_mat]
    );
    res.sendStatus(204);
});

app.post('/enrollments', async (req, res) => {
    const { libreta, cod_mat } = req.body;
    const result = await pool.query(
        'INSERT INTO enrollments (libreta, cod_mat) VALUES ($1, $2) RETURNING *',
        [libreta, cod_mat]
    );
    res.status(201).json(result.rows[0]);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});