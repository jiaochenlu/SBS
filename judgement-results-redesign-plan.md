# Judgement Results 页面重设计实施计划

## 概述
根据用户需求，重新设计 Judgement Results 页面，分为 Scorecard 和 Throughput 两大部分。

## 第一步：更新配置文件

### 需要在 experiment-config-merged.json 中为每个实验添加 results 数据结构：

```json
"results": {
  "scorecard": {
    "sbsSurplus": 0.0228,
    "pValue": 0.6904,
    "optionDistribution": [
      {"option": "Left is better", "count": 45},
      {"option": "Right is better", "count": 32},
      {"option": "Tie", "count": 18}
    ]
  },
  "agreement": {
    "totalAgreementRate": 0.153846,
    "agreementDistribution": [
      {"rate": "3/3", "count": 15},
      {"rate": "2/3", "count": 35},
      {"rate": "1/3", "count": 45}
    ]
  },
  "throughput": {
    "totalJudgementCount": 295,
    "totalJudgesCount": 4,
    "averageCompletionTime": 2.3,
    "dailyProgress": [
      {"date": "2024-03-10", "count": 12},
      {"date": "2024-03-11", "count": 18},
      {"date": "2024-03-12", "count": 25},
      {"date": "2024-03-13", "count": 30},
      {"date": "2024-03-14", "count": 28},
      {"date": "2024-03-15", "count": 35},
      {"date": "2024-03-16", "count": 42}
    ]
  }
}
```

### 为三个实验分别添加不同的 mock 数据：

#### 实验 1 (search-ndcg-001):
- SBS Surplus: 0.0228, P-Value: 0.6904
- Agreement Rate: 15.38%
- Total Judgements: 295

#### 实验 2 (search-ndcg-002):
- SBS Surplus: 0.0156, P-Value: 0.4520
- Agreement Rate: 23.67%
- Total Judgements: 128

#### 实验 3 (search-ndcg-003):
- SBS Surplus: 0.0334, P-Value: 0.8123
- Agreement Rate: 31.25%
- Total Judgements: 167

## 第二步：HTML 结构重构

### 替换当前的 Results tab 内容：

```html
<!-- Results Tab -->
<div id="results-tab" class="tab-content">
  <div class="content-container">
    <div class="section-header">
      <h3>Judgement Results</h3>
      <div class="header-actions">
        <button class="btn-primary" onclick="exportData()">Export Judgement Data</button>
      </div>
    </div>

    <!-- Scorecard Section -->
    <div class="scorecard-section">
      <div class="section-title">
        <h4>Scorecard</h4>
      </div>
      
      <div class="sbs-quality-container">
        <div class="subsection-header">
          <h5>SBS Overall Quality</h5>
          <select class="question-selector" id="questionSelector">
            <!-- Options populated dynamically from judgementQuestions -->
          </select>
        </div>
        
        <div class="metrics-grid">
          <!-- SBS Surplus -->
          <div class="metric-container">
            <div class="metric-card">
              <div class="metric-title">SBS Surplus</div>
              <div class="metric-value" id="sbsSurplus">0.0228</div>
              <div class="metric-subtitle">P-Value: <span id="pValue">0.6904</span></div>
            </div>
            <div class="chart-container">
              <canvas id="sbsChart" width="300" height="200"></canvas>
            </div>
          </div>
          
          <!-- Inter-judges Agreement -->
          <div class="metric-container">
            <div class="metric-card">
              <div class="metric-title">Inter-judges Agreement</div>
              <div class="metric-value" id="agreementRate">15.38%</div>
              <div class="metric-subtitle">Total Agreement Rate</div>
            </div>
            <div class="chart-container">
              <canvas id="agreementChart" width="300" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Throughput Section -->
    <div class="throughput-section">
      <div class="section-title">
        <h4>Throughput</h4>
      </div>
      
      <div class="throughput-stats">
        <div class="stat-card">
          <div class="stat-title">Total Judgement Count</div>
          <div class="stat-value" id="totalJudgements">295</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Total Judges Count</div>
          <div class="stat-value" id="totalJudges">4</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Average Completion Time</div>
          <div class="stat-value" id="avgCompletionTime">2.3 min</div>
        </div>
      </div>
      
      <div class="progress-chart-container">
        <h6>Completion Progress Over Time</h6>
        <canvas id="progressChart" width="800" height="300"></canvas>
      </div>
    </div>
  </div>
</div>
```

## 第三步：CSS 样式添加

### 在 experiment-detail.css 中添加新的样式：

```css
/* Scorecard Section */
.scorecard-section {
  margin-bottom: 30px;
}

.section-title h4 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.sbs-quality-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.subsection-header h5 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #495057;
}

.question-selector {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.metric-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 200px;
}

.metric-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 4px;
}

.metric-subtitle {
  font-size: 0.8rem;
  color: #6c757d;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Throughput Section */
.throughput-section {
  margin-top: 30px;
}

.throughput-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: #28a745;
}

.progress-chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.progress-chart-container h6 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 15px;
  color: #495057;
}
```

## 第四步：JavaScript 功能实现

### 需要添加的主要功能：

1. **数据加载**: 从配置文件加载 results 数据
2. **下拉框填充**: 根据 judgementQuestions 填充问题选择器
3. **图表渲染**: 使用 Chart.js 渲染柱状图和折线图
4. **数据切换**: 支持切换不同问题查看不同的结果

### 主要 JavaScript 函数：

```javascript
// 加载 Results 数据
function loadResultsData(experimentData) {
  const results = experimentData.results;
  
  // 更新 Scorecard 数据
  updateScorecardData(results.scorecard, results.agreement);
  
  // 更新 Throughput 数据
  updateThroughputData(results.throughput);
  
  // 渲染图表
  renderCharts(results);
}

// 填充问题选择器
function populateQuestionSelector(judgementQuestions) {
  const selector = document.getElementById('questionSelector');
  const sideBySideQuestions = judgementQuestions.filter(q => 
    q.type.includes('Query Level Side-by-Side')
  );
  
  sideBySideQuestions.forEach(question => {
    const option = document.createElement('option');
    option.value = question.id;
    option.textContent = question.text;
    selector.appendChild(option);
  });
}

// 渲染图表
function renderCharts(results) {
  renderSBSChart(results.scorecard.optionDistribution);
  renderAgreementChart(results.agreement.agreementDistribution);
  renderProgressChart(results.throughput.dailyProgress);
}
```

## 实施顺序

1. ✅ 创建实施计划文档
2. 🔄 切换到 Code 模式
3. ⏳ 更新配置文件添加 mock 数据
4. ⏳ 重构 HTML 结构
5. ⏳ 添加 CSS 样式
6. ⏳ 实现 JavaScript 功能
7. ⏳ 集成 Chart.js 图表库
8. ⏳ 测试和调试

## 注意事项

- 确保所有 mock 数据格式一致
- 图表数据要与实际的 judgementQuestions 对应
- 保持现有的用户体验和交互逻辑
- 考虑响应式设计，确保在不同屏幕尺寸下正常显示