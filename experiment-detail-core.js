/**
 * Experiment Detail Core Module (Optimized)
 * 优化后的核心功能模块，整合了新的模块化组件
 */

import { 
    getExperimentData, 
    getUsers, 
    getCurrentUser, 
    getExperimentConfig,
    setCurrentUser 
} from './experiment-detail-data.js';

import { chartManager, renderResultsCharts, loadFallbackChartsData } from './experiment-detail-charts.js';
import { loadQueries, updateSelectedQueries } from './experiment-detail-queries.js';
import { loadMembers } from './experiment-detail-members.js';
import { modalManager, showConfigurationModal, showDeleteConfirmationModal } from './experiment-detail-modals.js';

// Results storage
let customMetricsData = [];

/**
 * Update UI elements with configuration data
 * 简化版本，移除重复逻辑
 */
export function updateUIWithConfigData() {
    console.log('🎨 updateUIWithConfigData called');
    
    const experimentData = getExperimentData();
    if (!experimentData) {
        console.error('❌ experimentData is null, cannot update UI');
        return;
    }
    
    console.log('🔄 Starting UI updates...');
    
    // Update progress overview
    updateProgressOverview();
    
    // Update tab badges
    updateTabBadges();
    
    // Update configuration panel with a small delay to ensure DOM is ready
    setTimeout(() => {
        updateConfigurationPanel();
    }, 100);
    
    // Update UI based on role and experiment settings
    updateUIBasedOnRole();
    
    console.log('✅ updateUIWithConfigData completed');
}

/**
 * Update progress overview section
 */
function updateProgressOverview() {
    console.log('📊 updateProgressOverview called');
    
    const experimentData = getExperimentData();
    if (!experimentData) {
        console.warn('❌ experimentData is null in updateProgressOverview');
        return;
    }
    
    const queries = experimentData.queries || [];
    console.log('📊 Queries data:', queries);

    // Calculate total queries
    const totalQueries = queries.length;

    // Calculate unique judges
    const uniqueJudges = new Set();
    queries.forEach(query => {
        if (query.assignments) {
            query.assignments.forEach(assignment => {
                uniqueJudges.add(assignment.judge.name);
            });
        }
    });

    // Calculate query statuses
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    queries.forEach(query => {
        const assignments = query.assignments || [];
        const completedAssignments = assignments.filter(a => a.status === 'completed').length;
        const totalAssignments = assignments.length;

        if (completedAssignments === totalAssignments && totalAssignments > 0) {
            completedCount++;
        } else if (completedAssignments > 0) {
            inProgressCount++;
        } else {
            notStartedCount++;
        }
    });

    // Calculate percentages
    const completedPercentage = totalQueries > 0 ? Math.round((completedCount / totalQueries) * 100) : 0;
    const inProgressPercentage = totalQueries > 0 ? Math.round((inProgressCount / totalQueries) * 100) : 0;
    const notStartedPercentage = totalQueries > 0 ? Math.round((notStartedCount / totalQueries) * 100) : 0;
    
    // Update DOM elements
    updateElementSafely('totalQueriesDisplay', `${totalQueries} Total Queries`);
    updateElementSafely('judgesCount', `${uniqueJudges.size} Judges`);
    
    // Update progress segments
    updateProgressSegment('progressCompleted', completedPercentage, `${completedCount} Completed (${completedPercentage}%)`);
    updateProgressSegment('progressInProgress', inProgressPercentage, `${inProgressCount} In Progress (${inProgressPercentage}%)`);
    updateProgressSegment('progressNotStarted', notStartedPercentage, `${notStartedCount} Not Started (${notStartedPercentage}%)`);
    
    // Update progress statistics
    updateElementSafely('completedStat', `${completedCount} Completed (${completedPercentage}%)`);
    updateElementSafely('inProgressStat', `${inProgressCount} In Progress (${inProgressPercentage}%)`);
    updateElementSafely('notStartedStat', `${notStartedCount} Not Started (${notStartedPercentage}%)`);
    
    console.log('✅ updateProgressOverview completed');
}

/**
 * 安全更新元素内容
 */
function updateElementSafely(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        console.log(`✅ Updated ${id} to: ${content}`);
    } else {
        console.warn(`❌ Element ${id} not found`);
    }
}

/**
 * 更新进度条段
 */
function updateProgressSegment(id, percentage, title) {
    const element = document.getElementById(id);
    if (element) {
        element.style.width = `${percentage}%`;
        element.title = title;
        console.log(`✅ Updated ${id} width to: ${percentage}%`);
    } else {
        console.warn(`❌ Element ${id} not found`);
    }
}

/**
 * Update tab badges
 */
function updateTabBadges() {
    const experimentData = getExperimentData();
    if (!experimentData) return;
    
    console.log('📊 updateTabBadges called with experimentData:', experimentData);
    
    updateElementSafely('queriesTabBadge', experimentData.queries.length);
    updateElementSafely('membersTabBadge', experimentData.members.length);
}

/**
 * Update configuration panel
 */
function updateConfigurationPanel() {
    const experimentData = getExperimentData();
    if (!experimentData) {
        console.warn('⚠️ experimentData is null, cannot update configuration panel');
        return;
    }
    
    const config = experimentData.configuration;
    console.log('🔧 Updating configuration panel with:', config);
    
    // Update basic configuration items
    updateElementSafely('configExperimentType', config.experimentType);
    updateElementSafely('configExperimentName', experimentData.name);
    updateElementSafely('configExperimentDescription', experimentData.description);
    updateElementSafely('configDataSchema', config.dataSchema);
    updateElementSafely('configDataSource', config.dataSource);
    updateElementSafely('configQuerySetSelection', config.querySetSelection);
    updateElementSafely('configQuerySetFile', `${config.querySetFile.name} (${config.querySetFile.queryCount} queries)`);
    updateElementSafely('configControlProfile', config.controlProfile);
    updateElementSafely('configTreatmentProfile', config.treatmentProfile);
    updateElementSafely('configDataFieldsDisplay', config.dataFieldsDisplay);
    
    // Update judgement questions
    updateJudgementQuestions(config.judgementQuestions);
    
    // Update additional settings
    updateElementSafely('configBlindTest', config.additionalSettings.blindTest ? 'Enabled' : 'Disabled');
    updateElementSafely('configAllowAnyToJudge', config.additionalSettings.allowAnyToJudge ? 'Enabled' : 'Disabled');
    updateElementSafely('configJudgementGuide', config.additionalSettings.judgementGuide);
}

/**
 * Update judgement questions section
 */
function updateJudgementQuestions(questions) {
    const container = document.getElementById('judgementQuestionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'config-item';
        questionDiv.innerHTML = `
            <span class="config-label">Question ${question.id}:</span>
            <span class="config-value">${question.text} (${question.type})</span>
        `;
        container.appendChild(questionDiv);
    });
}

/**
 * Tab switching functionality
 */
export function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Load specific tab content using modular functions
    if (tabName === 'queries') {
        loadQueries();
    } else if (tabName === 'members') {
        loadMembers();
    } else if (tabName === 'results') {
        loadResults();
    }
}

/**
 * User switching functions
 */
export function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const currentUserElement = document.querySelector('.current-user');
    
    if (dropdown && currentUserElement) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        } else {
            // Calculate position for fixed positioning
            const rect = currentUserElement.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 8) + 'px';
            dropdown.style.left = rect.left + 'px';
            dropdown.style.width = rect.width + 'px';
            dropdown.classList.add('show');
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.user-switcher')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

export function switchUser(userId) {
    const users = getUsers();
    const user = users[userId];
    if (!user) return;
    
    // Update current user
    setCurrentUser(user);
    
    // Update UI to reflect new user
    updateUserDisplay();
    updatePermissions();
    updateUIBasedOnRole();
    
    // Close dropdown
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Reload content to apply role-based filtering
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        const tabName = activeTab.getAttribute('data-tab');
        switchTab(tabName);
    }
}

function updateUserDisplay() {
    const currentUser = getCurrentUser();
    console.log('👤 updateUserDisplay called, currentUser:', currentUser);
    
    if (!currentUser) {
        console.warn('❌ currentUser is null, cannot update user display');
        return;
    }
    
    updateElementSafely('currentUserAvatar', currentUser.initials);
    updateElementSafely('currentUserName', currentUser.name);
    updateElementSafely('currentUserRole', getRoleDisplayName(currentUser.role));
}

function getRoleDisplayName(role) {
    const roleNames = {
        'owner': 'Owner',
        'co-owner': 'Co-Owner',
        'judge': 'Judge'
    };
    return roleNames[role] || role;
}

function updatePermissions() {
    updateHeaderButtons();
    updateQueryPermissions();
    updateMemberPermissions();
    updateResultPermissions();
    updateQueryListPermissions();
}

function updateHeaderButtons() {
    const currentUser = getCurrentUser();
    const configBtn = document.getElementById('configBtn');
    const cloneBtn = document.getElementById('cloneBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    // Configuration: All users can view
    if (configBtn) {
        configBtn.disabled = false;
        configBtn.classList.remove('disabled');
        configBtn.removeAttribute('data-tooltip');
    }
    
    // Clone: All users can clone
    if (cloneBtn) {
        cloneBtn.disabled = false;
        cloneBtn.classList.remove('disabled');
        cloneBtn.removeAttribute('data-tooltip');
    }
    
    // Delete: Only owner can delete
    if (deleteBtn) {
        if (currentUser.role === 'owner') {
            deleteBtn.disabled = false;
            deleteBtn.classList.remove('disabled');
            deleteBtn.removeAttribute('data-tooltip');
        } else {
            deleteBtn.disabled = true;
            deleteBtn.classList.add('disabled');
        }
    }
}

function updateQueryPermissions() {
    const currentUser = getCurrentUser();
    const experimentConfig = getExperimentConfig();
    const assignBtn = document.getElementById('assignJudgesBtn');
    
    if (assignBtn) {
        assignBtn.style.display = "block";
        const canAssign = currentUser.role === 'owner' || currentUser.role === 'co-owner';
        const allowAnyToJudge = experimentConfig.allowAnyoneToJudge;
    
        assignBtn.disabled = !(canAssign && !allowAnyToJudge);
        assignBtn.setAttribute('data-tooltip', allowAnyToJudge
            ? 'Judgment is open to everyone for this experiment. Assigning judges is disabled.'
            : canAssign
            ? 'Assign queries to judges'
            : 'You do not have permission to assign queries');
    }
}

function updateMemberPermissions() {
    const currentUser = getCurrentUser();
    const experimentConfig = getExperimentConfig();
    const addMemberBtn = document.querySelector('button[onclick="addMember()"]');
    
    if (addMemberBtn) {
        if (experimentConfig.allowAnyoneToJudge) {
            addMemberBtn.disabled = true;
            addMemberBtn.classList.add('disabled');
            addMemberBtn.setAttribute('data-tooltip', 'Judgement is open to everyone for this experiment. Add member is disabled.');
        } else if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            addMemberBtn.disabled = false;
            addMemberBtn.classList.remove('disabled');
            addMemberBtn.removeAttribute('data-tooltip');
        } else {
            addMemberBtn.disabled = true;
            addMemberBtn.classList.add('disabled');
            addMemberBtn.removeAttribute('data-tooltip');
        }
    }
}

function updateResultPermissions() {
    // Results permissions are generally read-only, so minimal changes needed
}

function updateQueryListPermissions() {
    const currentUser = getCurrentUser();
    const experimentConfig = getExperimentConfig();
    const selectAllCheckbox = document.getElementById('selectAll');
    
    if (selectAllCheckbox) {
        if (currentUser.role === 'judge' || experimentConfig.allowAnyoneToJudge) {
            selectAllCheckbox.disabled = true;
            selectAllCheckbox.checked = false;
        } else {
            selectAllCheckbox.disabled = false;
        }
    }
}

function updateUIBasedOnRole() {
    updateAssignButtonState();
}

function updateAssignButtonState() {
    // 由于已经在updateQueryPermissions中处理，这里保持空实现
}

/**
 * 结果相关函数
 */
function loadResults() {
    console.log('📊 Loading Results tab...');
    
    // Load results data and render charts
    loadResultsData();
    populateQuestionSelector();
    
    // Ensure custom metrics are properly loaded
    setTimeout(() => {
        if (customMetricsData && customMetricsData.length > 0) {
            console.log('📊 Ensuring custom metrics are displayed after loadResults');
            populateCustomMetricsQuestionSelector();
        }
    }, 300);
}

function loadResultsData() {
    // Load and render charts using the charts module
    const resultsData = loadFallbackChartsData();
    console.log('📊 Results data loaded:', resultsData);
}

function populateQuestionSelector() {
    const experimentData = getExperimentData();
    if (!experimentData) return;
    
    const selector = document.getElementById('questionSelector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select a question...</option>';
    
    experimentData.configuration.judgementQuestions.forEach(question => {
        const option = document.createElement('option');
        option.value = question.id;
        option.textContent = question.text;
        selector.appendChild(option);
    });
}

function populateCustomMetricsQuestionSelector() {
    // Custom metrics question selector logic
    const selector = document.getElementById('customMetricsQuestionSelector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select a question...</option>';
    // Add custom metrics options if available
}

/**
 * Header action functions
 */
export function toggleConfigurationPanel() {
    const panel = document.getElementById('configurationPanel');
    if (panel) {
        panel.classList.toggle('open');
    }
}

export function cloneExperiment() {
    console.log('📋 Cloning experiment...');
    alert('Clone experiment functionality would be implemented here.');
}

export function deleteExperiment() {
    showDeleteConfirmationModal();
}

export function assignQueries() {
    const selectedQueries = Array.from(document.querySelectorAll('.query-row input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedQueries.length === 0) {
        alert('Please select queries to assign.');
        return;
    }
    
    // Import and use the modal function
    import('./experiment-detail-modals.js').then(module => {
        module.showAssignmentModal(selectedQueries);
    });
}

export function importQueries() {
    console.log('📥 Importing queries...');
    alert('Import queries functionality would be implemented here.');
}

export function exportData() {
    console.log('📤 Exporting data...');
    alert('Export data functionality would be implemented here.');
}

// Results tab switching
export function switchResultsTab(tabName) {
    // Hide all results tab contents
    const tabContents = document.querySelectorAll('.results-tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all results tab buttons
    const tabButtons = document.querySelectorAll('.results-tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}-results-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-results-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Question change handlers
export function onQuestionChange() {
    const selector = document.getElementById('questionSelector');
    if (selector && selector.value) {
        console.log('Question changed to:', selector.value);
        // Update charts based on selected question
    }
}

export function onCustomMetricsQuestionChange() {
    const selector = document.getElementById('customMetricsQuestionSelector');
    if (selector && selector.value) {
        console.log('Custom metrics question changed to:', selector.value);
        // Update custom metrics display
    }
}

// 全局函数导出
window.switchTab = switchTab;
window.toggleUserDropdown = toggleUserDropdown;
window.switchUser = switchUser;
window.updateUIWithConfigData = updateUIWithConfigData;
window.toggleConfigurationPanel = toggleConfigurationPanel;
window.cloneExperiment = cloneExperiment;
window.deleteExperiment = deleteExperiment;
window.assignQueries = assignQueries;
window.importQueries = importQueries;
window.exportData = exportData;
window.switchResultsTab = switchResultsTab;
window.onQuestionChange = onQuestionChange;
window.onCustomMetricsQuestionChange = onCustomMetricsQuestionChange;

// 初始化主模块的函数
export function initializeMainExperimentDetail() {
    console.log('🔄 Main experiment detail module initialized');
    updateUIWithConfigData();
}

// 设置全局访问
window.initializeMainExperimentDetail = initializeMainExperimentDetail;