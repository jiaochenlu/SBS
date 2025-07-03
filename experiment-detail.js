// Experiment Detail Page JavaScript

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
    
    // Create row content
    row.innerHTML = `
        <div class="checkbox-column">
            <input type="checkbox" value="${query.id}" onchange="updateSelectedQueries()">
        </div>
        <div class="query-column">
            <div class="query-text">${query.text}</div>
            <div class="query-meta">#${query.id}</div>
        </div>
        <div class="status-column">
            <span class="status-badge status-${query.status}">${query.status}</span>
        </div>
        <div class="assignee-column">
            <div class="assignee-info">
                <div class="assignee-avatar">${query.assignee ? query.assignee.initials : 'UN'}</div>
                <span class="assignee-name">${query.assignee ? query.assignee.name : 'Unassigned'}</span>
            </div>
        </div>
        <div class="progress-column">
            <div class="progress-bar-small">
                <div class="progress-fill-small" style="width: ${query.progress}%"></div>
            </div>
            <span class="progress-text">${query.progress}%</span>
        </div>
        <div class="actions-column">
            <button class="btn-icon" onclick="editQuery('${query.id}')" title="Edit">✏️</button>
            <button class="btn-icon" onclick="deleteQuery('${query.id}')" title="Delete">🗑️</button>
            <button class="btn-icon" onclick="viewQuery('${query.id}')" title="View">👁️</button>
        </div>
    `;
    
    return row;
}

function loadQueries() {
    const queryListBody = document.getElementById('queryListBody');
    if (!queryListBody) return;
    
    // Sample query data
    const sampleQueries = [
        {
            id: 'Q001',
            text: 'How to implement machine learning algorithms in Python?',
            status: 'completed',
            assignee: { name: 'John Smith', initials: 'JS' },
            progress: 100
        },
        {
            id: 'Q002',
            text: 'Best practices for web application security',
            status: 'in-progress',
            assignee: { name: 'Alice Miller', initials: 'AM' },
            progress: 65
        },
        {
            id: 'Q003',
            text: 'Database optimization techniques for large datasets',
            status: 'not-started',
            assignee: null,
            progress: 0
        },
        {
            id: 'Q004',
            text: 'Cloud infrastructure deployment strategies',
            status: 'completed',
            assignee: { name: 'Robert Johnson', initials: 'RJ' },
            progress: 100
        },
        {
            id: 'Q005',
            text: 'API design principles and best practices',
            status: 'in-progress',
            assignee: { name: 'John Smith', initials: 'JS' },
            progress: 30
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
            completed: 45,
            accuracy: 94
        },
        {
            id: 'alice-miller',
            name: 'Alice Miller',
            email: 'alice.miller@company.com',
            role: 'annotator',
            initials: 'AM',
            completed: 32,
            accuracy: 91
        },
        {
            id: 'robert-johnson',
            name: 'Robert Johnson',
            email: 'robert.johnson@company.com',
            role: 'annotator',
            initials: 'RJ',
            completed: 28,
            accuracy: 96
        }
    ];
    
    // Clear existing content
    membersGrid.innerHTML = '';
    
    // Add members
    sampleMembers.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        memberCard.innerHTML = `
            <div class="member-avatar">${member.initials}</div>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-email">${member.email}</div>
                <div class="member-role ${member.role}">${member.role}</div>
            </div>
            <div class="member-stats">
                <div class="stat-item">
                    <span class="stat-label">Completed</span>
                    <span class="stat-value">${member.completed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Accuracy</span>
                    <span class="stat-value">${member.accuracy}%</span>
                </div>
            </div>
            <div class="member-actions">
                <button class="btn-icon" onclick="editMember('${member.id}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="removeMember('${member.id}')" title="Remove">🗑️</button>
            </div>
        `;
        membersGrid.appendChild(memberCard);
    });
}

// Query management functions
function addQuery() {
    alert('Add Query functionality - to be implemented');
}

function importQueries() {
    alert('Import Queries functionality - to be implemented');
}

function assignQueries() {
    const selectedQueries = getSelectedQueries();
    if (selectedQueries.length === 0) {
        alert('Please select queries to assign');
        return;
    }
    alert(`Assigning ${selectedQueries.length} selected queries - to be implemented`);
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

function getSelectedQueries() {
    const checkboxes = document.querySelectorAll('.query-row input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateSelectedQueries() {
    const selectedCount = getSelectedQueries().length;
    // Update UI to show selected count if needed
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
    const modal = document.getElementById('addMemberModal');
    if (modal) {
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
    const role = document.querySelector('#addMemberModal select').value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    alert(`Adding member: ${email} as ${role} - to be implemented`);
    closeAddMemberModal();
}

function editMember(memberId) {
    alert(`Edit member ${memberId} - to be implemented`);
}

function removeMember(memberId) {
    if (confirm('Are you sure you want to remove this member?')) {
        alert(`Remove member ${memberId} - to be implemented`);
    }
}

function manageRoles() {
    alert('Manage Roles functionality - to be implemented');
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
    alert('Download Report functionality - to be implemented');
}

function exportData() {
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

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set default active tab
    switchTab('queries');
    
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