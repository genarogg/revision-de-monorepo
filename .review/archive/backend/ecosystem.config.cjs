
'use strict';

module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '.',               
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster', 

      env_file: '.env',     
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
    },

   
    {
      name: 'scaler',
      cwd: '.',             
      script: 'scaler.cjs',
      instances: 1,
      exec_mode: 'fork',

      env_prod: {
        NODE_ENV: 'production',
      },

      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '100M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
    },
  ],
};
