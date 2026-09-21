// scaler.cjs — colocar en /backend junto a ecosystem.config.cjs
// Autoscaling basado en 3 indicadores: CPU (PM2) + Event Loop Lag + Under Pressure
// Cooldown de 60s entre operaciones de scaling para evitar conflictos

'use strict';

const pm2          = require('pm2');
const os           = require('os');
const http         = require('http');

// ─── configuración ────────────────────────────────────────────────────────────
const CONFIG = {
  // instancias
  MIN_INSTANCES       : 1,
  MAX_INSTANCES       : os.cpus().length,

  // cooldown entre cualquier operación de scaling (subir o bajar)
  SCALE_COOLDOWN_MS   : 60 * 1000,

  // intervalo de chequeo del scaler
  CHECK_INTERVAL_MS   : 30 * 1000,

  // ── indicador 1: CPU via PM2 ────────────────────────────────────────────────
  CPU_SCALE_UP        : 40,   // % cpu promedio para escalar arriba
  CPU_SCALE_DOWN      : 10,   // % cpu promedio para escalar abajo

  // ── indicador 2: Event Loop Lag (via /internal/health) ─────────────────────
  LAG_SCALE_UP_MS     : 50,  // ms de lag promedio para escalar arriba
  LAG_SCALE_DOWN_MS   : 50,   // ms de lag promedio para escalar abajo

  // ── indicador 3: Under Pressure (via /internal/pressure) ───────────────────
  // Si cualquier worker responde 503 en /internal/pressure → escalar arriba
  PRESSURE_ENABLED    : true,

  // RAM mínima para permitir scale up
  MIN_FREE_RAM_MB     : 1024,

  // Idle timeout para scale down (solo aplica si CPU y lag están bajos)
  IDLE_TIMEOUT_MS     : 5 * 60 * 1000,

  // Puerto del backend
  BACKEND_PORT        : 4000,
};

const SERVICE = { name: 'backend', port: CONFIG.BACKEND_PORT };

// ─── estado interno ───────────────────────────────────────────────────────────
let lastScaleTime     = 0;      // timestamp del último scaling ejecutado
let scalingInProgress = false;
let lastActivity      = Date.now();

// ─── utilidades ───────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toLocaleTimeString('es-ES');
  console.log(`[${ts}] [scaler     ] ${msg}`);
}

function getFreeRamMB() {
  return Math.floor(os.freemem() / 1024 / 1024);
}

function getProcessList() {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => err ? reject(err) : resolve(list));
  });
}

function scaleService(name, targetInstances) {
  return new Promise((resolve, reject) => {
    pm2.scale(name, targetInstances, (err) => err ? reject(err) : resolve());
  });
}

function cooldownRestante() {
  return Math.max(0, CONFIG.SCALE_COOLDOWN_MS - (Date.now() - lastScaleTime));
}

// ─── consulta métricas de cada worker ────────────────────────────────────────
// Llama a /internal/health y /internal/pressure en cada worker
// Los workers en cluster comparten el puerto, PM2 hace round-robin,
// así que llamamos N veces para intentar alcanzar cada uno.

async function fetchWorkerMetrics(workerCount) {
  const base    = `http://localhost:${CONFIG.BACKEND_PORT}`;
  const samples = workerCount * 2; // más muestras para mayor cobertura

  const healthResults = await Promise.all(
    Array.from({ length: samples }, () =>
      fetch(`${base}/internal/health`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )
  );

  let pressureTriggered = false;
  if (CONFIG.PRESSURE_ENABLED) {
    const pressureResults = await Promise.all(
      Array.from({ length: samples }, () =>
        fetch(`${base}/internal/pressure`)
          .then(r => ({ status: r.status }))
          .catch(() => ({ status: 0 }))
      )
    );
    pressureTriggered = pressureResults.some(r => r.status === 503);
  }

  const valid  = healthResults.filter(Boolean);
  const avgLag = valid.length
    ? valid.reduce((a, b) => a + b.lagMs, 0) / valid.length
    : 0;
  const maxLag = valid.length ? Math.max(...valid.map(r => r.lagMs)) : 0;

  return { avgLag, maxLag, pressureTriggered, samples: valid.length };
}

// ─── lógica principal ─────────────────────────────────────────────────────────

async function evaluateBackend(processList) {
  const workers = processList.filter(
    p => p.name === SERVICE.name && p.pm2_env?.status === 'online'
  );

  if (workers.length === 0) { log('⚠  no hay workers online'); return; }
  if (scalingInProgress)    { log('⏳ scaling en progreso, saltando ciclo'); return; }

  const currentInstances = workers.length;
  const freeRamMB        = getFreeRamMB();

  // ── indicador 1: CPU via PM2 ─────────────────────────────────────────────
  const cpus   = workers.map(w => w.monit?.cpu ?? 0);
  const avgCpu = cpus.reduce((a, b) => a + b, 0) / cpus.length;
  const maxCpu = Math.max(...cpus);

  // ── indicadores 2 y 3: lag + under pressure ──────────────────────────────
  const { avgLag, maxLag, pressureTriggered, samples } =
    await fetchWorkerMetrics(currentInstances);

  // Actividad para idle tracking
  if (avgCpu > 5 || avgLag > 30) lastActivity = Date.now();

  const idleMs      = Date.now() - lastActivity;
  const idleMinutes = Math.floor(idleMs / 60000);
  const cooldownSeg = Math.ceil(cooldownRestante() / 1000);

  log(
    `workers: ${currentInstances}/${CONFIG.MAX_INSTANCES} | ` +
    `cpu avg: ${avgCpu.toFixed(1)}% max: ${maxCpu.toFixed(1)}% | ` +
    `lag avg: ${avgLag.toFixed(1)}ms max: ${maxLag.toFixed(1)}ms | ` +
    `pressure: ${pressureTriggered ? '🔴 SI' : '🟢 no'} | ` +
    `idle: ${idleMinutes}m | RAM: ${freeRamMB}MB` +
    (cooldownSeg > 0 ? ` | cooldown: ${cooldownSeg}s` : '')
  );

  // ── cooldown global — ningún indicador puede escalar si está activo ───────
  if (cooldownRestante() > 0) return;

  // ═══ SCALE UP ═════════════════════════════════════════════════════════════
  //  Sube si CUALQUIERA de los tres indicadores supera su umbral

  const cpuAlta      = avgCpu > CONFIG.CPU_SCALE_UP;
  const lagAlto      = avgLag > CONFIG.LAG_SCALE_UP_MS;
  const bajoPression = pressureTriggered;
  const debeSubir    = (cpuAlta || lagAlto || bajoPression)
                       && currentInstances < CONFIG.MAX_INSTANCES;

  if (debeSubir) {
    if (freeRamMB < CONFIG.MIN_FREE_RAM_MB) {
      log(`⚠  carga alta pero RAM insuficiente (${freeRamMB}MB libre)`); return;
    }

    const razones = [
      cpuAlta      && `cpu ${avgCpu.toFixed(1)}%>${CONFIG.CPU_SCALE_UP}%`,
      lagAlto      && `lag ${avgLag.toFixed(1)}ms>${CONFIG.LAG_SCALE_UP_MS}ms`,
      bajoPression && `under-pressure 503`,
    ].filter(Boolean).join(', ');

    const newCount = Math.min(currentInstances + 1, CONFIG.MAX_INSTANCES);
    log(`↑ escalando: ${currentInstances} → ${newCount} workers [${razones}]`);

    scalingInProgress = true;
    try {
      await scaleService(SERVICE.name, newCount);
      lastScaleTime = Date.now(); // iniciar cooldown
      log(`✓ ahora con ${newCount} workers | cooldown 60s activado`);
    } catch (err) {
      log(`✗ error al escalar arriba: ${err.message}`);
    } finally {
      scalingInProgress = false;
    }
    return;
  }

  // ═══ SCALE DOWN ═══════════════════════════════════════════════════════════
  //  Baja solo si LOS TRES indicadores están tranquilos + idle timeout

  const cpuBaja   = avgCpu < CONFIG.CPU_SCALE_DOWN;
  const lagBajo   = avgLag < CONFIG.LAG_SCALE_DOWN_MS;
  const sinPresion = !pressureTriggered;
  const idleOk    = idleMs > CONFIG.IDLE_TIMEOUT_MS;
  const tieneExtras = currentInstances > CONFIG.MIN_INSTANCES;

  const debeBajar = cpuBaja && lagBajo && sinPresion && idleOk && tieneExtras;

  if (debeBajar) {
    const newCount = Math.max(currentInstances - 1, CONFIG.MIN_INSTANCES);
    log(`↓ reduciendo: ${currentInstances} → ${newCount} workers [idle ${idleMinutes}min, cpu ${avgCpu.toFixed(1)}%, lag ${avgLag.toFixed(1)}ms]`);

    scalingInProgress = true;
    try {
      await scaleService(SERVICE.name, newCount);
      lastScaleTime = Date.now(); // iniciar cooldown
      lastActivity  = Date.now();
      log(`✓ ahora con ${newCount} workers | cooldown 60s activado`);
    } catch (err) {
      log(`✗ error al escalar abajo: ${err.message}`);
    } finally {
      scalingInProgress = false;
    }
  }
}

// ─── tick principal ───────────────────────────────────────────────────────────

async function tick() {
  try {
    const processList = await getProcessList();
    await evaluateBackend(processList);
  } catch (err) {
    console.error('[scaler] error en ciclo:', err.message);
  }
}

// ─── arranque ─────────────────────────────────────────────────────────────────

pm2.connect(false, async (err) => {
  if (err) { console.error('[scaler] no se pudo conectar a PM2:', err); process.exit(1); }

  console.log('─'.repeat(70));
  console.log('Autoscaler iniciado — 3 indicadores activos');
  console.log(`  CPUs disponibles  : ${os.cpus().length}`);
  console.log(`  Instancias        : ${CONFIG.MIN_INSTANCES} min / ${CONFIG.MAX_INSTANCES} max`);
  console.log(`  Cooldown scaling  : ${CONFIG.SCALE_COOLDOWN_MS / 1000}s entre operaciones`);
  console.log(`  Intervalo chequeo : ${CONFIG.CHECK_INTERVAL_MS / 1000}s`);
  console.log('  ─── Umbrales ───────────────────────────────────────────────');
  console.log(`  CPU               : ↑ >${CONFIG.CPU_SCALE_UP}%  ↓ <${CONFIG.CPU_SCALE_DOWN}%`);
  console.log(`  Event Loop Lag    : ↑ >${CONFIG.LAG_SCALE_UP_MS}ms  ↓ <${CONFIG.LAG_SCALE_DOWN_MS}ms`);
  console.log(`  Under Pressure    : ↑ si cualquier worker responde 503`);
  console.log(`  Idle timeout      : ↓ después de ${CONFIG.IDLE_TIMEOUT_MS / 60000} minutos`);
  console.log('─'.repeat(70));

  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const list    = await getProcessList();
    const workers = list.filter(p => p.name === SERVICE.name && p.pm2_env?.status === 'online');
    if (workers.length < CONFIG.MIN_INSTANCES) {
      log(`↑ forzando mínimo: ${workers.length} → ${CONFIG.MIN_INSTANCES} workers`);
      await scaleService(SERVICE.name, CONFIG.MIN_INSTANCES);
      log(`✓ workers levantados al mínimo: ${CONFIG.MIN_INSTANCES}`);
    }
  } catch (err) {
    console.error('[scaler] error forzando mínimo:', err.message);
  }

  await tick();
  setInterval(tick, CONFIG.CHECK_INTERVAL_MS);
});
