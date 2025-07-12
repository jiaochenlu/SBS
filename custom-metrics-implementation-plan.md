# Custom Metrics Section 实施计划

## 📋 需求分析
在 Scorecard 部分的 SBS Overall Quality section 下面添加一个新的 Custom Metrics section：
- 有些实验定义了 custom metrics，有些没有
- 没有定义时显示为空
- 有定义时展示 metrics 名称和具体分值
- 默认所有实验都没有定义 custom metrics

## 🗂️ 实施步骤

### 步骤 1：更新数据配置文件
**文件**: `experiment-result-config.json`

**修改内容**:
```json
{
  "experimentResults": {
    "search-ndcg-001": {
      "scorecard": { ... },
      "agreement": { ... },
      "customMetrics": [], // 空数组表示没有定义
      "throughput": { ... }
    },
    "search-ndcg-002": {
      "scorecard": { ... },
      "agreement": { ... },
      "customMetrics": [
        {
          "name": "User Satisfaction Score",
          "value": 4.2,
          "unit": "/5"
        },
        {
          "name": "Task Completion Rate",
          "value": 85.6,
          "unit": "%"
        }
      ], // 示例：有定义的 metrics
      "throughput": { ... }
    },
    "search-ndcg-003": {
      "scorecard": { ... },
      "agreement": { ... },
      "customMetrics": [], // 空数组表示没有定义
      "throughput": { ... }
    }
  }
}
```

### 步骤 2：更新 HTML 结构
**文件**: `experiment-detail.html`

**位置**: 在 SBS Overall Quality section 之后，Throughput section 之前

**新增结构**:
```html
<!-- Custom Metrics Section -->
<div class="custom-metrics-section">
    <div class="section-title">
        <h4>Custom Metrics</h4>
    </div>
    
    <div class="custom-metrics-container" id="customMetricsContainer">
        <!-- 动态内容将在这里填充 -->
        <!-- 如果没有 custom metrics，显示空状态 -->
        <!-- 如果有 custom metrics，显示 metric 卡片 -->
    </div>
</div>
```

### 步骤 3：添加 CSS 样式
**文件**: `experiment-detail.css`

**新增样式**:
```css
/* Custom Metrics Section Styles */
.custom-metrics-section {
    margin-bottom: 40px;
}

.custom-metrics-container {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 25px;
    border: 1px solid #dee2e6;
    min-height: 120px;
}

.custom-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.custom-metric-card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    border: 1px solid #e9ecef;
    text-align: center;
}

.custom-metric-name {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 10px;
    font-weight: 500;
}

.custom-metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #28a745;
    line-height: 1.1;
}

.custom-metric-unit {
    font-size: 1rem;
    color: #6c757d;
    margin-left: 4px;
}

.custom-metrics-empty {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    padding: 40px 20px;
}

.custom-metrics-empty::before {
    content: "📊";
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .custom-metrics-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .custom-metrics-container {
        padding: 20px;
    }
}
```

### 步骤 4：更新 JavaScript 功能
**文件**: `experiment-detail.js`

**新增函数**:
```javascript
// 更新 loadResultsData 函数
async function loadResultsData() {
    try {
        // ... 现有代码 ...
        
        // 添加 Custom Metrics 数据更新
        updateCustomMetrics(experimentResults.customMetrics);
        
        // ... 现有代码 ...
    } catch (error) {
        // ... 错误处理 ...
    }
}

// 新增函数：更新 Custom Metrics 显示
function updateCustomMetrics(customMetrics) {
    const container = document.getElementById('customMetricsContainer');
    if (!container) return;
    
    if (!customMetrics || customMetrics.length === 0) {
        // 显示空状态
        container.innerHTML = `
            <div class="custom-metrics-empty">
                No custom metrics defined for this experiment
            </div>
        `;
    } else {
        // 显示 metrics 卡片
        container.innerHTML = `
            <div class="custom-metrics-grid">
                ${customMetrics.map(metric => `
                    <div class="custom-metric-card">
                        <div class="custom-metric-name">${metric.name}</div>
                        <div class="custom-metric-value">
                            ${metric.value}
                            <span class="custom-metric-unit">${metric.unit || ''}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// 更新 loadFallbackResultsData 函数
function loadFallbackResultsData() {
    // ... 现有代码 ...
    
    const fallbackData = {
        // ... 现有数据 ...
        customMetrics: [] // 添加空的 custom metrics
    };
    
    // ... 现有代码 ...
    updateCustomMetrics(fallbackData.customMetrics);
}
```

## 🎨 视觉设计

### 有 Custom Metrics 时的布局：
```
┌─────────────────────────────────────────────────────────┐
│                    Custom Metrics                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ User Satisfaction│  │ Task Completion │              │
│  │     Score        │  │      Rate       │              │
│  │      4.2/5       │  │     85.6%       │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 没有 Custom Metrics 时的布局：
```
┌─────────────────────────────────────────────────────────┐
│                    Custom Metrics                       │
├─────────────────────────────────────────────────────────┤
│                        📊                              │
│            No custom metrics defined                   │
│               for this experiment                       │
└─────────────────────────────────────────────────────────┘
```

## 🧪 测试用例

### 测试场景 1：没有 Custom Metrics
- **实验**: search-ndcg-001, search-ndcg-003
- **期望结果**: 显示空状态消息

### 测试场景 2：有 Custom Metrics
- **实验**: search-ndcg-002
- **期望结果**: 显示 2 个 metric 卡片

### 测试场景 3：响应式测试
- **桌面端**: Metrics 卡片在网格中水平排列
- **移动端**: Metrics 卡片垂直堆叠

## 📝 实施优先级

1. **高优先级**: 更新配置文件和基础 HTML 结构
2. **中优先级**: 添加 CSS 样式和 JavaScript 功能
3. **低优先级**: 响应式设计优化和空状态美化

## 🔍 验收标准

- ✅ 配置文件包含 customMetrics 字段
- ✅ HTML 结构正确添加到指定位置
- ✅ 没有 metrics 时显示友好的空状态
- ✅ 有 metrics 时正确显示所有卡片
- ✅ 响应式设计在所有设备上正常工作
- ✅ 样式与现有设计保持一致