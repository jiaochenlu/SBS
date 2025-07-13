/**
 * Experiment Detail Data Management Module
 * 处理数据加载、配置管理和API调用
 */

// Global variables for configuration data
export let experimentData = null;
export let users = {};
export let currentUser = null;
export let experimentConfig = {
    allowAnyoneToJudge: false,
    experimentType: 'search-ndcg',
    isRealTimeAdHoc: false
};

/**
 * 设置实验数据
 */
export function setExperimentData(data) {
    experimentData = data;
    window.experimentData = data;
    window.exp = data;
}

/**
 * 设置用户数据
 */
export function setUsers(userData) {
    users = userData;
}

/**
 * 设置当前用户
 */
export function setCurrentUser(user) {
    currentUser = user;
}

/**
 * 更新实验配置
 */
export function updateExperimentConfig(config) {
    Object.assign(experimentConfig, config);
}

/**
 * Load experiment configuration from JSON file
 * 整合了原来的loadExperimentConfig函数
 */
export async function loadExperimentConfig() {
    try {
        console.log('🚀 STARTING loadExperimentConfig function');
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
        console.log('✨ CONFIG DATA LOADED SUCCESSFULLY:', config);
        console.log('✨ Experiment data:', config.experiment);
        
        const urlParams = new URLSearchParams(window.location.search);
        const experimentId = urlParams.get('id');
        console.log('🔍 URL Parameters:', urlParams.toString());
        console.log('🔍 Experiment ID from URL:', experimentId);
        
        const foundExperiment = config.experiments.find(exp => exp.id === experimentId);
        console.log('🔍 Matched Experiment Data:', foundExperiment);
        
        if (!foundExperiment) {
            console.error(`Experiment with ID "${experimentId}" not found.`);
            alert('Experiment not found. Please check the URL.');
            console.error('❌ Experiment not found. Available experiments:', config.experiments.map(exp => exp.id));
            return false;
        }
        
        // 设置实验数据
        setExperimentData(foundExperiment);
        console.log('✨ Set experimentData to:', experimentData);
        
        // Convert members array to users object for compatibility
        const userData = {};
        experimentData.members.forEach(member => {
            userData[member.id] = member;
        });
        setUsers(userData);
        console.log('✨ Set users to:', users);
        
        // Set default current user to owner
        const owner = experimentData.members.find(member => member.role === 'owner');
        setCurrentUser(owner || experimentData.members[0]);
        console.log('✨ Set currentUser to:', currentUser);
        
        // Update experiment config
        updateExperimentConfig({
            allowAnyoneToJudge: experimentData.configuration.additionalSettings.allowAnyToJudge,
            experimentType: experimentData.configuration.experimentType,
            isRealTimeAdHoc: experimentData.configuration.dataSource === 'ad-hoc'
        });
        
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
        
        // Debug logging for configuration
        console.log('🔍 Configuration Debug:');
        console.log('  - Raw allowAnyToJudge from config:', experimentData.configuration.additionalSettings.allowAnyToJudge);
        console.log('  - Set experimentConfig.allowAnyoneToJudge to:', experimentConfig.allowAnyoneToJudge);
        console.log('  - experimentConfig object:', experimentConfig);
        
        console.log('✅ Experiment configuration loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading experiment configuration:', error);
        return false;
    }
}

/**
 * Fallback data if config file loading fails
 */
export function loadFallbackData() {
    console.log('🔄 Loading fallback data...');
    
    const fallbackUsers = {
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
    
    setUsers(fallbackUsers);
    setCurrentUser(fallbackUsers['john-smith']);
    
    updateExperimentConfig({
        allowAnyoneToJudge: false,
        experimentType: 'search-ndcg',
        isRealTimeAdHoc: false
    });
    
    // Set fallback experimentData
    const fallbackExperimentData = {
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
    
    setExperimentData(fallbackExperimentData);
    console.log('✅ Fallback data loaded successfully');
}

/**
 * 获取当前实验数据
 */
export function getExperimentData() {
    return experimentData;
}

/**
 * 获取用户数据
 */
export function getUsers() {
    return users;
}

/**
 * 获取当前用户
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * 获取实验配置
 */
export function getExperimentConfig() {
    return experimentConfig;
}