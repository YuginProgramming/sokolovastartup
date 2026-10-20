/**
 * PM2 on the Ubuntu server, same idea as MM_project.
 * Deploy: npm ci && npm run build && pm2 start ecosystem.config.cjs
 * WEBAPP_URL in .env must be the public https address of this process.
 */
const path = require("path");
const root = path.resolve(__dirname);

module.exports = {
  apps: [
    {
      name: "startup-quiz",
      cwd: root,
      script: "dist/server/index.js",
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
    },
  ],
};
