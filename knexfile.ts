import * as dotenv from 'dotenv';

dotenv.config();

export default {
  client: 'pg',
  connection: process.env['DB_URL'],
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'migrations',
    extension: 'ts',
    loadExtensions: ['.ts'],
    directory: './migrations',
  },
};
