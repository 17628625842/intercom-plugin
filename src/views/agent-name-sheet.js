/**
 * 客服输入名字的 Sheet 页面
 * 这是一个全屏 iframe 页面，样式可以完全自定义
 */

function createAgentNameSheetHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>发送打赏卡片</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="alternate icon" href="/favicon.png" type="image/png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        
        .emoji {
            font-size: 60px;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        
        .preview {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 25px;
            border: 2px dashed #e0e0e0;
        }
        
        .preview-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
        }
        
        .preview-text {
            font-size: 18px;
            color: #333;
            font-weight: 500;
        }
        
        .preview-text .name {
            color: #667eea;
            font-weight: 700;
        }
        
        .input-group {
            margin-bottom: 25px;
        }
        
        .input-group label {
            display: block;
            text-align: left;
            font-size: 14px;
            color: #555;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .input-group input {
            width: 100%;
            padding: 15px 20px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .input-group input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        
        .input-group input::placeholder {
            color: #bbb;
        }
        
        .btn-primary {
            width: 100%;
            padding: 16px 30px;
            font-size: 16px;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:active {
            transform: translateY(0);
        }
        
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🎁</div>
        <h1>发送打赏卡片</h1>
        <p class="subtitle">请输入您的英文名，用户将收到个性化的打赏卡片</p>
        
        <div class="preview">
            <div class="preview-label">用户将看到</div>
            <div class="preview-text">🎁 Thank <span class="name" id="previewName">Allen</span>!</div>
        </div>
        
        <div class="input-group">
            <label for="agentName">您的英文名</label>
            <input type="text" id="agentName" placeholder="例如：Allen" value="" autofocus>
        </div>
        
        <button class="btn-primary" id="submitBtn" onclick="submitName()">
            发送给用户
        </button>
    </div>
    
    <script>
        // 实时预览名字
        const nameInput = document.getElementById('agentName');
        const previewName = document.getElementById('previewName');
        const submitBtn = document.getElementById('submitBtn');
        
        nameInput.addEventListener('input', function() {
            const name = this.value.trim() || 'Allen';
            previewName.textContent = name;
        });
        
        // 提交名字
        function submitName() {
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.focus();
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';
            
            // 使用 Intercom Sheet API 提交数据
            if (window.parent && window.parent.Intercom) {
                window.parent.Intercom('submitSheet', { agentName: name });
            } else {
                // Fallback: 使用 postMessage
                window.parent.postMessage({
                    type: 'intercom:submitSheet',
                    data: { agentName: name }
                }, '*');
            }
        }
        
        // 回车提交
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitName();
            }
        });
    </script>
</body>
</html>
    `;
}

module.exports = { createAgentNameSheetHTML };
