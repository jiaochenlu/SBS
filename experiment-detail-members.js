/**
 * Experiment Detail Members Module
 * 处理成员管理相关的所有功能
 */

import { getExperimentData, getCurrentUser, getExperimentConfig } from './experiment-detail-data.js';

/**
 * 加载成员列表
 */
export function loadMembers() {
    const membersGrid = document.querySelector('.members-grid');
    if (!membersGrid) {
        console.warn('❌ Members grid element not found');
        return;
    }
    
    const members = getMembersData();
    console.log('👥 Loading members:', members);
    
    // Clear existing content
    membersGrid.innerHTML = '';
    
    // Create member cards
    members.forEach(member => {
        const memberCard = createMemberCard(member);
        membersGrid.appendChild(memberCard);
    });
    
    console.log(`✅ Loaded ${members.length} members`);
}

/**
 * 获取成员数据（包含fallback）
 */
function getMembersData() {
    const experimentData = getExperimentData();
    
    if (experimentData && experimentData.members) {
        return experimentData.members;
    } else {
        console.warn('⚠️ Using fallback member data');
        return getFallbackMembers();
    }
}

/**
 * 创建成员卡片
 */
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    // Calculate progress percentage
    const progressPercentage = member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0;
    
    // Format last judged time
    const lastJudged = member.lastJudgedAt ? formatDateTime(member.lastJudgedAt) : 'Never';
    
    card.innerHTML = `
        <div class="member-avatar">${member.initials}</div>
        <div class="member-name">${member.name}</div>
        <div class="member-email">${member.email}</div>
        <div class="member-role ${member.role}">${getRoleDisplayName(member.role)}</div>
        
        <div class="member-stats">
            ${createStatItem('Role', getRoleDisplayName(member.role))}
            ${createStatItem('Assigned', member.assigned || 0)}
            ${createStatItem('Completed', member.completed || 0)}
            ${createStatItem('Last Judged', lastJudged)}
            ${member.assigned > 0 ? createProgressStat(member.completed, member.assigned, progressPercentage) : ''}
        </div>
        
        <div class="member-actions">
            ${createMemberActionButtons(member)}
        </div>
    `;
    
    return card;
}

/**
 * 创建统计项
 */
function createStatItem(label, value) {
    const isEmpty = !value || value === 0 || value === 'Never';
    return `
        <div class="stat-item">
            <span class="stat-label">${label}:</span>
            <span class="stat-value ${isEmpty ? 'empty' : ''}">${isEmpty ? '--' : value}</span>
        </div>
    `;
}

/**
 * 创建进度统计项
 */
function createProgressStat(completed, assigned, percentage) {
    return `
        <div class="stat-item progress-stat">
            <div class="progress-info">
                <span class="stat-label">Progress:</span>
                <span class="progress-percentage">${percentage}%</span>
            </div>
            <div class="member-progress-bar">
                <div class="member-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-numbers">${completed}/${assigned} completed</div>
        </div>
    `;
}

/**
 * 创建成员操作按钮
 */
function createMemberActionButtons(member) {
    const currentUser = getCurrentUser();
    const experimentConfig = getExperimentConfig();
    
    // Determine what actions are available
    const canManage = currentUser.role === 'owner' || (currentUser.role === 'co-owner' && member.role === 'judge');
    const canRemove = currentUser.role === 'owner' && member.id !== currentUser.id;
    const isCurrentUser = member.id === currentUser.id;
    
    let buttons = '';
    
    if (isCurrentUser) {
        buttons += `<button class="btn-icon" title="This is you" disabled>👤</button>`;
    }
    
    if (canManage && !experimentConfig.allowAnyoneToJudge) {
        buttons += `
            <button class="btn-icon" onclick="editMember('${member.id}')" title="Edit member">✏️</button>
        `;
    }
    
    if (canRemove) {
        buttons += `
            <button class="btn-icon" onclick="removeMember('${member.id}')" title="Remove member">🗑️</button>
        `;
    }
    
    if (member.role === 'judge') {
        buttons += `
            <button class="btn-icon" onclick="viewMemberProgress('${member.id}')" title="View progress">📊</button>
        `;
    }
    
    return buttons || '<span class="no-actions">No actions available</span>';
}

/**
 * 获取角色显示名称
 */
function getRoleDisplayName(role) {
    const roleNames = {
        'owner': 'Owner',
        'co-owner': 'Co-Owner', 
        'judge': 'Judge'
    };
    return roleNames[role] || role;
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
        return dateTimeString;
    }
}

/**
 * 获取fallback成员数据
 */
function getFallbackMembers() {
    return [
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
            lastJudgedAt: '2024-03-16 09:45:30'
        }
    ];
}

/**
 * 添加成员相关函数
 */
export function addMember() {
    const currentUser = getCurrentUser();
    const experimentConfig = getExperimentConfig();
    
    // Check permissions
    if (experimentConfig.allowAnyoneToJudge) {
        alert('Judgement is open to everyone for this experiment. Adding members is disabled.');
        return;
    }
    
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        alert('You do not have permission to add members.');
        return;
    }
    
    // Show add member modal
    showAddMemberModal();
}

export function showAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.style.display = 'flex';
        populateRoleSelect();
    }
}

export function closeAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function populateRoleSelect() {
    const roleSelect = document.getElementById('roleSelect');
    const currentUser = getCurrentUser();
    
    if (!roleSelect) return;
    
    roleSelect.innerHTML = '';
    
    // Owner can assign any role except owner
    if (currentUser.role === 'owner') {
        roleSelect.innerHTML = `
            <option value="co-owner">Co-Owner</option>
            <option value="judge">Judge</option>
        `;
    } else if (currentUser.role === 'co-owner') {
        // Co-owner can only assign judge role
        roleSelect.innerHTML = `
            <option value="judge">Judge</option>
        `;
    }
}

export function addMemberSubmit() {
    const modal = document.getElementById('addMemberModal');
    if (!modal) return;
    
    const emailInput = modal.querySelector('input[type="email"]');
    const roleSelect = modal.querySelector('#roleSelect');
    
    if (!emailInput || !roleSelect) return;
    
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    
    if (!email) {
        alert('Please enter an email address.');
        return;
    }
    
    if (!role) {
        alert('Please select a role.');
        return;
    }
    
    // Here you would typically send the data to the server
    console.log('Adding member:', { email, role });
    
    // For now, just show a success message and close the modal
    alert(`Member invitation sent to ${email} as ${getRoleDisplayName(role)}.`);
    closeAddMemberModal();
}

/**
 * 其他成员管理函数
 */
export function editMember(memberId) {
    console.log('Editing member:', memberId);
    // Implementation for editing member
    alert('Edit member functionality would be implemented here.');
}

export function removeMember(memberId) {
    const currentUser = getCurrentUser();
    
    if (currentUser.role !== 'owner') {
        alert('Only the experiment owner can remove members.');
        return;
    }
    
    if (memberId === currentUser.id) {
        alert('You cannot remove yourself from the experiment.');
        return;
    }
    
    if (confirm('Are you sure you want to remove this member from the experiment?')) {
        console.log('Removing member:', memberId);
        // Implementation for removing member
        alert('Remove member functionality would be implemented here.');
    }
}

export function viewMemberProgress(memberId) {
    console.log('Viewing member progress:', memberId);
    // Implementation for viewing member progress
    alert('View member progress functionality would be implemented here.');
}

export function manageMembers() {
    console.log('Managing members');
    // Implementation for bulk member management
    alert('Manage members functionality would be implemented here.');
}

// 导出全局函数
window.loadMembers = loadMembers;
window.addMember = addMember;
window.addMemberSubmit = addMemberSubmit;
window.closeAddMemberModal = closeAddMemberModal;
window.editMember = editMember;
window.removeMember = removeMember;
window.viewMemberProgress = viewMemberProgress;
window.manageMembers = manageMembers;