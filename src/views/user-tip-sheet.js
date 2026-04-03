/**
 * 用户端打赏 Sheet 页面
 * 这是一个全屏 iframe 页面，样式可以完全自定义
 */

function createUserTipSheetHTML(agentName, conversationId) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tip ${agentName}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="alternate icon" href="/favicon.png" type="image/png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 32px 28px;
            max-width: 380px;
            width: 100%;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
            text-align: center;
        }
        
        .emoji-header {
            font-size: 56px;
            margin-bottom: 16px;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        
        h1 {
            color: #1a1a2e;
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .subtitle {
            color: #666;
            font-size: 15px;
            margin-bottom: 28px;
            line-height: 1.5;
        }
        
        .tip-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .tip-btn {
            padding: 18px 16px;
            font-size: 18px;
            font-weight: 600;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .tip-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .tip-btn.primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }
        
        .tip-btn.primary:active {
            transform: translateY(-1px);
        }
        
        .tip-btn.secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        
        .tip-btn.secondary:hover {
            background: #f8f9fe;
            transform: translateY(-2px);
        }
        
        .custom-btn {
            width: 100%;
            padding: 16px;
            font-size: 16px;
            font-weight: 600;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }
        
        .custom-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
            margin: 20px 0;
        }
        
        .secure-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            color: #888;
            font-size: 13px;
        }
        
        .secure-badge svg {
            width: 14px;
            height: 14px;
        }
        
        /* Custom Amount Modal */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 100;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            background: white;
            border-radius: 20px;
            padding: 28px;
            max-width: 320px;
            width: 90%;
            text-align: center;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .modal-overlay.active .modal {
            transform: scale(1);
            opacity: 1;
        }
        
        .modal h2 {
            font-size: 20px;
            color: #1a1a2e;
            margin-bottom: 16px;
        }
        
        .modal input {
            width: 100%;
            padding: 14px 16px;
            font-size: 18px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            text-align: center;
            outline: none;
            margin-bottom: 16px;
        }
        
        .modal input:focus {
            border-color: #667eea;
        }
        
        .modal-btns {
            display: flex;
            gap: 10px;
        }
        
        .modal-btns button {
            flex: 1;
            padding: 12px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .modal-btns .cancel {
            background: #f0f0f0;
            color: #666;
            border: none;
        }
        
        .modal-btns .confirm {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
        }
        
        /* Loading state */
        .loading {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .loading::after {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
            margin-left: 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji-header">💝</div>
        <h1>Thank ${agentName}!</h1>
        <p class="subtitle">Your support means the world to us.<br>Choose an amount to show your appreciation.</p>
        
        <div class="tip-grid">
            <button class="tip-btn primary" onclick="selectTip(1)">
                <span>💵</span> $1
            </button>
            <button class="tip-btn primary" onclick="selectTip(5)">
                <span>💵</span> $5
            </button>
            <button class="tip-btn primary" onclick="selectTip(10)">
                <span>💵</span> $10
            </button>
            <button class="tip-btn primary" onclick="selectTip(20)">
                <span>💵</span> $20
            </button>
        </div>
        
        <button class="custom-btn" onclick="showCustomModal()">
            ✨ Custom Amount
        </button>
        
        <div class="divider"></div>
        
        <div class="secure-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            Secure payment via PayPal
        </div>
    </div>
    
    <!-- Custom Amount Modal -->
    <div class="modal-overlay" id="customModal">
        <div class="modal">
            <h2>✨ Enter Amount</h2>
            <input type="number" id="customAmount" placeholder="$" min="1" max="999">
            <div class="modal-btns">
                <button class="cancel" onclick="hideCustomModal()">Cancel</button>
                <button class="confirm" onclick="confirmCustomAmount()">Continue</button>
            </div>
        </div>
    </div>
    
    <script>
        const agentName = '${agentName}';
        const conversationId = '${conversationId}';
        
        function selectTip(amount) {
            // Submit to Intercom
            submitToIntercom('tip_' + amount, amount);
        }
        
        function showCustomModal() {
            document.getElementById('customModal').classList.add('active');
            document.getElementById('customAmount').focus();
        }
        
        function hideCustomModal() {
            document.getElementById('customModal').classList.remove('active');
        }
        
        function confirmCustomAmount() {
            const input = document.getElementById('customAmount');
            const amount = parseFloat(input.value);
            
            if (isNaN(amount) || amount < 1 || amount > 999) {
                input.style.borderColor = '#f5576c';
                return;
            }
            
            hideCustomModal();
            submitToIntercom('tip_custom', amount);
        }
        
        function submitToIntercom(componentId, amount) {
            // Use Intercom's submitSheet API
            if (window.Intercom) {
                window.Intercom('submitSheet', {
                    component_id: componentId,
                    amount: amount,
                    agentName: agentName,
                    conversationId: conversationId
                });
            } else {
                // Fallback: redirect to PayPal page
                window.location.href = window.location.origin + '/tip/' + conversationId + '/' + encodeURIComponent(agentName) + '?amount=' + amount;
            }
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideCustomModal();
            }
        });
        
        // Close modal on click outside
        document.getElementById('customModal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideCustomModal();
            }
        });
    </script>
</body>
</html>
    `;
}

module.exports = { createUserTipSheetHTML };
