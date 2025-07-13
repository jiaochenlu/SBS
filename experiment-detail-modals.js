/**
 * Experiment Detail Modals Module
 * 处理所有模态框相关的功能
 */

import { getExperimentData, getCurrentUser, getUsers, getExperimentConfig } from './experiment-detail-data.js';

/**
 * Modal Manager Class - 统一管理所有模态框
 */
export class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupGlobalListeners();
    }
    
    /**
     * 设置全局监听器
     */
    setupGlobalListeners() {
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });
        
        // 点击背景关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }
    
    /**
     * 显示模态框
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.activeModals.add(modalId);
            document.body.classList.add('modal-open');
        }
    }
    
    /**
     * 关闭模态框
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete(modalId);
            
            if (this.activeModals.size === 0) {
                document.body.classList.remove('modal-open');
            }
        }
    }
    
    /**
     * 关闭最顶层的模态框
     */
    closeTopModal() {
        if (this.activeModals.size > 0) {
            const topModal = Array.from(this.activeModals).pop();
            this.closeModal(topModal);
        }
    }
    
    /**
     * 创建动态模态框
     */
    createModal(options) {
        const {
            id,
            title,
            content,
            actions = [],
            size = 'medium',
            closeable = true
        } = options;
        
        // 检查是否已存在
        let modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
        
        modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal modal-${size}`;
        
        const actionsHtml = actions.map(action => 
            `<button class="${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">${action.text}</button>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    ${closeable ? `<button class="modal-close" onclick="modalManager.closeModal('${id}')">&times;</button>` : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actionsHtml ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
}

// 全局模态框管理器实例
export const modalManager = new ModalManager();

/**
 * Assignment Modal Functions
 * 分配相关的模态框功能
 */

/**
 * 显示分配查询模态框
 */
export function showAssignmentModal(selectedQueries = []) {
    const experimentData = getExperimentData();
    const users = getUsers();
    
    if (!experimentData || !users) {
        console.warn('⚠️ Missing data for assignment modal');
        return;
    }
    
    const judges = Object.values(users).filter(user => user.role === 'judge');
    const currentUser = getCurrentUser();
    
    // 准备查询信息
    const queryInfo = selectedQueries.length > 0 
        ? `Selected ${selectedQueries.length} queries`
        : 'No queries selected';
    
    // 创建judge选择器
    const judgeOptions = judges.map(judge => `
        <div class="judge-item available" onclick="toggleJudgeSelection('${judge.id}')">
            <div class="judge-item-content">
                <input type="checkbox" class="judge-checkbox" value="${judge.id}">
                <div class="judge-avatar available">${judge.initials}</div>
                <div class="judge-info">
                    <div class="judge-name">${judge.name}</div>
                    <div class="judge-role">${judge.role}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    const content = `
        <div class="assignment-info">
            <div class="info-card">
                <div class="info-icon">📋</div>
                <div class="info-text">${queryInfo}</div>
            </div>
        </div>
        
        <div class="form-section">
            <div class="section-header-small">
                <h4>Select Judges</h4>
                <span class="judges-count">${judges.length} available</span>
            </div>
            
            <div class="judges-list">
                ${judgeOptions}
            </div>
            
            <div class="selection-summary">
                <span id="selectionSummary">0 judges selected</span>
            </div>
        </div>
    `;
    
    const actions = [
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onclick: 'modalManager.closeModal("assignmentModal")'
        },
        {
            text: 'Assign',
            class: 'btn-primary',
            onclick: 'submitAssignment()'
        }
    ];
    
    const modal = modalManager.createModal({
        id: 'assignmentModal',
        title: 'Assign Queries to Judges',
        content: content,
        actions: actions,
        size: 'large'
    });
    
    modalManager.showModal('assignmentModal');
}

/**
 * 显示配置详情模态框
 */
export function showConfigurationModal() {
    const experimentData = getExperimentData();
    
    if (!experimentData) {
        console.warn('⚠️ No experiment data for configuration modal');
        return;
    }
    
    const config = experimentData.configuration;
    
    const content = `
        <div class="config-body">
            <div class="config-section">
                <h4>Experiment Type</h4>
                <div class="config-item">
                    <span class="config-label">Selected Type:</span>
                    <span class="config-value">${config.experimentType}</span>
                </div>
            </div>

            <div class="config-section">
                <h4>Basic Information</h4>
                <div class="config-item">
                    <span class="config-label">Experiment Name:</span>
                    <span class="config-value">${experimentData.name}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Description:</span>
                    <span class="config-value">${experimentData.description}</span>
                </div>
            </div>

            <div class="config-section">
                <h4>Labeling Data</h4>
                <div class="config-item">
                    <span class="config-label">Data Schema:</span>
                    <span class="config-value">${config.dataSchema}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Data Source:</span>
                    <span class="config-value">${config.dataSource}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Query Set Selection:</span>
                    <span class="config-value">${config.querySetSelection}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Query Set File:</span>
                    <span class="config-value">${config.querySetFile.name} (${config.querySetFile.queryCount} queries)</span>
                </div>
            </div>

            <div class="config-section">
                <h4>Judgement Questions</h4>
                ${config.judgementQuestions.map(q => `
                    <div class="config-item">
                        <span class="config-label">Question ${q.id}:</span>
                        <span class="config-value">${q.text} (${q.type})</span>
                    </div>
                `).join('')}
            </div>

            <div class="config-section">
                <h4>Additional Settings</h4>
                <div class="config-item">
                    <span class="config-label">Blind Test:</span>
                    <span class="config-value">${config.additionalSettings.blindTest ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Allow Any to Judge:</span>
                    <span class="config-value">${config.additionalSettings.allowAnyToJudge ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="config-item">
                    <span class="config-label">Judgement Guide:</span>
                    <span class="config-value">${config.additionalSettings.judgementGuide}</span>
                </div>
            </div>
        </div>
    `;
    
    const actions = [
        {
            text: 'Close',
            class: 'btn-primary',
            onclick: 'modalManager.closeModal("configurationModal")'
        }
    ];
    
    modalManager.createModal({
        id: 'configurationModal',
        title: 'Experiment Configuration',
        content: content,
        actions: actions,
        size: 'large'
    });
    
    modalManager.showModal('configurationModal');
}

/**
 * 显示确认删除模态框
 */
export function showDeleteConfirmationModal() {
    const currentUser = getCurrentUser();
    
    if (currentUser.role !== 'owner') {
        alert('Only the experiment owner can delete the experiment.');
        return;
    }
    
    const content = `
        <div class="delete-warning">
            <div class="warning-icon">⚠️</div>
            <p>Are you sure you want to delete this experiment?</p>
            <p><strong>This action cannot be undone.</strong></p>
            <p>All experiment data, including queries, assignments, and results, will be permanently deleted.</p>
        </div>
    `;
    
    const actions = [
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onclick: 'modalManager.closeModal("deleteConfirmationModal")'
        },
        {
            text: 'Delete Experiment',
            class: 'btn-danger',
            onclick: 'confirmDeleteExperiment()'
        }
    ];
    
    modalManager.createModal({
        id: 'deleteConfirmationModal',
        title: 'Delete Experiment',
        content: content,
        actions: actions,
        size: 'medium'
    });
    
    modalManager.showModal('deleteConfirmationModal');
}

/**
 * 显示查询详情模态框
 */
export function showQueryDetailsModal(queryId) {
    const experimentData = getExperimentData();
    
    if (!experimentData) {
        console.warn('⚠️ No experiment data for query details');
        return;
    }
    
    const query = experimentData.queries.find(q => q.id === queryId);
    if (!query) {
        console.warn(`⚠️ Query ${queryId} not found`);
        return;
    }
    
    const assignments = query.assignments || [];
    
    const assignmentsHtml = assignments.length > 0 
        ? assignments.map(assignment => `
            <div class="assignment-detail-row">
                <div class="judge-info">
                    <div class="assignee-avatar">${assignment.judge.initials}</div>
                    <div class="judge-details">
                        <div class="judge-name">${assignment.judge.name}</div>
                        <div class="assignment-meta">Assigned: ${assignment.assignedAt || 'Unknown'}</div>
                    </div>
                </div>
                <div class="assignment-status">
                    <span class="status-badge status-${assignment.status}">${assignment.status}</span>
                </div>
            </div>
        `).join('')
        : '<div class="no-assignments-message">No assignments for this query</div>';
    
    const content = `
        <div class="query-info">
            <div class="query-text-display">${query.text}</div>
            <div class="query-meta-display">Query ID: ${query.id} | Task Type: ${query.taskType?.name || 'N/A'}</div>
        </div>
        
        <div class="assignments-details">
            <h4>Assignments (${assignments.length})</h4>
            <div class="assignment-details-list">
                ${assignmentsHtml}
            </div>
        </div>
        
        <div class="assignment-summary-stats">
            <div class="stat-item">
                <div class="stat-label">Total Assigned</div>
                <div class="stat-value">${assignments.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Completed</div>
                <div class="stat-value">${assignments.filter(a => a.status === 'completed').length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">In Progress</div>
                <div class="stat-value">${assignments.filter(a => a.status === 'in-progress').length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Not Started</div>
                <div class="stat-value">${assignments.filter(a => a.status === 'not-started').length}</div>
            </div>
        </div>
    `;
    
    const actions = [
        {
            text: 'Close',
            class: 'btn-primary',
            onclick: 'modalManager.closeModal("queryDetailsModal")'
        }
    ];
    
    modalManager.createModal({
        id: 'queryDetailsModal',
        title: `Query Details - ${queryId}`,
        content: content,
        actions: actions,
        size: 'large'
    });
    
    modalManager.showModal('queryDetailsModal');
}

/**
 * 通用助手函数
 */
export function toggleJudgeSelection(judgeId) {
    const checkbox = document.querySelector(`input[value="${judgeId}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        updateSelectionSummary();
    }
}

function updateSelectionSummary() {
    const selectedCheckboxes = document.querySelectorAll('.judge-checkbox:checked');
    const summary = document.getElementById('selectionSummary');
    if (summary) {
        summary.textContent = `${selectedCheckboxes.length} judges selected`;
    }
}

export function submitAssignment() {
    const selectedJudges = Array.from(document.querySelectorAll('.judge-checkbox:checked')).map(cb => cb.value);
    
    if (selectedJudges.length === 0) {
        alert('Please select at least one judge.');
        return;
    }
    
    // Here you would typically send the assignment data to the server
    console.log('Submitting assignment:', selectedJudges);
    
    alert(`Assignment submitted for ${selectedJudges.length} judges.`);
    modalManager.closeModal('assignmentModal');
}

export function confirmDeleteExperiment() {
    // Here you would typically send the delete request to the server
    console.log('Deleting experiment...');
    
    alert('Experiment deletion functionality would be implemented here.');
    modalManager.closeModal('deleteConfirmationModal');
}

// 导出全局函数
window.modalManager = modalManager;
window.showAssignmentModal = showAssignmentModal;
window.showConfigurationModal = showConfigurationModal;
window.showDeleteConfirmationModal = showDeleteConfirmationModal;
window.showQueryDetailsModal = showQueryDetailsModal;
window.toggleJudgeSelection = toggleJudgeSelection;
window.submitAssignment = submitAssignment;
window.confirmDeleteExperiment = confirmDeleteExperiment;