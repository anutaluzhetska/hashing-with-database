# User registration and login system in the console based on Node.js and PostgreSQL.

## How to run

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add your `DB_URL`.
4. Commands:
- `node room.js register test@mail.com password123` — registration
- `node room.js login test@mail.com password123` — login
- `node room.js list` — list of all cats (users)
