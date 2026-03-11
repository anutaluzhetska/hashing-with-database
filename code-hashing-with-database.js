import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import pg from 'pg';

dotenv.config()

const { Pool } = pg;
const saltRounds = 10;

const pool = new Pool({
    connectionString: `${process.env.DB_URL}`,
    ssl: {
        rejectUnauthorized: false
    }
});

// Ініціалізація таблиці 
const initializeDatabase = async () => {
    console.log('Initializing kotik database...');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS kotik (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,   
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);
  `;
    try {
        await pool.query(createTableQuery);
        console.log('The kotik table is ready to go.');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        console.error('Full error:', error);
        throw error;
    }
};

// REGISTER - Реєстрація нового користувача 
async function registerUser(email, password) {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        const query = `
        INSERT INTO kotik (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, created_at`;

        const res = await pool.query(query, [email, hash]);
        console.log('User registered successfully:', res.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            console.error('Error: User with this email already exists!');
        } else {
            console.error('Registration error:', err.message);
        }
    }
}

// LOGIN -  Перевірка пароля
async function loginUser(email, password) {
    try {
        const res = await pool.query('SELECT * FROM kotik WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log('Access denied: User not found.');
            return;
        }

        const user = res.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            console.log(`Welcome, ${email}! Login successful.`);
        } else {
            console.log('Access denied: Incorrect password.');
        }
    } catch (err) {
        console.error('Login error:', err.message);
    }
}

// LIST - Перегляд усіх користувачів 
async function getAllUsers() {
    const res = await pool.query('SELECT id, email, password_hash, created_at FROM kotik ORDER BY id ASC');
    console.log('List of all registered users:');
    console.table(res.rows);
}

// DELETE - Видалення користувача за ID
async function deleteUser(id) {
    try {
        const res = await pool.query('DELETE FROM kotik WHERE id = $1 RETURNING *', [id]);
        if (res.rows.length > 0) {
            console.log(`User with ID ${id} has been removed.`);
        } else {
            console.log(`User with ID ${id} not found.`);
        }
    } catch (err) {
        console.error('Delete error:', err.message);
    }
}


const dataEntryViaTerminal = async () => {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    try {
        await initializeDatabase();

        switch (command) {
            case 'list':
                await getAllUsers();
                break;

            case 'register':
                if (args.length < 2) {
                    console.log("Usage: node room.js register <email> <password>");
                } else {
                    await registerUser(args[0], args[1]);
                }
                break;

            case 'login':
                if (args.length < 2) {
                    console.log("Usage: node room.js login <email> <password>");
                } else {
                    await loginUser(args[0], args[1]);
                }
                break;

            case 'delete':
                if (!args[0]) {
                    console.log("Error: Please specify the ID to delete.");
                } else {
                    await deleteUser(args[0]);
                }
                break;

            case 'help':
            default:
                console.log(`
                            Available commands:
list - Show all registered users
register <email> <password> - Add a new user
login <email> <password> - Authenticate user
delete <id> - Remove user by ID
help - Show this menu
                            `);
                break;

        }
    } catch (err) {
        console.log('System Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
};
dataEntryViaTerminal();
