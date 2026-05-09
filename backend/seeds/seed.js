const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const SUPABASE_MANAGEMENT_BASE_URL = 'https://api.supabase.com/v1';

function getProjectRef() {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    const hostname = new URL(supabaseUrl).hostname;
    return hostname.split('.')[0] || null;
  } catch {
    return null;
  }
}

function getSeedSqlFiles(seedDir) {
  return fs
    .readdir(seedDir)
    .then((entries) =>
      entries
        .filter((name) => /^\d+.*\.sql$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    );
}

function getAuthConfig() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = getProjectRef();

  if (!accessToken || !projectRef) {
    throw new Error(
      [
        'Missing Supabase Management API credentials for seeding.',
        'Required env vars in backend/.env:',
        '- SUPABASE_ACCESS_TOKEN=<your personal access token from Supabase dashboard>',
        '- SUPABASE_PROJECT_REF=<your project ref> (optional if SUPABASE_URL is set)',
        '',
        'Why: this script runs SQL through Supabase Management API, not a Postgres connection string.',
      ].join('\n')
    );
  }

  return { accessToken, projectRef };
}

async function runSqlFileWithSupabaseApi({ accessToken, projectRef }, filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  const fileName = path.basename(filePath);

  if (!sql.trim()) {
    console.log(`Skipping empty file: ${fileName}`);
    return;
  }

  console.log(`Running ${fileName}...`);

  const response = await fetch(`${SUPABASE_MANAGEMENT_BASE_URL}/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql, read_only: false }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed on ${fileName} (${response.status} ${response.statusText}): ${errorText}`);
  }

  console.log(`Done: ${fileName}`);
}

async function seed() {
  const seedDir = __dirname;

  try {
    const auth = getAuthConfig();
    const sqlFiles = await getSeedSqlFiles(seedDir);

    if (sqlFiles.length === 0) {
      console.log('No .sql seed files found.');
      return;
    }

    console.log(`Using Supabase project: ${auth.projectRef}`);

    for (const fileName of sqlFiles) {
      const filePath = path.join(seedDir, fileName);
      await runSqlFileWithSupabaseApi(auth, filePath);
    }

    console.log('Seed complete. All SQL files executed successfully.');
  } catch (error) {
    const details = error?.stack || error?.message || JSON.stringify(error, null, 2) || String(error);
    console.error('Seed failed:');
    console.error(details);
    process.exitCode = 1;
  }
}

seed();
