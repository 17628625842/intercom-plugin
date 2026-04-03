require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - POST /intercom/initialize`);
  console.log(`   - POST /intercom/submit`);
  console.log(`   - POST /canvas/user/initialize`);
  console.log(`   - POST /canvas/user/submit`);
});