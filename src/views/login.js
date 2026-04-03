/**
 * 登录页面视图
 */

/**
 * 创建登录页面 HTML
 * @param {string} error - 错误信息
 * @returns {string} HTML 字符串
 */
function createLoginPage(error = '') {
    return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>客服打赏系统 - 登录</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="alternate icon" href="/favicon.png" type="image/png">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
          :root {
              --primary: #ec4899;
              --primary-dark: #db2777;
              --primary-light: #f472b6;
              --primary-glow: rgba(236, 72, 153, 0.3);
              --dark: #0a0a0a;
              --dark-secondary: #141414;
              --dark-tertiary: #1f1f1f;
              --text-primary: #fafafa;
              --text-secondary: #a3a3a3;
              --text-muted: #737373;
              --border: rgba(255, 255, 255, 0.08);
              --card-bg: rgba(20, 20, 20, 0.95);
              --danger: #ef4444;
          }

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: var(--dark);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
              position: relative;
              overflow: hidden;
          }

          /* Animated gradient background */
          .bg-gradient {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: 
                  radial-gradient(ellipse at 0% 0%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 100% 100%, rgba(244, 114, 182, 0.1) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
              animation: gradientPulse 15s ease-in-out infinite;
              z-index: 0;
          }

          @keyframes gradientPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.1); }
          }

          /* Grid pattern overlay */
          .grid-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: 
                  linear-gradient(rgba(236, 72, 153, 0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(236, 72, 153, 0.02) 1px, transparent 1px);
              background-size: 60px 60px;
              z-index: 1;
              pointer-events: none;
          }

          /* Floating particles */
          .particles {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 1;
              pointer-events: none;
          }

          .particle {
              position: absolute;
              width: 4px;
              height: 4px;
              background: var(--primary);
              border-radius: 50%;
              opacity: 0.3;
              animation: float 15s infinite;
          }

          @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-100px) rotate(180deg); }
          }

          .login-container { 
              background: var(--card-bg);
              backdrop-filter: blur(20px);
              padding: 50px 45px;
              border-radius: 24px;
              text-align: center;
              box-shadow: 
                  0 25px 80px rgba(0, 0, 0, 0.5),
                  0 0 100px var(--primary-glow);
              max-width: 420px;
              width: 100%;
              position: relative;
              z-index: 2;
              border: 1px solid var(--border);
              animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
              from {
                  opacity: 0;
                  transform: translateY(30px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }

          .login-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, var(--primary), var(--primary-light));
              border-radius: 24px 24px 0 0;
          }

          .logo-icon {
              width: 70px;
              height: 70px;
              background: linear-gradient(135deg, var(--primary), var(--primary-light));
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              margin: 0 auto 24px;
              box-shadow: 0 10px 40px var(--primary-glow);
              position: relative;
          }

          .logo-icon::after {
              content: '';
              position: absolute;
              inset: -3px;
              border-radius: 23px;
              background: linear-gradient(135deg, var(--primary), var(--primary-light));
              z-index: -1;
              opacity: 0.5;
              filter: blur(15px);
          }

          .login-title { 
              background: linear-gradient(135deg, #fff, var(--primary-light));
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              font-size: 2em;
              font-weight: 800;
              margin-bottom: 8px;
              line-height: 1.2;
          }

          .login-subtitle {
              color: var(--text-muted);
              font-size: 1em;
              margin-bottom: 36px;
              line-height: 1.4;
          }

          .form-group {
              margin-bottom: 24px;
              text-align: left;
          }

          .form-group label {
              color: var(--text-secondary);
              font-weight: 500;
              font-size: 0.9em;
              display: block;
              margin-bottom: 10px;
          }

          .form-group input {
              width: 100%;
              padding: 14px 18px;
              border: 1px solid var(--border);
              border-radius: 12px;
              background: var(--dark);
              font-size: 1em;
              font-family: 'Inter', sans-serif;
              color: var(--text-primary);
              transition: all 0.3s ease;
          }

          .form-group input::placeholder {
              color: var(--text-muted);
          }

          .form-group input:focus {
              outline: none;
              border-color: var(--primary);
              box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
          }

          .login-btn {
              background: linear-gradient(135deg, var(--primary), var(--primary-dark));
              color: white;
              padding: 14px 30px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 600;
              font-size: 1em;
              font-family: 'Inter', sans-serif;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 6px 24px var(--primary-glow);
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
          }

          .login-btn:hover {
              transform: translateY(-3px);
              box-shadow: 0 10px 40px rgba(236, 72, 153, 0.4);
          }

          .login-btn:active {
              transform: translateY(-1px);
          }

          .error-message {
              background: rgba(239, 68, 68, 0.1);
              color: var(--danger);
              padding: 14px 18px;
              border-radius: 12px;
              margin-bottom: 24px;
              font-size: 0.9em;
              border: 1px solid rgba(239, 68, 68, 0.2);
              border-left: 4px solid var(--danger);
              line-height: 1.4;
              text-align: left;
              display: flex;
              align-items: center;
              gap: 10px;
          }

          .error-message i {
              font-size: 1.1em;
          }

          .footer-text {
              margin-top: 28px;
              color: var(--text-muted);
              font-size: 0.85em;
          }

          .footer-text i {
              color: var(--primary);
              margin-right: 6px;
          }

          /* 响应式设计 - 手机端优化 */
          @media (max-width: 768px) {
              body {
                  padding: 15px;
              }

              .login-container {
                  padding: 40px 28px;
                  max-width: 100%;
                  margin: 10px;
              }

              .logo-icon {
                  width: 60px;
                  height: 60px;
                  font-size: 28px;
                  margin-bottom: 20px;
              }

              .login-title {
                  font-size: 1.7em;
              }

              .login-subtitle {
                  font-size: 0.95em;
                  margin-bottom: 30px;
              }

              .form-group {
                  margin-bottom: 20px;
              }

              .form-group input {
                  padding: 14px 16px;
                  font-size: 16px;
              }

              .login-btn {
                  padding: 14px 30px;
                  font-size: 16px;
              }
          }

          /* 超小屏幕优化 */
          @media (max-width: 480px) {
              body {
                  padding: 10px;
              }

              .login-container {
                  padding: 35px 22px;
                  border-radius: 20px;
              }

              .logo-icon {
                  width: 55px;
                  height: 55px;
                  font-size: 26px;
              }

              .login-title {
                  font-size: 1.5em;
                  margin-bottom: 6px;
              }

              .login-subtitle {
                  font-size: 0.9em;
                  margin-bottom: 25px;
              }

              .form-group {
                  margin-bottom: 18px;
              }

              .form-group label {
                  font-size: 0.85em;
              }

              .error-message {
                  font-size: 0.85em;
                  padding: 12px 14px;
              }

              .footer-text {
                  font-size: 0.8em;
              }
          }

          /* 触摸设备优化 */
          @media (hover: none) and (pointer: coarse) {
              .login-btn:hover {
                  transform: none;
              }

              .login-btn:active {
                  transform: scale(0.98);
              }
          }

          /* 防止缩放的输入框优化 */
          @supports (-webkit-touch-callout: none) {
              .form-group input,
              .login-btn {
                  font-size: 16px;
              }
          }
      </style>
  </head>
  <body>
      <div class="bg-gradient"></div>
      <div class="grid-overlay"></div>
      <div class="particles">
          <div class="particle" style="left: 10%; top: 20%; animation-delay: 0s;"></div>
          <div class="particle" style="left: 20%; top: 80%; animation-delay: 2s;"></div>
          <div class="particle" style="left: 60%; top: 30%; animation-delay: 4s;"></div>
          <div class="particle" style="left: 80%; top: 70%; animation-delay: 6s;"></div>
          <div class="particle" style="left: 40%; top: 50%; animation-delay: 8s;"></div>
      </div>

      <div class="login-container">
          <div class="logo-icon">
              <i class="fas fa-gift" style="color: white;"></i>
          </div>
          <h1 class="login-title">管理后台</h1>
          <p class="login-subtitle">客服打赏系统</p>

          ${error ? `<div class="error-message"><i class="fas fa-exclamation-circle"></i>${error}</div>` : ''}

          <form method="POST" action="/login">
              <div class="form-group">
                  <label for="username">用户名</label>
                  <input type="text" id="username" name="username" placeholder="请输入用户名" required autocomplete="username">
              </div>
              <div class="form-group">
                  <label for="password">密码</label>
                  <input type="password" id="password" name="password" placeholder="请输入密码" required autocomplete="current-password">
              </div>
              <button type="submit" class="login-btn">
                  <i class="fas fa-sign-in-alt"></i>
                  登录
              </button>
          </form>

          <div class="footer-text">
              <i class="fas fa-lock"></i>
              安全加密登录
          </div>
      </div>
  </body>
  </html>
  `;
}

module.exports = {
    createLoginPage
};
