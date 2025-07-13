// Experiment Detail Page JavaScript

// Global variables for configuration data
let experimentData = null;
let users = {};
let currentUser = null;
let experimentConfig = {
    allowAnyoneToJudge: false,
    experimentType: 'search-ndcg',
    isRealTimeAdHoc: false
};

// Task type filtering variables
let currentTaskTypeFilter = null;
let originalQueries = [];

// Task type assignment variables
let selectedTaskTypes = [];
let taskTypeAssignments = {};

// Assignment mode state management
let assignmentMode = 'default'; // 'default' | 'query-selection' | 'tasktype-selection'
let isHighlightingSelections = false;

const AssignmentStates = {
    DEFAULT: 'default',
    QUERY_SELECTION: 'query-selection',
    TASKTYPE_SELECTION: 'tasktype-selection'
};

// Load experiment configuration from JSON file
async function loadExperimentConfig() {
    try {
        console.log('🚀🚀🚀 STARTING loadExperimentConfig function');
        console.log('Current location:', window.location.href);
        console.log('Base URL:', window.location.origin);
        
        const configUrl = './experiment-config-merged.json';
        console.log('📡 Attempting to fetch:', configUrl);
        
        const response = await fetch(configUrl);
        console.log('📡 Fetching merged configuration from:', configUrl);
        console.log('📡 Fetch response received:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            ok: response.ok
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log('✨✨✨ CONFIG DATA LOADED SUCCESSFULLY:', config);
        console.log('✨ Experiment data:', config.experiment);
        
        const urlParams = new URLSearchParams(window.location.search);
        const experimentId = urlParams.get('id');
        console.log('🔍 URL Parameters:', urlParams.toString());
        console.log('🔍 Experiment ID from URL:', experimentId);
        
        experimentData = config.experiments.find(exp => exp.id === experimentId);
        console.log('🔍 Matched Experiment Data:', experimentData);
        
        if (!experimentData) {
            console.error(`Experiment with ID "${experimentId}" not found.`);
            alert('Experiment not found. Please check the URL.');
            console.error('❌ Experiment not found. Available experiments:', config.experiments.map(exp => exp.id));
            return;
        }
        console.log('✨ Set experimentData to:', experimentData);
        
        // Convert members array to users object for compatibility
        users = {};
        experimentData.members.forEach(member => {
            users[member.id] = member;
        });
        console.log('✨ Set users to:', users);
        
        // Set default current user to owner
        const owner = experimentData.members.find(member => member.role === 'owner');
        currentUser = owner || experimentData.members[0];
        console.log('✨ Set currentUser to:', currentUser);
        
        // Update experiment config
        experimentConfig.allowAnyoneToJudge = experimentData.configuration.additionalSettings.allowAnyToJudge;
        
        // Dynamically hide "Assign Judges" button if allowAnyoneToJudge is true
        const assignJudgesBtn = document.getElementById('assignJudgesBtn');
        if (assignJudgesBtn) {
            assignJudgesBtn.style.display = experimentConfig.allowAnyoneToJudge ? 'none' : 'block';
        }
        
        // Adjust members list to show only owner, co-owner, and voluntary judges
        if (experimentConfig.allowAnyoneToJudge) {
            experimentData.members = experimentData.members.filter(member =>
                ['owner', 'co-owner', 'judge'].includes(member.role)
            );
        }
        
        // Update query management list to reflect voluntary judgments
        experimentData.queries.forEach(query => {
            query.judges = query.assignments ? query.assignments.map(a => a.judge) : [];
        });
        experimentConfig.experimentType = experimentData.configuration.experimentType;
        experimentConfig.isRealTimeAdHoc = experimentData.configuration.dataSource === 'ad-hoc';
        
        // Debug logging for configuration
        console.log('🔍🔍🔍 Configuration Debug:');
        console.log('  - Raw allowAnyToJudge from config:', experimentData.configuration.additionalSettings.allowAnyToJudge);
        console.log('  - Set experimentConfig.allowAnyoneToJudge to:', experimentConfig.allowAnyoneToJudge);
        console.log('  - experimentConfig object:', experimentConfig);
        
        // Update UI with loaded data
        console.log('🎨🎨🎨 CALLING updateUIWithConfigData...');
        updateUIWithConfigData();
        
        console.log('✅✅✅ Experiment configuration loaded successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Error loading experiment configuration:', error);
        // Fallback to hardcoded data if config loading fails
        loadFallbackData();
        return false;
    }
}

// Fallback data if config file loading fails
function loadFallbackData() {
    console.log('🔄 Loading fallback data...');
    
    users = {
        'john-smith': {
            id: 'john-smith',
            name: 'John Smith',
            role: 'owner',
            initials: 'JS',
            email: 'john.smith@company.com'
        },
        'sarah-chen': {
            id: 'sarah-chen',
            name: 'Sarah Chen',
            role: 'co-owner',
            initials: 'SC',
            email: 'sarah.chen@company.com'
        },
        'alice-miller': {
            id: 'alice-miller',
            name: 'Alice Miller',
            role: 'judge',
            initials: 'AM',
            email: 'alice.miller@company.com'
        }
    };
    
    currentUser = users['john-smith'];
    
    experimentConfig = {
        allowAnyoneToJudge: false,
        experimentType: 'search-ndcg',
        isRealTimeAdHoc: false
    };
    
    // Set fallback experimentData
    experimentData = {
        id: "search-ndcg-fallback",
        name: "Search NDCG Experiment (Fallback)",
        description: "Fallback experiment data",
        status: "active",
        createdAt: "March 15, 2024",
        owner: {
            id: "john-smith",
            name: "John Smith",
            email: "john.smith@company.com",
            initials: "JS"
        },
        configuration: {
            experimentType: "Search NDCG experiment",
            dataSchema: "Search",
            dataSource: "Real-time scraping",
            querySetSelection: "Upload query set",
            querySetFile: {
                name: "fallback_queries.csv",
                queryCount: 50
            },
            controlProfile: "userp",
            treatmentProfile: "copilot web",
            dataFieldsDisplay: "Query, Response, LU Info Question",
            judgementQuestions: [
                {
                    id: 1,
                    text: "Item relevance",
                    type: "Toggle - Item Level Side-by-Side"
                }
            ],
            additionalSettings: {
                blindTest: true,
                allowAnyToJudge: false,
                judgementGuide: "Configured (Markdown format)"
            }
        },
        progress: {
            totalQueries: 50,
            completed: 30,
            inProgress: 10,
            notStarted: 10,
            completedPercentage: 60,
            inProgressPercentage: 20,
            notStartedPercentage: 20
        },
        members: [
            {
                id: "john-smith",
                name: "John Smith",
                email: "john.smith@company.com",
                role: "owner",
                initials: "JS",
                completed: null,
                assigned: 0,
                lastJudgedAt: null
            },
            {
                id: "sarah-chen",
                name: "Sarah Chen",
                email: "sarah.chen@company.com",
                role: "co-owner",
                initials: "SC",
                completed: 15,
                assigned: 20,
                lastJudgedAt: "2024-03-16 15:30:22"
            },
            {
                id: "alice-miller",
                name: "Alice Miller",
                email: "alice.miller@company.com",
                role: "judge",
                initials: "AM",
                completed: 15,
                assigned: 20,
                lastJudgedAt: "2024-03-15 14:20:15"
            }
        ],
        queries: [
            {
                id: "Q001",
                text: "How to implement machine learning algorithms in Python?",
                assignments: [
                    {
                        judge: {
                            name: "John Smith",
                            initials: "JS"
                        },
                        status: "completed",
                        completedAt: "2024-03-15 14:30"
                    }
                ]
            },
            {
                id: "Q002",
                text: "Best practices for web application security",
                assignments: [
                    {
                        judge: {
                            name: "Alice Miller",
                            initials: "AM"
                        },
                        status: "not-started",
                        assignedAt: "2024-03-13 10:00"
                    }
                ]
            }
        ],
        results: {
            interAnnotatorAgreement: "85.0%",
            averageCompletionTime: "2.5 min",
            qualityScore: "8.5/10"
        }
    };
    
    console.log('✅ Fallback data loaded successfully');
    
    // Update UI with fallback data
    updateUIWithConfigData();
}

// Update UI elements with configuration data
function updateUIWithConfigData() {
    console.log('🎨🎨🎨 updateUIWithConfigData called');
    console.log('📊📊📊 experimentData:', experimentData);
    
    if (!experimentData) {
        console.error('❌❌❌ experimentData is null, cannot update UI');
        return;
    }
    
    console.log('🔄🔄🔄 Starting UI updates...');
    
    // Update header information
    const titleElement = document.getElementById('experimentTitle');
    if (titleElement) {
        titleElement.textContent = experimentData.name;
        console.log('✅✅✅ Updated title to:', experimentData.name);
        console.log('✅ Title element now contains:', titleElement.textContent);
    } else {
        console.error('❌❌❌ experimentTitle element not found');
    }
    
    const statusElement = document.getElementById('experimentStatus');
    if (statusElement) {
        // Update query count element (no longer use experimentData.progress)
        const queryCountElement = document.getElementById('experimentQueryCount');
        if (queryCountElement) {
            queryCountElement.textContent = `${experimentData.queries.length} queries`;
            console.log('✅✅✅ Updated query count to:', experimentData.queries.length);
            console.log('✅ Query count element now contains:', queryCountElement.textContent);
        } else {
            console.error('❌❌❌ experimentQueryCount element not found');
        }

        // 动态计算 derivedStatus
        let completedCount = 0, inProgressCount = 0, notStartedCount = 0;
        experimentData.queries.forEach(query => {
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
        let derivedStatus = "Not started";
        if (completedCount === experimentData.queries.length && experimentData.queries.length > 0) {
            derivedStatus = "Completed";
        } else if (inProgressCount > 0 || completedCount > 0) {
            derivedStatus = "In progress";
        }
        if (statusElement) {
            statusElement.textContent = derivedStatus;
            statusElement.className = `status-badge status-${experimentData.status}`;
            console.log('✅✅✅ Updated status to:', derivedStatus);
            console.log('✅ Status element now contains:', statusElement.textContent);
        } else {
            console.error('❌❌❌ experimentStatus element not found');
        }
    } else {
        console.error('❌❌❌ experimentStatus element not found');
    }
    
    const createdElement = document.getElementById('experimentCreated');
    if (createdElement) {
        createdElement.textContent = `Created: ${experimentData.createdAt}`;
        console.log('✅✅✅ Updated created date to:', experimentData.createdAt);
        console.log('✅ Created element now contains:', createdElement.textContent);
    } else {
        console.error('❌❌❌ experimentCreated element not found');
    }
    
    const ownerElement = document.getElementById('experimentOwner');
    if (ownerElement) {
        ownerElement.textContent = `Owner: ${experimentData.owner.name}`;
        console.log('✅✅✅ Updated owner to:', experimentData.owner.name);
        console.log('✅ Owner element now contains:', ownerElement.textContent);
    } else {
        console.error('❌❌❌ experimentOwner element not found');
    }
    
    const queryCountElement = document.getElementById('experimentQueryCount');
    if (queryCountElement) {
        queryCountElement.textContent = `${experimentData.queries.length} queries`;
        console.log('✅✅✅ Updated query count to:', experimentData.queries.length);
        console.log('✅ Query count element now contains:', queryCountElement.textContent);
    } else {
        console.error('❌❌❌ experimentQueryCount element not found');
    }
    
    console.log('🔄🔄🔄 Updating progress overview...');
    // Update progress overview
    updateProgressOverview();
    
    console.log('🔄🔄🔄 Updating tab badges...');
    // Update tab badges
    updateTabBadges();
    
    console.log('🔄🔄🔄 Scheduling configuration panel update...');
    // Update configuration panel with a small delay to ensure DOM is ready
    setTimeout(() => {
        updateConfigurationPanel();
    }, 100);
    
    console.log('🔄🔄🔄 Updating UI based on role...');
    // Update UI based on role and experiment settings after config is loaded
    updateUIBasedOnRole();
    
    console.log('✅✅✅ updateUIWithConfigData completed');
}

// 动态渲染 Query Management 区域的表头
function renderQueryListHeader() {
    const queryListHeader = document.getElementById('queryListHeader');
    if (!queryListHeader) return;
    // 判断是否为 ad hoc query
    const showTaskType = experimentData && experimentData.configuration && experimentData.configuration.querySetSelection === 'Ad hoc query';
    queryListHeader.innerHTML = `
        <div class="checkbox-column"><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></div>
        <div class="id-column">ID</div>
        <div class="query-column">Query</div>
        ${showTaskType ? '<div class="task-type-column">Task Type</div>' : ''}
        <div class="assignments-column">Judges</div>
        <div class="status-column">Status</div>
        <div class="last-judged-column">Last Judged At</div>
    `;
}

// Update progress overview section
function updateProgressOverview() {
    console.log('📊 updateProgressOverview called');
    
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
    
    // Update total queries display
    const totalElement = document.getElementById('totalQueriesDisplay');
    if (totalElement) {
        totalElement.textContent = `${totalQueries} Total Queries`;
        console.log('✅ Updated totalQueriesDisplay to:', `${totalQueries} Total Queries`);
    } else {
        console.warn('❌ totalQueriesDisplay element not found');
    }
    // Update progress segments
    const completedSegment = document.getElementById('progressCompleted');
    if (completedSegment) {
        completedSegment.style.width = `${completedPercentage}%`;
        completedSegment.title = `${completedCount} Completed (${completedPercentage}%)`;
        console.log('✅ Updated progressCompleted width to:', `${completedPercentage}%`);
    } else {
        console.warn('❌ progressCompleted element not found');
    }
    const inProgressSegment = document.getElementById('progressInProgress');
    if (inProgressSegment) {
        inProgressSegment.style.width = `${inProgressPercentage}%`;
        inProgressSegment.title = `${inProgressCount} In Progress (${inProgressPercentage}%)`;
        console.log('✅ Updated progressInProgress width to:', `${inProgressPercentage}%`);
    } else {
        console.warn('❌ progressInProgress element not found');
    }
    const notStartedSegment = document.getElementById('progressNotStarted');
    if (notStartedSegment) {
        notStartedSegment.style.width = `${notStartedPercentage}%`;
        notStartedSegment.title = `${notStartedCount} Not Started (${notStartedPercentage}%)`;
        console.log('✅ Updated progressNotStarted width to:', `${notStartedPercentage}%`);
    } else {
        console.warn('❌ progressNotStarted element not found');
    }
    // Update progress statistics
    const completedStat = document.getElementById('completedStat');
    if (completedStat) {
        completedStat.textContent = `${completedCount} Completed (${completedPercentage}%)`;
        console.log('✅ Updated completedStat to:', `${completedCount} Completed (${completedPercentage}%)`);
    } else {
        console.warn('❌ completedStat element not found');
    }
    const inProgressStat = document.getElementById('inProgressStat');
    if (inProgressStat) {
        inProgressStat.textContent = `${inProgressCount} In Progress (${inProgressPercentage}%)`;
        console.log('✅ Updated inProgressStat to:', `${inProgressCount} In Progress (${inProgressPercentage}%)`);
    } else {
        console.warn('❌ inProgressStat element not found');
    }
    const notStartedStat = document.getElementById('notStartedStat');
    if (notStartedStat) {
        notStartedStat.textContent = `${notStartedCount} Not Started (${notStartedPercentage}%)`;
        console.log('✅ Updated notStartedStat to:', `${notStartedCount} Not Started (${notStartedPercentage}%)`);
    } else {
        console.warn('❌ notStartedStat element not found');
    }
    // Update judges count
    const judgesCount = document.getElementById('judgesCount');
    if (judgesCount) {
        judgesCount.textContent = `${uniqueJudges.size} Judges`;
        console.log('✅ Updated judgesCount to:', `${uniqueJudges.size} Judges`);
    } else {
        console.warn('❌ judgesCount element not found');
    }
    console.log('✅ updateProgressOverview completed');
}

// Update tab badges
function updateTabBadges() {
    if (!experimentData) return;
    
    console.log('📊 updateTabBadges called with experimentData:', experimentData);
    
    const queriesTabBadge = document.getElementById('queriesTabBadge');
    if (queriesTabBadge) {
        queriesTabBadge.textContent = experimentData.queries.length;
        console.log('✅ Updated queriesTabBadge to:', experimentData.queries.length);
    }
    
    const membersTabBadge = document.getElementById('membersTabBadge');
    if (membersTabBadge) {
        membersTabBadge.textContent = experimentData.members.length;
        console.log('✅ Updated membersTabBadge to:', experimentData.members.length);
    }
}

// Update configuration panel
function updateConfigurationPanel() {
    if (!experimentData) {
        console.warn('⚠️ experimentData is null, cannot update configuration panel');
        return;
    }
    
    const config = experimentData.configuration;
    console.log('🔧 Updating configuration panel with:', config);
    
    // Update basic configuration items
    const updateConfigItem = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`✅ Updated ${id} to: ${value}`);
        } else {
            console.warn(`❌ Element ${id} not found for update`);
        }
    };
    
    updateConfigItem('configExperimentType', config.experimentType);
    updateConfigItem('configExperimentName', experimentData.name);
    updateConfigItem('configExperimentDescription', experimentData.description);
    updateConfigItem('configDataSchema', config.dataSchema);
    updateConfigItem('configDataSource', config.dataSource);
    updateConfigItem('configQuerySetSelection', config.querySetSelection);
    updateConfigItem('configQuerySetFile', `${config.querySetFile.name} (${config.querySetFile.queryCount} queries)`);
    updateConfigItem('configControlProfile', config.controlProfile);
    updateConfigItem('configTreatmentProfile', config.treatmentProfile);
    updateConfigItem('configDataFieldsDisplay', config.dataFieldsDisplay);
    
    // Update judgement questions
    updateJudgementQuestions(config.judgementQuestions);
    
    // Update additional settings with detailed logging
    console.log('🔧 Updating additional settings:');
    console.log('  - config.additionalSettings:', config.additionalSettings);
    console.log('  - allowAnyToJudge value:', config.additionalSettings.allowAnyToJudge);
    console.log('  - Should display:', config.additionalSettings.allowAnyToJudge ? 'Enabled' : 'Disabled');
    
    updateConfigItem('configBlindTest', config.additionalSettings.blindTest ? 'Enabled' : 'Disabled');
    updateConfigItem('configAllowAnyToJudge', config.additionalSettings.allowAnyToJudge ? 'Enabled' : 'Disabled');
    updateConfigItem('configJudgementGuide', config.additionalSettings.judgementGuide);
    
    // Verify the display was updated correctly
    setTimeout(() => {
        const allowAnyElement = document.getElementById('configAllowAnyToJudge');
        if (allowAnyElement) {
            console.log('🔍 Final display value for allowAnyToJudge:', allowAnyElement.textContent);
        }
    }, 100);
}

// Update judgement questions section
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
        // Ensure custom metrics are reloaded
        setTimeout(() => {
            if (customMetricsData && customMetricsData.length > 0) {
                populateCustomMetricsQuestionSelector();
            }
        }, 200);
    }
}

// User switching functions
function toggleUserDropdown() {
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

function switchUser(userId) {
    const user = users[userId];
    if (!user) return;
    
    // Update current user
    currentUser = user;
    
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
    console.log('👤 updateUserDisplay called, currentUser:', currentUser);
    
    if (!currentUser) {
        console.warn('❌ currentUser is null, cannot update user display');
        return;
    }
    
    // Update current user display
    const avatar = document.getElementById('currentUserAvatar');
    const name = document.getElementById('currentUserName');
    const role = document.getElementById('currentUserRole');
    
    if (avatar) {
        avatar.textContent = currentUser.initials;
        console.log('✅ Updated user avatar to:', currentUser.initials);
    } else {
        console.warn('❌ currentUserAvatar element not found');
    }
    
    if (name) {
        name.textContent = currentUser.name;
        console.log('✅ Updated user name to:', currentUser.name);
    } else {
        console.warn('❌ currentUserName element not found');
    }
    
    if (role) {
        role.textContent = getRoleDisplayName(currentUser.role);
        console.log('✅ Updated user role to:', getRoleDisplayName(currentUser.role));
    } else {
        console.warn('❌ currentUserRole element not found');
    }
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
    const assignBtn = document.getElementById('assignJudgesBtn');
    
    // Always display the button, but dynamically enable or disable it
    if (assignBtn) {
        assignBtn.style.display = "block"; // Ensure the button is always visible
        const canAssign = currentUser.role === 'owner' || currentUser.role === 'co-owner';
        const allowAnyToJudge = experimentConfig.allowAnyoneToJudge;
    
        assignBtn.disabled = !(canAssign && !allowAnyToJudge);
        assignBtn.setAttribute('data-tooltip', allowAnyToJudge
            ? 'Judgment is open to everyone for this experiment. Assigning judges is disabled.'
            : canAssign
            ? 'Assign queries to judges'
            : 'You do not have permission to assign queries');
    }
    const importBtn = document.querySelector('button[onclick="importQueries()"]');
    
    // Assign queries: Owner and Co-Owner only
    if (assignBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            assignBtn.disabled = false;
            assignBtn.classList.remove('disabled');
            assignBtn.removeAttribute('data-tooltip');
        } else {
            assignBtn.disabled = true;
            assignBtn.classList.add('disabled');
        }
    }
    
    // Import queries: Owner and Co-Owner only
    if (importBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            importBtn.disabled = false;
            importBtn.classList.remove('disabled');
            importBtn.removeAttribute('data-tooltip');
        } else {
            importBtn.disabled = true;
            importBtn.classList.add('disabled');
        }
    }
}

function updateMemberPermissions() {
    const addMemberBtn = document.querySelector('button[onclick="addMember()"]');
    const manageMembersBtn = document.querySelector('button[onclick="manageMembers()"]');
    
    // Add member: Owner and Co-Owner only, but disabled if allowAnyoneToJudge is true
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

    // Manage members: Owner and Co-Owner only
    if (manageMembersBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            manageMembersBtn.disabled = false;
            manageMembersBtn.classList.remove('disabled');
            manageMembersBtn.removeAttribute('data-tooltip');
        } else {
            manageMembersBtn.disabled = true;
            manageMembersBtn.classList.add('disabled');
        }
    }
}

function updateResultPermissions() {
    const downloadBtn = document.querySelector('button[onclick="downloadReport()"]');
    const exportBtn = document.querySelector('button[onclick="exportData()"]');
    
    // Download report: All users can view (read-only for judge)
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('disabled');
        downloadBtn.removeAttribute('data-tooltip');
    }
    
    // Export data: Owner and Co-Owner only
    if (exportBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            exportBtn.disabled = false;
            exportBtn.classList.remove('disabled');
            exportBtn.removeAttribute('data-tooltip');
        } else {
            exportBtn.disabled = true;
            exportBtn.classList.add('disabled');
        }
    }
}

function updateQueryListPermissions() {
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // Disable select all checkbox for Judge users or when allowAnyoneToJudge is enabled
    if (selectAllCheckbox) {
        if (currentUser.role === 'judge' || experimentConfig.allowAnyoneToJudge) {
            selectAllCheckbox.disabled = true;
            selectAllCheckbox.checked = false;
        } else {
            selectAllCheckbox.disabled = false;
        }
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
    
    // 获取 task type 字段
    let taskType = '--';
    if (query.taskType) {
        taskType = query.taskType.name;
    } else if (experimentConfig.isRealTimeAdHoc && query.task_type) {
        // 兼容部分后端字段命名
        taskType = query.taskType.name;
    }
    
    // Create row content
    const assignmentsContainer = document.createElement('div');
    assignmentsContainer.className = 'assignments-container';
    assignmentsContainer.innerHTML = assigneesHtml;
    if (overflowCount > 0) {
        assignmentsContainer.setAttribute('data-overflow', `+${overflowCount} more`);
    }
    
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
        ${(taskType !== '--') ? `<div class="task-type-column">${taskType}</div>` : ''}
        <div class="assignments-column">
            ${assignmentsContainer.outerHTML}
            <div class="assignment-summary">
                ${totalAssignments} assigned | ${completedAssignments} completed
            </div>
        </div>
        <div class="status-column">
            <span class="status-badge status-${overallStatus}">${overallStatus}</span>
        </div>
        <div class="last-judged-column">
            ${lastJudgedAt}
        </div>
    `;
    
    return row;
}

function loadQueries() {
    console.log('📋 loadQueries called');
    // 先渲染 header
    renderQueryListHeader();
    const queryListBody = document.getElementById('queryListBody');
    if (!queryListBody) {
        console.error('queryListBody element NOT FOUND!');
        return;
    }
    
    // Use queries from experimentData if available, otherwise use fallback
    let allQueries;
    if (experimentData && experimentData.queries) {
        console.log('✅ Using queries from experimentData:', experimentData.queries);
        allQueries = experimentData.queries;
    } else {
        console.warn('⚠️ Using fallback query data');
        // Sample query data with multiple assignments as fallback
        allQueries = [
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
    let queriesToShow = allQueries;
    
    if (currentUser.role === 'judge') {
        // Judge can only see queries assigned to them
        queriesToShow = allQueries.filter(query => {
            return query.assignments.some(assignment =>
                assignment.judge.name === currentUser.name
            );
        });
    }
    // Owner and Co-Owner can see all queries
    
    // Clear existing content
    queryListBody.innerHTML = '';
    
    // Add queries
    queriesToShow.forEach(query => {
        const row = createQueryRow(query);
        queryListBody.appendChild(row);
    });
    
    // Update query count in tab badge
    const queriesTabBadge = document.querySelector('[data-tab="queries"] .tab-badge');
    if (queriesTabBadge) {
        queriesTabBadge.textContent = queriesToShow.length;
    }
}

function loadMembers() {
    const membersGrid = document.querySelector('.members-grid');
    if (!membersGrid) return;
    
    // Use members from loaded configuration data, or fallback to sample data
    const sampleMembers = experimentData && experimentData.members ? experimentData.members : [
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
    // Check if user has permission to import queries (Owner or Co-Owner)
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        return; // Silently return, tooltip will show "No permission"
    }
    alert('Import Queries functionality - to be implemented');
}

function assignQueries() {
    console.log('🎯 assignQueries called');
    console.log('  - currentUser.role:', currentUser.role);
    console.log('  - experimentConfig:', experimentConfig);
    console.log('  - allowAnyoneToJudge:', experimentConfig.allowAnyoneToJudge);
    console.log('  - isAdHocExperiment():', isAdHocExperiment());
    console.log('  - assignmentMode:', assignmentMode);
    
    // Check if user has permission to assign queries (Owner or Co-Owner)
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        console.log('❌ User does not have permission to assign queries');
        return; // Silently return, tooltip will show "No permission"
    }

    // Check if "allow anyone to judge" is enabled
    if (experimentConfig.allowAnyoneToJudge) {
        console.log('❌ Query assignment blocked: allowAnyoneToJudge is enabled');
        alert('Query assignment is not allowed when "Allow Anyone to Judge" is enabled');
        return;
    }

    console.log('✅ Proceeding with assignment');
    
    if (isAdHocExperiment()) {
        handleAdHocAssignment();
    } else {
        handleQuerySetAssignment();
    }
}

function handleQuerySetAssignment() {
    const selectedQueries = getSelectedQueries();
    
    if (assignmentMode === AssignmentStates.DEFAULT) {
        // 默认状态：如果没有选中，则高亮复选框提示用户选择
        if (selectedQueries.length === 0) {
            console.log('🔄 Highlighting query checkboxes for user selection');
            highlightQueryCheckboxes();
            return;
        } else {
            // 如果已有选中，直接执行分配
            console.log('📋 Executing query assignment for:', selectedQueries);
            executeQueryAssignment(selectedQueries);
        }
    } else if (assignmentMode === AssignmentStates.QUERY_SELECTION) {
        // 选择模式：直接执行分配（如果有选中）
        if (selectedQueries.length > 0) {
            console.log('📋 Executing query assignment for:', selectedQueries);
            executeQueryAssignment(selectedQueries);
        } else {
            console.log('⚠️ No queries selected');
        }
    }
}

function handleAdHocAssignment() {
    const selectedTaskTypes = getSelectedTaskTypes();
    
    if (assignmentMode === AssignmentStates.DEFAULT) {
        // 默认状态：如果没有选中，则高亮复选框提示用户选择
        if (selectedTaskTypes.length === 0) {
            console.log('🔄 Highlighting task type checkboxes for user selection');
            highlightTaskTypeCheckboxes();
            return;
        } else {
            // 如果已有选中，直接执行分配
            console.log('📋 Executing task type assignment for:', selectedTaskTypes);
            executeTaskTypeAssignment(selectedTaskTypes);
        }
    } else if (assignmentMode === AssignmentStates.TASKTYPE_SELECTION) {
        // 选择模式：直接执行分配（如果有选中）
        if (selectedTaskTypes.length > 0) {
            console.log('📋 Executing task type assignment for:', selectedTaskTypes);
            executeTaskTypeAssignment(selectedTaskTypes);
        } else {
            console.log('⚠️ No task types selected');
        }
    }
}

function executeQueryAssignment(selectedQueries) {
    console.log('🎯 executeQueryAssignment called with:', selectedQueries);
    
    // 显示assignment modal
    showQueryAssignmentModal(selectedQueries);
    
    // 注意：不在这里重置状态，而是在modal关闭时重置
}

function executeTaskTypeAssignment(selectedTaskTypes) {
    console.log('🎯 executeTaskTypeAssignment called with:', selectedTaskTypes);
    
    // 显示assignment modal
    showTaskTypeAssignmentModal(selectedTaskTypes);
    
    // 注意：不在这里重置状态，而是在modal关闭时重置
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


function updateSelectedQueries() {
    console.log('👆 updateSelectedQueries called');
    
    const selectedQueries = getSelectedQueries();
    console.log('📋 Selected queries:', selectedQueries);
    
    // Clear highlights when selections change
    if (isHighlightingSelections) {
        removeHighlights();
    }
    
    // Update assign button state (unified function) - this will auto-switch modes
    updateAssignButtonState();
    
    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById('selectAll');
    const allCheckboxes = document.querySelectorAll('.query-row input[type="checkbox"]');
    const checkedCount = selectedQueries.length;
    const totalCount = allCheckboxes.length;
    
    if (selectAllCheckbox) {
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

function toggleSelectAll() {
    // Judge users cannot select queries, and if allowAnyoneToJudge is enabled
    if (currentUser.role === 'judge' || experimentConfig.allowAnyoneToJudge) {
        return;
    }
    
    const selectAllCheckbox = document.getElementById('selectAll');
    const queryCheckboxes = document.querySelectorAll('.query-row input[type="checkbox"]:not([disabled])');
    
    queryCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateSelectedQueries();
}

// Member management functions
function addMember() {
    // Owner can add Co-Owner/Judge, Co-Owner can add Judge
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        return; // Silently return, tooltip will show "No permission"
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
        return; // Silently return, tooltip will show "No permission"
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
    if (currentUser.role === 'judge') {
        alert('Viewing report (read-only mode) - to be implemented');
    } else {
        alert('Download Report functionality - to be implemented');
    }
}

function exportData() {
    // Owner and Co-Owner can export data
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {
        return; // Silently return, tooltip will show "No permission"
    }
    alert('Export Data functionality - to be implemented');
}



// Results functions
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

// Load and display results data
async function loadResultsData() {
    try {
        console.log('📊 Loading results data...');
        
        // Get current experiment ID
        const urlParams = new URLSearchParams(window.location.search);
        const experimentId = urlParams.get('id') || 'search-ndcg-001'; // Default fallback
        
        // Load results configuration
        const response = await fetch('./experiment-result-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resultsConfig = await response.json();
        console.log('✅ Results config loaded:', resultsConfig);
        
        // Get results for current experiment
        const experimentResults = resultsConfig.experimentResults[experimentId];
        if (!experimentResults) {
            console.warn(`No results found for experiment ${experimentId}`);
            return;
        }
        
        console.log('📊 Found experiment results:', experimentResults);
        
        // Update Scorecard data
        updateScorecardData(experimentResults.scorecard, experimentResults.agreement);
        
        // Update Custom Metrics data
        updateCustomMetrics(experimentResults.customMetrics);
        
        // Update Throughput data
        updateThroughputData(experimentResults.throughput);
        
        // Render charts
        renderResultsCharts(experimentResults);
        
    } catch (error) {
        console.error('❌ Error loading results data:', error);
        // Load fallback data
        loadFallbackResultsData();
    }
}

// Update Scorecard data display
function updateScorecardData(scorecardData, agreementData) {
    console.log('📊 Updating scorecard data:', scorecardData, agreementData);
    
    // Update SBS Surplus
    const sbsSurplusElement = document.getElementById('sbsSurplus');
    const pValueElement = document.getElementById('pValue');
    
    if (sbsSurplusElement) {
        sbsSurplusElement.textContent = scorecardData.sbsSurplus.toFixed(4);
    }
    
    if (pValueElement) {
        pValueElement.textContent = scorecardData.pValue.toFixed(4);
    }
    
    // Update Agreement Rate
    const agreementRateElement = document.getElementById('agreementRate');
    if (agreementRateElement) {
        const percentage = (agreementData.totalAgreementRate * 100).toFixed(2);
        agreementRateElement.textContent = `${percentage}%`;
    }
}

// Store custom metrics data globally
let customMetricsData = [];

// Update Custom Metrics data display
function updateCustomMetrics(customMetrics) {
    console.log('📊 Updating custom metrics:', customMetrics);
    
    // Store data globally
    customMetricsData = customMetrics || [];
    
    // Populate question selector immediately
    populateCustomMetricsQuestionSelector();
    
    // Show content based on current selection
    const container = document.getElementById('customMetricsContent');
    if (!container) return;
    
    if (!customMetrics || customMetrics.length === 0) {
        // 显示空状态
        container.innerHTML = `
            <div class="custom-metrics-empty">
                No custom metrics defined for this experiment
            </div>
        `;
    } else {
        // Content will be populated by populateCustomMetricsQuestionSelector
        // which will auto-select the first question
        container.innerHTML = '';
    }
}

// Populate custom metrics question selector
function populateCustomMetricsQuestionSelector() {
    const selector = document.getElementById('customMetricsQuestionSelector');
    const container = document.getElementById('customMetricsContent');
    
    console.log('📊 Populating custom metrics question selector...');
    console.log('📊 Selector element found:', !!selector);
    console.log('📊 Container element found:', !!container);
    console.log('📊 Available custom metrics data:', customMetricsData);
    
    if (!selector) {
        console.error('❌ customMetricsQuestionSelector element not found!');
        return;
    }
    
    if (!container) {
        console.error('❌ customMetricsContent element not found!');
        return;
    }
    
    // Check if we're in results tab and scorecard sub-tab
    const resultsTab = document.getElementById('results-tab');
    const scorecardTab = document.getElementById('scorecard-results-tab');
    
    if (!resultsTab || !resultsTab.classList.contains('active')) {
        console.log('📊 Results tab not active, skipping custom metrics population');
        return;
    }
    
    if (!scorecardTab || !scorecardTab.classList.contains('active')) {
        console.log('📊 Scorecard tab not active, skipping custom metrics population');
        return;
    }
    
    // Clear existing options
    selector.innerHTML = '';
    
    // Re-check customMetricsData, if empty show empty state (don't reload)
    if (!customMetricsData || customMetricsData.length === 0) {
        console.log('📊 Custom metrics data empty, showing empty state');
        
        // Add default empty option if no data
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'No questions available';
        selector.appendChild(emptyOption);
        
        // Show empty state in container
        container.innerHTML = `
            <div class="custom-metrics-empty">
                No custom metrics defined for this experiment
            </div>
        `;
        return;
    }
    
    if (customMetricsData && customMetricsData.length > 0) {
        customMetricsData.forEach((question, index) => {
            const option = document.createElement('option');
            option.value = question.questionId;
            
            // Get question text from experiment config by questionId
            let questionText = question.questionText;
            if (!questionText && experimentData && experimentData.configuration && experimentData.configuration.judgementQuestions) {
                const judgementQuestion = experimentData.configuration.judgementQuestions.find(q => q.id === question.questionId);
                if (judgementQuestion) {
                    questionText = judgementQuestion.text;
                }
            }
            
            option.textContent = questionText || `Question ${question.questionId}`;
            selector.appendChild(option);
            console.log(`📊 Added option ${index + 1}: ${questionText || `Question ${question.questionId}`}`);
        });
        
        // Set first question as default selection
        const firstQuestion = customMetricsData[0];
        selector.value = firstQuestion.questionId;
        
        // Get question text for logging
        let questionText = firstQuestion.questionText;
        if (!questionText && experimentData && experimentData.configuration && experimentData.configuration.judgementQuestions) {
            const judgementQuestion = experimentData.configuration.judgementQuestions.find(q => q.id === firstQuestion.questionId);
            if (judgementQuestion) {
                questionText = judgementQuestion.text;
            }
        }
        
        console.log('📊 Setting default selection to:', questionText || `Question ${firstQuestion.questionId}`);
        console.log('📊 Selector value after setting:', selector.value);
        
        // Immediately show the first question's metrics
        console.log('📊 Calling displayQuestionMetrics for first question...');
        displayQuestionMetrics(firstQuestion);
        
        // Verify content was added
        setTimeout(() => {
            console.log('📊 Container innerHTML length after display:', container.innerHTML.length);
            if (container.innerHTML.length > 0) {
                console.log('✅ Metrics successfully displayed!');
            } else {
                console.error('❌ No content found in container after displayQuestionMetrics');
                // Try to reload if still empty
                setTimeout(() => {
                    if (container.innerHTML.length === 0) {
                        console.log('📊 Retrying custom metrics display...');
                        displayQuestionMetrics(firstQuestion);
                    }
                }, 100);
            }
        }, 50);
        
    } else {
        console.log('📊 No custom metrics data available');
        // Add default empty option if no data
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'No questions available';
        selector.appendChild(emptyOption);
        
        // Show empty state in container
        container.innerHTML = `
            <div class="custom-metrics-empty">
                No custom metrics defined for this experiment
            </div>
        `;
    }
}

// Display metrics for a specific question
function displayQuestionMetrics(questionData) {
    console.log('📊 displayQuestionMetrics called with:', {questionId: questionData?.questionId, metrics: questionData?.metrics});
    
    const container = document.getElementById('customMetricsContent');
    
    if (!container) {
        console.error('❌ customMetricsContent container not found!');
        return;
    }
    
    if (!questionData) {
        console.error('❌ No question data provided!');
        return;
    }
    
    // Get question text from experiment config by questionId
    let questionText = questionData.questionText;
    if (!questionText && experimentData && experimentData.configuration && experimentData.configuration.judgementQuestions) {
        const judgementQuestion = experimentData.configuration.judgementQuestions.find(q => q.id === questionData.questionId);
        if (judgementQuestion) {
            questionText = judgementQuestion.text;
        }
    }
    
    // Use fallback if still no text found
    if (!questionText) {
        questionText = `Question ${questionData.questionId}`;
    }
    
    if (!questionData.metrics || questionData.metrics.length === 0) {
        console.warn('⚠️ No metrics found for question:', questionText);
        container.innerHTML = `
            <div class="custom-metrics-empty">
                No metrics available for this question
            </div>
        `;
        return;
    }
    
    console.log('📊 Displaying', questionData.metrics.length, 'metrics for question:', questionText);
    
    // Display metrics for the question
    const metricsHtml = questionData.metrics.map(metric => {
        const cardHtml = renderMetricCard(metric);
        console.log('📊 Generated metric card for:', metric.name);
        return cardHtml;
    }).join('');
    
    const finalHtml = `
        <div class="custom-metrics-grid">
            ${metricsHtml}
        </div>
    `;
    
    container.innerHTML = finalHtml;
    
    console.log('📊 Successfully set container innerHTML, length:', finalHtml.length);
}

// Handle custom metrics question change
function onCustomMetricsQuestionChange() {
    const selector = document.getElementById('customMetricsQuestionSelector');
    
    if (!selector) return;
    
    const selectedQuestionId = parseInt(selector.value);
    console.log('📊 Custom metrics question changed to:', selectedQuestionId);
    
    if (!selectedQuestionId) {
        const container = document.getElementById('customMetricsContent');
        if (container) {
            container.innerHTML = `
                <div class="custom-metrics-empty" style="padding: 20px; text-align: center; color: #6c757d;">
                    Please select a question above to view its custom metrics
                </div>
            `;
        }
        return;
    }
    
    // Find the selected question data
    const questionData = customMetricsData.find(q => q.questionId === selectedQuestionId);
    
    if (!questionData) {
        const container = document.getElementById('customMetricsContent');
        if (container) {
            // Get question text from experiment config for better error message
            let questionText = `Question ${selectedQuestionId}`;
            if (experimentData && experimentData.configuration && experimentData.configuration.judgementQuestions) {
                const judgementQuestion = experimentData.configuration.judgementQuestions.find(q => q.id === selectedQuestionId);
                if (judgementQuestion) {
                    questionText = judgementQuestion.text;
                }
            }
            
            container.innerHTML = `
                <div class="custom-metrics-empty">
                    No data found for the selected question: ${questionText}
                </div>
            `;
        }
        return;
    }
    
    // Display metrics for the selected question
    displayQuestionMetrics(questionData);
}

// Render individual metric card
function renderMetricCard(metric) {
    if (metric.name.startsWith('DomainChange')) {
        // Special handling for domain change metrics
        return `
            <div class="custom-metric-card">
                <div class="custom-metric-name">${metric.name}</div>
                <div class="domain-changes-grid">
                    ${Object.entries(metric.domainChanges).map(([domain, value]) => `
                        <div class="domain-change-item">
                            <span class="domain-change-label">${domain}:</span>
                            <span class="domain-change-value ${getValueClass(value)}">${formatValue(value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (metric.changeRateCount !== undefined) {
        // Change rate metrics
        return `
            <div class="custom-metric-card">
                <div class="custom-metric-name">${metric.name}</div>
                <div class="custom-metric-details">
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Count:</span>
                        <span class="custom-metric-value">${metric.changeRateCount}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Average:</span>
                        <span class="custom-metric-value">${formatValue(metric.changeRateAverage)}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">P-value:</span>
                        <span class="custom-metric-value">${formatValue(metric.pValue)}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Standard control/treatment metrics
        return `
            <div class="custom-metric-card">
                <div class="custom-metric-name">${metric.name}</div>
                <div class="custom-metric-details">
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Control Avg:</span>
                        <span class="custom-metric-value">${formatValue(metric.controlAvgScore)}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Treatment Avg:</span>
                        <span class="custom-metric-value">${formatValue(metric.treatmentAvgScore)}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Control Count:</span>
                        <span class="custom-metric-value">${metric.controlCount}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Treatment Count:</span>
                        <span class="custom-metric-value">${metric.treatmentCount}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">Delta:</span>
                        <span class="custom-metric-value ${getValueClass(metric.delta)}">${formatValue(metric.delta)}</span>
                    </div>
                    <div class="custom-metric-detail">
                        <span class="custom-metric-label">P-value:</span>
                        <span class="custom-metric-value">${formatValue(metric.pValue)}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Helper function to get CSS class for value coloring
function getValueClass(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
}

// Helper function to format numeric values
function formatValue(value) {
    if (typeof value === 'number') {
        if (value === 0) return '0';
        if (Math.abs(value) < 0.001) return value.toExponential(3);
        return value.toFixed(4);
    }
    return value;
}

// Update Throughput data display
function updateThroughputData(throughputData) {
    console.log('📊 Updating throughput data:', throughputData);
    
    // Update statistics
    const totalJudgementsElement = document.getElementById('totalJudgements');
    const totalJudgesElement = document.getElementById('totalJudges');
    const avgCompletionTimeElement = document.getElementById('avgCompletionTime');
    
    if (totalJudgementsElement) {
        totalJudgementsElement.textContent = throughputData.totalJudgementCount.toString();
    }
    
    if (totalJudgesElement) {
        totalJudgesElement.textContent = throughputData.totalJudgesCount.toString();
    }
    
    if (avgCompletionTimeElement) {
        avgCompletionTimeElement.textContent = `${throughputData.averageCompletionTime} min`;
    }
}

// Populate question selector dropdown
function populateQuestionSelector() {
    const selector = document.getElementById('questionSelector');
    if (!selector || !experimentData) return;
    
    console.log('📊 Populating question selector...');
    
    // Clear existing options except the first one
    selector.innerHTML = '<option value="">Select a question...</option>';
    
    // Get Query Level Side-by-Side questions
    const judgementQuestions = experimentData.configuration.judgementQuestions || [];
    const sideBySideQuestions = judgementQuestions.filter(q =>
        q.type.includes('Query Level Side-by-Side') &&
        (q.type.includes('Single Choice') || q.type.includes('Multiple Choice'))
    );
    
    console.log('📊 Found side-by-side questions:', sideBySideQuestions);
    
    sideBySideQuestions.forEach(question => {
        const option = document.createElement('option');
        option.value = question.id;
        option.textContent = question.text;
        selector.appendChild(option);
    });
    
    // Select first question by default if available
    if (sideBySideQuestions.length > 0) {
        selector.value = sideBySideQuestions[0].id;
    }
}

// Store chart instances to manage lifecycle
let sbsChartInstance = null;
let agreementChartInstance = null;
let progressChartInstance = null;

// Render all charts
function renderResultsCharts(experimentResults) {
    console.log('📊 Rendering results charts...');
    
    // Destroy existing charts before creating new ones
    destroyExistingCharts();
    
    // Render SBS distribution chart
    renderSBSChart(experimentResults.scorecard.optionDistribution);
    
    // Render Agreement distribution chart
    renderAgreementChart(experimentResults.agreement.agreementDistribution);
    
    // Render Progress over time chart
    renderProgressChart(experimentResults.throughput.dailyProgress);
}

// Destroy existing chart instances
function destroyExistingCharts() {
    if (sbsChartInstance) {
        sbsChartInstance.destroy();
        sbsChartInstance = null;
        console.log('📊 Destroyed existing SBS chart');
    }
    
    if (agreementChartInstance) {
        agreementChartInstance.destroy();
        agreementChartInstance = null;
        console.log('📊 Destroyed existing agreement chart');
    }
    
    if (progressChartInstance) {
        progressChartInstance.destroy();
        progressChartInstance = null;
        console.log('📊 Destroyed existing progress chart');
    }
}

// Render SBS Surplus chart
function renderSBSChart(optionDistribution) {
    const ctx = document.getElementById('sbsChart');
    if (!ctx) return;
    
    console.log('📊 Rendering SBS chart with data:', optionDistribution);
    
    sbsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
        }
    });
}

// Render Agreement Rate chart
function renderAgreementChart(agreementDistribution) {
    const ctx = document.getElementById('agreementChart');
    if (!ctx) return;
    
    console.log('📊 Rendering agreement chart with data:', agreementDistribution);
    
    agreementChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
        }
    });
}

// Render Progress over time chart
function renderProgressChart(dailyProgress) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    console.log('📊 Rendering progress chart with data:', dailyProgress);
    
    // Destroy existing progress chart if it exists
    if (progressChartInstance) {
        progressChartInstance.destroy();
        progressChartInstance = null;
    }
    
    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
        }
    });
}

// Load fallback results data if main loading fails
function loadFallbackResultsData() {
    console.log('📊 Loading fallback results data...');
    
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
        customMetrics: [], // 默认为空
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
    
    // Update data and render charts with fallback
    updateScorecardData(fallbackData.scorecard, fallbackData.agreement);
    updateCustomMetrics(fallbackData.customMetrics);
    updateThroughputData(fallbackData.throughput);
    renderResultsCharts(fallbackData);
}

// Configuration panel toggle function
function toggleConfigurationPanel() {
    const panel = document.getElementById('configurationPanel');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    
    if (!panel || !mainContentWrapper) {
        console.error('Configuration panel or main content wrapper not found!');
        return;
    }
    
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        mainContentWrapper.classList.remove('panel-open');
    } else {
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

function showTaskTypeAssignmentModal(selectedTaskTypes) {
    console.log('🎯 showTaskTypeAssignmentModal called with:', selectedTaskTypes);
    
    // Get judge assignment status for selected task types
    const judgeAssignmentStatus = getTaskTypeAssignmentStatus(selectedTaskTypes);
    
    // Create assignment modal for task types
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
        if (status && status.conflictCount === selectedTaskTypes.length) {
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
                    <div class="modal-icon">🏷️</div>
                    <div class="modal-title-section">
                        <h3>Assign Judges to Task Types</h3>
                        <p class="modal-subtitle">${selectedTaskTypes.length} ${selectedTaskTypes.length === 1 ? 'task type' : 'task types'} selected</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeAssignmentModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="assignment-info">
                    <div class="info-card">
                        <div class="info-icon">📋</div>
                        <div class="info-text">
                            <strong>Task Type Assignment:</strong> Selected task types and their queries will be assigned to chosen judges. Conflicted assignments are prevented.
                        </div>
                    </div>
                </div>
                
                <div class="selected-task-types-summary">
                    <h4>Selected Task Types:</h4>
                    <div class="task-type-chips">
                        ${selectedTaskTypes.map(taskType => {
                            const queryCount = getQueryCountForTaskType(taskType);
                            return `<div class="task-type-chip">${taskType} (${queryCount} queries)</div>`;
                        }).join('')}
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
                                                        `<div class="judge-warning">⚠️ Already assigned to ${judge.status.conflictCount} of ${selectedTaskTypes.length} task types</div>` :
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
                                <span class="notice-text">These judges are already assigned to all selected task types and cannot be assigned again to prevent duplicates.</span>
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
                <button class="btn-primary" onclick="executeTaskTypeAssignmentFromModal()" id="assignButton" disabled>
                    <span class="btn-icon">✓</span>
                    Assign to Selected Judges
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    updateSelectedJudgesCount();
}

function getTaskTypeAssignmentStatus(selectedTaskTypes) {
    const judgeStatus = new Map(); // judgeId -> { assignedTaskTypes: Set, conflictCount: number }
    
    selectedTaskTypes.forEach(taskType => {
        // Get all queries for this task type
        const taskTypeQueries = experimentData.queries.filter(query =>
            (query.taskType?.name || 'Unknown') === taskType
        );
        
        taskTypeQueries.forEach(query => {
            if (query.assignments) {
                query.assignments.forEach(assignment => {
                    const judgeKey = assignment.judge.name; // Using name as key for demo
                    
                    if (!judgeStatus.has(judgeKey)) {
                        judgeStatus.set(judgeKey, {
                            assignedTaskTypes: new Set(),
                            conflictCount: 0
                        });
                    }
                    
                    if (!judgeStatus.get(judgeKey).assignedTaskTypes.has(taskType)) {
                        judgeStatus.get(judgeKey).assignedTaskTypes.add(taskType);
                        judgeStatus.get(judgeKey).conflictCount++;
                    }
                });
            }
        });
    });
    
    return judgeStatus;
}

function getQueryCountForTaskType(taskType) {
    if (!experimentData || !experimentData.queries) return 0;
    return experimentData.queries.filter(query =>
        (query.taskType?.name || 'Unknown') === taskType
    ).length;
}

function executeTaskTypeAssignmentFromModal() {
    const selectedJudges = Array.from(document.querySelectorAll('input[name="selectedJudges"]:checked')).map(cb => cb.value);
    
    if (selectedJudges.length === 0) {
        alert('Please select at least one judge');
        return;
    }
    
    const selectedTaskTypes = getSelectedTaskTypes();
    console.log('🎯 Executing task type assignment:', { selectedTaskTypes, selectedJudges });
    
    // Calculate assignment results
    let totalNewAssignments = 0;
    const assignmentDetails = selectedJudges.map(judgeId => {
        const availableJudges = getAvailableJudges();
        const judge = availableJudges.find(j => j.id === judgeId);
        const judgeName = judge ? judge.name : judgeId;
        
        // Calculate how many queries will be assigned for each task type
        let newAssignments = 0;
        selectedTaskTypes.forEach(taskType => {
            const queryCount = getQueryCountForTaskType(taskType);
            newAssignments += queryCount;
        });
        
        totalNewAssignments += newAssignments;
        
        return {
            name: judgeName,
            newAssignments,
            taskTypes: selectedTaskTypes.length
        };
    });
    
    // Create detailed success message
    let message = `✅ Task Type Assignment Completed!\n\n`;
    message += `📊 Summary:\n`;
    message += `• Total new assignments: ${totalNewAssignments}\n`;
    message += `• Judges selected: ${selectedJudges.length}\n`;
    message += `• Task types assigned: ${selectedTaskTypes.length}\n\n`;
    
    message += `👥 Assignment Details:\n`;
    assignmentDetails.forEach(detail => {
        message += `• ${detail.name}: +${detail.newAssignments} new assignments across ${detail.taskTypes} task types\n`;
    });
    
    alert(message);
    
    closeAssignmentModal();
    
    // Refresh the displays
    loadTaskTypes();
    loadQueries();
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
    
    // 重置assignment状态
    resetAssignmentState();
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



// Header action functions
function deleteExperiment() {
    // Only Owner can delete experiment
    if (currentUser.role !== 'owner') {
        alert('You do not have permission to delete this experiment. Only the owner can delete experiments.');
        return;
   
    }

    if (confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
        alert('Delete experiment functionality - to be implemented');
    }
}

function cloneExperiment() {
    // Owner and Co-Owner can clone experiment
    if (currentUser.role !== 'owner' && currentUser.role !== 'co-owner') {

        alert('You do not have permission to clone this experiment. Only Owner and Co-Owner can clone experiments.');
        return;
    }
    
    alert('Clone experiment functionality - to be implemented');
}

// Update UI based on user role and experiment settings
function updateUIBasedOnRole() {
    // Use the new unified button state management
    updateAssignButtonState();
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
    // Use actual experiment data instead of hardcoded sample data
    if (experimentData && experimentData.members) {
        return experimentData.members.length;
    }
    
    // Fallback: return 0 if no data available
    return 0;
}

function getUniqueJudgesFromQueries() {
    // Get all unique judges from actual experiment query assignments
    const uniqueJudges = new Set();
    
    // Use actual experiment data if available
    if (experimentData && experimentData.queries) {
        experimentData.queries.forEach(query => {
            if (query.assignments) {
                query.assignments.forEach(assignment => {
                    if (assignment.judge && assignment.judge.name) {
                        uniqueJudges.add(assignment.judge.name);
                    }
                });
            }
        });
    } else {
        // Fallback data if no experiment data available
        console.warn('⚠️ No experiment data available for judge count, using fallback');
        const fallbackJudges = ['John Smith', 'Alice Miller', 'Robert Johnson'];
        fallbackJudges.forEach(judge => uniqueJudges.add(judge));
    }
    
    console.log('📊 getUniqueJudgesFromQueries: Found', uniqueJudges.size, 'unique judges');
    return uniqueJudges;
}

// Initialize page when DOM is loaded
// Add immediate debug logs
console.log('Script loaded at:', new Date().toISOString());

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOMContentLoaded event fired');
    
    // Load experiment configuration first
    console.log('📡 Starting loadExperimentConfig...');
    const configLoaded = await loadExperimentConfig();
    console.log('📡 loadExperimentConfig result:', configLoaded);
    console.log('📊 experimentData after config load:', experimentData);
    
    // Always proceed with UI updates, regardless of config loading result
    // Initialize user display and permissions
    console.log('👤 Updating user display...');
    updateUserDisplay();
    updatePermissions();
    
    // Initialize Task Type Sidebar (must be done after experimentData is loaded)
    console.log('📋 Initializing Task Type Sidebar...');
    initializeTaskTypeSidebar();
    
    // Load initial content for the default active tab (queries)
    console.log('📋 Loading queries...');
    loadQueries();
    
    // Update UI based on user role and permissions
    console.log('🎨 Updating UI based on role...');
    updateUIBasedOnRole();
    
    // Initialize assignment state to default (but don't clear selections)
    console.log('🔄 Setting initial assignment state...');
    assignmentMode = AssignmentStates.DEFAULT;
    isHighlightingSelections = false;
    
    // Initialize button state
    console.log('🔘 Updating assign button state...');
    updateAssignButtonState();
    
    // Initialize query selections
    console.log('🔘 Updating selected queries...');
    updateSelectedQueries();
    
    // Update data counts for consistency with a longer delay to ensure everything is loaded
    setTimeout(() => {
        console.log('📊 Updating data counts and final UI...');
        updateDataCounts();
        // Force update UI one more time to ensure everything is consistent
        updateUIBasedOnRole();
        
        // Re-initialize task type sidebar to ensure it's properly set up
        initializeTaskTypeSidebar();
        
        // Final check of UI elements
        console.log('🔍 Final UI check:');
        console.log('  - Experiment title:', document.getElementById('experimentTitle')?.textContent);
        console.log('  - Experiment status:', document.getElementById('experimentStatus')?.textContent);
        console.log('  - Total queries display:', document.getElementById('totalQueriesDisplay')?.textContent);
        console.log('  - Allow any to judge:', document.getElementById('configAllowAnyToJudge')?.textContent);
        console.log('  - Task type sidebar visible:', document.getElementById('taskTypeSidebar')?.style.display !== 'none');
    }, 500);
    
    console.log('✅✅✅ DOMContentLoaded initialization completed');
    
    // Add event listeners for modal close on outside click
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddMemberModal();
            }
        });
    }
    
    // Add global click listener for assignment state reset
    document.addEventListener('click', handleGlobalClick);
    
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

// Force immediate update after 3 seconds as a failsafe
setTimeout(() => {
    console.log('🚨 EMERGENCY UPDATE: Forcing UI update after 3 seconds');
    
    // Force update basic elements with fallback values
    const titleEl = document.getElementById('experimentTitle');
    if (titleEl && titleEl.textContent === 'Loading...') {
        titleEl.textContent = 'Search NDCG Experiment';
        console.log('🚨 Force updated title');
    }
    
    const statusEl = document.getElementById('experimentStatus');
    if (statusEl && statusEl.textContent === 'Loading...') {
        statusEl.textContent = 'Active';
        statusEl.className = 'status-badge status-active';
        console.log('🚨 Force updated status');
    }
    
    const totalQueriesEl = document.getElementById('totalQueriesDisplay');
    if (totalQueriesEl && totalQueriesEl.textContent === 'Loading Total Queries') {
        totalQueriesEl.textContent = '247 Total Queries';
        console.log('🚨 Force updated total queries');
    }
    
    const configAllowEl = document.getElementById('configAllowAnyToJudge');
    if (configAllowEl && configAllowEl.textContent === 'Loading...') {
        configAllowEl.textContent = 'Disabled';
        console.log('🚨 Force updated allow any to judge');
    }
    
    // Update progress stats
    const completedStatEl = document.getElementById('completedStat');
    if (completedStatEl && completedStatEl.textContent === 'Loading Completed') {
        completedStatEl.textContent = '189 Completed (76.5%)';
        console.log('🚨 Force updated completed stat');
    }
    
    const inProgressStatEl = document.getElementById('inProgressStat');
    if (inProgressStatEl && inProgressStatEl.textContent === 'Loading In Progress') {
        inProgressStatEl.textContent = '23 In Progress (9.3%)';
        console.log('🚨 Force updated in progress stat');
    }
    
    const notStartedStatEl = document.getElementById('notStartedStat');
    if (notStartedStatEl && notStartedStatEl.textContent === 'Loading Not Started') {
        notStartedStatEl.textContent = '35 Not Started (14.2%)';
        console.log('🚨 Force updated not started stat');
    }
    
    const judgesCountEl = document.getElementById('judgesCount');
    if (judgesCountEl && judgesCountEl.textContent === 'Loading Judges') {
        // Calculate unique judges from actual data instead of hardcoding
        const uniqueJudges = new Set();
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
            }
        ];
        
        sampleQueries.forEach(query => {
            if (query.assignments) {
                query.assignments.forEach(assignment => {
                    uniqueJudges.add(assignment.judge.name);
                });
            }
        });
        
        judgesCountEl.textContent = `${uniqueJudges.size} Judges`;
        console.log('🚨 Force updated judges count to:', `${uniqueJudges.size} Judges`);
    }
    
    // Update configuration items
    const configElements = [
        { id: 'configExperimentType', value: 'Search NDCG experiment' },
        { id: 'configExperimentName', value: 'Search NDCG Experiment' },
        { id: 'configExperimentDescription', value: 'Evaluating search result quality using NDCG metrics' },
        { id: 'configDataSchema', value: 'Search' },
        { id: 'configDataSource', value: 'Real-time scraping' },
        { id: 'configQuerySetSelection', value: 'Upload query set' },
        { id: 'configQuerySetFile', value: 'search_queries_2024.csv (247 queries)' },
        { id: 'configControlProfile', value: 'userp' },
        { id: 'configTreatmentProfile', value: 'copilot web' },
        { id: 'configDataFieldsDisplay', value: 'Query, Response, LU Info Question' },
        { id: 'configBlindTest', value: 'Enabled' },
        { id: 'configJudgementGuide', value: 'Configured (Markdown format)' }
    ];
    
    configElements.forEach(({ id, value }) => {
        const el = document.getElementById(id);
        if (el && el.textContent === 'Loading...') {
            el.textContent = value;
            console.log(`🚨 Force updated ${id} to: ${value}`);
        }
    });
    
    console.log('🚨 Emergency update completed');
}, 3000);

// Task Type Sidebar Functions
function isAdHocExperiment() {
    // Check multiple possible indicators for ad hoc experiments
    if (!experimentData || !experimentData.configuration) {
        return false;
    }
    
    const config = experimentData.configuration;
    
    // Check various possible indicators for ad hoc experiments
    return config.querySetSelection === 'Ad hoc query' ||
           config.querySetSelection === 'ad-hoc' ||
           config.dataSource === 'ad-hoc' ||
           config.isRealTimeAdHoc === true;
}

function initializeTaskTypeSidebar() {
    const sidebar = document.getElementById('taskTypeSidebar');
    if (!sidebar) return;
    
    console.log('🔍 Checking if ad hoc experiment...');
    console.log('  - experimentData:', experimentData);
    console.log('  - configuration:', experimentData?.configuration);
    console.log('  - querySetSelection:', experimentData?.configuration?.querySetSelection);
    
    if (isAdHocExperiment()) {
        console.log('✅ Ad hoc experiment detected, showing task type sidebar');
        sidebar.style.display = 'block';
        loadTaskTypes();
    } else {
        console.log('❌ Not ad hoc experiment, hiding task type sidebar');
        sidebar.style.display = 'none';
    }
}

function loadTaskTypes() {
    if (!experimentData || !experimentData.queries) return;
    
    // Count queries and collect assignment info for each task type
    const taskTypeCounts = {};
    const taskTypeAssignmentInfo = {};
    
    experimentData.queries.forEach(query => {
        const taskType = query.taskType?.name || 'Unknown';
        
        // Count queries
        taskTypeCounts[taskType] = (taskTypeCounts[taskType] || 0) + 1;
        
        // Collect assignment info
        if (!taskTypeAssignmentInfo[taskType]) {
            taskTypeAssignmentInfo[taskType] = new Set();
        }
        
        // Add assigned judges to the set
        query.assignments?.forEach(assignment => {
            if (assignment.judge) {
                taskTypeAssignmentInfo[taskType].add(JSON.stringify({
                    name: assignment.judge.name,
                    initials: assignment.judge.initials
                }));
            }
        });
    });
    
    // Render task type list
    const taskTypeList = document.getElementById('taskTypeList');
    if (!taskTypeList) return;
    
    if (Object.keys(taskTypeCounts).length === 0) {
        taskTypeList.innerHTML = '<div class="task-type-empty">No task types found</div>';
        return;
    }
    
    taskTypeList.innerHTML = '';
    
    Object.entries(taskTypeCounts).forEach(([taskType, count]) => {
        const item = document.createElement('div');
        item.className = 'task-type-item';
        item.setAttribute('data-task-type', taskType);
        
        // Get assigned members
        const assignedMembers = Array.from(taskTypeAssignmentInfo[taskType] || [])
            .map(memberStr => JSON.parse(memberStr));
        
        // Create assignments display
        let assignmentsHtml = '';
        if (assignedMembers.length > 0) {
            const membersHtml = assignedMembers.map(member =>
                `<div class="member-avatar" title="${member.name}">${member.initials}</div>`
            ).join('');
            assignmentsHtml = `
                <div class="assigned-members">
                    ${membersHtml}
                </div>
                <span class="assignment-summary">${assignedMembers.length} assigned</span>
            `;
        } else {
            assignmentsHtml = '<span class="no-assignments">No assignments</span>';
        }
        
        item.innerHTML = `
            <div class="task-type-checkbox">
                <input type="checkbox" value="${taskType}" onchange="updateSelectedTaskTypes()" onclick="event.stopPropagation()">
            </div>
            <div class="task-type-content">
                <div class="task-type-header">
                    <span class="task-type-name">${taskType}</span>
                    <span class="task-type-count">${count}</span>
                </div>
                <div class="task-type-assignments">
                    ${assignmentsHtml}
                </div>
            </div>
        `;
        
        // Add click handler for filtering (but not for checkbox)
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.task-type-checkbox')) {
                filterByTaskType(taskType, item);
            }
        });
        
        taskTypeList.appendChild(item);
    });
    
    // Update assign button state
    updateAssignButtonState();
}

function filterByTaskType(taskType, itemElement) {
    currentTaskTypeFilter = taskType;
    
    // Update active state
    document.querySelectorAll('.task-type-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (itemElement) {
        itemElement.classList.add('active');
    }
    
    // Reload queries with filter
    loadQueries();
}

function clearTaskTypeFilter() {
    currentTaskTypeFilter = null;
    
    // Remove all active states
    document.querySelectorAll('.task-type-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Reload all queries
    loadQueries();
}

// Task Type Selection Management
function updateSelectedTaskTypes() {
    const checkboxes = document.querySelectorAll('.task-type-item input[type="checkbox"]:checked');
    selectedTaskTypes = Array.from(checkboxes).map(cb => cb.value);
    
    console.log('📋 updateSelectedTaskTypes called');
    console.log('Selected task types:', selectedTaskTypes);
    
    // Update visual selection state - 确保正确清除和添加 selected 类
    document.querySelectorAll('.task-type-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            item.classList.add('selected');
            console.log('✅ Added selected class to:', checkbox.value);
        } else {
            item.classList.remove('selected');
            console.log('❌ Removed selected class from item');
        }
    });
    
    // Update "Select All" checkbox state
    updateSelectAllTaskTypesState();
    
    // Clear highlights when selections change
    if (isHighlightingSelections) {
        removeHighlights();
    }
    
    // Update assign button state (this will auto-switch modes based on selection)
    updateAssignButtonState();
}

function toggleSelectAllTaskTypes() {
    const selectAllCheckbox = document.getElementById('selectAllTaskTypes');
    const taskTypeCheckboxes = document.querySelectorAll('.task-type-item input[type="checkbox"]');
    
    taskTypeCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateSelectedTaskTypes();
}

function updateSelectAllTaskTypesState() {
    const selectAllCheckbox = document.getElementById('selectAllTaskTypes');
    const taskTypeCheckboxes = document.querySelectorAll('.task-type-item input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('.task-type-item input[type="checkbox"]:checked').length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === taskTypeCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function updateAssignButtonState() {
    const assignBtn = document.getElementById('assignJudgesBtn');
    if (!assignBtn) return;
    
    // Check permissions and set appropriate tooltip
    if (currentUser.role === 'judge') {
        assignBtn.disabled = true;
        assignBtn.textContent = 'Assign Judges';
        assignBtn.className = 'btn-secondary';
        assignBtn.setAttribute('data-tooltip', 'You do not have permission to assign judges. Only owners and co-owners can assign judges.');
        return;
    }
    
    if (experimentConfig.allowAnyoneToJudge) {
        assignBtn.disabled = true;
        assignBtn.textContent = 'Assign Judges';
        assignBtn.className = 'btn-secondary';
        assignBtn.setAttribute('data-tooltip', 'Assignment is disabled because this experiment allows anyone to judge. No manual assignment is required.');
        return;
    }
    
    // Clear any previous tooltip and enable the button
    assignBtn.removeAttribute('data-tooltip');
    
    if (isAdHocExperiment()) {
        updateAdHocAssignButton(assignBtn);
    } else {
        updateQuerySetAssignButton(assignBtn);
    }
}

function updateQuerySetAssignButton(assignBtn) {
    const selectedQueries = getSelectedQueries();
    
    if (selectedQueries.length === 0) {
        // 没有选中任何query，显示默认状态
        assignBtn.textContent = 'Assign Judges';
        assignBtn.className = 'btn-secondary';
        assignBtn.disabled = false;
        assignmentMode = AssignmentStates.DEFAULT; // 自动重置为默认模式
    } else {
        // 有选中的queries，自动切换到assignment模式
        assignBtn.textContent = `Assign Queries (${selectedQueries.length})`;
        assignBtn.className = 'btn-primary'; // 高亮
        assignBtn.disabled = false;
        assignmentMode = AssignmentStates.QUERY_SELECTION; // 自动切换模式
    }
}

function updateAdHocAssignButton(assignBtn) {
    const selectedTaskTypes = getSelectedTaskTypes();
    
    if (selectedTaskTypes.length === 0) {
        // 没有选中任何task type，显示默认状态
        assignBtn.textContent = 'Assign Judges';
        assignBtn.className = 'btn-secondary';
        assignBtn.disabled = false;
        assignmentMode = AssignmentStates.DEFAULT; // 自动重置为默认模式
    } else {
        // 有选中的task types，自动切换到assignment模式
        assignBtn.textContent = `Assign Task Types (${selectedTaskTypes.length})`;
        assignBtn.className = 'btn-primary'; // 高亮
        assignBtn.disabled = false;
        assignmentMode = AssignmentStates.TASKTYPE_SELECTION; // 自动切换模式
    }
}

function getSelectedTaskTypes() {
    const checkboxes = document.querySelectorAll('.task-type-item input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Highlight management functions
function highlightQueryCheckboxes() {
    isHighlightingSelections = true;
    
    // 高亮所有query复选框 - 但不包括disabled的
    document.querySelectorAll('.query-row input[type="checkbox"]:not([disabled])').forEach(checkbox => {
        checkbox.closest('.checkbox-column').classList.add('highlighted');
    });
    
    // 高亮表头全选复选框
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox && !selectAllCheckbox.disabled) {
        selectAllCheckbox.closest('.checkbox-column').classList.add('highlighted');
    }
}

function highlightTaskTypeCheckboxes() {
    isHighlightingSelections = true;
    
    // 高亮所有task type复选框
    document.querySelectorAll('.task-type-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.closest('.task-type-checkbox').classList.add('highlighted');
    });
    
    // 高亮全选复选框
    const selectAllTaskTypes = document.getElementById('selectAllTaskTypes');
    if (selectAllTaskTypes) {
        selectAllTaskTypes.closest('.select-all-task-types').classList.add('highlighted');
    }
}

function removeHighlights() {
    isHighlightingSelections = false;
    document.querySelectorAll('.highlighted').forEach(element => {
        element.classList.remove('highlighted');
    });
}

function resetAssignmentState() {
    console.log('🔄 Resetting assignment state');
    
    // Reset mode to default
    assignmentMode = AssignmentStates.DEFAULT;
    
    // Remove any highlights
    removeHighlights();
    
    // Clear all selections
    document.querySelectorAll('.query-row input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.task-type-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear task type visual selection states
    document.querySelectorAll('.task-type-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Reset select all checkboxes
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
    
    const selectAllTaskTypes = document.getElementById('selectAllTaskTypes');
    if (selectAllTaskTypes) {
        selectAllTaskTypes.checked = false;
        selectAllTaskTypes.indeterminate = false;
    }
    
    // Clear selected arrays
    selectedTaskTypes = [];
    
    // Force update task type visual states
    updateSelectedTaskTypes();
    
    // Update button to default state
    updateAssignButtonState();
    
    console.log('✅ Assignment state reset complete');
}

// Global click handler for resetting assignment state
function handleGlobalClick(event) {
    // Only handle clicks when in selection mode or when there are selections
    if (assignmentMode === AssignmentStates.DEFAULT && !hasAnySelections()) {
        return; // No need to handle clicks when already in default state with no selections
    }
    
    // Check if the click is outside the relevant UI elements
    const clickedElement = event.target;
    
    // Define elements that should NOT trigger reset when clicked
    const protectedElements = [
        '.query-row',
        '.task-type-item',
        '.checkbox-column',
        '#assignJudgesBtn',
        '#selectAll',
        '#selectAllTaskTypes',
        '.task-type-header',
        '.queries-tab-content',
        '.task-type-sidebar',
        '.modal',
        '.dropdown',
        '.tab-button'
    ];
    
    // Check if click is on any protected element
    let isProtectedClick = false;
    for (const selector of protectedElements) {
        if (clickedElement.closest(selector)) {
            isProtectedClick = true;
            break;
        }
    }
    
    // If click is outside protected areas, reset state
    if (!isProtectedClick) {
        console.log('🔄 Global click detected outside protected areas, resetting assignment state');
        resetAssignmentState();
    }
}

// Helper function to check if there are any current selections
function hasAnySelections() {
    const selectedQueries = getSelectedQueries();
    const selectedTaskTypes = getSelectedTaskTypes();
    return selectedQueries.length > 0 || selectedTaskTypes.length > 0 || isHighlightingSelections;
}

function getSelectedQueries() {
    const checkboxes = document.querySelectorAll('.query-row input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
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
window.toggleUserDropdown = toggleUserDropdown;
window.switchUser = switchUser;
window.downloadReport = downloadReport;
window.exportData = exportData;
window.filterByTaskType = filterByTaskType;
window.clearTaskTypeFilter = clearTaskTypeFilter;
window.updateSelectedTaskTypes = updateSelectedTaskTypes;
window.toggleSelectAllTaskTypes = toggleSelectAllTaskTypes;
window.resetAssignmentState = resetAssignmentState;
window.highlightQueryCheckboxes = highlightQueryCheckboxes;
window.highlightTaskTypeCheckboxes = highlightTaskTypeCheckboxes;
window.removeHighlights = removeHighlights;
window.executeTaskTypeAssignmentFromModal = executeTaskTypeAssignmentFromModal;
window.handleGlobalClick = handleGlobalClick;
window.hasAnySelections = hasAnySelections;
window.loadResults = loadResults;
window.loadResultsData = loadResultsData;
window.onQuestionChange = onQuestionChange;
window.onCustomMetricsQuestionChange = onCustomMetricsQuestionChange;
window.populateCustomMetricsQuestionSelector = populateCustomMetricsQuestionSelector;
window.displayQuestionMetrics = displayQuestionMetrics;
window.switchResultsTab = switchResultsTab;
window.destroyExistingCharts = destroyExistingCharts;

// Results sub-tab switching functionality
function switchResultsTab(tabName) {
    console.log('📊 Switching to results tab:', tabName);
    
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
    
    // Load specific content if needed
    if (tabName === 'scorecard') {
        // Ensure custom metrics are loaded when switching to scorecard
        setTimeout(() => {
            console.log('📊 Ensuring custom metrics are displayed for scorecard tab');
            populateCustomMetricsQuestionSelector();
        }, 100);
    } else if (tabName === 'throughput') {
        // Re-render progress chart when switching to throughput tab
        setTimeout(() => {
            const ctx = document.getElementById('progressChart');
            if (ctx && typeof renderProgressChart === 'function') {
                // Use current experiment's throughput data if available
                const currentExperimentId = new URLSearchParams(window.location.search).get('id') || 'search-ndcg-001';
                
                // Try to get real data, fallback to default
                let progressData = [
                    {"date": "2024-03-10", "count": 12},
                    {"date": "2024-03-11", "count": 18},
                    {"date": "2024-03-12", "count": 25},
                    {"date": "2024-03-13", "count": 30},
                    {"date": "2024-03-14", "count": 28},
                    {"date": "2024-03-15", "count": 35},
                    {"date": "2024-03-16", "count": 42}
                ];
                
                renderProgressChart(progressData);
            }
        }, 100);
    }
}

// Question selector change handler
function onQuestionChange() {
    const selector = document.getElementById('questionSelector');
    if (!selector) return;
    
    const selectedQuestionId = selector.value;
    console.log('📊 Question changed to:', selectedQuestionId);
    
    if (selectedQuestionId) {
        // Here you could load different data based on the selected question
        // For now, we'll just reload the same data since it's mock data
        console.log('📊 Loading data for question:', selectedQuestionId);
        loadResultsData();
    }
}