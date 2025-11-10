module.exports = {
  apps: [{
    name: 'rose-whatsapp-bot',
    script: './whatsapp_business_bot.js',
    
    // Environment
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    
    // Instance management
    instances: 1,
    exec_mode: 'fork', // Use 'cluster' for multiple instances if needed
    
    // Auto-restart configuration
    autorestart: true,
    watch: false, // Set to true for development
    max_memory_restart: '500M',
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Advanced features
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Environment file
    env_file: '.env'
  }]
};
