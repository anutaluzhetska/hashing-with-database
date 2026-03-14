# User registration and login system in the console based on Node.js and PostgreSQL.

## How to run

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add your `DB_URL`.
   `DB_URL=your_database_link`
4. Commands:
- `node room.js register mail@test.com pass123` — registration
- `node room.js login mail@test.com pass123` — login
- `node room.js list` — list of all cats (users)
- `node room.js update mail@test.com new_pass` — update password
- `node room.js delete mail@test.com` — delete
- `node room.js help` — all commands
