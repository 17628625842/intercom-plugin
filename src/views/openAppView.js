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
        async function fetchTokenByTicket(ticketId) {
            try {
                const response = await fetch('/api/ticket/' + ticketId);
                if (response.ok) {
                    const data = await response.json();
                    return data.token;
                }
            } catch (error) {
                console.error('Fetch token error:', error);
            }
            return null;
        }

        window.onload = async function() {
            // 获取当前页面的所有查询参数
            const urlParams = new URLSearchParams(window.location.search);
            const ticketId = urlParams.get('ticketId');
            
            let tokenData = '';
            if (ticketId) {
                const token = await fetchTokenByTicket(ticketId);
                if (token) {
                    // 将 token 对象转为字符串并进行 base64 编码，方便传输
                    tokenData = '&token=' + encodeURIComponent(JSON.stringify(token));
                }
            }

            // 构造 App Scheme URL
            const queryParams = window.location.search;
            const appScheme = 'mulebuy://' + (queryParams || '') + tokenData;
            
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
