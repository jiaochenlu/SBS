/**
 * Experiment Detail Initialization Module
 * 从HTML内联JavaScript中提取的初始化逻辑
 */

import {
    calculateUniqueJudges,
    calculateProgressStats,
    generateUserDropdown,
    getCurrentExperiment,
    updateUIElements,
    updateProgressBars,
    loadQueryList,
    applyFallbackUpdates
} from './experiment-detail-utils.js';

import {
    loadExperimentConfig,
    loadFallbackData,
    getExperimentData,
    setExperimentData
} from './experiment-detail-data.js';

/**
 * 延迟更新UI元素
 */
function delayedUIUpdates(exp) {
    setTimeout(() => {
        console.log('🔄 Generating user dropdown...');
        generateUserDropdown();
        
        // 确保Members tab badge显示正确的值
        const membersTabBadge = document.getElementById('membersTabBadge');
        if (membersTabBadge && exp.members) {
            membersTabBadge.textContent = exp.members.length;
            console.log('🔧 Force updated membersTabBadge to:', exp.members.length);
        }
        
        // 同时确保judges count显示正确的值
        const judgesCountEl = document.getElementById('judgesCount');
        if (judgesCountEl && exp.queries) {
            const correctJudgesCount = calculateUniqueJudges(exp);
            judgesCountEl.textContent = correctJudgesCount;
            console.log('🔧 Force updated judgesCount to:', correctJudgesCount);
        }
    }, 100);
}

/**
 * 最终检查和修正UI元素
 */
function finalUIVerification(exp) {
    setTimeout(() => {
        const membersTabBadge = document.getElementById('membersTabBadge');
        if (membersTabBadge && exp.members) {
            const currentValue = membersTabBadge.textContent;
            const expectedValue = exp.members.length;
            
            console.log('🔍 Final check - Current members badge:', currentValue, 'Expected:', expectedValue);
            
            if (currentValue !== expectedValue.toString()) {
                membersTabBadge.textContent = expectedValue;
                console.log('🔧 Corrected membersTabBadge from', currentValue, 'to', expectedValue);
            }
        }
        
        // 最终检查judges count
        const judgesCountEl = document.getElementById('judgesCount');
        if (judgesCountEl && exp.queries) {
            const currentJudgesValue = judgesCountEl.textContent;
            const expectedJudgesValue = calculateUniqueJudges(exp);
            
            console.log('🔍 Final check - Current judges count:', currentJudgesValue, 'Expected:', expectedJudgesValue);
            
            if (currentJudgesValue !== expectedJudgesValue) {
                judgesCountEl.textContent = expectedJudgesValue;
                console.log('🔧 Corrected judgesCount from', currentJudgesValue, 'to', expectedJudgesValue);
            }
        }
    }, 500);
}

/**
 * 准备UI更新数据
 */
function prepareUIUpdates(exp) {
    return [
        { id: 'experimentTitle', value: exp.name, title: exp.name },
        { id: 'experimentStatus', value: exp.status.charAt(0).toUpperCase() + exp.status.slice(1) },
        { id: 'experimentCreated', value: `Created: ${exp.createdAt}` },
        { id: 'experimentOwner', value: `Owner: ${exp.owner.name}` },
        { id: 'experimentQueryCount', value: `${exp.queries ? exp.queries.length : 0} queries` },
        { id: 'totalQueriesDisplay', value: `${exp.queries ? exp.queries.length : 0} Total Queries` },
        { id: 'completedStat', value: calculateProgressStats(exp).completed },
        { id: 'inProgressStat', value: calculateProgressStats(exp).inProgress },
        { id: 'notStartedStat', value: calculateProgressStats(exp).notStarted },
        { id: 'judgesCount', value: calculateUniqueJudges(exp) },
        { id: 'configExperimentType', value: exp.configuration.experimentType },
        { id: 'configExperimentName', value: exp.name },
        { id: 'configExperimentDescription', value: exp.description },
        { id: 'configDataSchema', value: exp.configuration.dataSchema },
        { id: 'configDataSource', value: exp.configuration.dataSource },
        { id: 'configQuerySetSelection', value: exp.configuration.querySetSelection },
        { id: 'configQuerySetFile', value: `${exp.configuration.querySetFile.name} (${exp.configuration.querySetFile.queryCount} queries)` },
        { id: 'configControlProfile', value: exp.configuration.controlProfile },
        { id: 'configTreatmentProfile', value: exp.configuration.treatmentProfile },
        { id: 'configDataFieldsDisplay', value: exp.configuration.dataFieldsDisplay },
        { id: 'configBlindTest', value: exp.configuration.additionalSettings.blindTest ? 'Enabled' : 'Disabled' },
        { id: 'configAllowAnyToJudge', value: exp.configuration.additionalSettings.allowAnyToJudge ? 'Enabled' : 'Disabled' },
        { id: 'configJudgementGuide', value: exp.configuration.additionalSettings.judgementGuide },
        { id: 'queriesTabBadge', value: exp.queries.length },
        { id: 'membersTabBadge', value: exp.members.length }
    ];
}

/**
 * 主要的配置加载和UI更新函数
 * 使用数据模块的loadExperimentConfig
 */
export async function initializeExperimentDetail() {
    console.log('🚀 Initializing experiment detail...');
    
    try {
        // 使用数据模块加载配置
        const configLoaded = await loadExperimentConfig();
        
        if (!configLoaded) {
            console.warn('⚠️ Config loading failed, using fallback data');
            loadFallbackData();
        }
        
        // 获取实验数据
        const exp = getExperimentData();
        if (!exp) {
            console.error('❌ No experiment data available');
            applyFallbackUpdates();
            return;
        }
        
        console.log(`📋 Loading experiment: ${exp.name} (${exp.id})`);
        
        // 延迟生成用户下拉菜单，确保DOM和数据都就绪
        delayedUIUpdates(exp);
        
        // 额外的检查，在更长的延迟后再次确保正确值
        finalUIVerification(exp);
        
        // Update all hardcoded "Loading..." immediately
        const updates = prepareUIUpdates(exp);
        updateUIElements(updates);
        
        // Update progress bars using calculated stats
        const progressStats = calculateProgressStats(exp);
        updateProgressBars(progressStats);
        
        // Update experiment status badge class
        const statusElement = document.getElementById('experimentStatus');
        if (statusElement) {
            statusElement.className = `status-badge status-${exp.status}`;
        }
        
        console.log('🎉 All UI elements updated successfully!');
        console.log('📊 Members count from initialization:', exp.members.length);
        
        // Load queries into the query list
        loadQueryList(exp);
        
        // 触发主JS文件的初始化（如果需要）
        if (window.initializeMainExperimentDetail) {
            console.log('🔄 Triggering main experiment detail initialization...');
            window.initializeMainExperimentDetail();
        }
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        // Set fallback values if initialization fails
        loadFallbackData();
        applyFallbackUpdates();
    }
}

/**
 * 简化版初始化（不使用内联方式）
 */
export async function simpleInitialize() {
    console.log('🚀 Simple initialization starting...');
    
    try {
        // 先尝试从现有全局变量获取数据
        if (window.experimentData || window.exp) {
            const exp = window.experimentData || window.exp;
            console.log('✅ Using existing experiment data:', exp);
            setExperimentData(exp);
            
            // 基本UI更新
            const updates = prepareUIUpdates(exp);
            updateUIElements(updates);
            
            const progressStats = calculateProgressStats(exp);
            updateProgressBars(progressStats);
            
            return;
        }
        
        // 如果没有现有数据，则加载配置
        await initializeExperimentDetail();
        
    } catch (error) {
        console.error('❌ Simple initialization failed:', error);
        applyFallbackUpdates();
    }
}

// 导出供全局使用
window.initializeExperimentDetail = initializeExperimentDetail;
window.simpleInitialize = simpleInitialize;