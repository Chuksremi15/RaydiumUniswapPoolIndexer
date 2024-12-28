import pkg from "pg";

const { Client } = pkg;

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

console.log("dbConfig", dbConfig);
// Create a reusable connection function
const client = new Client(dbConfig);

const connectToDatabase = async () => {
  try {
    if (!client._connected) {
      await client.connect();
      console.log("Connected to PostgreSQL!");
    }
  } catch (err) {
    console.error("Connection error", err.stack);
  }
};

// Export the client and the connection function
export { client, connectToDatabase };
