require('dotenv').config();
const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// 创建 HTTP Server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - POST /intercom/initialize`);
  console.log(`   - POST /intercom/submit`);
  console.log(`   - POST /canvas/user/initialize`);
  console.log(`   - POST /canvas/user/submit`);
});