/**
 * Experiment Detail Utilities Module
 * 从HTML内联JavaScript中提取的工具函数
 */

/**
 * 计算查询中实际参与的unique judges数量
 */
export function calculateUniqueJudges(exp) {
    if (!exp || !exp.queries) {
        return '0 Judges';
    }
    
    const uniqueJudges = new Set();
    exp.queries.forEach(query => {
        if (query.assignments) {
            query.assignments.forEach(assignment => {
                if (assignment.judge && assignment.judge.name) {
                    uniqueJudges.add(assignment.judge.name);
                }
            });
        }
    });
    
    console.log('📊 calculateUniqueJudges: Found', uniqueJudges.size, 'unique judges in assignments');
    return `${uniqueJudges.size} Judges`;
}

/**
 * 计算进度统计的辅助函数
 */
export function calculateProgressStats(exp) {
    if (!exp || !exp.queries) {
        return {
            completed: '0 Completed (0%)',
            inProgress: '0 In Progress (0%)',
            notStarted: '0 Not Started (0%)'
        };
    }
    
    const queries = exp.queries;
    let completedCount = 0, inProgressCount = 0, notStartedCount = 0;
    
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
    
    const total = queries.length;
    const completedPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const inProgressPercentage = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
    const notStartedPercentage = total > 0 ? Math.round((notStartedCount / total) * 100) : 0;
    
    return {
        completed: `${completedCount} Completed (${completedPercentage}%)`,
        inProgress: `${inProgressCount} In Progress (${inProgressPercentage}%)`,
        notStarted: `${notStartedCount} Not Started (${notStartedPercentage}%)`,
        completedCount,
        inProgressCount,
        notStartedCount,
        completedPercentage,
        inProgressPercentage,
        notStartedPercentage
    };
}

/**
 * 用户下拉菜单生成函数
 */
export function generateUserDropdown() {
    // 检查数据源（优先使用全局变量，然后是window.exp）
    const expData = window.experimentData || window.exp;
    
    if (!expData || !expData.members) {
        console.warn('⚠️ No experiment data or members available for user dropdown');
        console.warn('  - window.experimentData:', window.experimentData);
        console.warn('  - window.exp:', window.exp);
        return;
    }
    
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) {
        console.warn('⚠️ User dropdown element not found');
        return;
    }
    
    console.log('🔄 Generating user dropdown with data:', expData.members);
    dropdown.innerHTML = '';
    
    expData.members.forEach(member => {
        const userOption = document.createElement('div');
        userOption.className = 'user-option';
        userOption.onclick = () => {
            console.log('👤 User clicked:', member.name);
            if (window.switchUser) {
                window.switchUser(member.id);
            } else {
                console.warn('⚠️ switchUser function not available');
            }
        };
        
        userOption.innerHTML = `
            <div class="user-avatar">${member.initials}</div>
            <div class="user-info">
                <div class="user-name">${member.name}</div>
                <div class="user-role">${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</div>
            </div>
        `;
        
        dropdown.appendChild(userOption);
    });
    
    console.log('✅ User dropdown generated with', expData.members.length, 'members');
}

/**
 * 获取当前实验数据
 */
export function getCurrentExperiment(config) {
    // 尝试从URL参数获取实验ID
    const urlParams = new URLSearchParams(window.location.search);
    const experimentId = urlParams.get('id');
    
    if (experimentId) {
        const experiment = config.experiments.find(exp => exp.id === experimentId);
        if (experiment) {
            console.log(`✅ Found experiment by ID: ${experimentId}`);
            return experiment;
        }
    }
    
    // 如果没有找到或没有指定ID，返回第一个实验
    console.log('⚠️ No experiment ID specified or not found, using first experiment');
    return config.experiments[0];
}

/**
 * 更新UI元素的值
 */
export function updateUIElements(updates) {
    updates.forEach(update => {
        const element = document.getElementById(update.id);
        if (element) {
            element.textContent = update.value;
            // 如果有title属性，也更新它（用于tooltip）
            if (update.title) {
                element.setAttribute('title', update.title);
            }
            console.log(`✅ Updated ${update.id} to: ${update.value}`);
        } else {
            console.warn(`❌ Element ${update.id} not found`);
        }
    });
}

/**
 * 更新进度条
 */
export function updateProgressBars(progressStats) {
    const progressCompleted = document.getElementById('progressCompleted');
    if (progressCompleted) {
        progressCompleted.style.width = `${progressStats.completedPercentage}%`;
        progressCompleted.title = progressStats.completed;
    }
    
    const progressInProgress = document.getElementById('progressInProgress');
    if (progressInProgress) {
        progressInProgress.style.width = `${progressStats.inProgressPercentage}%`;
        progressInProgress.title = progressStats.inProgress;
    }
    
    const progressNotStarted = document.getElementById('progressNotStarted');
    if (progressNotStarted) {
        progressNotStarted.style.width = `${progressStats.notStartedPercentage}%`;
        progressNotStarted.title = progressStats.notStarted;
    }
}

/**
 * 创建查询行的HTML
 */
export function createQueryRowHTML(query) {
    const assignments = query.assignments || [];
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const totalAssignments = assignments.length;
    
    let overallStatus = 'not-started';
    if (completedAssignments === totalAssignments && totalAssignments > 0) {
        overallStatus = 'completed';
    } else if (completedAssignments > 0) {
        overallStatus = 'in-progress';
    }
    
    // Create assignees display
    const assigneesHtml = assignments.length > 0 ?
        assignments.map(assignment => `
            <div class="assignment-item" title="${assignment.judge.name} - ${assignment.status}">
                <div class="assignee-avatar ${assignment.status}">${assignment.judge.initials}</div>
                <div class="assignment-status-dot ${assignment.status}"></div>
            </div>
        `).join('') :
        '<div class="no-assignments">Not assigned</div>';
    
    // Calculate last judged time
    const completedAssignmentsForTime = assignments.filter(a => a.status === 'completed');
    let lastJudgedAt = '--';
    if (completedAssignmentsForTime.length > 0) {
        const latestCompletion = completedAssignmentsForTime.reduce((latest, current) => {
            const currentTime = new Date(current.completedAt).getTime();
            const latestTime = new Date(latest.completedAt).getTime();
            return currentTime > latestTime ? current : latest;
        });
        
        const date = new Date(latestCompletion.completedAt);
        lastJudgedAt = date.getFullYear() + '-' +
                      String(date.getMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getDate()).padStart(2, '0') + ' ' +
                      String(date.getHours()).padStart(2, '0') + ':' +
                      String(date.getMinutes()).padStart(2, '0') + ':' +
                      String(date.getSeconds()).padStart(2, '0');
    }
    
    return `
        <div class="checkbox-column">
            <input type="checkbox" value="${query.id}" onchange="updateSelectedQueries()">
        </div>
        <div class="query-column">
            <div class="query-text">${query.text}</div>
            <div class="query-meta">#${query.id}</div>
        </div>
        <div class="task-type-column">
            <div class="task-type-text">${query.taskType || 'N/A'}</div>
        </div>
        <div class="assignments-column">
            <div class="assignments-container">
                ${assigneesHtml}
            </div>
            <div class="assignment-summary">
                ${totalAssignments} judges | ${completedAssignments} completed
            </div>
        </div>
        <div class="status-column">
            <span class="status-badge status-${overallStatus}">${overallStatus}</span>
        </div>
        <div class="last-judged-column">
            ${lastJudgedAt}
        </div>
    `;
}

/**
 * 加载查询列表
 */
export function loadQueryList(exp) {
    console.log('📋 Loading queries...');
    const queryListBody = document.getElementById('queryListBody');
    if (queryListBody && exp.queries) {
        queryListBody.innerHTML = ''; // Clear existing content
        
        exp.queries.forEach(query => {
            const row = document.createElement('div');
            row.className = 'query-row';
            row.innerHTML = createQueryRowHTML(query);
            queryListBody.appendChild(row);
        });
        
        console.log(`✅ Loaded ${exp.queries.length} queries`);
    } else {
        console.warn('❌ queryListBody element not found or no queries in config');
    }
}

/**
 * 应用fallback更新
 */
export function applyFallbackUpdates() {
    const fallbackUpdates = [
        { id: 'experimentTitle', value: 'Search NDCG Experiment (Fallback)' },
        { id: 'experimentStatus', value: 'Active' },
        { id: 'experimentCreated', value: 'Created: March 15, 2024' },
        { id: 'experimentOwner', value: 'Owner: John Smith' },
        { id: 'experimentQueryCount', value: '50 queries' },
        { id: 'totalQueriesDisplay', value: '50 Total Queries' },
        { id: 'completedStat', value: '30 Completed (60%)' },
        { id: 'inProgressStat', value: '10 In Progress (20%)' },
        { id: 'notStartedStat', value: '10 Not Started (20%)' },
        { id: 'judgesCount', value: '3 Judges' }
    ];
    
    updateUIElements(fallbackUpdates);
}