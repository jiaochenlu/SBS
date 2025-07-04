// Experiment Detail Page JavaScript

// User role and experiment configuration
const currentUser = {
    role: 'owner', // owner, co-owner, judge
    id: 'current-user-id',
    name: 'Current User'
};

const experimentConfig = {
    allowAnyoneToJudge: false, // This controls the "Assign Selected" button state
    experimentType: 'search-ndcg', // 'real-time-ad-hoc' or other types
    isRealTimeAdHoc: false
};

// Tab switching functionality
function switchTab(tabName) {
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
    
    // Load specific tab content if needed
    if (tabName === 'queries') {
        loadQueries();
    } else if (tabName === 'members') {
        loadMembers();
    } else if (tabName === 'results') {
        loadResults();
    }
}

// Query management functions
function createQueryRow(query) {
    const row = document.createElement('div');
    row.className = 'query-row';
    
    // Enhanced hover effects
    row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = '#f8fafc';
        row.style.transform = 'translateX(4px)';
        row.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        row.style.borderLeft = '4px solid #667eea';
    });
    
    row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = 'white';
        row.style.transform = 'translateX(0)';
        row.style.boxShadow = 'none';
        row.style.borderLeft = 'none';
    });
    
    // Calculate overall progress and status
    const assignments = query.assignments || [];
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const totalAssignments = assignments.length;
    
    let overallStatus = 'not-started';
    if (completedAssignments === totalAssignments && totalAssignments > 0) {
        overallStatus = 'completed';
    } else if (completedAssignments > 0) {
        overallStatus = 'in-progress';
    }
    
    const overallProgress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
    
    // Create assignees display - limit to 5 avatars
    const maxAvatars = 5;
    const visibleAssignments = assignments.slice(0, maxAvatars);
    const overflowCount = Math.max(0, assignments.length - maxAvatars);
    
    const assigneesHtml = assignments.length > 0 ?
        visibleAssignments.map(assignment => `
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
        // Find the most recent completion time
        const latestCompletion = completedAssignmentsForTime.reduce((latest, current) => {
            const currentTime = new Date(current.completedAt).getTime();
            const latestTime = new Date(latest.completedAt).getTime();
            return currentTime > latestTime ? current : latest;
        });
        
        // Format as YYYY-MM-DD HH:mm:ss
        const date = new Date(latestCompletion.completedAt);
        lastJudgedAt = date.getFullYear() + '-' +
                      String(date.getMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getDate()).padStart(2, '0') + ' ' +
                      String(date.getHours()).padStart(2, '0') + ':' +
                      String(date.getMinutes()).padStart(2, '0') + ':' +
                      String(date.getSeconds()).padStart(2, '0');
    }
    
    // Create row content
    const assignmentsContainer = document.createElement('div');
    assignmentsContainer.className = 'assignments-container';
    assignmentsContainer.innerHTML = assigneesHtml;
    if (overflowCount > 0) {
        assignmentsContainer.setAttribute('data-overflow', `+${overflowCount} more`);
    }
    
    row.innerHTML = `
        <div class="checkbox-column">
            <input type="checkbox" value="${query.id}" onchange="updateSelectedQueries()">
        </div>
        <div class="query-column">
            <div class="query-text">${query.text}</div>
            <div class="query-meta">#${query.id}</div>
        </div>
        <div class="assignments-column">
            ${assignmentsContainer.outerHTML}
            <div class="assignment-summary">
                ${totalAssignments} assigned | ${completedAssignments} completed
            </div>
        </div>
        <div class="status-column">
            <span class="status-badge status-${overallStatus}">${overallStatus}</span>
        </div>
        <div class="progress-column">
            <div class="progress-bar-small">
                <div class="progress-fill-small" style="width: ${overallProgress}%"></div>
            </div>
            <span class="progress-text">${overallProgress}%</span>
            <div class="progress-detail">${completedAssignments}/${totalAssignments}</div>
        </div>
        <div class="last-judged-column">
            ${lastJudgedAt}
        </div>
    `;
    
    return row;
}

function loadQueries() {
    console.log('loadQueries function called');
    const queryListBody = document.getElementById('queryListBody');
    console.log('queryListBody element found:', queryListBody);
    if (!queryListBody) {
        console.error('queryListBody element NOT FOUND!');
        return;
    }
    
    // Sample query data with multiple assignments
    const sampleQueries = [
        {
            id: 'Q001',
            text: 'How to implement machine learning algorithms in Python?',
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'completed', completedAt: '2024-03-15 14:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-15 16:20' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-16 09:15' }
            ]
        },
        {
            id: 'Q002',
            text: 'Best practices for web application security',
            assignments: [
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-14 11:45' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'not-started', assignedAt: '2024-03-13 10:00' }
            ]
        },
        {
            id: 'Q003',
            text: 'Database optimization techniques for large datasets',
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'not-started', assignedAt: '2024-03-12 15:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'not-started', assignedAt: '2024-03-12 15:30' }
            ]
        },
        {
            id: 'Q004',
            text: 'Cloud infrastructure deployment strategies',
            assignments: [
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-11 13:20' }
            ]
        },
        {
            id: 'Q005',
            text: 'API design principles and best practices',
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
            assignments: []
        }
    ];
    
    // Clear existing content
    queryListBody.innerHTML = '';
    
    // Add queries
    sampleQueries.forEach(query => {
        const row = createQueryRow(query);
        queryListBody.appendChild(row);
    });
}

function loadMembers() {
    const membersGrid = document.querySelector('.members-grid');
    if (!membersGrid) return;
    
    // Sample member data
    const sampleMembers = [
        {
            id: 'john-smith',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'owner',
            initials: 'JS',
            completed: null,
            assigned: 0,
            lastJudgedAt: null
        },
        {
            id: 'sarah-chen',
            name: 'Sarah Chen',
            email: 'sarah.chen@company.com',
            role: 'co-owner',
            initials: 'SC',
            completed: 38,
            assigned: 45,
            lastJudgedAt: '2024-03-16 15:30:22'
        },
        {
            id: 'alice-miller',
            name: 'Alice Miller',
            email: 'alice.miller@company.com',
            role: 'judge',
            initials: 'AM',
            completed: 32,
            assigned: 40,
            lastJudgedAt: '2024-03-15 14:20:15'
        },
        {
            id: 'robert-johnson',
            name: 'Robert Johnson',
            email: 'robert.johnson@company.com',
            role: 'judge',
            initials: 'RJ',
            completed: 28,
            assigned: 35,
            lastJudgedAt: '2024-03-14 09:45:33'
        }
    ];
    
    // Clear existing content
    membersGrid.innerHTML = '';
    
    // Add members
    sampleMembers.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        
        // Calculate progress percentage
        const progressPercentage = member.assigned > 0 && member.completed !== null
            ? Math.round((member.completed / member.assigned) * 100)
            : null;
        
        memberCard.innerHTML = `
            <div class="member-avatar">${member.initials}</div>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-email">${member.email}</div>
                <div class="member-role ${member.role}">${member.role}</div>
            </div>
            <div class="member-stats">
                <div class="stat-item progress-stat">
                    <div class="progress-info">
                        <span class="stat-label">Progress</span>
                        <span class="progress-percentage">${progressPercentage !== null ? progressPercentage + '%' : '--'}</span>
                        <span class="progress-numbers">${member.completed !== null ? member.completed : '--'} / ${member.assigned || '--'}</span>
                    </div>
                    <div class="member-progress-bar">
                        <div class="member-progress-fill" style="width: ${progressPercentage !== null ? progressPercentage : 0}%"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Last Judged At</span>
                    <span class="stat-value ${!member.lastJudgedAt ? 'empty' : ''}">${member.lastJudgedAt || '--'}</span>
                </div>
            </div>
        `;
        membersGrid.appendChild(memberCard);
    });
    
    // Update data counts after loading members
    setTimeout(() => {
        updateDataCounts();
    }, 50);
}

// Query management functions
function addQuery() {
    alert('Add Query functionality - to be implemented');
}

function importQueries() {
    alert('Import Queries functionality - to be implemented');
}

function assignQueries() {
    // Check if user has permission to assign queries (Owner or Co-Owner)
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to assign queries. Only Owner and Co-Owner can assign queries.');
        return;
    }

    // Check if "allow anyone to judge" is enabled
    if (experimentConfig.allowAnyoneToJudge) {
        alert('Query assignment is not allowed when "Allow Anyone to Judge" is enabled');
        return;
    }

    const selectedQueries = getSelectedQueries();
    if (selectedQueries.length === 0) {
        alert('Please select queries to assign');
        return;
    }

    // Show assignment modal based on experiment type
    if (experimentConfig.isRealTimeAdHoc) {
        showTaskTypeAssignmentModal(selectedQueries);
    } else {
        showQueryAssignmentModal(selectedQueries);
    }
}

function editQuery(queryId) {
    alert(`Edit query ${queryId} - to be implemented`);
}

function deleteQuery(queryId) {
    if (confirm(`Are you sure you want to delete query ${queryId}?`)) {
        alert(`Delete query ${queryId} - to be implemented`);
    }
}

function viewQuery(queryId) {
    alert(`View query ${queryId} - to be implemented`);
}

function viewQueryAssignments(queryId) {
    // Find the query data
    const query = getCurrentQueryData(queryId);
    if (!query) {
        alert('Query not found');
        return;
    }
    
    // Create assignment details modal
    const modal = document.createElement('div');
    modal.id = 'assignmentDetailsModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const assignmentsHtml = query.assignments.length > 0 ?
        query.assignments.map(assignment => `
            <div class="assignment-detail-row">
                <div class="judge-info">
                    <div class="assignee-avatar ${assignment.status}">${assignment.judge.initials}</div>
                    <div class="judge-details">
                        <div class="judge-name">${assignment.judge.name}</div>
                        <div class="assignment-meta">
                            ${assignment.status === 'completed' ?
                                `完成时间: ${assignment.completedAt}` :
                                `分配时间: ${assignment.assignedAt}`
                            }
                        </div>
                    </div>
                </div>
                <div class="assignment-status">
                    <span class="status-badge status-${assignment.status}">${assignment.status}</span>
                </div>
                <div class="assignment-actions">
                    ${assignment.status !== 'completed' ?
                        `<button class="btn-icon" onclick="reassignTask('${queryId}', '${assignment.judge.name}')" title="重新分配">🔄</button>` :
                        `<button class="btn-icon" onclick="viewSubmission('${queryId}', '${assignment.judge.name}')" title="查看提交">👁️</button>`
                    }
                    <button class="btn-icon" onclick="removeAssignment('${queryId}', '${assignment.judge.name}')" title="移除分配">🗑️</button>
                </div>
            </div>
        `).join('') :
        '<div class="no-assignments-message">此查询尚未分配给任何人</div>';
    
    modal.innerHTML = `
        <div class="modal-content assignment-details-modal">
            <div class="modal-header">
                <h3>查询分配详情</h3>
                <button class="modal-close" onclick="closeAssignmentDetailsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="query-info">
                    <h4>查询内容</h4>
                    <div class="query-text-display">${query.text}</div>
                    <div class="query-meta-display">ID: ${query.id}</div>
                </div>
                <div class="assignments-details">
                    <h4>分配情况 (${query.assignments.length}人)</h4>
                    <div class="assignment-details-list">
                        ${assignmentsHtml}
                    </div>
                </div>
                <div class="assignment-summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">总分配</span>
                        <span class="stat-value">${query.assignments.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">已完成</span>
                        <span class="stat-value">${query.assignments.filter(a => a.status === 'completed').length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">进行中</span>
                        <span class="stat-value">${query.assignments.filter(a => a.status === 'in-progress').length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">未开始</span>
                        <span class="stat-value">${query.assignments.filter(a => a.status === 'not-started').length}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeAssignmentDetailsModal()">关闭</button>
                <button class="btn-primary" onclick="addMoreAssignments('${queryId}')">添加更多分配</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getCurrentQueryData(queryId) {
    // This should ideally come from a data store, for demo purposes we'll reconstruct
    const sampleQueries = [
        {
            id: 'Q001',
            text: 'How to implement machine learning algorithms in Python?',
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'completed', completedAt: '2024-03-15 14:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-15 16:20' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-16 09:15' }
            ]
        },
        {
            id: 'Q002',
            text: 'Best practices for web application security',
            assignments: [
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-14 11:45' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'in-progress', assignedAt: '2024-03-13 10:00' }
            ]
        },
        {
            id: 'Q003',
            text: 'Database optimization techniques for large datasets',
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'not-started', assignedAt: '2024-03-12 15:30' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'not-started', assignedAt: '2024-03-12 15:30' }
            ]
        },
        {
            id: 'Q004',
            text: 'Cloud infrastructure deployment strategies',
            assignments: [
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'completed', completedAt: '2024-03-11 13:20' }
            ]
        },
        {
            id: 'Q005',
            text: 'API design principles and best practices',
            assignments: [
                { judge: { name: 'John Smith', initials: 'JS' }, status: 'in-progress', assignedAt: '2024-03-10 09:00' },
                { judge: { name: 'Alice Miller', initials: 'AM' }, status: 'completed', completedAt: '2024-03-14 17:30' },
                { judge: { name: 'Robert Johnson', initials: 'RJ' }, status: 'in-progress', assignedAt: '2024-03-10 09:00' },
                { judge: { name: 'Sarah Chen', initials: 'SC' }, status: 'not-started', assignedAt: '2024-03-15 14:00' }
            ]
        },
        {
            id: 'Q006',
            text: 'Mobile app performance optimization strategies',
            assignments: []
        }
    ];
    
    return sampleQueries.find(q => q.id === queryId);
}

function getSelectedQueries() {
    const checkboxes = document.querySelectorAll('.query-row input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateSelectedQueries() {
    const selectedCount = getSelectedQueries().length;
    const assignBtn = document.getElementById('assignJudgesBtn');
    
    if (assignBtn) {
        if (selectedCount === 0) {
            // No queries selected - make button secondary style (not highlighted)
            assignBtn.className = 'btn-secondary';
        } else {
            // Queries selected - make button primary style (highlighted)
            assignBtn.className = 'btn-primary';
        }
    }
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const queryCheckboxes = document.querySelectorAll('.query-row input[type="checkbox"]');
    
    queryCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateSelectedQueries();
}

// Member management functions
function addMember() {
    // Owner can add Co-Owner/Judge, Co-Owner can add Judge
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to add members');
        return;
    }
    
    const modal = document.getElementById('addMemberModal');
    const roleSelect = document.getElementById('roleSelect');
    
    if (modal && roleSelect) {
        // Clear existing options
        roleSelect.innerHTML = '';
        
        // Add role options based on current user's role
        if (currentUser.role === 'owner') {
            // Owner can assign Co-Owner and Judge roles
            roleSelect.innerHTML = `
                <option value="">Select a role</option>
                <option value="co-owner">Co-Owner</option>
                <option value="judge">Judge</option>
            `;
        } else if (currentUser.role === 'co-owner') {
            // Co-Owner can only assign Judge role
            roleSelect.innerHTML = `
                <option value="">Select a role</option>
                <option value="judge">Judge</option>
            `;
        }
        
        modal.style.display = 'flex';
    }
}

function closeAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addMemberSubmit() {
    // Get form values
    const email = document.querySelector('#addMemberModal input[type="email"]').value;
    const role = document.getElementById('roleSelect').value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (!role) {
        alert('Please select a role');
        return;
    }
    
    // Validate role assignment based on current user's permissions
    if (currentUser.role === 'owner') {
        // Owner can assign co-owner or judge
        if (role !== 'co-owner' && role !== 'judge') {
            alert('Invalid role selection');
            return;
        }
    } else if (currentUser.role === 'co-owner') {
        // Co-Owner can only assign judge
        if (role !== 'judge') {
            alert('You can only assign Judge role');
            return;
        }
    }
    
    alert(`Adding member: ${email} as ${role} - to be implemented`);
    closeAddMemberModal();
}

function editMember(memberId) {
    // Owner can edit Co-Owner/Judge, Co-Owner can edit Judge
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to edit members');
        return;
    }
    alert(`Edit member ${memberId} - to be implemented`);
}

function removeMember(memberId) {
    // Owner can remove Co-Owner/Judge, Co-Owner can remove Judge
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to remove members');
        return;
    }
    
    if (confirm('Are you sure you want to remove this member?')) {
        alert(`Remove member ${memberId} - to be implemented`);
    }
}

function manageMembers() {
    // Owner can manage all members, Co-Owner can manage Judge members
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to manage members');
        return;
    }
    alert('Manage Members functionality - to be implemented');
}

// Pagination functions
function previousPage() {
    alert('Previous page - to be implemented');
}

function nextPage() {
    alert('Next page - to be implemented');
}

// Results functions
function downloadReport() {
    // Owner and Co-Owner can download reports
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to download reports');
        return;
    }
    alert('Download Report functionality - to be implemented');
}

function exportData() {
    // Owner and Co-Owner can export data
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to export data');
        return;
    }
    alert('Export Data functionality - to be implemented');
}

// Settings functions
function archiveExperiment() {
    if (confirm('Are you sure you want to archive this experiment?')) {
        alert('Archive Experiment - to be implemented');
    }
}

function deleteExperiment() {
    if (confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
        alert('Delete Experiment - to be implemented');
    }
}

// Results functions
function loadResults() {
    // Initialize results view
    console.log('Loading results...');
}

// Configuration panel toggle function
function toggleConfigurationPanel() {
    console.log('toggleConfigurationPanel called');
    
    const panel = document.getElementById('configurationPanel');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    
    console.log('Panel element:', panel);
    console.log('Main content wrapper:', mainContentWrapper);
    
    if (!panel) {
        console.error('Configuration panel not found!');
        return;
    }
    
    if (!mainContentWrapper) {
        console.error('Main content wrapper not found!');
        return;
    }
    
    if (panel.classList.contains('open')) {
        // Close panel
        console.log('Closing panel');
        panel.classList.remove('open');
        mainContentWrapper.classList.remove('panel-open');
    } else {
        // Open panel
        console.log('Opening panel');
        panel.classList.add('open');
        mainContentWrapper.classList.add('panel-open');
    }
}

// Assignment modal functions
function showQueryAssignmentModal(selectedQueries) {
    // Get judge assignment status for selected queries
    const judgeAssignmentStatus = getJudgeAssignmentStatus(selectedQueries);
    
    // Create assignment modal for regular queries
    const modal = document.createElement('div');
    modal.id = 'assignmentModal';
    modal.className = 'modal';
    modal.style.display = 'flex';

    const availableJudges = getAvailableJudges();
    
    // Calculate available judges and conflicts
    const fullyConflictedJudges = [];
    const availableJudgesForAssignment = [];
    
    availableJudges.forEach(judge => {
        const status = judgeAssignmentStatus.get(judge.name);
        if (status && status.conflictCount === selectedQueries.length) {
            // Fully conflicted - cannot be assigned
            fullyConflictedJudges.push({...judge, status});
        } else {
            // Available (including partially conflicted)
            availableJudgesForAssignment.push({...judge, status});
        }
    });
    
    modal.innerHTML = `
        <div class="modal-content assignment-modal">
            <div class="modal-header">
                <div class="modal-header-content">
                    <div class="modal-icon">👥</div>
                    <div class="modal-title-section">
                        <h3>Assign Judges to Queries</h3>
                        <p class="modal-subtitle">${selectedQueries.length} ${selectedQueries.length === 1 ? 'query' : 'queries'} selected</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeAssignmentModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="assignment-info">
                    <div class="info-card">
                        <div class="info-icon">📋</div>
                        <div class="info-text">
                            <strong>Smart Assignment:</strong> Each query can only be assigned to a judge once. Conflicted assignments are automatically prevented.
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="judges-tabs">
                        <button class="judge-tab active" data-tab="available" onclick="switchJudgeTab('available')">
                            ✅ Can be Assigned <span class="tab-count">${availableJudgesForAssignment.length}</span>
                        </button>
                        ${fullyConflictedJudges.length > 0 ? `
                            <button class="judge-tab" data-tab="assigned" onclick="switchJudgeTab('assigned')">
                                🚫 Already Assigned <span class="tab-count">${fullyConflictedJudges.length}</span>
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="judges-tab-content active" id="available-tab">
                        ${availableJudgesForAssignment.length > 0 ? `
                            <div class="judges-list">
                                ${availableJudgesForAssignment.map(judge => {
                                    const isPartiallyConflicted = judge.status && judge.status.conflictCount > 0;
                                    return `
                                        <div class="judge-item available" onclick="toggleJudgeSelection('${judge.id}')">
                                            <div class="judge-item-content">
                                                <div class="judge-avatar available">${judge.initials}</div>
                                                <div class="judge-info">
                                                    <div class="judge-name">${judge.name}</div>
                                                    <div class="judge-role">${judge.role}</div>
                                                    ${isPartiallyConflicted ?
                                                        `<div class="judge-warning">⚠️ Already assigned to ${judge.status.conflictCount} of ${selectedQueries.length} queries</div>` :
                                                        ''
                                                    }
                                                </div>
                                                <input type="checkbox" class="judge-checkbox" value="${judge.id}" name="selectedJudges" id="judge-${judge.id}">
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div class="empty-state">No judges available for assignment</div>'}
                    </div>
                    
                    ${fullyConflictedJudges.length > 0 ? `
                        <div class="judges-tab-content" id="assigned-tab">
                            <div class="assignment-notice">
                                <span class="notice-icon">🚫</span>
                                <span class="notice-text">These judges are already assigned to all selected queries and cannot be assigned again to prevent duplicates.</span>
                            </div>
                            
                            <div class="judges-list">
                                ${fullyConflictedJudges.map(judge => `
                                    <div class="judge-item unavailable">
                                        <div class="judge-item-content">
                                            <div class="judge-avatar conflicted">${judge.initials}</div>
                                            <div class="judge-info">
                                                <div class="judge-name">${judge.name}</div>
                                                <div class="judge-role">${judge.role}</div>
                                            </div>
                                            <div class="unavailable-badge">Unavailable</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="selection-summary">
                    <span id="selectedJudgesCount">0 judges selected</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeAssignmentModal()">
                    <span class="btn-icon">✕</span>
                    Cancel
                </button>
                <button class="btn-primary" onclick="executeQueryAssignment()" id="assignButton" disabled>
                    <span class="btn-icon">✓</span>
                    Assign to Selected Judges
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    updateSelectedJudgesCount();
}

function getJudgeAssignmentStatus(selectedQueries) {
    const judgeStatus = new Map(); // judgeId -> { assignedQueries: Set, conflictCount: number }
    
    selectedQueries.forEach(queryId => {
        const query = getCurrentQueryData(queryId);
        if (query && query.assignments) {
            query.assignments.forEach(assignment => {
                const judgeKey = assignment.judge.name; // Using name as key for demo
                
                if (!judgeStatus.has(judgeKey)) {
                    judgeStatus.set(judgeKey, {
                        assignedQueries: new Set(),
                        conflictCount: 0
                    });
                }
                
                judgeStatus.get(judgeKey).assignedQueries.add(queryId);
                judgeStatus.get(judgeKey).conflictCount++;
            });
        }
    });
    
    return judgeStatus;
}

function toggleJudgeSelection(judgeId) {
    const checkbox = document.getElementById(`judge-${judgeId}`);
    const item = checkbox.closest('.judge-item');
    
    if (checkbox && !item.classList.contains('unavailable')) {
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
        
        updateSelectedJudgesCount();
    }
}

function switchJudgeTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.judge-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.judges-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
}

function updateSelectedJudgesCount() {
    const selectedJudges = document.querySelectorAll('input[name="selectedJudges"]:checked');
    const countElement = document.getElementById('selectedJudgesCount');
    const assignButton = document.getElementById('assignButton');
    
    if (countElement) {
        const count = selectedJudges.length;
        countElement.textContent = `${count} ${count === 1 ? 'judge' : 'judges'} selected`;
    }
    
    if (assignButton) {
        if (selectedJudges.length > 0) {
            assignButton.disabled = false;
            assignButton.classList.remove('disabled');
        } else {
            assignButton.disabled = true;
            assignButton.classList.add('disabled');
        }
    }
}

function showTaskTypeAssignmentModal(selectedQueries) {
    // Create assignment modal for real-time ad hoc queries (task types)
    const modal = document.createElement('div');
    modal.id = 'assignmentModal';
    modal.className = 'modal';
    modal.style.display = 'flex';

    const availableJudges = getAvailableJudges();
    const taskTypes = ['Web Search', 'Image Search', 'News Search', 'Shopping Search'];
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Assign Task Types</h3>
                <button class="modal-close" onclick="closeAssignmentModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Select Task Types:</label>
                    <div class="task-types-selection">
                        <label class="checkbox-option">
                            <input type="checkbox" id="selectAllTaskTypes" onchange="toggleSelectAllTaskTypes()">
                            <span class="checkbox-text">Select All</span>
                        </label>
                        ${taskTypes.map(taskType => `
                            <label class="checkbox-option">
                                <input type="checkbox" value="${taskType}" name="selectedTaskTypes">
                                <span class="checkbox-text">${taskType}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Select Judges:</label>
                    <div class="judges-selection">
                        <label class="checkbox-option">
                            <input type="checkbox" id="selectAllJudges" onchange="toggleSelectAllJudges()">
                            <span class="checkbox-text">Select All</span>
                        </label>
                        ${availableJudges.map(judge => `
                            <label class="checkbox-option">
                                <input type="checkbox" value="${judge.id}" name="selectedJudges">
                                <span class="checkbox-text">${judge.name} (${judge.email})</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeAssignmentModal()">Cancel</button>
                <button class="btn-primary" onclick="executeTaskTypeAssignment()">Assign Task Types</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function getAvailableJudges() {
    // Return judges who are members of the experiment
    const sampleJudges = [
        { id: 'alice-miller', name: 'Alice Miller', email: 'alice.miller@company.com', role: 'judge', initials: 'AM' },
        { id: 'robert-johnson', name: 'Robert Johnson', email: 'robert.johnson@company.com', role: 'judge', initials: 'RJ' },
        { id: 'john-smith', name: 'John Smith', email: 'john.smith@company.com', role: 'owner', initials: 'JS' },
        { id: 'sarah-chen', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'co-owner', initials: 'SC' }
    ];
    return sampleJudges.filter(member => member.role === 'judge' || member.role === 'owner' || member.role === 'co-owner');
}

function closeAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.remove();
    }
}

function toggleSelectAllJudges() {
    const selectAllCheckbox = document.getElementById('selectAllJudges');
    const judgeCheckboxes = document.querySelectorAll('input[name="selectedJudges"]');
    
    judgeCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function toggleSelectAllTaskTypes() {
    const selectAllCheckbox = document.getElementById('selectAllTaskTypes');
    const taskTypeCheckboxes = document.querySelectorAll('input[name="selectedTaskTypes"]');
    
    taskTypeCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function executeQueryAssignment() {
    const selectedJudges = Array.from(document.querySelectorAll('input[name="selectedJudges"]:checked')).map(cb => cb.value);
    
    if (selectedJudges.length === 0) {
        alert('Please select at least one judge');
        return;
    }
    
    const selectedQueries = getSelectedQueries();
    const judgeAssignmentStatus = getJudgeAssignmentStatus(selectedQueries);
    
    // Calculate smart assignment results
    let totalNewAssignments = 0;
    const assignmentDetails = selectedJudges.map(judgeId => {
        const availableJudges = getAvailableJudges();
        const judge = availableJudges.find(j => j.id === judgeId);
        const judgeName = judge ? judge.name : judgeId;
        
        const status = judgeAssignmentStatus.get(judgeName);
        const newAssignments = status ? selectedQueries.length - status.conflictCount : selectedQueries.length;
        totalNewAssignments += newAssignments;
        
        return {
            name: judgeName,
            newAssignments,
            skippedDuplicates: status ? status.conflictCount : 0
        };
    });
    
    // Create detailed success message
    let message = `✅ Smart Assignment Completed!\n\n`;
    message += `📊 Summary:\n`;
    message += `• Total new assignments: ${totalNewAssignments}\n`;
    message += `• Judges selected: ${selectedJudges.length}\n`;
    message += `• Queries processed: ${selectedQueries.length}\n\n`;
    
    message += `👥 Assignment Details:\n`;
    assignmentDetails.forEach(detail => {
        message += `• ${detail.name}: +${detail.newAssignments} new`;
        if (detail.skippedDuplicates > 0) {
            message += ` (${detail.skippedDuplicates} duplicates prevented)`;
        }
        message += `\n`;
    });
    
    alert(message);
    
    closeAssignmentModal();
    
    // Refresh the query list to show assignments
    loadQueries();
}

function executeTaskTypeAssignment() {
    const selectedJudges = Array.from(document.querySelectorAll('input[name="selectedJudges"]:checked')).map(cb => cb.value);
    const selectedTaskTypes = Array.from(document.querySelectorAll('input[name="selectedTaskTypes"]:checked')).map(cb => cb.value);
    
    if (selectedJudges.length === 0) {
        alert('Please select at least one judge');
        return;
    }
    
    if (selectedTaskTypes.length === 0) {
        alert('Please select at least one task type');
        return;
    }
    
    alert(`Assigning ${selectedTaskTypes.length} task types to ${selectedJudges.length} judges`);
    closeAssignmentModal();
}

// Update UI based on user role and experiment settings
function updateUIBasedOnRole() {
    const assignButton = document.querySelector('button[onclick="assignQueries()"]');
    
    if (assignButton) {
        // Only Owner and Co-Owner can assign queries
        const canAssign = (currentUser.role === 'owner' || currentUser.role === 'co-owner') && !experimentConfig.allowAnyoneToJudge;
        
        if (!canAssign) {
            assignButton.disabled = true;
            assignButton.style.opacity = '0.5';
            assignButton.style.cursor = 'not-allowed';
            
            if (experimentConfig.allowAnyoneToJudge) {
                assignButton.title = 'Assignment not allowed when "Allow Anyone to Judge" is enabled';
            } else if (currentUser.role === 'judge') {
                assignButton.title = 'You do not have permission to assign queries. Only Owner and Co-Owner can assign queries.';
            } else {
                assignButton.title = 'You do not have permission to assign queries';
            }
        } else {
            assignButton.disabled = false;
            assignButton.style.opacity = '1';
            assignButton.style.cursor = 'pointer';
            assignButton.title = 'Assign selected queries to judges';
        }
    }
}

// Add delete experiment function for Owner only
function deleteExperiment() {
    if (currentUser.role !== 'owner') {
        alert('You do not have permission to delete this experiment. Only Owner can delete experiments.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
        alert('Delete Experiment - to be implemented');
    }
}

// Add clone experiment function for Co-Owner
function cloneExperiment() {
    if (currentUser.role !== 'co-owner') {
        alert('You do not have permission to clone this experiment. Only Co-Owner can clone experiments.');
        return;
    }
    
    alert('Clone Experiment - to be implemented');
}

function closeAssignmentDetailsModal() {
    const modal = document.getElementById('assignmentDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function addMoreAssignments(queryId) {
    closeAssignmentDetailsModal();
    // Simulate selecting this query and opening assignment modal
    const queryCheckbox = document.querySelector(`input[value="${queryId}"]`);
    if (queryCheckbox) {
        queryCheckbox.checked = true;
        assignQueries();
    }
}

function reassignTask(queryId, judgeName) {
    alert(`重新分配任务 ${queryId} 给 ${judgeName} - 待实现`);
}

function viewSubmission(queryId, judgeName) {
    alert(`查看 ${judgeName} 对查询 ${queryId} 的提交 - 待实现`);
}

function removeAssignment(queryId, judgeName) {
    if (confirm(`确定要移除 ${judgeName} 对查询 ${queryId} 的分配吗？`)) {
        alert(`移除分配 ${queryId} -> ${judgeName} - 待实现`);
        closeAssignmentDetailsModal();
        loadQueries(); // Refresh the list
    }
}

// Make function globally accessible
window.switchTab = switchTab;
window.toggleSelectAll = toggleSelectAll;
window.updateSelectedQueries = updateSelectedQueries;
window.assignQueries = assignQueries;
window.importQueries = importQueries;
window.toggleConfigurationPanel = toggleConfigurationPanel;
window.closeAssignmentModal = closeAssignmentModal;
window.toggleSelectAllJudges = toggleSelectAllJudges;
window.toggleSelectAllTaskTypes = toggleSelectAllTaskTypes;
window.executeQueryAssignment = executeQueryAssignment;
window.executeTaskTypeAssignment = executeTaskTypeAssignment;
window.deleteExperiment = deleteExperiment;
window.cloneExperiment = cloneExperiment;
window.viewQueryAssignments = viewQueryAssignments;
window.closeAssignmentDetailsModal = closeAssignmentDetailsModal;
window.addMoreAssignments = addMoreAssignments;
window.reassignTask = reassignTask;
window.viewSubmission = viewSubmission;
window.removeAssignment = removeAssignment;
window.toggleJudgeSelection = toggleJudgeSelection;
window.updateSelectedJudgesCount = updateSelectedJudgesCount;
window.switchJudgeTab = switchJudgeTab;
window.addMember = addMember;
window.closeAddMemberModal = closeAddMemberModal;
window.addMemberSubmit = addMemberSubmit;
window.manageMembers = manageMembers;

// Helper functions for data consistency
function updateDataCounts() {
    // Update Members tab badge based on actual member data
    const membersTabBadge = document.querySelector('[data-tab="members"] .tab-badge');
    if (membersTabBadge) {
        // Use actual member data count instead of DOM elements
        const memberCount = getMemberCount();
        membersTabBadge.textContent = memberCount;
    }
    
    // Update Judges count in Progress Overview
    const judgesInfo = document.querySelector('.judges-info .stat-text');
    if (judgesInfo) {
        // Get unique judges from query assignments
        const uniqueJudges = getUniqueJudgesFromQueries();
        judgesInfo.textContent = `${uniqueJudges.size} Judges`;
    }
}

function getMemberCount() {
    // Return the actual number of members from data
    const sampleMembers = [
        {
            id: 'john-smith',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'owner',
            initials: 'JS',
            completed: null,
            assigned: 0,
            lastJudgedAt: null
        },
        {
            id: 'sarah-chen',
            name: 'Sarah Chen',
            email: 'sarah.chen@company.com',
            role: 'co-owner',
            initials: 'SC',
            completed: 38,
            assigned: 45,
            lastJudgedAt: '2024-03-16 15:30:22'
        },
        {
            id: 'alice-miller',
            name: 'Alice Miller',
            email: 'alice.miller@company.com',
            role: 'judge',
            initials: 'AM',
            completed: 32,
            assigned: 40,
            lastJudgedAt: '2024-03-15 14:20:15'
        },
        {
            id: 'robert-johnson',
            name: 'Robert Johnson',
            email: 'robert.johnson@company.com',
            role: 'judge',
            initials: 'RJ',
            completed: 28,
            assigned: 35,
            lastJudgedAt: '2024-03-14 09:45:33'
        }
    ];
    
    return sampleMembers.length;
}

function getUniqueJudgesFromQueries() {
    // Get all unique judges from query assignments
    const uniqueJudges = new Set();
    
    // This should ideally come from actual query data
    // For now, using the same data structure as in loadQueries
    const sampleQueries = [
        {
            assignments: [
                { judge: { name: 'John Smith' } },
                { judge: { name: 'Alice Miller' } },
                { judge: { name: 'Robert Johnson' } }
            ]
        },
        {
            assignments: [
                { judge: { name: 'Alice Miller' } },
                { judge: { name: 'Robert Johnson' } }
            ]
        },
        {
            assignments: [
                { judge: { name: 'John Smith' } },
                { judge: { name: 'Alice Miller' } }
            ]
        },
        {
            assignments: [
                { judge: { name: 'Robert Johnson' } }
            ]
        },
        {
            assignments: [
                { judge: { name: 'John Smith' } },
                { judge: { name: 'Alice Miller' } },
                { judge: { name: 'Robert Johnson' } },
                { judge: { name: 'Sarah Chen' } }
            ]
        },
        {
            assignments: []
        }
    ];
    
    sampleQueries.forEach(query => {
        if (query.assignments) {
            query.assignments.forEach(assignment => {
                uniqueJudges.add(assignment.judge.name);
            });
        }
    });
    
    return uniqueJudges;
}

// Initialize page when DOM is loaded
// Add immediate debug logs
console.log('Script loaded at:', new Date().toISOString());

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired at:', new Date().toISOString());
    
    // Load initial content for the default active tab (queries)
    console.log('Calling loadQueries from DOMContentLoaded...');
    loadQueries();
    
    // Update UI based on user role and permissions
    updateUIBasedOnRole();
    
    // Initialize button state
    updateSelectedQueries();
    
    // Update data counts for consistency
    setTimeout(() => {
        updateDataCounts();
    }, 100);
    
    console.log('DOMContentLoaded initialization completed');
    
    // Add event listeners for modal close on outside click
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddMemberModal();
            }
        });
    }
    
    // Initialize search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            // Implement search filtering
            console.log('Searching for:', e.target.value);
        });
    }
    
    // Initialize filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function(e) {
            // Implement filtering
            console.log('Filter changed:', e.target.value);
        });
    });
});

// Backup initialization in case DOMContentLoaded doesn't fire
console.log('Setting up backup initialization...');
setTimeout(function() {
    console.log('Backup initialization running...');
    if (!document.getElementById('queryListBody') || document.getElementById('queryListBody').innerHTML.trim() === '') {
        console.log('Main initialization seems to have failed, running backup...');
        loadQueries();
    } else {
        console.log('Main initialization succeeded, backup not needed');
    }
}, 500);

// Also try immediate initialization if document is already ready
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('Document already ready, running immediate initialization');
    loadQueries();
}
    