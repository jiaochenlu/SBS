/**
 * Experiment Detail Queries Module
 * 处理查询相关的所有功能
 */

import { getExperimentData, getCurrentUser, getExperimentConfig } from './experiment-detail-data.js';

// Task type filtering variables
let currentTaskTypeFilter = null;
let originalQueries = [];

// Assignment mode state management
let assignmentMode = 'default'; // 'default' | 'query-selection' | 'tasktype-selection'
let isHighlightingSelections = false;

const AssignmentStates = {
    DEFAULT: 'default',
    QUERY_SELECTION: 'query-selection',
    TASKTYPE_SELECTION: 'tasktype-selection'
};

/**
 * 计算查询状态 - 根据新的状态规则
 */
export function getQueryStatus(query, experimentConfig) {
    const assignments = query.assignments || [];
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const totalAssignments = assignments.length;
    
    const isUploadQuerySet = experimentConfig.querySetSelection === 'Upload query set';
    const isAdHocQuery = experimentConfig.querySetSelection === 'Ad hoc query';
    const allowAnyOne = experimentConfig.allowAnyoneToJudge;
    
    // 1. Upload query set + allow any one = false
    if (isUploadQuerySet && !allowAnyOne) {
        if (totalAssignments === 0) {
            return 'not-assigned';  // assign judges = 0
        }
        if (completedCount === totalAssignments) {
            return 'completed';     // completed judges == all assigned judges
        }
        return 'in-progress';       // completed judges < all assigned judges
    }
    
    // 2. Upload query set + allow any one = true
    if (isUploadQuerySet && allowAnyOne) {
        if (completedCount === 0) {
            return 'in-progress';   // completed judge = 0
        }
        return 'completed';         // completed judges > 0
    }
    
    // 3. Ad hoc query + allow any one = false
    // 4. Ad hoc query + allow any one = true
    if (isAdHocQuery) {
        // 只有 judge 提交了一个 query 之后才有一条 query 记录
        // 所以 query 列表里的 query 永远只有一个状态：completed
        return 'completed';         // completed judges > 0
    }
    
    // Fallback to old logic for backwards compatibility
    if (completedCount === totalAssignments && totalAssignments > 0) {
        return 'completed';
    } else if (completedCount > 0) {
        return 'in-progress';
    }
    return 'not-assigned';
}

/**
 * 获取状态显示名称
 */
export function getStatusDisplayName(status) {
    const statusNames = {
        'not-assigned': 'Not Assigned',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusNames[status] || status;
}

/**
 * 创建查询行 - 整合版本，移除重复代码
 */
export function createQueryRow(query) {
    const row = document.createElement('div');
    row.className = 'query-row';
    
    const assignments = query.assignments || [];
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const totalAssignments = assignments.length;
    
    // Calculate overall status using new logic
    const experimentConfig = getExperimentConfig();
    const overallStatus = getQueryStatus(query, experimentConfig);
    
    // Debug logging
    console.log('🔍 Query status calculation:', {
        queryId: query.id,
        querySetSelection: experimentConfig.querySetSelection,
        allowAnyoneToJudge: experimentConfig.allowAnyoneToJudge,
        totalAssignments: totalAssignments,
        completedAssignments: completedAssignments,
        overallStatus: overallStatus
    });
    
    // Create assignments container
    const assignmentsContainer = createAssignmentsContainer(assignments);
    
    // Calculate last judged time
    const lastJudgedAt = calculateLastJudgedTime(assignments);
    
    // Get task type
    const taskType = query.taskType?.name || 'N/A';
    
    // Check if this is an ad hoc experiment
    const currentUser = getCurrentUser();
    const isAdHocExperiment = () => experimentConfig.isRealTimeAdHoc;
    
    // Determine if checkbox should be disabled
    const isCheckboxDisabled = currentUser.role === 'judge' || isAdHocExperiment() || experimentConfig.allowAnyoneToJudge;
    
    row.innerHTML = `
        <div class="checkbox-column">
            <input type="checkbox" value="${query.id}" onchange="updateSelectedQueries()" ${isCheckboxDisabled ? 'disabled' : ''}>
        </div>
        <div class="id-column">
            <a href="/query/${query.id}" class="query-id-link">${query.id}</a>
        </div>
        <div class="query-column">
            <div class="query-text">${query.text}</div>
        </div>
        ${(taskType !== 'N/A') ? `<div class="task-type-column">${taskType}</div>` : ''}
        <div class="assignments-column">
            ${assignmentsContainer.outerHTML}
            <div class="assignment-summary">
                ${totalAssignments} judges | ${completedAssignments} completed
            </div>
        </div>
        <div class="status-column">
            <span class="status-badge status-${overallStatus}" data-debug="Status: ${overallStatus}">${getStatusDisplayName(overallStatus)}</span>
        </div>
        <div class="last-judged-column">
            ${lastJudgedAt}
        </div>
    `;
    
    return row;
}

/**
 * 创建分配容器
 */
function createAssignmentsContainer(assignments) {
    const assignmentsContainer = document.createElement('div');
    assignmentsContainer.className = 'assignments-container';
    
    if (assignments.length === 0) {
        assignmentsContainer.innerHTML = '<div class="no-assignments">Not assigned</div>';
        return assignmentsContainer;
    }
    
    // Show first 5 assignments, with overflow indicator
    const maxVisible = 5;
    const visibleAssignments = assignments.slice(0, maxVisible);
    const overflow = assignments.length > maxVisible ? assignments.length - maxVisible : 0;
    
    visibleAssignments.forEach(assignment => {
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'assignment-item';
        assignmentItem.title = `${assignment.judge.name} - ${assignment.status}`;
        assignmentItem.innerHTML = `
            <div class="assignee-avatar ${assignment.status}">${assignment.judge.initials}</div>
            <div class="assignment-status-dot ${assignment.status}"></div>
        `;
        assignmentsContainer.appendChild(assignmentItem);
    });
    
    if (overflow > 0) {
        assignmentsContainer.setAttribute('data-overflow', `+${overflow} more`);
    }
    
    return assignmentsContainer;
}

/**
 * 计算最后评判时间
 */
function calculateLastJudgedTime(assignments) {
    const completedAssignments = assignments.filter(a => a.status === 'completed');
    if (completedAssignments.length === 0) {
        return '--';
    }
    
    const latestCompletion = completedAssignments.reduce((latest, current) => {
        const currentTime = new Date(current.completedAt).getTime();
        const latestTime = new Date(latest.completedAt).getTime();
        return currentTime > latestTime ? current : latest;
    });
    
    const date = new Date(latestCompletion.completedAt);
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0') + ':' +
           String(date.getSeconds()).padStart(2, '0');
}

/**
 * 渲染查询列表头部
 */
export function renderQueryListHeader() {
    const experimentConfig = getExperimentConfig();
    const isAdHocExperiment = experimentConfig.isRealTimeAdHoc;
    
    const queryListHeader = document.getElementById('queryListHeader');
    if (!queryListHeader) {
        console.warn('❌ queryListHeader element not found');
        return;
    }
    
    // Create header based on experiment type
    if (isAdHocExperiment) {
        queryListHeader.innerHTML = `
            <div class="checkbox-column">
                <input type="checkbox" id="selectAll" onchange="toggleSelectAll()">
            </div>
            <div class="id-column">ID</div>
            <div class="query-column">Query</div>
            <div class="task-type-column">Task Type</div>
            <div class="assignments-column">Assignments</div>
            <div class="status-column">Status</div>
            <div class="last-judged-column">Last Judged</div>
        `;
    } else {
        queryListHeader.innerHTML = `
            <div class="checkbox-column">
                <input type="checkbox" id="selectAll" onchange="toggleSelectAll()">
            </div>
            <div class="id-column">ID</div>
            <div class="query-column">Query</div>
            <div class="assignments-column">Assignments</div>
            <div class="status-column">Status</div>
            <div class="last-judged-column">Last Judged</div>
        `;
    }
    
    console.log('✅ Query list header rendered');
}

/**
 * 加载查询列表 - 整合版本
 */
export function loadQueries() {
    console.log('📋 loadQueries called');
    
    // 先渲染 header
    renderQueryListHeader();
    
    const queryListBody = document.getElementById('queryListBody');
    if (!queryListBody) {
        console.error('queryListBody element NOT FOUND!');
        return;
    }
    
    // Use queries from experimentData if available, otherwise use fallback
    let allQueries = getQueriesData();
    
    // Save original queries for filtering
    if (originalQueries.length === 0) {
        originalQueries = [...allQueries];
    }
    
    console.log('📋 Using queries:', allQueries);
    
    // Apply task type filter first
    if (currentTaskTypeFilter) {
        allQueries = allQueries.filter(query => {
            const taskType = query.taskType?.name || 'Unknown';
            return taskType === currentTaskTypeFilter;
        });
        console.log('📋 Filtered by task type:', currentTaskTypeFilter, 'Result:', allQueries.length);
    }
    
    // Filter queries based on user role
    const queriesToShow = filterQueriesByRole(allQueries);
    
    // Clear existing content and render queries
    queryListBody.innerHTML = '';
    queriesToShow.forEach(query => {
        const row = createQueryRow(query);
        queryListBody.appendChild(row);
    });
    
    // Update query count in tab badge
    updateQueryCount(queriesToShow.length);
    
    console.log(`✅ Loaded ${queriesToShow.length} queries`);
}

/**
 * 获取查询数据（包含fallback）
 */
function getQueriesData() {
    const experimentData = getExperimentData();
    
    console.log('🔍 getQueriesData called - experimentData:', experimentData);
    
    if (experimentData && experimentData.queries) {
        console.log('✅ Using queries from experimentData:', experimentData.queries);
        return experimentData.queries;
    } else {
        console.warn('⚠️ Using fallback query data');
        return getFallbackQueries();
    }
}

/**
 * 根据用户角色过滤查询
 */
function filterQueriesByRole(allQueries) {
    const currentUser = getCurrentUser();
    
    if (currentUser.role === 'judge') {
        // Judge can only see queries assigned to them
        return allQueries.filter(query => {
            return query.assignments.some(assignment =>
                assignment.judge.name === currentUser.name
            );
        });
    }
    
    // Owner and Co-Owner can see all queries
    return allQueries;
}

/**
 * 更新查询数量显示
 */
function updateQueryCount(count) {
    const queriesTabBadge = document.querySelector('[data-tab="queries"] .tab-badge');
    if (queriesTabBadge) {
        queriesTabBadge.textContent = count;
    }
}

/**
 * 获取fallback查询数据
 */
function getFallbackQueries() {
    return [
        {
            id: 'Q001',
            text: 'How to implement machine learning algorithms in Python?',
            taskType: { name: 'Web Search' },
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'completed', completedAt: '2024-03-15 14:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-15 16:20' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-16 09:15' }
            ]
        },
        {
            id: 'Q002',
            text: 'Best practices for web application security',
            taskType: { name: 'News Search' },
            assignments: [
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'not-started', assignedAt: '2024-03-13 10:00' }
            ]
        },
        {
            id: 'Q003',
            text: 'Database optimization techniques for large datasets',
            taskType: { name: 'Web Search' },
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'not-started', assignedAt: '2024-03-12 15:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'not-started', assignedAt: '2024-03-12 15:30' }
            ]
        },
        {
            id: 'Q004',
            text: 'Cloud infrastructure deployment strategies',
            taskType: { name: 'Shopping Search' },
            assignments: [
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-11 13:20' }
            ]
        },
        {
            id: 'Q005',
            text: 'API design principles and best practices',
            taskType: { name: 'Image Search' },
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'not-started', assignedAt: '2024-03-10 09:00' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-14 17:30' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'not-started', assignedAt: '2024-03-10 09:00' },
                { judge: { name: 'Sarah Chen', initials: 'SC' }, status: 'not-started', assignedAt: '2024-03-15 14:00' }
            ]
        },
        {
            id: 'Q006',
            text: 'Mobile app performance optimization strategies',
            taskType: { name: 'News Search' },
            assignments: []
        },
        {
            id: 'Q007',
            text: 'Frontend framework comparison and selection',
            taskType: { name: 'Web Search' },
            assignments: [
                { judge: { name: 'Sarah Chen', initials: 'SC' }, status: 'in-progress', assignedAt: '2024-03-16 10:00' }
            ]
        },
        {
            id: 'Q008',
            text: 'Microservices architecture design patterns',
            taskType: { name: 'Shopping Search' },
            assignments: []
        }
    ];
}

/**
 * 任务类型过滤相关函数
 */
export function setTaskTypeFilter(taskType) {
    currentTaskTypeFilter = taskType;
    loadQueries(); // 重新加载查询以应用过滤器
}

export function clearTaskTypeFilter() {
    currentTaskTypeFilter = null;
    loadQueries();
}

export function getCurrentTaskTypeFilter() {
    return currentTaskTypeFilter;
}

/**
 * 获取原始查询数据
 */
export function getOriginalQueries() {
    return originalQueries;
}

/**
 * 设置分配模式
 */
export function setAssignmentMode(mode) {
    assignmentMode = mode;
}

export function getAssignmentMode() {
    return assignmentMode;
}

/**
 * 选择相关函数
 */
export function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const queryCheckboxes = document.querySelectorAll('.query-row input[type="checkbox"]:not(:disabled)');
    
    if (selectAllCheckbox && queryCheckboxes.length > 0) {
        const isChecked = selectAllCheckbox.checked;
        queryCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        // 触发选择更新
        if (window.updateSelectedQueries) {
            window.updateSelectedQueries();
        }
    }
}

export function updateSelectedQueries() {
    const selectedCheckboxes = document.querySelectorAll('.query-row input[type="checkbox"]:checked');
    const assignBtn = document.getElementById('assignJudgesBtn');
    
    if (assignBtn) {
        const hasSelection = selectedCheckboxes.length > 0;
        const currentUser = getCurrentUser();
        const experimentConfig = getExperimentConfig();
        const canAssign = currentUser.role === 'owner' || currentUser.role === 'co-owner';
        const allowAnyToJudge = experimentConfig.allowAnyoneToJudge;
        
        assignBtn.disabled = !(hasSelection && canAssign && !allowAnyToJudge);
        
        if (hasSelection && canAssign && !allowAnyToJudge) {
            assignBtn.classList.remove('disabled');
            assignBtn.removeAttribute('data-tooltip');
        } else {
            assignBtn.classList.add('disabled');
            if (allowAnyToJudge) {
                assignBtn.setAttribute('data-tooltip', 'Judgment is open to everyone for this experiment');
            } else if (!canAssign) {
                assignBtn.setAttribute('data-tooltip', 'You do not have permission to assign queries');
            } else {
                assignBtn.setAttribute('data-tooltip', 'Select queries to assign');
            }
        }
    }
    
    console.log(`📋 Selected ${selectedCheckboxes.length} queries`);
}

// 导出全局函数
window.loadQueries = loadQueries;
window.toggleSelectAll = toggleSelectAll;
window.updateSelectedQueries = updateSelectedQueries;
window.createQueryRow = createQueryRow;
window.renderQueryListHeader = renderQueryListHeader;
window.getQueryStatus = getQueryStatus;
window.getStatusDisplayName = getStatusDisplayName;