// test-workers.mjs
// Ejecutar con: node test-workers.mjs

const BASE_URL = "https://monorepo.nimbux.cloud/api/workers";
const TOTAL    = 200;

// ─── helpers ──────────────────────────────────────────────────────────────────

const tally = (results) => {
  const counts = {};
  for (const r of results) {
    if (!r) continue;
    const key = r.worker ?? "error";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

const printTally = (counts) => {
  for (const [worker, n] of Object.entries(counts)) {
    const bar = "█".repeat(Math.round(n / 2));
    console.log(`  ${worker.padEnd(30)} ${String(n).padStart(4)} req  ${bar}`);
  }
};

// ─── ping ─────────────────────────────────────────────────────────────────────

console.log(`\n📡 PING  — ${TOTAL} peticiones a ${BASE_URL}/ping`);
console.log("─".repeat(60));

const pingResults = await Promise.all(
  Array.from({ length: TOTAL }, () =>
    fetch(`${BASE_URL}/ping`)
      .then((r) => r.json())
      .catch(() => null)
  )
);

printTally(tally(pingResults));
console.log("✓ Ping done\n");

// ─── stress ───────────────────────────────────────────────────────────────────

const STRESS_TOTAL = 20;
console.log(`🔥 STRESS — ${STRESS_TOTAL} peticiones a ${BASE_URL}/stress`);
console.log("─".repeat(60));

const stressResults = await Promise.all(
  Array.from({ length: STRESS_TOTAL }, () =>
    fetch(`${BASE_URL}/stress`)
      .then((r) => r.json())
      .catch(() => null)
  )
);

printTally(tally(stressResults));

const times = stressResults
  .filter(Boolean)
  .map((r) => parseInt(r.elapsed));
const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
console.log(`  Tiempo promedio por tarea: ${avg}ms`);
console.log("✓ Stress done\n");

// ─── scale stress ─────────────────────────────────────────────────────────────
// Supera el threshold del scaler: conex/worker > 50 o req/min > 20
// El scaler revisa cada 30s — puede tardar hasta 30s en reaccionar

const CONCURRENCIA = 60;
const DURACION_MS  = 2 * 60 * 1000; // 2 minutos

console.log(`🚀 SCALE STRESS — rafagas continuas por ${DURACION_MS / 60000} minutos`);
console.log(`   Concurrencia : ${CONCURRENCIA} peticiones simultáneas`);
console.log(`   Objetivo      : forzar scale up en los logs del scaler`);
console.log(`   Tip           : corre "pm2 logs" en otra terminal para verlo`);
console.log("─".repeat(60));

const scaleStart = Date.now();
let totalReqs    = 0;
let rafaga       = 0;

while (Date.now() - scaleStart < DURACION_MS) {
  const batch = await Promise.all(
    Array.from({ length: CONCURRENCIA }, () =>
      fetch(`${BASE_URL}/stress`).then(r => r.json()).catch(() => null)
    )
  );
  totalReqs += CONCURRENCIA;
  rafaga++;

  const workers  = tally(batch);
  const elapsed  = Math.round((Date.now() - scaleStart) / 1000);
  const workerList = Object.keys(workers).join(", ") || "—";
  process.stdout.write(`\r  [${elapsed}s] rafaga #${rafaga} | total: ${totalReqs} reqs | workers activos: ${workerList}   `);
}

console.log(`\n\n  Total enviado : ${totalReqs} peticiones`);
console.log(`  Duración      : ${Math.round((Date.now() - scaleStart) / 1000)}s`);
console.log("✓ Scale stress done\n");
