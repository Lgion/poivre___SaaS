module.exports = {
  apps: [
    {
      name: 'soppi-crowdfunding',
      script: './apps/crowdfunding/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'soppi-ecommerce',
      script: './apps/ecommerce/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'soppi-saas',
      script: './apps/saas/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    }
  ]
};

