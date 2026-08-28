import { execSync } from 'child_process';
import path from 'path';
import { GenericContainer, Wait } from 'testcontainers';

const POSTGRES_IMAGE = 'postgres:15.1';
const POSTGRES_USER = 'test';
const POSTGRES_PASSWORD = 'test';
const POSTGRES_DB = 'test';
const POSTGRES_PORT = 5432;

const API_DIR = path.resolve(__dirname);

function runMigrations(): void {
  execSync('npx prisma migrate deploy --config prisma.config.ts', {
    cwd: API_DIR,
    env: { ...process.env },
    stdio: 'inherit',
  });
}

export async function setup(): Promise<(() => Promise<void>) | void> {
  const container = await new GenericContainer(POSTGRES_IMAGE)
    .withEnvironment({
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DB,
    })
    .withExposedPorts(POSTGRES_PORT)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections', 2),
    )
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(POSTGRES_PORT);

  process.env['DB_URL'] =
    `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${port}/${POSTGRES_DB}`;

  runMigrations();

  return async () => {
    await container.stop();
  };
}
