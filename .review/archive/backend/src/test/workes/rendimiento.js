import pm2 from 'pm2';

pm2.connect(false, (err) => {
  if (err) { console.error(err); process.exit(1); }

  pm2.list((err, list) => {
    if (err) { console.error(err); pm2.disconnect(); return; }

    list
      .filter(p => p.name === 'backend' && p.pm2_env?.status === 'online')
      .forEach(p => {
        const ram = Math.round(p.monit.memory / 1024 / 1024);
        console.log(`Worker ${p.pm_id} (PID ${p.pid}) | CPU: ${p.monit.cpu}% | RAM: ${ram}MB`);
      });

    pm2.disconnect();
  });
});