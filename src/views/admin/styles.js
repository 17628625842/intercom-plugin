/**
 * 管理后台样式表
 */

const adminStyles = `
:root {
    --primary: #ec4899;
    --primary-dark: #db2777;
    --primary-light: #f472b6;
    --primary-glow: rgba(236, 72, 153, 0.3);
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #0a0a0a;
    --dark-secondary: #141414;
    --dark-tertiary: #1f1f1f;
    --text-primary: #fafafa;
    --text-secondary: #a3a3a3;
    --text-muted: #737373;
    --border: rgba(255, 255, 255, 0.08);
    --card-bg: rgba(20, 20, 20, 0.9);
    --glass: rgba(255, 255, 255, 0.03);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--dark);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
}

/* Animated gradient background */
.bg-gradient {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(ellipse at 0% 0%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(244, 114, 182, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
    animation: gradientPulse 20s ease-in-out infinite;
    z-index: 0;
}

@keyframes gradientPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* Grid pattern overlay */
.grid-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        linear-gradient(rgba(236, 72, 153, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(236, 72, 153, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 1;
    pointer-events: none;
}

.container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 28px;
    position: relative;
    z-index: 2;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36px;
    padding: 16px 0;
}

.logo {
    display: flex;
    align-items: center;
    gap: 16px;
}

.logo-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 8px 32px var(--primary-glow);
    position: relative;
}

.logo-icon::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    z-index: -1;
    opacity: 0.5;
    filter: blur(10px);
}

.logo-text h1 {
    font-size: 1.6em;
    font-weight: 700;
    background: linear-gradient(135deg, #fff, var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.logo-text p {
    font-size: 0.9em;
    color: var(--text-muted);
    margin-top: 2px;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 11px 22px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9em;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    font-family: inherit;
    text-decoration: none;
}

.btn-secondary {
    background: var(--dark-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--primary);
    transform: translateY(-2px);
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    box-shadow: 0 4px 20px var(--primary-glow);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

/* Currency Toggle */
.currency-toggle {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 24px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.currency-label {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.95em;
    display: flex;
    align-items: center;
    gap: 8px;
}

.currency-label i {
    color: var(--primary);
}

.currency-switch {
    display: flex;
    background: var(--dark);
    border-radius: 10px;
    padding: 4px;
    gap: 4px;
}

.currency-option {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9em;
    font-family: inherit;
}

.currency-option.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    box-shadow: 0 4px 16px var(--primary-glow);
}

.currency-option:hover:not(.active) {
    color: var(--text-primary);
}

.exchange-rate-info {
    color: var(--text-muted);
    font-size: 0.85em;
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
}

.exchange-rate-info i {
    color: var(--primary-light);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 26px;
    border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 60px var(--primary-glow);
    border-color: rgba(236, 72, 153, 0.3);
}

.stat-card:hover::before {
    opacity: 1;
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18px;
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
}

.stat-icon.pink { background: rgba(236, 72, 153, 0.15); color: var(--primary); }
.stat-icon.green { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

.stat-value {
    font-size: 2.2em;
    font-weight: 800;
    margin-bottom: 6px;
    background: linear-gradient(135deg, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-label {
    color: var(--text-muted);
    font-size: 0.95em;
    font-weight: 500;
}

/* Filters Section */
.filters-section {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 26px;
    margin-bottom: 32px;
    border: 1px solid var(--border);
    position: relative;
    z-index: 10;
    overflow: visible !important;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
}

.filters-title {
    font-size: 1.15em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.filters-title i {
    color: var(--primary);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.filter-group label {
    font-size: 0.9em;
    color: var(--text-secondary);
    font-weight: 500;
}

.filter-input {
    padding: 13px 18px;
    background: var(--dark);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 0.95em;
    font-family: inherit;
    transition: all 0.3s ease;
}

.filter-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
}

/* Custom Select Styling */
.filter-input option {
    background: var(--dark-secondary);
    color: var(--text-primary);
    padding: 12px;
}

/* Custom Date Component Style Update */
.custom-date-wrapper {
    position: relative;
    width: 100%;
}

.custom-date-wrapper i {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    pointer-events: none;
    font-size: 1em;
    z-index: 10;
    transition: all 0.3s ease;
}

.date-picker-input {
    padding-left: 48px !important;
    cursor: pointer !important;
    background: linear-gradient(to right, rgba(236, 72, 153, 0.05), transparent) !important;
    font-weight: 500 !important;
    letter-spacing: 0.5px;
    border: 1px solid var(--border) !important;
}

.date-picker-input:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 20px var(--primary-glow) !important;
}

/* Range Picker Style Fixes */
.flatpickr-day.inRange, 
.flatpickr-day.prevMonthDay.inRange, 
.flatpickr-day.nextMonthDay.inRange, 
.flatpickr-day.today.inRange, 
.flatpickr-day:hover, 
.flatpickr-day.prevMonthDay:hover, 
.flatpickr-day.nextMonthDay:hover {
    background: rgba(236, 72, 153, 0.15) !important;
    border-color: transparent !important;
}

.flatpickr-day.selected.startRange,
.flatpickr-day.selected.endRange {
    background: var(--primary) !important;
    box-shadow: 0 0 15px var(--primary-glow) !important;
}

.flatpickr-calendar {
    margin-top: 10px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6) !important;
}

.flatpickr-innerContainer {
    padding: 10px !important;
}
.custom-select-wrapper {
    position: relative;
    user-select: none;
    width: 100%;
}

.custom-select-wrapper.open {
    z-index: 9999 !important;
}

.custom-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 18px;
    background: var(--dark);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 0.95em;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-select-trigger:hover {
    border-color: rgba(236, 72, 153, 0.5);
    background: rgba(255, 255, 255, 0.02);
}

.custom-select-wrapper.open .custom-select-trigger {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
}

.custom-select-trigger i.fa-chevron-down {
    font-size: 0.8em;
    color: var(--primary);
    transition: transform 0.3s ease;
}

.custom-select-wrapper.open i.fa-chevron-down {
    transform: rotate(180deg);
}

.custom-options {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--dark-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    display: none;
    z-index: 9999;
    max-height: 300px;
    overflow-y: auto;
    padding: 6px;
    backdrop-filter: blur(20px);
}

.custom-select-wrapper.open .custom-options {
    display: block;
    animation: dropdownFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.custom-option {
    padding: 12px 14px;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95em;
}

.custom-option:hover {
    background: rgba(236, 72, 153, 0.08);
    color: var(--primary-light);
}

.custom-option.selected {
    background: rgba(236, 72, 153, 0.15);
    color: var(--primary);
    font-weight: 600;
}

/* Custom Scrollbar for Options */
.custom-options::-webkit-scrollbar {
    width: 6px;
}
.custom-options::-webkit-scrollbar-track {
    background: transparent;
}
.custom-options::-webkit-scrollbar-thumb {
    background: var(--dark-tertiary);
    border-radius: 10px;
}
.custom-options::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}

/* Custom Flatpickr High-End Reset */
/* Custom Flatpickr High-End Reset */
.flatpickr-calendar {
    background: var(--dark-secondary) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 20px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
    width: 380px !important; /* 同步 380px */
    padding: 0 !important; 
    backdrop-filter: blur(25px) !important;
    z-index: 99999 !important;
    overflow: hidden !important;
    
    /* 关键修复：强制浏览器使用深色模式渲染原生控件 (如下拉菜单) */
    color-scheme: dark !important; 
}

.flatpickr-innerContainer {
    padding: 10px !important;
    width: 380px !important;
    box-sizing: border-box !important;
}

.flatpickr-rContainer {
    width: 100% !important;
}

.flatpickr-days {
    width: 100% !important;
}

.dayContainer {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    justify-content: flex-start !important; /* 改为左对齐 */
    align-content: flex-start !important;
    flex-wrap: wrap !important;
}

.flatpickr-day {
    flex-basis: 14.2857% !important; /* 强制 1/7 宽度，形成严格网格 */
    max-width: 46px !important; 
    height: 46px !important;
    line-height: 46px !important;
    font-size: 1.0em !important;
    margin: 0 !important;
    border-radius: 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* --- 智能隐藏非本月日期 (消除底部留白的关键) --- */
/* 上个月的日期：隐身但必需占位，否则 1 号的位置会乱 */
.flatpickr-day.prevMonthDay {
    visibility: hidden !important;
    pointer-events: none !important;
}

/* 下个月的日期：直接甚至 DOM 都不渲染，彻底消除底部空间 */
.flatpickr-day.nextMonthDay {
    display: none !important;
    pointer-events: none !important;
}

/* 确保所有容器高度紧贴内容 */
.dayContainer,
.flatpickr-days,
.flatpickr-rContainer,
.flatpickr-innerContainer,
.flatpickr-calendar {
    height: auto !important;
}

/* --- Flattened Header (极简表头 - 终极修复版) --- */
.flatpickr-calendar .flatpickr-months {
    background: transparent !important;
    border-bottom: none !important;
    position: relative !important;
    padding: 10px 0 !important;
    height: 50px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* 强力清除所有可能的子元素背景 */
.flatpickr-calendar .flatpickr-months * {
    background: transparent !important;
}

.flatpickr-current-month {
    font-size: 1.25em !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    padding: 0 !important;
    width: 60% !important;
    left: 20% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: absolute !important;
    top: 0 !important;
}

/* 月份下拉框美化 */
.flatpickr-monthDropdown-months {
    font-weight: 600 !important;
    margin-right: 6px !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    border: none !important;
    background-color: var(--dark-secondary) !important; /* 深色背景 */
    color: var(--text-primary) !important;
    padding: 2px 10px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    text-align: center !important;
}

.flatpickr-monthDropdown-months:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 关键：修复下拉选项的白色背景 */
.flatpickr-monthDropdown-months option {
    background-color: var(--dark-secondary) !important;
    color: var(--text-primary) !important;
    padding: 10px !important;
}

/* 年份输入框美化 */
.numInputWrapper {
    font-weight: 600 !important;
}

.numInputWrapper input.numInput {
    background: transparent !important;
    border: none !important;
    color: var(--text-primary) !important;
    font-size: inherit !important;
    font-weight: inherit !important;
}

.numInputWrapper:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px !important;
}

/* 隐藏年份原本的上下箭头，改用更干净的样式（Flatpickr 默认有 hover 出现箭头，这里保持默认但微调颜色） */
.numInputWrapper span {
    border: none !important;
}
.numInputWrapper span:hover {
    background: rgba(255, 255, 255, 0.1) !important;
}
.numInputWrapper span:after {
    border-color: transparent transparent var(--text-secondary) transparent !important;
}
.numInputWrapper span.arrowUp:after {
    border-top: none !important;
}
.numInputWrapper span.arrowDown:after {
    border-top-color: var(--text-secondary) !important;
}

/* 箭头定位优化：增加一点边距 */
.flatpickr-prev-month, 
.flatpickr-next-month {
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    height: 30px !important;
    width: 30px !important;
    border-radius: 8px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(255, 255, 255, 0.05) !important; /* 这里必须有点背景色，否则和纯透明表头分不清 */
    transition: all 0.2s ease !important;
    padding: 0 !important;
    z-index: 100 !important; /* 提高 z-index 防止被遮挡 */
}

/* 专门针对箭头：这里需要背景色，所以覆盖上面的通配符规则 */
.flatpickr-calendar .flatpickr-months .flatpickr-prev-month,
.flatpickr-calendar .flatpickr-months .flatpickr-next-month {
     background: rgba(255, 255, 255, 0.05) !important;
}

.flatpickr-prev-month {
    left: 20px !important; /* 增加到 20px */
}

.flatpickr-next-month {
    right: 20px !important; /* 增加到 20px */
}

.flatpickr-prev-month:hover, 
.flatpickr-next-month:hover {
    background: var(--primary) !important; /* 悬停颜色 */
    color: white !important;
    fill: white !important;
}

/* 专门针对箭头悬停：覆盖通配符 */
.flatpickr-calendar .flatpickr-months .flatpickr-prev-month:hover,
.flatpickr-calendar .flatpickr-months .flatpickr-next-month:hover {
     background: var(--primary) !important;
}

.flatpickr-prev-month svg, 
.flatpickr-next-month svg {
    width: 12px !important;
    height: 12px !important;
    fill: currentColor !important;
}

/* --- Compact Bottom (减少底部留白) --- */
.flatpickr-innerContainer {
    padding: 0 10px 15px 10px !important;
    width: 380px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    margin-top: 5px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.05) !important; /* 在表头和日期之间加一条极细的分割线 */
}

.flatpickr-weekdays {
    background: transparent !important;
    height: 36px !important;
    margin-top: 5px !important;
}

span.flatpickr-weekday {
    color: var(--primary-light) !important;
    font-weight: 600 !important;
    font-size: 0.9em !important;
    background: transparent !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.flatpickr-days {
    width: 100% !important;
    border: none !important;
}

.dayContainer {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
}

.flatpickr-day {
    max-width: 40px !important;
    height: 40px !important;
    line-height: 40px !important;
    margin: 2px !important;
    border-radius: 10px !important;
}

.flatpickr-day.inRange {
    background: rgba(236, 72, 153, 0.1) !important;
    box-shadow: none !important;
}

.flatpickr-day.selected {
    background: var(--primary) !important;
    color: white !important;
}

/* Table Section */
.table-section {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid var(--border);
    overflow: hidden;
}

.table-header {
    padding: 22px 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    background: rgba(236, 72, 153, 0.03);
}

.table-title {
    font-size: 1.25em;
    font-weight: 600;
}

.table-badge {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
    box-shadow: 0 4px 16px var(--primary-glow);
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: var(--dark-secondary);
}

th {
    padding: 18px 22px;
    text-align: left;
    font-weight: 600;
    font-size: 0.85em;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

th:nth-child(5),
th:nth-child(6),
th:nth-child(7) {
    text-align: center;
}

tbody tr {
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--border);
}

tbody tr:hover {
    background: rgba(236, 72, 153, 0.03);
}

td {
    padding: 18px 22px;
    font-size: 0.95em;
}

td:nth-child(5),
td:nth-child(6),
td:nth-child(7) {
    text-align: center;
}

.agent-cell {
    display: flex;
    align-items: center;
    gap: 14px;
}

.agent-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1em;
    box-shadow: 0 4px 12px var(--primary-glow);
}

.agent-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.agent-name {
    font-weight: 600;
    font-size: 1em;
}

.amount-cell {
    font-weight: 700;
    font-size: 1.1em;
    color: var(--success);
}

.amount-refunded {
    color: var(--text-muted);
    text-decoration: line-through;
}

.status-badge {
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.status-badge.completed {
    background: rgba(16, 185, 129, 0.12);
    color: var(--success);
}

.status-badge.refunded {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger);
}

.action-btn {
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-family: inherit;
    background: rgba(245, 158, 11, 0.12);
    color: var(--warning);
}

.action-btn:hover {
    background: rgba(245, 158, 11, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.conv-id {
    background: var(--dark);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8em;
    font-family: 'SF Mono', 'Consolas', monospace;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    display: inline-block;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.refund-reason {
    font-size: 0.8em;
    color: var(--danger);
    margin-top: 6px;
    padding: 4px 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
    border-left: 3px solid var(--danger);
    cursor: pointer;
    display: inline-block;
}

.refund-reason:hover {
    background: rgba(239, 68, 68, 0.15);
}

.refund-info {
    font-size: 0.75em;
    color: var(--text-muted);
    margin-top: 4px;
}

.processed-label {
    color: var(--text-muted);
    font-size: 0.85em;
}

.no-payment {
    color: var(--text-muted);
    font-size: 0.8em;
}

.empty-state {
    text-align: center;
    padding: 80px 40px;
    color: var(--text-muted);
}

.empty-state i {
    font-size: 4em;
    margin-bottom: 20px;
    color: var(--dark-tertiary);
}

.empty-state p {
    font-size: 1.1em;
}

/* Responsive */
@media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .filters-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .header { flex-direction: column; gap: 20px; text-align: center; }
    .header-actions { justify-content: center; flex-wrap: wrap; }
    .stats-grid { grid-template-columns: 1fr; }
    .filters-grid { grid-template-columns: 1fr; }
    .table-section { overflow-x: auto; }
    table { min-width: 900px; }
    .container { padding: 16px; }
    .currency-toggle { 
        flex-direction: column; 
        gap: 12px;
        text-align: center;
    }
    .exchange-rate-info { margin-left: 0; }
}

/* Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stat-card { animation: fadeInUp 0.6s ease-out backwards; }
.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.15s; }
.stat-card:nth-child(3) { animation-delay: 0.2s; }
.stat-card:nth-child(4) { animation-delay: 0.25s; }
.filters-section { animation: fadeInUp 0.6s ease-out 0.35s backwards; }
.table-section { animation: fadeInUp 0.6s ease-out 0.45s backwards; }

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background: var(--dark-secondary);
    border: 1px solid var(--border);
    padding: 28px;
    border-radius: 20px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    color: var(--danger);
    font-size: 1.1em;
    font-weight: 600;
}

.modal-body {
    color: var(--text-secondary);
    line-height: 1.6;
    padding: 14px;
    background: var(--dark);
    border-radius: 10px;
    border-left: 4px solid var(--danger);
    margin-bottom: 20px;
}

.modal-close {
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    float: right;
    font-family: inherit;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: var(--primary-dark);
}
`;

module.exports = { adminStyles };
