// Global variable to store experiment presets
let experimentPresets = {};

// Function to load experiment presets from config file
async function loadExperimentPresets() {
    console.log('🚀 Starting to load experiment presets...');
    try {
        console.log('📄 Fetching config file from:', './experiment-presets-config.json');
        const response = await fetch('./experiment-presets-config.json');
        console.log('📡 Fetch response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const configData = await response.json();
        console.log('✨ Config data loaded successfully:', configData);
        console.log('📊 Found', configData.presets?.length || 0, 'presets in config');
        
        // Store presets data
        experimentPresets = {};
        configData.presets.forEach(preset => {
            experimentPresets[preset.id] = preset;
            console.log('💾 Stored preset:', preset.name);
        });
        console.log('🗄️ All experiment presets stored:', Object.keys(experimentPresets));
        
        // Populate the experiment type dropdown
        console.log('🔄 About to populate dropdown with config data...');
        populateExperimentTypeDropdown(configData.presets);
        console.log('✅ Successfully loaded presets from config file!');
        
    } catch (error) {
        console.error('❌ Error loading experiment presets:', error);
        console.log('🔄 Falling back to hard-coded presets...');
        // Fallback to hard-coded options if config loading fails
        loadFallbackPresets();
    }
}

// Function to populate experiment type dropdown from config
function populateExperimentTypeDropdown(presets) {
    console.log('🎯 Starting to populate dropdown with', presets?.length || 0, 'presets');
    const experimentTypeSelect = document.getElementById('experimentType');
    
    if (!experimentTypeSelect) {
        console.error('❌ Could not find experimentType select element');
        return;
    }
    
    console.log('📝 Current dropdown has', experimentTypeSelect.children.length, 'options');
    
    // Clear existing options (except the first placeholder option)
    while (experimentTypeSelect.children.length > 1) {
        experimentTypeSelect.removeChild(experimentTypeSelect.lastChild);
    }
    
    console.log('🧹 Cleared dropdown, now has', experimentTypeSelect.children.length, 'options');
    
    // Add options from config
    presets.forEach((preset, index) => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        option.title = preset.description || ''; // Add description as tooltip
        experimentTypeSelect.appendChild(option);
        console.log(`➕ Added option ${index + 1}: "${preset.name}" (${preset.id})`);
    });
    
    console.log('✅ Dropdown populated successfully! Total options:', experimentTypeSelect.children.length);
}

// Fallback function for hard-coded presets (in case config fails to load)
function loadFallbackPresets() {
    console.warn('⚠️ Using fallback presets due to config loading failure');
    console.log('📋 This might happen when running locally due to CORS restrictions');
    
    experimentPresets = {
        'search-ndcg': {
            id: 'search-ndcg',
            name: 'Search NDCG experiment [FALLBACK]',
            configuration: {
                dataSchema: 'search',
                dataSource: 'real-time-scraping',
                querySet: 'upload-query'
            }
        },
        'search-quality': {
            id: 'search-quality',
            name: 'Search general quality experiment [FALLBACK]',
            configuration: {
                dataSchema: 'search',
                dataSource: 'real-time-scraping',
                querySet: 'ad-hoc'
            }
        },
        'researcher': {
            id: 'researcher',
            name: 'Researcher experiment [FALLBACK]',
            configuration: {
                dataSchema: 'chat-multiturn',
                dataSource: 'upload-local'
            }
        },
        'meeting-copilot': {
            id: 'meeting-copilot',
            name: 'Meeting Copilot experiment [FALLBACK]',
            configuration: {
                dataSchema: 'chat-singleturn',
                dataSource: 'import-scrape'
            }
        }
    };
    
    console.log('💾 Fallback presets stored:', Object.keys(experimentPresets));
    
    // Also populate dropdown with fallback data
    const fallbackPresets = [
        { id: 'search-ndcg', name: 'Search NDCG experiment [FALLBACK]', description: 'Search experiment focused on NDCG metrics' },
        { id: 'search-quality', name: 'Search general quality experiment [FALLBACK]', description: 'Search experiment for general quality evaluation' },
        { id: 'researcher', name: 'Researcher experiment [FALLBACK]', description: 'Multi-turn chat experiment for researcher scenarios' },
        { id: 'meeting-copilot', name: 'Meeting Copilot experiment [FALLBACK]', description: 'Single-turn chat experiment for meeting copilot scenarios' }
    ];
    console.log('🔄 Populating dropdown with fallback data...');
    populateExperimentTypeDropdown(fallbackPresets);
    console.log('✅ Fallback presets loaded successfully!');
}

// Function to configure default settings based on experiment type
function configureExperimentDefaults(experimentType) {
    const preset = experimentPresets[experimentType];
    if (!preset || !preset.configuration) {
        console.error('Experiment preset not found:', experimentType);
        return;
    }
    
    const config = preset.configuration;
    
    // Set Data Schema
    if (config.dataSchema) {
        const dataSchemaInput = document.querySelector(`input[name="dataSchema"][value="${config.dataSchema}"]`);
        if (dataSchemaInput) {
            dataSchemaInput.checked = true;
            dataSchemaInput.dispatchEvent(new Event('change'));
        }
    }
    
    // Wait for schema change to complete, then set other options
    setTimeout(() => {
        // Set Data Source
        if (config.dataSource) {
            const dataSourceInput = document.querySelector(`input[name="dataSource"][value="${config.dataSource}"]`);
            if (dataSourceInput) {
                dataSourceInput.checked = true;
                dataSourceInput.dispatchEvent(new Event('change'));
            }
        }
        
        // Set Query Set (if specified)
        if (config.querySet) {
            setTimeout(() => {
                const querySetInput = document.querySelector(`input[name="querySet"][value="${config.querySet}"]`);
                if (querySetInput) {
                    querySetInput.checked = true;
                    querySetInput.dispatchEvent(new Event('change'));
                }
            }, 100);
        }
    }, 100);
}

// Form logic
document.addEventListener('DOMContentLoaded', function() {
    const experimentTypeSelect = document.getElementById('experimentType');
    const dataSchemaInputs = document.querySelectorAll('input[name="dataSchema"]');
    const dataSourceInputs = document.querySelectorAll('input[name="dataSource"]');
    const querySetInputs = document.querySelectorAll('input[name="querySet"]');
    
    // Load experiment presets from config
    loadExperimentPresets();
    
    // Handle experiment type selection
    experimentTypeSelect.addEventListener('change', function() {
        if (this.value) {
            configureExperimentDefaults(this.value);
        }
    });
        
        // Show/hide sections based on data source selection
        dataSourceInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Hide all conditional sections
                document.getElementById('realTimeSubOptions').style.display = 'none';
                document.getElementById('uploadLocalOptions').style.display = 'none';
                document.getElementById('importScrapeOptions').style.display = 'none';
                
                // Show relevant section
                if (this.value === 'real-time-scraping') {
                    document.getElementById('realTimeSubOptions').style.display = 'block';
                } else if (this.value === 'upload-local') {
                    document.getElementById('uploadLocalOptions').style.display = 'block';
                } else if (this.value === 'import-scrape') {
                    document.getElementById('importScrapeOptions').style.display = 'block';
                }
            });
        });
        
        // Show/hide query set options
        querySetInputs.forEach(input => {
            input.addEventListener('change', function() {
                document.getElementById('adHocOptions').style.display = 'none';
                document.getElementById('uploadQueryOptions').style.display = 'none';
                
                if (this.value === 'ad-hoc') {
                    document.getElementById('adHocOptions').style.display = 'block';
                } else if (this.value === 'upload-query') {
                    document.getElementById('uploadQueryOptions').style.display = 'block';
                }
            });
        });
        
        // Update profile options based on data schema
        dataSchemaInputs.forEach(input => {
            input.addEventListener('change', function() {
                const controlSelect = document.getElementById('controlProfile');
                const treatmentSelect = document.getElementById('treatmentProfile');
                
                // Clear existing options
                controlSelect.innerHTML = '<option value="">Select control profile...</option>';
                treatmentSelect.innerHTML = '<option value="">Select treatment profile...</option>';
                
                let options = [];
                if (this.value === 'chat-singleturn' || this.value === 'chat-multiturn') {
                    options = ['copilot web', 'copilot work', 'researcher'];
                } else if (this.value === 'search') {
                    options = ['userp', 'workplace search', 'copilot web', 'copilot work'];
                }
                
                options.forEach(option => {
                    controlSelect.add(new Option(option, option));
                    treatmentSelect.add(new Option(option, option));
                });
                
                // Enable dependent sections and show/hide default fields based on schema
                enableDependentSections();
                updateDefaultFields(this.value);
                
                // Handle Turn 1 disable/enable logic for chat-multiturn
                handleTurnFieldsVisibility(this.value);
            });
        });
        
        // Function to enable sections that depend on Data Schema
        function enableDependentSections() {
            const dataSourceSection = document.getElementById('dataSourceSection');
            const dataFieldsSection = document.getElementById('dataFieldsSection');
            
            // Enable Data Source section
            dataSourceSection.classList.remove('disabled-section');
            const dataSourceMessage = dataSourceSection.querySelector('.dependency-message');
            if (dataSourceMessage) dataSourceMessage.style.display = 'none';
            
            const dataSourceInputs = dataSourceSection.querySelectorAll('input[type="radio"]');
            const dataSourceLabels = dataSourceSection.querySelectorAll('.radio-option');
            
            dataSourceInputs.forEach(input => {
                input.disabled = false;
            });
            
            dataSourceLabels.forEach(label => {
                label.classList.remove('disabled');
            });
            
            // Enable Data Fields section
            dataFieldsSection.classList.remove('disabled-section');
            const dataFieldsMessage = dataFieldsSection.querySelector('.dependency-message');
            if (dataFieldsMessage) dataFieldsMessage.style.display = 'none';
            
            const helpText = dataFieldsSection.querySelector('.help-text');
            const defaultFields = dataFieldsSection.querySelector('#defaultFields');
            
            if (helpText) helpText.style.display = 'block';
            if (defaultFields) defaultFields.style.display = 'block';
        }
        
        // Update default fields display based on schema
        function updateDefaultFields(schema) {
            const chatSingleTurnFields = document.getElementById('chatSingleTurnDefaultFields');
            const chatMultiTurnFields = document.getElementById('chatMultiTurnDefaultFields');
            const searchFields = document.getElementById('searchDefaultFields');
            
            // Hide all field lists first
            if (chatSingleTurnFields) chatSingleTurnFields.style.display = 'none';
            if (chatMultiTurnFields) chatMultiTurnFields.style.display = 'none';
            if (searchFields) searchFields.style.display = 'none';
            
            // Show relevant fields based on schema
            if (schema === 'chat-singleturn') {
                if (chatSingleTurnFields) chatSingleTurnFields.style.display = 'block';
            } else if (schema === 'chat-multiturn') {
                if (chatMultiTurnFields) chatMultiTurnFields.style.display = 'block';
            } else if (schema === 'search') {
                if (searchFields) searchFields.style.display = 'block';
            }
            
            // Add a small delay to ensure DOM elements are ready
            setTimeout(() => {
                handleTurnFieldsVisibility(schema);
            }, 100);
            
            // Add default quiz questions based on schema
            addDefaultQuizQuestions(schema);
        }
        
        // Function to handle Turn fields for chat-multiturn
        function handleTurnFieldsVisibility(schema) {
            if (schema === 'chat-multiturn') {
                // Default select Turn 1, Turn 2 and their sub-options
                const turn1Checkbox = document.querySelector('input[value="turn1"]');
                const turn1QueryCheckbox = document.querySelector('input[value="turn1_query"]');
                const turn1ResponseCheckbox = document.querySelector('input[value="turn1_sydney_response"]');
                const turn2Checkbox = document.querySelector('input[value="turn2"]');
                const turn2QueryCheckbox = document.querySelector('input[value="turn2_query"]');
                const turn2ResponseCheckbox = document.querySelector('input[value="turn2_sydney_response"]');
                
                // Default check all Turn 1 and Turn 2 options
                if (turn1Checkbox) turn1Checkbox.checked = true;
                if (turn1QueryCheckbox) turn1QueryCheckbox.checked = true;
                if (turn1ResponseCheckbox) turn1ResponseCheckbox.checked = true;
                if (turn2Checkbox) turn2Checkbox.checked = true;
                if (turn2QueryCheckbox) turn2QueryCheckbox.checked = true;
                if (turn2ResponseCheckbox) turn2ResponseCheckbox.checked = true;
                
                // Add event listeners for parent-child relationships
                setupTurnParentChildRelationship();
            }
        }
        
        // Function to setup parent-child relationship for Turn options
        function setupTurnParentChildRelationship() {
            // Handle Turn 1 and its sub-options
            const turn1Checkbox = document.querySelector('input[value="turn1"]');
            const turn1QueryCheckbox = document.querySelector('input[value="turn1_query"]');
            const turn1ResponseCheckbox = document.querySelector('input[value="turn1_sydney_response"]');
            
            // Handle Turn 2 and its sub-options
            const turn2Checkbox = document.querySelector('input[value="turn2"]');
            const turn2QueryCheckbox = document.querySelector('input[value="turn2_query"]');
            const turn2ResponseCheckbox = document.querySelector('input[value="turn2_sydney_response"]');
            
            // Turn 1 parent checkbox event
            if (turn1Checkbox) {
                // Remove existing listeners to prevent duplicates
                turn1Checkbox.removeEventListener('change', handleTurn1Change);
                turn1Checkbox.addEventListener('change', handleTurn1Change);
            }
            
            // Turn 2 parent checkbox event
            if (turn2Checkbox) {
                // Remove existing listeners to prevent duplicates
                turn2Checkbox.removeEventListener('change', handleTurn2Change);
                turn2Checkbox.addEventListener('change', handleTurn2Change);
            }
        }
        
        // Handle Turn 1 checkbox change
        function handleTurn1Change() {
            const turn1QueryCheckbox = document.querySelector('input[value="turn1_query"]');
            const turn1ResponseCheckbox = document.querySelector('input[value="turn1_sydney_response"]');
            
            if (!this.checked) {
                // If Turn 1 is unchecked, uncheck its sub-options
                if (turn1QueryCheckbox) turn1QueryCheckbox.checked = false;
                if (turn1ResponseCheckbox) turn1ResponseCheckbox.checked = false;
            } else {
                // If Turn 1 is checked, check its sub-options
                if (turn1QueryCheckbox) turn1QueryCheckbox.checked = true;
                if (turn1ResponseCheckbox) turn1ResponseCheckbox.checked = true;
            }
        }
        
        // Handle Turn 2 checkbox change
        function handleTurn2Change() {
            const turn2QueryCheckbox = document.querySelector('input[value="turn2_query"]');
            const turn2ResponseCheckbox = document.querySelector('input[value="turn2_sydney_response"]');
            
            if (!this.checked) {
                // If Turn 2 is unchecked, uncheck its sub-options
                if (turn2QueryCheckbox) turn2QueryCheckbox.checked = false;
                if (turn2ResponseCheckbox) turn2ResponseCheckbox.checked = false;
            } else {
                // If Turn 2 is checked, check its sub-options
                if (turn2QueryCheckbox) turn2QueryCheckbox.checked = true;
                if (turn2ResponseCheckbox) turn2ResponseCheckbox.checked = true;
            }
        }
        
        // Function to add default quiz questions based on schema
        function addDefaultQuizQuestions(schema) {
            const container = document.getElementById('quizQuestions');
            
            // Clear existing questions
            container.innerHTML = '';
            questionCounter = 0;
            
            if (schema === 'chat-singleturn' || schema === 'chat-multiturn') {
                // Chat schema default questions
                addDefaultQuestion({
                    text: "Which side is better?",
                    type: "single-choice",
                    required: true,
                    evalLevel: "overall",
                    options: [
                        {text: "A is better", score: 1},
                        {text: "Same", score: 2},
                        {text: "B is better", score: 3},
                        {text: "Both bad", score: 4}
                    ]
                });
                
                addDefaultQuestion({
                    text: "Comment",
                    type: "text",
                    required: false,
                    evalLevel: "overall",
                    options: []
                });
                
            } else if (schema === 'search') {
                // Search schema default questions
                addDefaultQuestion({
                    text: "Item relevance",
                    type: "toggle",
                    required: true,
                    evalLevel: "item-sbs",
                    options: [
                        {text: "N/A", score: 1},
                        {text: "Left is better", score: 2},
                        {text: "Same", score: 3},
                        {text: "Right is better", score: 4},
                        {text: "Both bad", score: 5}
                    ]
                });
                
                addDefaultQuestion({
                    text: "Which side is better?",
                    type: "single-choice",
                    required: true,
                    evalLevel: "query-sbs",
                    options: [
                        {text: "A is better", score: 1},
                        {text: "Same", score: 2},
                        {text: "B is better", score: 3},
                        {text: "Both bad", score: 4}
                    ]
                });
                
                addDefaultQuestion({
                    text: "Comment",
                    type: "text",
                    required: false,
                    evalLevel: "query-sbs",
                    options: []
                });
            }
        }
        
        // Function to add a default question with predefined settings
        function addDefaultQuestion(questionData) {
            questionCounter++;
            const container = document.getElementById('quizQuestions');
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.id = `question_${questionCounter}`;
            
            const schema = document.querySelector('input[name="dataSchema"]:checked')?.value || '';
            const hasMultipleData = document.querySelector('input[name="dataSource"]:checked')?.value !== 'real-time-scraping';
            
            // Create options HTML
            let optionsHtml = '';
            if (questionData.options.length > 0) {
                questionData.options.forEach(option => {
                    optionsHtml += `
                        <div class="option-item">
                            <input type="text" class="option-text" value="${option.text}" required>
                            <input type="number" class="option-score" value="${option.score}" min="1" required>
                            <button type="button" class="btn-remove-option" onclick="removeOption(this)">×</button>
                        </div>
                    `;
                });
                optionsHtml += `<button type="button" class="btn-add-option" onclick="addOption('options_${questionCounter}')">Add Option</button>`;
            }
            
            // Get evaluation level options
            const evalLevelHtml = hasMultipleData ? getEvaluationLevelOptions(schema, questionData.evalLevel) : '';
            
            questionDiv.innerHTML = `
                <div class="question-header" onclick="toggleQuestionDetails('question_${questionCounter}')">
                    <div class="question-header-left">
                        <div class="question-number">${questionCounter}</div>
                        <div class="question-header-content">
                            <span class="question-title">${questionData.required ? '<span class="required">*</span>' + questionData.text : questionData.text}</span>
                            <div class="question-preview" id="preview_${questionCounter}">
                                ${generateQuestionPreview(questionData)}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="question-expand-icon" id="expand_${questionCounter}">▶</span>
                        <button type="button" class="btn-remove-question" onclick="event.stopPropagation(); removeQuestion('question_${questionCounter}')">Remove</button>
                    </div>
                </div>
                
                <div class="question-details" id="details_${questionCounter}">
                    <div class="question-text-input">
                        <label class="field-label">Question Text</label>
                        <input type="text" class="form-control" value="${questionData.text}" required onchange="updateQuestionTitle(this, ${questionCounter})">
                    </div>
                    
                    <div class="question-config">
                        <div>
                            <label class="field-label">Question Type</label>
                            <select class="form-control question-type" onchange="updateQuestionOptions(this, 'question_${questionCounter}')">
                                <option value="single-choice" ${questionData.type === 'single-choice' ? 'selected' : ''}>Single Choice</option>
                                <option value="multiple-choice" ${questionData.type === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                                <option value="text" ${questionData.type === 'text' ? 'selected' : ''}>Text Box</option>
                                <option value="list" ${questionData.type === 'list' ? 'selected' : ''}>List Box</option>
                                <option value="toggle" ${questionData.type === 'toggle' ? 'selected' : ''}>Toggle</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="field-label">Required</label>
                            <select class="form-control" onchange="updateQuestionRequired(this, ${questionCounter})">
                                <option value="required" ${questionData.required ? 'selected' : ''}>Required</option>
                                <option value="optional" ${!questionData.required ? 'selected' : ''}>Optional</option>
                            </select>
                        </div>
                        
                        ${evalLevelHtml}
                    </div>
                    
                    <div class="question-options" id="options_${questionCounter}" style="${questionData.type === 'text' || questionData.type === 'list' ? 'display: none;' : ''}">
                        <label class="field-label">Options</label>
                        ${optionsHtml}
                    </div>
                    
                    <div class="question-actions" id="actions_${questionCounter}" style="display: none;">
                        <button type="button" class="btn-save-question" onclick="saveQuestionChanges('question_${questionCounter}')">Save Changes</button>
                        <button type="button" class="btn-cancel-question" onclick="cancelQuestionChanges('question_${questionCounter}')">Cancel</button>
                    </div>
                </div>
            `;
            
            container.appendChild(questionDiv);
            
            // Set the evaluation level if specified
            if (hasMultipleData && questionData.evalLevel) {
                setTimeout(() => {
                    const evalRadio = document.querySelector(`input[name="eval_level_${questionCounter}"][value="${questionData.evalLevel}"]`);
                    if (evalRadio) {
                        evalRadio.checked = true;
                    }
                }, 100);
            }
        }
        
        // File upload handlers
        function setupFileHandler(fileInputId, infoElementId) {
            const fileInput = document.getElementById(fileInputId);
            const infoElement = document.getElementById(infoElementId);
            
            fileInput.addEventListener('change', function() {
                if (this.files[0]) {
                    // Simulate query count (in real implementation, would parse file)
                    const randomQueryCount = Math.floor(Math.random() * 100) + 10;
                    infoElement.textContent = `File uploaded: ${this.files[0].name} (${randomQueryCount} queries)`;
                    infoElement.style.display = 'block';
                }
            });
        }
        
        // Setup file handlers
        setupFileHandler('querySetFile', 'queryCount');
        setupFileHandler('controlFile', 'controlFileInfo');
        setupFileHandler('treatment1File', 'treatment1FileInfo');
        setupFileHandler('treatment2File', 'treatment2FileInfo');
        
        // Import functionality
        document.getElementById('importBtn').addEventListener('click', function() {
            const url = document.getElementById('importUrl').value;
            const resultElement = document.getElementById('importResult');
            
            if (url) {
                // Simulate import (in real implementation, would make API call)
                resultElement.textContent = 'Import successful! 45 queries imported.';
                resultElement.style.display = 'block';
            } else {
                alert('Please enter a URL to import');
            }
        });
        
        // Form submission
        document.getElementById('experimentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Experiment creation submitted! (This is a demo)');
        });
        
    });

    // Global variables for quiz questions
    let questionCounter = 0;
    // Global object to store original question values
    let originalQuestionValues = {};

    // Function to generate question preview based on type and options
    function generateQuestionPreview(questionData) {
        const type = questionData.type;
        const options = questionData.options || [];
        
        switch (type) {
            case 'single-choice':
                if (options.length > 0) {
                    return `
                        <div class="preview-options-horizontal">
                            ${options.map(option => `
                                <label class="preview-radio">
                                    <input type="radio" name="preview_${Date.now()}" disabled>
                                    <span>${option.text}</span>
                                </label>
                            `).join('')}
                        </div>
                    `;
                }
                return '<div class="preview-placeholder">Single choice options will appear here</div>';
                
            case 'multiple-choice':
                if (options.length > 0) {
                    return `
                        <div class="preview-options-horizontal">
                            ${options.map(option => `
                                <label class="preview-checkbox">
                                    <input type="checkbox" disabled>
                                    <span>${option.text}</span>
                                </label>
                            `).join('')}
                        </div>
                    `;
                }
                return '<div class="preview-placeholder">Multiple choice options will appear here</div>';
                
            case 'toggle':
                if (options.length > 0) {
                    const totalOptions = options.length;
                    
                    // Calculate width based on text length and number of options
                    const avgTextLength = options.reduce((sum, opt) => sum + opt.text.length, 0) / options.length;
                    const baseWidth = Math.max(avgTextLength * 8, 60); // Minimum 60px per option
                    const trackWidth = Math.min(400, Math.max(150, baseWidth * totalOptions + 40)); // Add padding
                    
                    return `
                        <div class="preview-toggle-slider" style="width: ${trackWidth}px;">
                            <div class="toggle-track" style="width: ${trackWidth}px;">
                                ${options.map((option, index) => {
                                    const position = totalOptions === 1 ? 50 : (index / (totalOptions - 1)) * 100;
                                    return `<div class="toggle-dot" style="left: ${position}%" title="${option.text}"></div>`;
                                }).join('')}
                            </div>
                            <div class="toggle-labels" style="width: ${trackWidth}px;">
                                ${options.map((option, index) => {
                                    const position = totalOptions === 1 ? 50 : (index / (totalOptions - 1)) * 100;
                                    return `<span class="toggle-label" style="left: ${position}%;">${option.text}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
                return '<div class="preview-placeholder">Toggle options will appear here</div>';
                
            case 'text':
                return '<input type="text" class="preview-text-input" placeholder="Input your answer here..." disabled>';
                
            case 'list':
                return `
                    <div class="preview-list">
                        <div class="preview-list-item">Add your list item</div>
                    </div>
                `;
                
            default:
                return '<div class="preview-placeholder">Question preview will appear here</div>';
        }
    }

    // Function to select additional fields from file
    function selectAdditionalFields() {
        // Simulate field selection from uploaded file
        const fields = ['timestamp', 'user_id', 'session_id', 'location', 'device_type', 'intent_confidence'];
        const container = document.getElementById('additionalFieldsList');
        
        // Clear existing fields
        container.innerHTML = '';
        
        // Add mock fields for demo
        fields.forEach(field => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.innerHTML = `
                <label class="field-checkbox">
                    <input type="checkbox" name="additionalFields" value="${field}">
                    <span class="field-name">${field}</span>
                </label>
            `;
            container.appendChild(fieldItem);
        });
    }

    // Function to add quiz question
    function addQuizQuestion() {
        questionCounter++;
        const container = document.getElementById('quizQuestions');
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.id = `question_${questionCounter}`;
        
        const schema = document.querySelector('input[name="dataSchema"]:checked')?.value || '';
        const hasMultipleData = document.querySelector('input[name="dataSource"]:checked')?.value !== 'real-time-scraping';
        
        questionDiv.innerHTML = `
            <div class="question-header" onclick="toggleQuestionDetails('question_${questionCounter}')">
                <div class="question-header-left">
                    <div class="question-number">${questionCounter}</div>
                    <div class="question-header-content">
                        <span class="question-title">New Question</span>
                        <div class="question-preview" id="preview_${questionCounter}">
                            <div class="preview-placeholder">Question preview will appear here</div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="question-expand-icon" id="expand_${questionCounter}">▶</span>
                    <button type="button" class="btn-remove-question" onclick="event.stopPropagation(); removeQuestion('question_${questionCounter}')">Remove</button>
                </div>
            </div>
            
            <div class="question-details" id="details_${questionCounter}">
                <div class="question-text-input">
                    <label class="field-label">Question Text</label>
                    <input type="text" class="form-control" placeholder="Enter your question..." required onchange="updateQuestionTitle(this, ${questionCounter})">
                </div>
                
                <div class="question-config">
                    <div>
                        <label class="field-label">Question Type</label>
                        <select class="form-control question-type" onchange="updateQuestionOptions(this, 'question_${questionCounter}')">
                            <option value="single-choice">Single Choice</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text Box</option>
                            <option value="list">List Box</option>
                            <option value="toggle">Toggle</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="field-label">Required</label>
                        <select class="form-control" onchange="updateQuestionRequired(this, ${questionCounter})">
                            <option value="required">Required</option>
                            <option value="optional">Optional</option>
                        </select>
                    </div>
                    
                    ${hasMultipleData ? getEvaluationLevelOptions(schema) : ''}
                </div>
                
                <div class="question-options" id="options_${questionCounter}">
                    <label class="field-label">Options</label>
                    <div class="option-item">
                        <input type="text" class="option-text" placeholder="Option text" required>
                        <input type="number" class="option-score" placeholder="Score" min="1" value="1" required>
                        <button type="button" class="btn-remove-option" onclick="removeOption(this)">×</button>
                    </div>
                    <div class="option-item">
                        <input type="text" class="option-text" placeholder="Option text" required>
                        <input type="number" class="option-score" placeholder="Score" min="1" value="2" required>
                        <button type="button" class="btn-remove-option" onclick="removeOption(this)">×</button>
                    </div>
                    <button type="button" class="btn-add-option" onclick="addOption('options_${questionCounter}')">Add Option</button>
                </div>
                
                <div class="question-actions" id="actions_${questionCounter}" style="display: none;">
                    <button type="button" class="btn-save-question" onclick="saveQuestionChanges('question_${questionCounter}')">Save Changes</button>
                    <button type="button" class="btn-cancel-question" onclick="cancelQuestionChanges('question_${questionCounter}')">Cancel</button>
                </div>
            </div>
        `;
        
        container.appendChild(questionDiv);
        
        // Auto-expand new questions
        setTimeout(() => {
            const questionId = 'question_' + questionCounter;
            const questionNumber = questionCounter;
            
            // Store original empty values for new question
            originalQuestionValues[questionNumber] = {
                text: '',
                type: 'single-choice',
                required: 'required',
                evalLevel: null,
                options: [
                    {text: '', score: '1'},
                    {text: '', score: '2'}
                ]
            };
            
            // Force expand the question details
            const details = document.getElementById('details_' + questionNumber);
            const icon = document.getElementById('expand_' + questionNumber);
            const actions = document.getElementById('actions_' + questionNumber);
            
            if (details && icon && actions) {
                // Show the details
                details.style.display = 'block';
                details.classList.add('expanded');
                icon.textContent = '▼';
                icon.classList.add('expanded');
                
                // Show action buttons
                actions.style.display = 'flex';
                
                // Add change listeners
                addChangeListeners(questionId);
                
                // Set initial button state (Save disabled for new empty question)
                setTimeout(() => {
                    checkForChanges(questionNumber);
                }, 100);
            }
        }, 50);
    }

    // Function to get evaluation level options based on schema and data source
    function getEvaluationLevelOptions(schema, selectedLevel = '') {
        if (schema === 'chat') {
            return `
                <div class="evaluation-level">
                    <label class="field-label">Evaluation Level</label>
                    <div class="evaluation-level-options">
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="overall" ${selectedLevel === 'overall' ? 'checked' : ''}>
                            <span class="radio-text">Overall (one answer)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="sbs" ${selectedLevel === 'sbs' ? 'checked' : ''}>
                            <span class="radio-text">Side-by-Side (answer for each side)</span>
                        </label>
                    </div>
                </div>
            `;
        } else if (schema === 'search') {
            return `
                <div class="evaluation-level">
                    <label class="field-label">Evaluation Level</label>
                    <div class="evaluation-level-options">
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="query-overall" ${selectedLevel === 'query-overall' ? 'checked' : ''}>
                            <span class="radio-text">Query Level Overall</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="query-sbs" ${selectedLevel === 'query-sbs' ? 'checked' : ''}>
                            <span class="radio-text">Query Level Side-by-Side</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="item-overall" ${selectedLevel === 'item-overall' ? 'checked' : ''}>
                            <span class="radio-text">Item Level Overall</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="eval_level_${questionCounter}" value="item-sbs" ${selectedLevel === 'item-sbs' ? 'checked' : ''}>
                            <span class="radio-text">Item Level Side-by-Side</span>
                        </label>
                    </div>
                </div>
            `;
        }
        return '';
    }

    // Function to update question options based on type
    function updateQuestionOptions(selectElement, questionId) {
        const questionNumber = questionId.split('_')[1];
        const optionsContainer = document.getElementById(`options_${questionNumber}`);
        const questionType = selectElement.value;
        
        if (questionType === 'text' || questionType === 'list') {
            optionsContainer.style.display = 'none';
        } else {
            optionsContainer.style.display = 'block';
        }
        
        // Update preview
        updateQuestionPreview(questionNumber);
        
        // Trigger change detection
        setTimeout(() => {
            checkForChanges(questionNumber);
        }, 10);
    }

    // Function to update question preview
    function updateQuestionPreview(questionNumber) {
        const questionElement = document.getElementById(`question_${questionNumber}`);
        const previewElement = document.getElementById(`preview_${questionNumber}`);
        
        if (!questionElement || !previewElement) return;
        
        // Get current question data
        const textInput = questionElement.querySelector('input[type="text"]');
        const typeSelect = questionElement.querySelector('.question-type');
        const optionTexts = questionElement.querySelectorAll('.option-text');
        
        const questionData = {
            text: textInput ? textInput.value : '',
            type: typeSelect ? typeSelect.value : 'single-choice',
            options: []
        };
        
        // Extract current options
        optionTexts.forEach(optionInput => {
            if (optionInput.value && optionInput.value.trim()) {
                questionData.options.push({
                    text: optionInput.value
                });
            }
        });
        
        // Update preview
        previewElement.innerHTML = generateQuestionPreview(questionData);
    }

    // Function to add option to question
    function addOption(containerId) {
        const container = document.getElementById(containerId);
        const addButton = container.querySelector('.btn-add-option');
        const optionCount = container.querySelectorAll('.option-item').length;
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.innerHTML = `
            <input type="text" class="option-text" placeholder="Option text" required>
            <input type="number" class="option-score" placeholder="Score" min="1" value="${optionCount + 1}" required>
            <button type="button" class="btn-remove-option" onclick="removeOption(this)">×</button>
        `;
        
        container.insertBefore(optionDiv, addButton);
        
        // Add change listeners to new option inputs and trigger change detection
        const newInputs = optionDiv.querySelectorAll('input');
        const questionNumber = containerId.split('_')[1];
        
        newInputs.forEach(input => {
            // Define the change handler function
            const handleInputChange = () => {
                setTimeout(() => {
                    checkForChanges(questionNumber);
                    updateQuestionPreview(questionNumber);
                }, 10);
            };
            
            // Store reference to the handler
            input._changeHandler = handleInputChange;
            
            // Add listeners
            input.addEventListener('input', handleInputChange);
            input.addEventListener('change', handleInputChange);
            input.addEventListener('keyup', handleInputChange);
        });
        
        // Trigger change detection and preview update immediately
        setTimeout(() => {
            checkForChanges(questionNumber);
            updateQuestionPreview(questionNumber);
        }, 10);
    }

    // Function to remove option from question
    function removeOption(button) {
        const optionItem = button.parentElement;
        const container = optionItem.parentElement;
        
        // Don't allow removing if only 2 options left
        if (container.querySelectorAll('.option-item').length > 2) {
            // Get question number for change detection
            const containerId = container.id;
            const questionNumber = containerId.split('_')[1];
            
            optionItem.remove();
            
            // Trigger change detection and preview update after removal
            setTimeout(() => {
                checkForChanges(questionNumber);
                updateQuestionPreview(questionNumber);
            }, 10);
        } else {
            alert('A question must have at least 2 options');
        }
    }

    // Function to remove question
    function removeQuestion(questionId) {
        const questionElement = document.getElementById(questionId);
        if (questionElement) {
            questionElement.remove();
        }
    }

    // Function to toggle additional fields
    function toggleAdditionalFields() {
        const content = document.getElementById('additionalFieldsContent');
        const icon = document.getElementById('additionalFieldsIcon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▼';
            icon.classList.add('expanded');
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
            icon.classList.remove('expanded');
        }
    }


    // Function to update question title in header
    function updateQuestionTitle(input, questionNumber) {
        const titleElement = input.closest('.quiz-question').querySelector('.question-title');
        const questionContainer = input.closest('.quiz-question');
        
        // Find the required select dropdown (it's the second select in the question config)
        const selects = questionContainer.querySelectorAll('select');
        const requiredSelect = selects[1]; // First is question type, second is required/optional
        const isRequired = requiredSelect ? requiredSelect.value === 'required' : true;
        
        const questionText = input.value || 'New Question';
        if (isRequired) {
            titleElement.innerHTML = '<span class="required">*</span>' + questionText;
        } else {
            titleElement.textContent = questionText;
        }
        
        // Update preview when question text changes
        updateQuestionPreview(questionNumber);
        
        // Trigger change detection
        setTimeout(() => {
            checkForChanges(questionNumber);
        }, 10);
    }

    // Function to update question required status
    function updateQuestionRequired(select, questionNumber) {
        const questionContainer = select.closest('.quiz-question');
        const titleElement = questionContainer.querySelector('.question-title');
        const textInput = questionContainer.querySelector('input[type="text"]');
        const questionText = textInput.value || 'New Question';
        const isRequired = select.value === 'required';
        
        if (isRequired) {
            titleElement.innerHTML = '<span class="required">*</span>' + questionText;
        } else {
            titleElement.textContent = questionText;
        }
        
        // Trigger change detection
        setTimeout(() => {
            checkForChanges(questionNumber);
        }, 10);
    }

    // Function to toggle experiment description
    function toggleExperimentDescription() {
        const section = document.getElementById('experimentDescriptionSection');
        const button = document.querySelector('.btn-add-description');
        
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.style.display = 'none';
        }
    }

    // Function to remove experiment description
    function removeExperimentDescription() {
        const section = document.getElementById('experimentDescriptionSection');
        const button = document.querySelector('.btn-add-description');
        const textarea = document.getElementById('experimentDescription');
        
        // Clear the textarea content
        textarea.value = '';
        
        // Hide the section and show the add button again
        section.style.display = 'none';
        button.style.display = 'flex';
    }

    // Function to open contact modal
    function openContactModal() {
        document.getElementById('contactModal').style.display = 'flex';
        // Prevent scrolling on background
        document.body.style.overflow = 'hidden';
    }

    // Function to close contact modal
    function closeContactModal() {
        document.getElementById('contactModal').style.display = 'none';
        // Restore scrolling
        document.body.style.overflow = 'auto';
    }

    // Close modal when clicking outside of it
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('contactModal');
        if (event.target === modal) {
            closeContactModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeContactModal();
        }
    });

    // Markdown Editor Functions
    function switchToEditor() {
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelectorAll('.tab-button')[0].classList.add('active');
        document.getElementById('judgementGuide').style.display = 'block';
        document.getElementById('markdownPreview').style.display = 'none';
    }

    function switchToPreview() {
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelectorAll('.tab-button')[1].classList.add('active');
        document.getElementById('judgementGuide').style.display = 'none';
        document.getElementById('markdownPreview').style.display = 'block';
        updatePreview();
    }

    function insertMarkdown(before, after) {
        const textarea = document.getElementById('judgementGuide');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const newText = before + selectedText + after;
        
        textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        
        // Set cursor position
        const newCursorPos = start + before.length + selectedText.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }

    function updatePreview() {
        const markdown = document.getElementById('judgementGuide').value;
        const preview = document.querySelector('.preview-content');
        
        // Simple markdown to HTML conversion
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // Code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap lists in ul tags
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // Wrap in paragraphs if not already wrapped
        if (!html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<ul>')) {
            html = '<p>' + html + '</p>';
        }
        
        preview.innerHTML = html || '<p><em>Preview will appear here...</em></p>';
    }

    // Auto-update preview when typing (debounced)
    let previewTimeout;
    const judgementGuideElement = document.getElementById('judgementGuide');
    if (judgementGuideElement) {
        judgementGuideElement.addEventListener('input', function() {
            if (document.getElementById('markdownPreview').style.display !== 'none') {
                clearTimeout(previewTimeout);
                previewTimeout = setTimeout(updatePreview, 300);
            }
        });
    }

    // Enhanced toggle function with change tracking
    function toggleQuestionDetails(questionId) {
        const questionNumber = questionId.split('_')[1];
        const details = document.getElementById('details_' + questionNumber);
        const icon = document.getElementById('expand_' + questionNumber);
        const actions = document.getElementById('actions_' + questionNumber);
        
        if (!details || !icon) {
            console.error('Could not find question elements for', questionId);
            return;
        }
        
        // Check if currently collapsed
        const isCollapsed = details.style.display === 'none' || details.style.display === '';
        
        if (isCollapsed) {
            // Expand the question
            details.style.display = 'block';
            details.classList.add('expanded');
            icon.textContent = '▼';
            icon.classList.add('expanded');
            
            // Store original values when opening (if not already stored)
            if (!originalQuestionValues[questionNumber]) {
                try {
                    storeOriginalValues(questionId);
                } catch (error) {
                    console.error('Error storing original values:', error);
                }
            }
            
            // Add change listeners
            try {
                addChangeListeners(questionId);
            } catch (error) {
                console.error('Error adding change listeners:', error);
            }
            
            // Show action buttons and check initial state
            if (actions) {
                actions.style.display = 'flex';
                setTimeout(() => {
                    checkForChanges(questionNumber);
                }, 100);
            }
            
        } else {
            // Collapse the question
            details.style.display = 'none';
            details.classList.remove('expanded');
            icon.textContent = '▶';
            icon.classList.remove('expanded');
            if (actions) actions.style.display = 'none';
        }
    }

    // Store original values when question is opened
    function storeOriginalValues(questionId) {
        const questionElement = document.getElementById(questionId);
        const questionNumber = questionId.split('_')[1];
        
        if (!questionElement) {
            console.error('Could not find question element:', questionId);
            return;
        }
        
        const textInput = questionElement.querySelector('input[type="text"]');
        const typeSelect = questionElement.querySelector('.question-type');
        const selects = questionElement.querySelectorAll('select');
        
        const originalData = {
            text: textInput ? textInput.value || '' : '',
            type: typeSelect ? typeSelect.value || 'single-choice' : 'single-choice',
            required: selects.length > 1 ? selects[1].value || 'required' : 'required',
            evalLevel: getSelectedEvaluationLevel(questionElement),
            options: []
        };
        
        // Store original options
        const optionTexts = questionElement.querySelectorAll('.option-text');
        const optionScores = questionElement.querySelectorAll('.option-score');
        
        for (let i = 0; i < optionTexts.length; i++) {
            originalData.options.push({
                text: optionTexts[i] ? optionTexts[i].value || '' : '',
                score: optionScores[i] ? optionScores[i].value || '1' : '1'
            });
        }
        
        originalQuestionValues[questionNumber] = originalData;
    }

    // Add change listeners to detect modifications
    function addChangeListeners(questionId) {
        const questionElement = document.getElementById(questionId);
        const questionNumber = questionId.split('_')[1];
        
        if (!questionElement) {
            console.error('Could not find question element for adding listeners:', questionId);
            return;
        }
        
        // Remove existing listeners to avoid duplicates
        const inputs = questionElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Remove existing listeners if any
            input.removeEventListener('input', input._changeHandler);
            input.removeEventListener('change', input._changeHandler);
            input.removeEventListener('keyup', input._changeHandler);
            
            // Define the change handler function
            const handleInputChange = () => {
                setTimeout(() => {
                    checkForChanges(questionNumber);
                    updateQuestionPreview(questionNumber);
                }, 10);
            };
            
            // Store reference to the handler for later removal
            input._changeHandler = handleInputChange;
            
            // Add listeners
            input.addEventListener('input', handleInputChange);
            input.addEventListener('change', handleInputChange);
            input.addEventListener('keyup', handleInputChange);
        });
        
        console.log('Added change listeners to question', questionNumber);
    }

    // Check if question has been modified or has content (for new questions)
    function checkForChanges(questionNumber) {
        const questionElement = document.getElementById('question_' + questionNumber);
        const actions = document.getElementById('actions_' + questionNumber);
        const saveButton = actions ? actions.querySelector('.btn-save-question') : null;
        const cancelButton = actions ? actions.querySelector('.btn-cancel-question') : null;
        const original = originalQuestionValues[questionNumber];
        
        if (!questionElement || !actions) {
            return;
        }
        
        if (!original) {
            return;
        }
        
        // Always show action buttons
        actions.style.display = 'flex';
        
        // Always enable Cancel button
        if (cancelButton) {
            cancelButton.disabled = false;
            cancelButton.style.opacity = '1';
            cancelButton.style.cursor = 'pointer';
        }
        
        // Get current values
        const textInput = questionElement.querySelector('input[type="text"]');
        const currentText = textInput ? textInput.value.trim() : '';
        
        const optionTexts = questionElement.querySelectorAll('.option-text');
        let hasOptionContent = false;
        optionTexts.forEach(input => {
            if (input.value.trim() !== '' && input.value.trim() !== 'Option text') {
                hasOptionContent = true;
            }
        });
        
        // Check if this is a new question (empty original values)
        const isNewQuestion = (original.text === '' && original.options.every(opt => opt.text === '' || opt.text === 'Option text'));
        
        let shouldEnableSave = false;
        
        if (isNewQuestion) {
            // New question: enable only if user has written meaningful content
            // Check if question text is not empty
            const hasQuestionText = currentText !== '';
            
            // Check if at least one option has meaningful content (not just placeholder)
            let hasValidOptions = false;
            optionTexts.forEach(input => {
                const value = input.value.trim();
                if (value !== '' && value !== 'Option text') {
                    hasValidOptions = true;
                }
            });
            
            // For choice-type questions, require both question text and at least one valid option
            const typeSelect = questionElement.querySelector('.question-type');
            const questionType = typeSelect ? typeSelect.value : 'single-choice';
            
            if (questionType === 'text' || questionType === 'list') {
                // For text/list questions, only require question text
                shouldEnableSave = hasQuestionText;
            } else {
                // For choice questions, require both question text and valid options
                shouldEnableSave = hasQuestionText && hasValidOptions;
            }
        } else {
            // Existing question: enable if there are changes
            const typeSelect = questionElement.querySelector('.question-type');
            const selects = questionElement.querySelectorAll('select');
            
            const current = {
                text: currentText,
                type: typeSelect ? typeSelect.value : 'single-choice',
                required: selects.length > 1 ? selects[1].value : 'required',
                evalLevel: getSelectedEvaluationLevel(questionElement),
                options: []
            };
            
            // Get current options
            const optionScores = questionElement.querySelectorAll('.option-score');
            for (let i = 0; i < optionTexts.length; i++) {
                current.options.push({
                    text: optionTexts[i] ? optionTexts[i].value.trim() : '',
                    score: optionScores[i] ? optionScores[i].value : '1'
                });
            }
            
            // Check for changes
            shouldEnableSave = (
                current.text !== original.text ||
                current.type !== original.type ||
                current.required !== original.required ||
                current.evalLevel !== original.evalLevel ||
                JSON.stringify(current.options) !== JSON.stringify(original.options)
            );
        }
        
        // Set Save button state
        if (saveButton) {
            if (shouldEnableSave) {
                saveButton.disabled = false;
                saveButton.style.opacity = '1';
                saveButton.style.cursor = 'pointer';
                saveButton.style.backgroundColor = '';
            } else {
                saveButton.disabled = true;
                saveButton.style.opacity = '0.5';
                saveButton.style.cursor = 'not-allowed';
                saveButton.style.backgroundColor = '#e2e8f0';
            }
        }
    }

    // Save question changes
    function saveQuestionChanges(questionId) {
        const questionNumber = questionId.split('_')[1];
        const questionElement = document.getElementById(questionId);
        
        // Update the question title in the header
        const titleInput = questionElement.querySelector('input[type="text"]');
        updateQuestionTitle(titleInput, questionNumber);
        
        // Hide actions and collapse
        const actions = document.getElementById('actions_' + questionNumber);
        actions.style.display = 'none';
        
        // Store new values as original
        storeOriginalValues(questionId);
        
        // Collapse question
        toggleQuestionDetails(questionId);
    }

    // Cancel question changes
    function cancelQuestionChanges(questionId) {
        const questionNumber = questionId.split('_')[1];
        const questionElement = document.getElementById(questionId);
        const original = originalQuestionValues[questionNumber];
        
        if (!original) return;
        
        // Restore original values
        questionElement.querySelector('input[type="text"]').value = original.text;
        questionElement.querySelector('.question-type').value = original.type;
        questionElement.querySelectorAll('select')[1].value = original.required;
        
        // Restore evaluation level
        if (original.evalLevel) {
            const evalRadio = questionElement.querySelector(`input[name^="eval_level_"][value="${original.evalLevel}"]`);
            if (evalRadio) {
                evalRadio.checked = true;
            }
        }
        
        // Restore original options
        const optionsContainer = questionElement.querySelector('.question-options');
        const addButton = optionsContainer.querySelector('.btn-add-option');
        
        // Clear existing options
        const existingOptions = optionsContainer.querySelectorAll('.option-item');
        existingOptions.forEach(option => option.remove());
        
        // Recreate original options
        original.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.innerHTML = `
                <input type="text" class="option-text" value="${option.text}" required>
                <input type="number" class="option-score" value="${option.score}" min="1" required>
                <button type="button" class="btn-remove-option" onclick="removeOption(this)">×</button>
            `;
            optionsContainer.insertBefore(optionDiv, addButton);
        });
        
        // Update title
        updateQuestionTitle(questionElement.querySelector('input[type="text"]'), questionNumber);
        
        // Hide actions and collapse
        const actions = document.getElementById('actions_' + questionNumber);
        actions.style.display = 'none';
        
        // Collapse question
        toggleQuestionDetails(questionId);
    }

    // Helper function to get selected evaluation level
    function getSelectedEvaluationLevel(questionElement) {
        const evalRadios = questionElement.querySelectorAll('input[name^="eval_level_"]');
        for (let radio of evalRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return null;
    }

    // Toggle between UI and Raw JSON modes
    function toggleRawCodeMode() {
        const toggle = document.getElementById('rawCodeToggle');
        const uiMode = document.getElementById('uiMode');
        const jsonMode = document.getElementById('jsonMode');
        const jsonEditor = document.getElementById('questionsJsonEditor');
        
        if (toggle.checked) {
            // Switch to JSON mode
            const questionsData = extractQuestionsFromUI();
            const jsonString = JSON.stringify(questionsData, null, 2);
            jsonEditor.value = jsonString;
            // Store original JSON to detect changes later
            jsonEditor.setAttribute('data-original', jsonString);
            uiMode.style.display = 'none';
            jsonMode.style.display = 'block';
        } else {
            // Switch to UI mode
            const jsonText = jsonEditor.value.trim();
            
            // If JSON editor is empty or unchanged, just switch back without modifying UI
            if (jsonText === '' || jsonText === jsonEditor.getAttribute('data-original')) {
                uiMode.style.display = 'block';
                jsonMode.style.display = 'none';
                clearValidationMessage();
                return;
            }
            
            // Only try to parse and reload if JSON has been modified
            try {
                const jsonData = JSON.parse(jsonText);
                loadQuestionsToUI(jsonData);
                clearValidationMessage();
            } catch (error) {
                console.error('JSON Parse Error:', error);
                console.error('JSON Content:', jsonEditor.value);
                showValidationMessage(`JSON Parse Error: ${error.message}`, 'error');
                // Force switch back to UI mode without changing questions
                uiMode.style.display = 'block';
                jsonMode.style.display = 'none';
                toggle.checked = false;
                clearValidationMessage();
                return;
            }
            
            uiMode.style.display = 'block';
            jsonMode.style.display = 'none';
        }
    }

    // Extract questions data from UI
    function extractQuestionsFromUI() {
        const questions = [];
        const questionElements = document.querySelectorAll('.quiz-question');
        
        questionElements.forEach((element, index) => {
            try {
                const textInput = element.querySelector('input[type="text"]');
                const typeSelect = element.querySelector('.question-type');
                const selects = element.querySelectorAll('select');
                
                const questionData = {
                    id: index + 1,
                    text: textInput ? textInput.value || '' : '',
                    type: typeSelect ? typeSelect.value : 'single-choice',
                    required: selects.length > 1 ? selects[1].value === 'required' : true,
                    evaluationLevel: getSelectedEvaluationLevel(element),
                    options: []
                };
                
                // Extract options
                const optionTexts = element.querySelectorAll('.option-text');
                const optionScores = element.querySelectorAll('.option-score');
                
                for (let i = 0; i < optionTexts.length; i++) {
                    if (optionTexts[i] && optionTexts[i].value && optionTexts[i].value.trim()) {
                        const score = optionScores[i] ? parseInt(optionScores[i].value) || 1 : 1;
                        questionData.options.push({
                            text: optionTexts[i].value,
                            score: score
                        });
                    }
                }
                
                questions.push(questionData);
            } catch (error) {
                console.error('Error extracting question data:', error, element);
                // Skip this question if there's an error
            }
        });
        
        return {
            questions: questions,
            schema: "judgement_questions_v1",
            metadata: {
                createdAt: new Date().toISOString(),
                totalQuestions: questions.length
            }
        };
    }

    // Load questions from JSON to UI
    function loadQuestionsToUI(jsonData) {
        // Clear existing questions
        const container = document.getElementById('quizQuestions');
        container.innerHTML = '';
        questionCounter = 0;
        originalQuestionValues = {};
        
        if (jsonData.questions && Array.isArray(jsonData.questions)) {
            jsonData.questions.forEach(questionData => {
                // Convert JSON format to internal format
                const internalFormat = {
                    text: questionData.text || '',
                    type: questionData.type || 'single-choice',
                    required: questionData.required !== false,
                    evalLevel: questionData.evaluationLevel || null,
                    options: questionData.options || []
                };
                
                addDefaultQuestion(internalFormat);
            });
        }
    }

    // Format JSON in the editor
    function formatJSON() {
        const editor = document.getElementById('questionsJsonEditor');
        try {
            const parsed = JSON.parse(editor.value);
            editor.value = JSON.stringify(parsed, null, 2);
            showValidationMessage('JSON formatted successfully', 'success');
        } catch (error) {
            showValidationMessage('Invalid JSON format. Cannot format.', 'error');
        }
    }

    // Validate JSON in the editor
    function validateJSON() {
        const editor = document.getElementById('questionsJsonEditor');
        try {
            const parsed = JSON.parse(editor.value);
            
            // Basic validation
            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new Error('JSON must contain a "questions" array');
            }
            
            // Validate each question
            parsed.questions.forEach((q, index) => {
                if (!q.text || typeof q.text !== 'string') {
                    throw new Error(`Question ${index + 1}: text is required and must be a string`);
                }
                if (!q.type || !['single-choice', 'multiple-choice', 'text', 'list', 'toggle'].includes(q.type)) {
                    throw new Error(`Question ${index + 1}: invalid question type`);
                }
            });
            
            showValidationMessage('JSON is valid!', 'success');
        } catch (error) {
            showValidationMessage(`Validation error: ${error.message}`, 'error');
        }
    }

    // Show validation message
    function showValidationMessage(message, type) {
        const messageElement = document.getElementById('jsonValidationMessage');
        messageElement.textContent = message;
        messageElement.className = `json-validation-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }

    // Clear validation message
    function clearValidationMessage() {
        const messageElement = document.getElementById('jsonValidationMessage');
        messageElement.style.display = 'none';
    }