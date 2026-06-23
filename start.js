/**
 * TalentMesh AI — Master Startup Script
 * Usage: node start.js
 *
 * Handles everything in order:
 *  1. Start Docker (Postgres + Redis)
 *  2. Wait for Postgres to be ready
 *  3. Push Prisma schema (non-destructive)
 *  4. Seed DB if empty
 *  5. Start Backend (NestJS on :3001)
 *  6. Start Frontend (Next.js on :3000)
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'backend');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = colors.cyan) {
  console.log(`${color}${colors.bold}[TalentMesh]${colors.reset} ${msg}`);
}

function run(cmd, cwd = ROOT, { silent = false } = {}) {
  try {
    log(`Running: ${cmd}`, colors.yellow);
    execSync(cmd, { cwd, stdio: silent ? 'pipe' : 'inherit', shell: true });
    return true;
  } catch (err) {
    return false;
  }
}

function waitForPostgres(maxRetries = 20, delayMs = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      log(`Waiting for Postgres... (attempt ${attempts}/${maxRetries})`, colors.yellow);
      const ok = run(
        'npx prisma db execute --stdin --schema=prisma/schema.prisma <<< ""',
        BACKEND,
        { silent: true }
      ) || run(
        'npx prisma db execute --file /dev/null 2>nul || exit 0',
        BACKEND,
        { silent: true }
      );
      // Simpler: try a raw pg_isready via docker exec
      const ready = run('docker exec talentmesh-postgres pg_isready -U postgres', ROOT, { silent: true });
      if (ready) {
        log('✅ Postgres is ready!', colors.green);
        resolve();
      } else if (attempts >= maxRetries) {
        reject(new Error('Postgres did not become ready in time.'));
      } else {
        setTimeout(check, delayMs);
      }
    };
    check();
  });
}

function spawnProcess(name, cmd, cwd, color) {
  const [bin, ...args] = cmd.split(' ');
  const proc = spawn(bin, args, { cwd, shell: true, stdio: 'pipe' });
  proc.stdout.on('data', (d) => process.stdout.write(`${color}[${name}]${colors.reset} ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`${colors.red}[${name}]${colors.reset} ${d}`));
  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`${name} exited with code ${code}`, colors.red);
    }
  });
  return proc;
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}
  ████████╗ █████╗ ██╗     ███████╗███╗   ██╗████████╗███╗   ███╗███████╗███████╗██╗  ██╗
  ╚══██╔══╝██╔══██╗██║     ██╔════╝████╗  ██║╚══██╔══╝████╗ ████║██╔════╝██╔════╝██║  ██║
     ██║   ███████║██║     █████╗  ██╔██╗ ██║   ██║   ██╔████╔██║█████╗  ███████╗███████║
     ██║   ██╔══██║██║     ██╔══╝  ██║╚██╗██║   ██║   ██║╚██╔╝██║██╔══╝  ╚════██║██╔══██║
     ██║   ██║  ██║███████╗███████╗██║ ╚████║   ██║   ██║ ╚═╝ ██║███████╗███████║██║  ██║
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
  ${colors.reset}`);

  log('🚀 Starting TalentMesh AI Platform...', colors.green);

  // ── Step 1: Start Docker ─────────────────────────────────────────
  log('Step 1/5 — Starting Docker containers (Postgres + Redis)...', colors.cyan);
  const dockerOk = run('docker-compose up -d', ROOT);
  if (!dockerOk) {
    log('⚠️  docker-compose failed. If Docker is already running, continuing...', colors.yellow);
  }

  // ── Step 2: Wait for Postgres ────────────────────────────────────
  log('Step 2/5 — Waiting for Postgres to be ready...', colors.cyan);
  try {
    await waitForPostgres(20, 2000);
  } catch (err) {
    log(`❌ ${err.message}`, colors.red);
    log('Make sure Docker Desktop is running and try again.', colors.red);
    process.exit(1);
  }

  // ── Step 3: Push Prisma Schema ───────────────────────────────────
  log('Step 3/5 — Syncing Prisma schema to database...', colors.cyan);
  const schemaOk = run('npx prisma db push --accept-data-loss', BACKEND);
  if (!schemaOk) {
    log('❌ Prisma schema push failed. Check your DATABASE_URL in backend/.env', colors.red);
    process.exit(1);
  }

  // ── Step 4: Seed Database (idempotent — skips if data exists) ────
  log('Step 4/5 — Seeding database (skips if already seeded)...', colors.cyan);
  run('npm run db:seed', BACKEND);

  // ── Step 4.5: Build Backend ──────────────────────────────────────
  log('Step 4.5 — Compiling Backend production build...', colors.cyan);
  run('npm run build', BACKEND);

  // ── Step 5: Start Servers ────────────────────────────────────────
  log('Step 5/5 — Starting Backend (port 3001) and Frontend (port 3000)...', colors.cyan);

  const backend = spawnProcess('Backend', 'node dist/main.js', BACKEND, colors.yellow);
  const frontend = spawnProcess('Frontend', 'npm run dev', ROOT, colors.green);

  // Graceful shutdown
  const shutdown = () => {
    log('Shutting down...', colors.red);
    backend.kill();
    frontend.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  log('\n✅ All services started!', colors.green);
  log('   Frontend  → http://localhost:3000', colors.green);
  log('   Backend   → http://localhost:3001', colors.green);
  log('   Swagger   → http://localhost:3001/api/docs\n', colors.green);
  log('Press Ctrl+C to stop all services.\n', colors.yellow);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
