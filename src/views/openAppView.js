/**
 * Open App 视图模板 - 用于唤起 App 并传递参数
 */
const openAppView = (queryParams = '') => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opening Mulebuy App...</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
            background-color: #f5f5f7; 
            color: #1d1d1f; 
        }
        .container { text-align: center; padding: 20px; }
        .loader { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #8F71FD; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 20px; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        h1 { font-size: 20px; margin-bottom: 10px; }
        p { font-size: 14px; color: #86868b; }
    </style>
    <script>
        window.onload = function() {
            // 获取当前页面的所有查询参数
            const queryParams = window.location.search;
            // 构造 App Scheme URL
            const appScheme = 'mulebuy://' + (queryParams || '');
            
            console.log('Attempting to open App with scheme:', appScheme);
            
            // 尝试唤起 App
            window.location.href = appScheme;
            
            // 兜底逻辑：如果 3 秒后页面还在，说明可能未安装 App 或唤起失败
            setTimeout(function() {
                const container = document.querySelector('.container');
                if (container) {
                    container.innerHTML = '<h1>Opening Mulebuy App...</h1><p>If the app didn\\'t open automatically, please make sure it is installed on your device.</p>';
                }
            }, 3000);
        };
    </script>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <h1>Redirecting to Mulebuy App</h1>
        <p>Please wait while we open the application...</p>
    </div>
</body>
</html>`;
};

module.exports = openAppView;
