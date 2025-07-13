/**
 * Experiment Detail Charts Module
 * 处理所有图表渲染和管理功能
 */

// Store chart instances to manage lifecycle
let chartInstances = new Map();

/**
 * Chart Manager Class - 统一管理所有图表
 */
export class ChartManager {
    constructor() {
        this.charts = new Map();
    }
    
    /**
     * 销毁指定图表
     */
    destroyChart(chartId) {
        if (this.charts.has(chartId)) {
            const chart = this.charts.get(chartId);
            chart.destroy();
            this.charts.delete(chartId);
            console.log(`📊 Destroyed chart: ${chartId}`);
        }
    }
    
    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        this.charts.forEach((chart, id) => {
            chart.destroy();
            console.log(`📊 Destroyed chart: ${id}`);
        });
        this.charts.clear();
    }
    
    /**
     * 注册图表实例
     */
    registerChart(chartId, chartInstance) {
        // 如果已存在同名图表，先销毁
        this.destroyChart(chartId);
        this.charts.set(chartId, chartInstance);
    }
    
    /**
     * 获取图表实例
     */
    getChart(chartId) {
        return this.charts.get(chartId);
    }
}

// 全局图表管理器实例
export const chartManager = new ChartManager();

/**
 * Destroy existing chart instances
 * 兼容原有的destroyExistingCharts函数
 */
export function destroyExistingCharts() {
    chartManager.destroyAllCharts();
    
    // 清理全局变量（兼容原代码）
    if (window.sbsChartInstance) {
        window.sbsChartInstance.destroy();
        window.sbsChartInstance = null;
    }
    if (window.agreementChartInstance) {
        window.agreementChartInstance.destroy();
        window.agreementChartInstance = null;
    }
    if (window.progressChartInstance) {
        window.progressChartInstance.destroy();
        window.progressChartInstance = null;
    }
}

/**
 * 通用图表渲染函数
 */
function createChart(canvasId, type, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`❌ Canvas element ${canvasId} not found`);
        return null;
    }
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const chart = new Chart(ctx, {
            type,
            data,
            options: mergedOptions
        });
        
        chartManager.registerChart(canvasId, chart);
        console.log(`📊 Created ${type} chart: ${canvasId}`);
        return chart;
    } catch (error) {
        console.error(`❌ Error creating chart ${canvasId}:`, error);
        return null;
    }
}

/**
 * Render SBS Surplus chart
 */
export function renderSBSChart(optionDistribution) {
    console.log('📊 Rendering SBS chart with data:', optionDistribution);
    
    const data = {
        labels: optionDistribution.map(item => item.option),
        datasets: [{
            label: 'Judgement Count',
            data: optionDistribution.map(item => item.count),
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    const options = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };
    
    const chart = createChart('sbsChart', 'bar', data, options);
    
    // 兼容原代码的全局变量
    window.sbsChartInstance = chart;
    
    return chart;
}

/**
 * Render Agreement Rate chart
 */
export function renderAgreementChart(agreementDistribution) {
    console.log('📊 Rendering agreement chart with data:', agreementDistribution);
    
    const data = {
        labels: agreementDistribution.map(item => item.rate),
        datasets: [{
            label: 'Count',
            data: agreementDistribution.map(item => item.count),
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 205, 86, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 205, 86, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    const options = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };
    
    const chart = createChart('agreementChart', 'bar', data, options);
    
    // 兼容原代码的全局变量
    window.agreementChartInstance = chart;
    
    return chart;
}

/**
 * Render Progress over time chart
 */
export function renderProgressChart(dailyProgress) {
    console.log('📊 Rendering progress chart with data:', dailyProgress);
    
    // Destroy existing progress chart if it exists
    chartManager.destroyChart('progressChart');
    
    const data = {
        labels: dailyProgress.map(item => item.date),
        datasets: [{
            label: 'Daily Judgements',
            data: dailyProgress.map(item => item.count),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
    
    const options = {
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5
                }
            },
            x: {
                ticks: {
                    maxRotation: 45
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        }
    };
    
    const chart = createChart('progressChart', 'line', data, options);
    
    // 兼容原代码的全局变量
    window.progressChartInstance = chart;
    
    return chart;
}

/**
 * Render all charts - 统一渲染入口
 */
export function renderResultsCharts(experimentResults) {
    console.log('📊 Rendering results charts...');
    
    // Destroy existing charts before creating new ones
    destroyExistingCharts();
    
    // Render SBS distribution chart
    if (experimentResults.scorecard && experimentResults.scorecard.optionDistribution) {
        renderSBSChart(experimentResults.scorecard.optionDistribution);
    }
    
    // Render Agreement distribution chart
    if (experimentResults.agreement && experimentResults.agreement.agreementDistribution) {
        renderAgreementChart(experimentResults.agreement.agreementDistribution);
    }
    
    // Render Progress over time chart
    if (experimentResults.throughput && experimentResults.throughput.dailyProgress) {
        renderProgressChart(experimentResults.throughput.dailyProgress);
    }
}

/**
 * 加载默认图表数据（fallback）
 */
export function loadFallbackChartsData() {
    console.log('📊 Loading fallback charts data...');
    
    const fallbackData = {
        scorecard: {
            sbsSurplus: 0.0228,
            pValue: 0.6904,
            optionDistribution: [
                {"option": "Left is better", "count": 45},
                {"option": "Right is better", "count": 32},
                {"option": "Tie", "count": 18}
            ]
        },
        agreement: {
            totalAgreementRate: 0.153846,
            agreementDistribution: [
                {"rate": "3/3", "count": 15},
                {"rate": "2/3", "count": 35},
                {"rate": "1/3", "count": 45}
            ]
        },
        throughput: {
            totalJudgementCount: 295,
            totalJudgesCount: 4,
            averageCompletionTime: 2.3,
            dailyProgress: [
                {"date": "2024-03-10", "count": 12},
                {"date": "2024-03-11", "count": 18},
                {"date": "2024-03-12", "count": 25},
                {"date": "2024-03-13", "count": 30},
                {"date": "2024-03-14", "count": 28},
                {"date": "2024-03-15", "count": 35},
                {"date": "2024-03-16", "count": 42}
            ]
        }
    };
    
    renderResultsCharts(fallbackData);
    return fallbackData;
}

/**
 * 重新渲染特定图表
 */
export function refreshChart(chartId, data, options = {}) {
    const existingChart = chartManager.getChart(chartId);
    if (existingChart) {
        // 更新现有图表数据
        existingChart.data = data;
        if (options) {
            Object.assign(existingChart.options, options);
        }
        existingChart.update();
        console.log(`📊 Refreshed chart: ${chartId}`);
    } else {
        console.warn(`❌ Chart ${chartId} not found for refresh`);
    }
}

// 导出全局使用的函数（兼容原代码）
window.destroyExistingCharts = destroyExistingCharts;
window.renderSBSChart = renderSBSChart;
window.renderAgreementChart = renderAgreementChart;
window.renderProgressChart = renderProgressChart;
window.renderResultsCharts = renderResultsCharts;