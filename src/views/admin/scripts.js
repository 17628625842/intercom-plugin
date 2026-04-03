/**
 * 管理后台客户端脚本
 */

function getAdminScripts(options) {
    const { startDate, endDate, currency } = options;

    return `
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化 Flatpickr 日期范围选择器 (Range Mode)
        flatpickr('#dateRange', {
            locale: 'zh',
            mode: 'range',
            dateFormat: 'Y-m-d',
            allowInput: false,
            clickOpens: true,
            disableMobile: true,
            animate: true,
            onClose: function(selectedDates, dateStr, instance) {
                if (selectedDates.length === 2) {
                    const start = instance.formatDate(selectedDates[0], "Y-m-d");
                    const end = instance.formatDate(selectedDates[1], "Y-m-d");
                    document.getElementById('startDate').value = start;
                    document.getElementById('endDate').value = end;
                    // 自动应用筛选
                    applyFilters();
                }
            },
            onReady: function(selectedDates, dateStr, instance) {
                initCustomMonthPicker(instance);
            },
            onMonthChange: function(selectedDates, dateStr, instance) {
               updateCustomMonthLabel(instance);
            },
            onYearChange: function(selectedDates, dateStr, instance) {
               updateCustomMonthLabel(instance);
            }
        });

        // --- Custom Month Picker Logic (纯自定义月份选择器 - 修复版) ---
        function initCustomMonthPicker(instance) {
            const calendar = instance.calendarContainer;
            const currentMonthContainer = calendar.querySelector('.flatpickr-current-month');
            
            // 1. 彻底清空原有的月份/年份结构 (防止 CSS 冲突和隐藏问题)
            currentMonthContainer.innerHTML = '';
            
            // 2. 重置容器样式，确保它是 Flex 居中布局
            Object.assign(currentMonthContainer.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                width: '100%',
                left: '0',
                top: '0',
                height: '100%',
                padding: '0',
                pointerEvents: 'none' // 让容器本身不阻挡下方点击，但子元素要开启
            });

            // 3. 创建自定义 [月份] Trigger
            const monthTrigger = document.createElement('span');
            monthTrigger.className = 'custom-month-trigger';
            Object.assign(monthTrigger.style, {
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em',
                padding: '5px 10px',
                borderRadius: '8px',
                marginRight: '5px',
                pointerEvents: 'auto', // 开启点击
                transition: 'background 0.2s',
                color: 'var(--text-primary)'
            });
            
            monthTrigger.onmouseenter = () => monthTrigger.style.background = 'rgba(255,255,255,0.1)';
            monthTrigger.onmouseleave = () => monthTrigger.style.background = 'transparent';
            monthTrigger.onclick = (e) => {
                e.stopPropagation();
                toggleCustomMonthGrid(instance);
            };

            // 4. 创建自定义 [年份] Display (暂时只读，保持简洁)
            const yearDisplay = document.createElement('span');
            yearDisplay.className = 'custom-year-display';
            Object.assign(yearDisplay.style, {
                fontWeight: '600',
                fontSize: '1em',
                padding: '5px 5px',
                pointerEvents: 'auto',
                color: 'var(--text-primary)'
            });

            // 5. 将它们放入容器
            currentMonthContainer.appendChild(monthTrigger);
            currentMonthContainer.appendChild(yearDisplay);

            // 6. 存储引用以便更新
            instance.customElements = { monthTrigger, yearDisplay };
            
            updateCustomMonthLabel(instance);
        }

        function updateCustomMonthLabel(instance) {
            if (!instance.customElements) return;
            
            const { monthTrigger, yearDisplay } = instance.customElements;
            const months = instance.l10n.months.longhand;
            
            // 更新文字
            monthTrigger.innerText = months[instance.currentMonth];
            yearDisplay.innerText = instance.currentYear;
        }

        function toggleCustomMonthGrid(instance) {
            const calendar = instance.calendarContainer;
            let grid = calendar.querySelector('.custom-month-grid');

            if (grid) {
                // 如果已存在，则移除（关闭）
                grid.remove();
                return;
            }

            // 创建网格容器
            grid = document.createElement('div');
            grid.className = 'custom-month-grid';
            
            // 样式直接内联确保高优先级
            Object.assign(grid.style, {
                position: 'absolute',
                top: '55px', /* Header Height 下方 */
                left: '0',
                width: '100%',
                height: 'calc(100% - 55px)',
                background: '#18181b', /* 深色背景 */
                backdropFilter: 'blur(10px)',
                zIndex: '99999',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '15px',
                boxSizing: 'border-box'
            });

            const months = instance.l10n.months.longhand; // ["一月", "二月"...]
            months.forEach((m, idx) => {
                const btn = document.createElement('div');
                btn.innerText = m;
                const isSelected = instance.currentMonth === idx;
                
                Object.assign(btn.style, {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    color: isSelected ? '#fff' : '#a1a1aa',
                    background: isSelected ? '#ff3e86' : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                });

                // Hover Effects
                btn.onmouseenter = () => {
                    if (!btn.dataset.selected) {
                        btn.style.background = '#ff3e86';
                        btn.style.color = '#fff';
                    }
                };
                btn.onmouseleave = () => {
                    if (btn.dataset.selected !== 'true') {
                        btn.style.background = 'rgba(255,255,255,0.03)';
                        btn.style.color = '#a1a1aa';
                    } else {
                         btn.style.background = '#ff3e86'; // Keep selected
                    }
                };
                
                if(isSelected) btn.dataset.selected = 'true';

                btn.onclick = (e) => {
                    e.stopPropagation();
                    instance.changeMonth(idx, false); // Switch Month
                    grid.remove(); // Close Grid
                };
                grid.appendChild(btn);
            });

            // 点击外部关闭 Grid
            const closeHandler = (e) => {
                if (!grid.contains(e.target) && !e.target.classList.contains('custom-month-label')) {
                    grid.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            // 延时添加避免立即触发
            setTimeout(() => document.addEventListener('click', closeHandler), 10);
            
            calendar.appendChild(grid);
        }

        // 初始化自定义下拉框 (Custom Dropdown)
        const wrapper = document.getElementById('agentSelectWrapper');
        if (wrapper) {
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const options = wrapper.querySelectorAll('.custom-option');
            const hiddenInput = document.getElementById('agentSelect');
            const triggerText = trigger.querySelector('span');

            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                wrapper.classList.toggle('open');
            });

            options.forEach(option => {
                option.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    const text = this.textContent.trim();
                    
                    hiddenInput.value = value;
                    triggerText.textContent = text;
                    
                    options.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    wrapper.classList.remove('open');
                    
                    // 自动应用筛选
                    applyFilters();
                });
            });

            // 点击外部关闭
            document.addEventListener('click', function() {
                wrapper.classList.remove('open');
            });
        }
    });

    // --- 无刷新筛选 (Ajax/PJAX) ---
    
    let isFetching = false;

    // 核心函数：获取新页面并局部替换 DOM
    async function updatePageContent(url) {
        if (isFetching) return; // 防止重复请求
        isFetching = true;

        try {
            console.log('🔄 PJAX 请求 URL:', url); // Debug: 确认参数是否正确

            // 1. 发起请求
            const response = await fetch(url);
            if (!response.ok) throw new Error('网络请求失败');
            const htmlText = await response.text();
            
            // 2. 解析返回的 HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // 3. 提取并替换关键区域
            const areasToUpdate = [
                { selector: '.stats-grid', name: '统计数据' },
                { selector: '.main-table-section', name: '数据表格' },
                { selector: '.pending-table-section', name: '待处理订单' }
            ];
            
            areasToUpdate.forEach(area => {
                const newEl = doc.querySelector(area.selector);
                const oldEl = document.querySelector(area.selector);
                if (newEl && oldEl) {
                    // 使用 replaceWith 确保完全替换
                    oldEl.replaceWith(newEl);
                } else if (!area.selector.includes('pending')) {
                    // Pending 可能本来就没有，不需要警告
                    // 但主表格和统计数据必须有
                    console.warn('无法找到替换区域: ' + area.name);
                }
            });

            // 4. 更新 URL (不刷新页面)
            window.history.pushState({}, '', url);
            
        } catch (error) {
            console.error('页面更新失败:', error);
        } finally {
            isFetching = false;
        }
    }

    function clearFilters() {
        const url = '/?currency=${currency}'; // 保持当前货币
        updatePageContent(url);
        
        // 我们也需要重置输入框的 UI 状态
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('agentSelect').value = 'all';
        const triggerSpan = document.querySelector('.custom-select-trigger span');
        if(triggerSpan) triggerSpan.innerText = '所有客服';
        const options = document.querySelectorAll('.custom-option');
        options.forEach(opt => opt.classList.remove('selected'));
        // 选中 "all" (如果存在)
        const allOpt = document.querySelector('.custom-option[data-value="all"]');
        if(allOpt) allOpt.classList.add('selected');
        
        // 重置 Flatpickr
        const fp = document.querySelector('#dateRange')._flatpickr;
        if(fp) fp.clear();
    }

    function switchCurrency(newCurrency) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('currency', newCurrency);
        const url = '/?' + urlParams.toString();
        // 这里切换货币可能涉及较多 UI 变动，用无刷新更新也没问题
        updatePageContent(url);
    }

    function applyFilters() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const agent = document.getElementById('agentSelect').value;
        const currency = '${currency}'; // 这个是服务端注入的初始值，但我们应该从 URL 或当前状态获取
        // 为了稳妥，我们从 URL 获取当前的 currency，或者依然信任服务端注入的这个变量(如果不常变)
        // 实际上 switchCurrency 已经修改了 URL，我们最好每次都读 URL 的 param
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentCurrency = currentUrlParams.get('currency') || '${currency}';
        
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (agent && agent !== 'all') params.append('agent', agent);
        params.append('currency', currentCurrency);
        params.append('page', '1'); // 筛选变了回第一页
        
        const url = '/?' + params.toString();
        updatePageContent(url);
    }

    function goToPage(page) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        const url = '/?' + urlParams.toString();
        updatePageContent(url);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            applyFilters();
        }
    });

    function handleRefund(tipId, agentName, amount) {
        const reason = prompt('退款给客服 ' + agentName + ' 的 $' + amount + '\\n\\n请输入退款原因（可选）:');
        
        if (reason === null) {
            return;
        }
        
        const confirmMessage = '确定要退款 $' + amount + ' 给客服 ' + agentName + ' 吗？\\n\\n' +
                              '注意事项：\\n' +
                              '• 退款将通过PayPal原路返回\\n' +
                              '• 退款后无法撤销\\n' +
                              '• 退款可能需要3-5个工作日到账';
        
        if (confirm(confirmMessage)) {
            const loadingBtn = event.target;
            const originalText = loadingBtn.innerHTML;
            loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
            loadingBtn.disabled = true;
            
            fetch('/admin/refund/' + tipId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: reason || '' })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('退款成功！\\n\\nPayPal退款ID: ' + data.refund_id + '\\n\\n退款将在3-5个工作日内到账。');
                    window.location.reload();
                } else {
                    alert('退款失败：' + data.error + '\\n\\n请检查PayPal配置或联系技术支持。');
                    loadingBtn.innerHTML = originalText;
                    loadingBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('退款请求失败:', error);
                alert('退款请求失败，请检查网络连接后重试');
                loadingBtn.innerHTML = originalText;
                loadingBtn.disabled = false;
            });
        }
    }

    function showRefundReason(reason) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = \`
            <div class="modal-content">
                <div class="modal-header">
                    <i class="fas fa-comment-dots"></i>
                    退款原因
                </div>
                <div class="modal-body">\${reason}</div>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">关闭</button>
            </div>
        \`;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    `;
}

module.exports = { getAdminScripts };
