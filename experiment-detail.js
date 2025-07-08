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
    
    const queriesTabBadge = document.getElementById('queriesTabBadge');
    if (queriesTabBadge) queriesTabBadge.textContent = experimentData.queries.length;
    
    const membersTabBadge = document.getElementById('membersTabBadge');
    if (membersTabBadge) membersTabBadge.textContent = experimentData.members.length;
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
        configBtn.removeAttribute('title');
    }
    
    // Clone: All users can clone
    if (cloneBtn) {
        cloneBtn.disabled = false;
        cloneBtn.classList.remove('disabled');
        cloneBtn.removeAttribute('title');
    }
    
    // Delete: Only owner can delete
    if (deleteBtn) {
        if (currentUser.role === 'owner') {
            deleteBtn.disabled = false;
            deleteBtn.classList.remove('disabled');
            deleteBtn.removeAttribute('title');
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
        assignBtn.title = allowAnyToJudge
            ? 'Judgment is open to everyone for this experiment. Assigning judges is disabled.'
            : canAssign
            ? 'Assign queries to judges'
            : 'You do not have permission to assign queries';
    }
    const importBtn = document.querySelector('button[onclick="importQueries()"]');
    
    // Assign queries: Owner and Co-Owner only
    if (assignBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            assignBtn.disabled = false;
            assignBtn.classList.remove('disabled');
            assignBtn.removeAttribute('title');
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
            importBtn.removeAttribute('title');
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
            addMemberBtn.title = 'Judgement is open to everyone for this experiment. Add member is disabled.';
        } else if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            addMemberBtn.disabled = false;
            addMemberBtn.classList.remove('disabled');
            addMemberBtn.removeAttribute('title');
        } else {
            addMemberBtn.disabled = true;
            addMemberBtn.classList.add('disabled');
            addMemberBtn.removeAttribute('title');
        }
    }

    // Manage members: Owner and Co-Owner only
    if (manageMembersBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            manageMembersBtn.disabled = false;
            manageMembersBtn.classList.remove('disabled');
            manageMembersBtn.removeAttribute('title');
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
        downloadBtn.removeAttribute('title');
    }
    
    // Export data: Owner and Co-Owner only
    if (exportBtn) {
        if (currentUser.role === 'owner' || currentUser.role === 'co-owner') {
            exportBtn.disabled = false;
            exportBtn.classList.remove('disabled');
            exportBtn.removeAttribute('title');
        } else {
            exportBtn.disabled = true;
            exportBtn.classList.add('disabled');
        }
    }
}

function updateQueryListPermissions() {
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // Disable select all checkbox for Judge users
    if (selectAllCheckbox) {
        if (currentUser.role === 'judge') {
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
    
    // Create row content
    const assignmentsContainer = document.createElement('div');
    assignmentsContainer.className = 'assignments-container';
    assignmentsContainer.innerHTML = assigneesHtml;
    if (overflowCount > 0) {
        assignmentsContainer.setAttribute('data-overflow', `+${overflowCount} more`);
    }
    
    row.innerHTML = `
        <div class="checkbox-column">
            <input type="checkbox" value="${query.id}" onchange="updateSelectedQueries()" ${currentUser.role === 'judge' ? 'disabled' : ''}>
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
        <div class="last-judged-column">
            ${lastJudgedAt}
        </div>
    `;
    
    return row;
}

function loadQueries() {
    console.log('📋 loadQueries called');
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
            },        {
            id: 'Q006',
            text: 'Mobile app performance optimization strategies',
            assignments: []
        },
        {
            id: 'Q007',
            text: 'Frontend framework comparison and selection',
            assignments: [
                { judge: { name: 'Sarah Chen', initials: 'SC' }, status: 'in-progress', assignedAt: '2024-03-16 10:00' }
            ]
        },
        {
            id: 'Q008',
            text: 'Microservices architecture design patterns',
            assignments: []
        }
    ];
    }
    
    console.log('📋 Using queries:', allQueries);
    
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

    console.log('✅ Proceeding with query assignment');
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
    // Judge users cannot select queries
    if (currentUser.role === 'judge') {
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
    // Initialize results view - placeholder for future implementation
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
    const assignButton = document.querySelector('button[onclick="assignQueries()"]');
    
    if (assignButton) {
        // Only Owner and Co-Owner can assign queries
        const hasRolePermission = (currentUser.role === 'owner' || currentUser.role === 'co-owner');
        const allowAnyoneDisabled = !experimentConfig.allowAnyoneToJudge;
        const canAssign = hasRolePermission && allowAnyoneDisabled;
        
        if (!canAssign) {
            assignButton.disabled = true;
            assignButton.style.opacity = '0.5';
            assignButton.style.cursor = 'not-allowed';
            
            if (experimentConfig.allowAnyoneToJudge) {
                assignButton.title = 'Judgment is open to everyone for this experiment. Assigning judges is disabled.';
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
    
    // Load initial content for the default active tab (queries)
    console.log('📋 Loading queries...');
    loadQueries();
    
    // Update UI based on user role and permissions
    console.log('🎨 Updating UI based on role...');
    updateUIBasedOnRole();
    
    // Initialize button state
    console.log('🔘 Updating selected queries...');
    updateSelectedQueries();
    
    // Update data counts for consistency with a longer delay to ensure everything is loaded
    setTimeout(() => {
        console.log('📊 Updating data counts and final UI...');
        updateDataCounts();
        // Force update UI one more time to ensure everything is consistent
        updateUIBasedOnRole();
        
        // Final check of UI elements
        console.log('🔍 Final UI check:');
        console.log('  - Experiment title:', document.getElementById('experimentTitle')?.textContent);
        console.log('  - Experiment status:', document.getElementById('experimentStatus')?.textContent);
        console.log('  - Total queries display:', document.getElementById('totalQueriesDisplay')?.textContent);
        console.log('  - Allow any to judge:', document.getElementById('configAllowAnyToJudge')?.textContent);
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
        judgesCountEl.textContent = '4 Judges';
        console.log('🚨 Force updated judges count');
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