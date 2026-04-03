/**
 * 打赏页面视图
 * 用户端打赏界面
 */

/**
 * 创建打赏页面 HTML
 * @param {string} agentName - 客服名称
 * @param {string} conversationId - 对话 ID
 * @returns {string} HTML 字符串
 */
function createTipPage(agentName, conversationId) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tip ${agentName}</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="alternate icon" href="/favicon.png" type="image/png">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 15px;
              position: relative;
          }
          
          body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: 
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
              background-size: 100px 100px, 150px 150px;
              pointer-events: none;
          }
          
          .tip-container { 
              background: rgba(255, 255, 255, 0.98);
              backdrop-filter: blur(20px);
              padding: 30px 25px;
              border-radius: 20px;
              text-align: center;
              box-shadow: 
                  0 15px 40px rgba(0, 0, 0, 0.15),
                  0 0 0 1px rgba(255, 255, 255, 0.2);
              max-width: 420px;
              width: 100%;
              position: relative;
              z-index: 1;
          }
          
          .tip-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 20px 20px 0 0;
          }
          
          .tip-header {
              margin-bottom: 25px;
          }
          
          .tip-icon { 
              font-size: 3em;
              background: linear-gradient(135deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 12px;
              display: block;
          }
          
          .tip-title { 
              font-size: 1.8em;
              font-weight: 700;
              margin-bottom: 8px;
              color: #1a202c;
              letter-spacing: -0.02em;
          }
          
          .tip-subtitle {
              color: #64748b;
              font-size: 1em;
              margin-bottom: 15px;
              font-weight: 500;
          }
          
          .agent-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 8px 16px;
              border-radius: 50px;
              font-weight: 600;
              font-size: 0.9em;
              margin-bottom: 20px;
              box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
          }
          
          .trust-indicators {
              display: flex;
              justify-content: space-around;
              margin-bottom: 25px;
              padding: 12px 0;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
          }
          
          .trust-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              color: #64748b;
              font-size: 0.75em;
          }
          
          .trust-item i {
              font-size: 1.3em;
              color: #10b981;
          }
          
          .tip-amounts {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 20px;
          }
          
          .tip-button {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              border: none;
              padding: 12px 18px;
              border-radius: 12px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: 'Inter', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              position: relative;
              overflow: hidden;
          }
          
          .tip-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
          }
          
          .tip-button:hover::before {
              left: 100%;
          }
          
          .tip-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
          
          .tip-button:active {
              transform: translateY(-1px);
          }
          
          .custom-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px dashed #e2e8f0;
          }
          
          .custom-title {
              font-size: 1.1em;
              font-weight: 600;
              color: #1a202c;
              margin-bottom: 10px;
          }
          
          .custom-input {
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
              font-size: 1em;
              margin-bottom: 12px;
              font-family: 'Inter', sans-serif;
              transition: all 0.3s ease;
              background: #f8fafc;
          }
          
          .custom-input:focus {
              outline: none;
              border-color: #667eea;
              background: white;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .custom-button {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: 'Inter', sans-serif;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
          }
          
          .custom-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          }
          
          .loading {
              display: none;
              margin-top: 15px;
              padding: 12px;
              background: #f0f9ff;
              border-radius: 10px;
              color: #0369a1;
              font-weight: 500;
              font-size: 0.9em;
          }
          
          .loading i {
              animation: spin 1s linear infinite;
              margin-right: 6px;
          }
          
          @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          
          .security-notice {
              margin-top: 20px;
              padding: 10px;
              background: #f8fafc;
              border-radius: 8px;
              font-size: 0.8em;
              color: #64748b;
              display: flex;
              align-items: center;
              gap: 6px;
          }
          
          .security-notice i {
              color: #10b981;
              font-size: 1.1em;
          }
          
          @media (max-width: 480px) {
              .tip-container { 
                  padding: 25px 20px; 
                  margin: 10px;
              }
              .tip-title { font-size: 1.6em; }
              .tip-amounts { 
                  grid-template-columns: 1fr; 
                  gap: 8px;
              }
              .trust-indicators {
                  flex-direction: column;
                  gap: 8px;
              }
          }
      </style>
  </head>
  <body>
      <div class="tip-container">
          <div class="tip-header">
              <i class="tip-icon fas fa-gift"></i>
              <h1 class="tip-title">Thank ${agentName}</h1>
              <p class="tip-subtitle">Show your appreciation with a secure tip</p>
              <div class="agent-badge">
                  <i class="fas fa-user-circle"></i>
                  ${agentName}
              </div>
          </div>
          
          <div class="trust-indicators">
              <div class="trust-item">
                  <i class="fas fa-shield-alt"></i>
                  <span>Secure</span>
              </div>
              <div class="trust-item">
                  <i class="fab fa-paypal"></i>
                  <span>PayPal</span>
              </div>
              <div class="trust-item">
                  <i class="fas fa-lock"></i>
                  <span>Encrypted</span>
              </div>
          </div>
          
          <div class="tip-amounts">
              <button class="tip-button" onclick="processTip(1)">
                  <i class="fas fa-coffee"></i>
                  $1
              </button>
              <button class="tip-button" onclick="processTip(5)">
                  <i class="fas fa-heart"></i>
                  $5
              </button>
              <button class="tip-button" onclick="processTip(10)">
                  <i class="fas fa-star"></i>
                  $10
              </button>
              <button class="tip-button" onclick="processTip(20)">
                  <i class="fas fa-crown"></i>
                  $20
              </button>
          </div>
          
          <div class="custom-section">
              <h3 class="custom-title">Custom Amount</h3>
              <input type="number" id="customAmount" class="custom-input" placeholder="Enter amount ($1-$500)" min="1" max="500">
              <button class="custom-button" onclick="processCustomTip()">
                  <i class="fas fa-magic"></i>
                  Send Custom Tip
              </button>
          </div>
          
          <div class="loading" id="loading">
              <i class="fas fa-spinner"></i>
              Processing your secure payment...
          </div>
          
          <div class="security-notice">
              <i class="fas fa-info-circle"></i>
              <span>Secure PayPal processing. We never store payment info.</span>
          </div>
      </div>

      <script>
          function showLoading() {
              document.getElementById('loading').style.display = 'block';
              const buttons = document.querySelectorAll('.tip-button, .custom-button');
              buttons.forEach(btn => btn.disabled = true);
          }

          function processTip(amount) {
              console.log('Processing tip:', amount);
              showLoading();
              createPayment(amount);
          }

          function processCustomTip() {
              const customAmount = parseFloat(document.getElementById('customAmount').value);
              if (!customAmount || customAmount < 1 || customAmount > 500) {
                  alert('Please enter a valid amount between $1 and $500');
                  return;
              }
              console.log('Processing custom tip:', customAmount);
              showLoading();
              createPayment(customAmount);
          }

          async function createPayment(amount) {
              try {
                  const response = await fetch('/create-payment', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          amount: amount,
                          conversationId: '${conversationId}',
                          agentName: '${agentName}'
                      })
                  });

                  const data = await response.json();
                  
                  if (data.success && data.paymentUrl) {
                      window.location.href = data.paymentUrl;
                  } else {
                      throw new Error(data.error || 'Payment creation failed');
                  }
              } catch (error) {
                  console.error('Payment error:', error);
                  alert('Sorry, there was an error processing your tip. Please try again.');
                  location.reload();
              }
          }

          document.getElementById('customAmount').addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                  processCustomTip();
              }
          });
      </script>
  </body>
  </html>
  `;
}

module.exports = {
    createTipPage
};
