/**
 * 支付结果页面视图
 */

/**
 * 创建支付结果页面 HTML
 * @param {boolean} success - 是否成功
 * @param {string} message - 消息
 * @returns {string} HTML 字符串
 */
function createPaymentResultPage(success, message) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? 'Payment Successful' : 'Payment Failed'}</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="alternate icon" href="/favicon.png" type="image/png">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, ${success ? '#10b981 0%, #059669 100%' : '#ef4444 0%, #dc2626 100%'});
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
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
          
          .result-container { 
              background: rgba(255, 255, 255, 0.98);
              backdrop-filter: blur(20px);
              padding: 50px 40px;
              border-radius: 24px;
              text-align: center;
              box-shadow: 
                  0 25px 70px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.3);
              max-width: 500px;
              width: 100%;
              position: relative;
              z-index: 1;
              animation: slideInUp 0.6s ease-out;
          }
          
          .result-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: ${success ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'};
              border-radius: 24px 24px 0 0;
          }
          
          @keyframes slideInUp {
              from {
                  opacity: 0;
                  transform: translateY(30px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }
          
          .result-icon { 
              font-size: 5em;
              margin-bottom: 25px;
              color: ${success ? '#10b981' : '#ef4444'};
              position: relative;
              animation: ${success ? 'bounce' : 'shake'} 0.8s ease-out;
          }
          
          @keyframes bounce {
              0%, 20%, 53%, 80%, 100% {
                  transform: translate3d(0,0,0);
              }
              40%, 43% {
                  transform: translate3d(0, -15px, 0);
              }
              70% {
                  transform: translate3d(0, -8px, 0);
              }
              90% {
                  transform: translate3d(0, -3px, 0);
              }
          }
          
          @keyframes shake {
              10%, 90% {
                  transform: translate3d(-1px, 0, 0);
              }
              20%, 80% {
                  transform: translate3d(2px, 0, 0);
              }
              30%, 50%, 70% {
                  transform: translate3d(-4px, 0, 0);
              }
              40%, 60% {
                  transform: translate3d(4px, 0, 0);
              }
          }
          
          .result-title {
              font-size: 2.2em;
              font-weight: 700;
              margin-bottom: 15px;
              color: #1a202c;
              letter-spacing: -0.02em;
          }
          
          .result-message { 
              font-size: 1.2em; 
              margin-bottom: 35px; 
              color: #64748b;
              line-height: 1.6;
              font-weight: 500;
          }
          
          .success-details {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
              text-align: left;
          }
          
          .success-details h3 {
              color: #059669;
              font-size: 1.1em;
              margin-bottom: 12px;
              font-weight: 600;
          }
          
          .detail-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #dcfce7;
          }
          
          .detail-item:last-child {
              border-bottom: none;
          }
          
          .detail-label {
              color: #374151;
              font-weight: 500;
          }
          
          .detail-value {
              color: #059669;
              font-weight: 600;
          }
          
          .error-details {
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
              text-align: left;
          }
          
          .error-details h3 {
              color: #dc2626;
              font-size: 1.1em;
              margin-bottom: 12px;
              font-weight: 600;
          }
          
          .error-details p {
              color: #374151;
              line-height: 1.5;
          }
          
          .action-buttons {
              display: flex;
              gap: 15px;
              justify-content: center;
              flex-wrap: wrap;
          }
          
          .btn {
              padding: 14px 28px;
              border: none;
              border-radius: 12px;
              font-size: 1.1em;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: 'Inter', sans-serif;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              position: relative;
              overflow: hidden;
          }
          
          .btn::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
          }
          
          .btn:hover::before {
              left: 100%;
          }
          
          .btn-primary {
              background: ${success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
              color: white;
              box-shadow: 0 4px 15px ${success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(102, 126, 234, 0.3)'};
          }
          
          .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px ${success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(102, 126, 234, 0.4)'};
          }
          
          .btn-secondary {
              background: white;
              color: #64748b;
              border: 2px solid #e2e8f0;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .btn-secondary:hover {
              background: #f8fafc;
              border-color: #cbd5e1;
              transform: translateY(-1px);
          }
          
          .confetti {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 0;
          }
          
          @media (max-width: 480px) {
              .result-container { 
                  padding: 40px 30px; 
                  margin: 15px;
              }
              .result-title { font-size: 1.8em; }
              .result-message { font-size: 1.1em; }
              .action-buttons {
                  flex-direction: column;
              }
              .btn {
                  width: 100%;
                  justify-content: center;
              }
          }
      </style>
  </head>
  <body>
      ${success ? '<div class="confetti" id="confetti"></div>' : ''}
      
      <div class="result-container">
          <div class="result-icon">
              <i class="fas ${success ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          </div>
          
          <h1 class="result-title">${success ? 'Payment Successful!' : 'Payment Failed'}</h1>
          
          <div class="result-message">
              ${message}
          </div>
          
          ${success ? `
          <div class="success-details">
              <h3><i class="fas fa-receipt"></i> Transaction Details</h3>
              <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value"><i class="fas fa-check"></i> Completed</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Payment Method</span>
                  <span class="detail-value"><i class="fab fa-paypal"></i> PayPal</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Security</span>
                  <span class="detail-value"><i class="fas fa-shield-alt"></i> Encrypted</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Receipt</span>
                  <span class="detail-value"><i class="fas fa-envelope"></i> Sent via Email</span>
              </div>
          </div>
          ` : `
          <div class="error-details">
              <h3><i class="fas fa-exclamation-triangle"></i> What happened?</h3>
              <p>Your payment could not be processed. This might be due to insufficient funds, expired card, or a temporary issue with the payment processor.</p>
          </div>
          `}
          
          <div class="action-buttons">
              <button class="btn btn-primary" onclick="window.close()">
                  <i class="fas ${success ? 'fa-home' : 'fa-redo'}"></i>
                  ${success ? 'Close Window' : 'Try Again'}
              </button>
              ${!success ? `
              <button class="btn btn-secondary" onclick="window.history.back()">
                  <i class="fas fa-arrow-left"></i>
                  Go Back
              </button>
              ` : ''}
          </div>
      </div>

      ${success ? `
      <script>
          // 添加庆祝彩带效果
          function createConfetti() {
              const confetti = document.getElementById('confetti');
              const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];
              
              for (let i = 0; i < 50; i++) {
                  const particle = document.createElement('div');
                  particle.style.position = 'absolute';
                  particle.style.width = Math.random() * 8 + 4 + 'px';
                  particle.style.height = particle.style.width;
                  particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                  particle.style.left = Math.random() * 100 + '%';
                  particle.style.top = '-10px';
                  particle.style.borderRadius = '50%';
                  particle.style.animation = \`fall \${Math.random() * 3 + 2}s linear infinite\`;
                  particle.style.animationDelay = Math.random() * 2 + 's';
                  confetti.appendChild(particle);
              }
          }
          
          // CSS 动画
          const style = document.createElement('style');
          style.textContent = \`
              @keyframes fall {
                  0% {
                      transform: translateY(-100vh) rotate(0deg);
                      opacity: 1;
                  }
                  100% {
                      transform: translateY(100vh) rotate(720deg);
                      opacity: 0;
                  }
              }
          \`;
          document.head.appendChild(style);
          
          // 启动彩带效果
          setTimeout(createConfetti, 500);
          
          // 3秒后清理彩带
          setTimeout(() => {
              const confetti = document.getElementById('confetti');
              if (confetti) confetti.remove();
          }, 8000);
      </script>
      ` : ''}
  </body>
  </html>
  `;
}

module.exports = {
    createPaymentResultPage
};
