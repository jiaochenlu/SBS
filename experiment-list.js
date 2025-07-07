document.addEventListener("DOMContentLoaded", () => {
    const experimentList = document.getElementById("experiment-list");

    // Fetch experiment data from the configuration file
    console.log('📡 Fetching merged configuration from: experiment-config-merged.json');
    fetch("experiment-config-merged.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Successfully fetched experiment data:', data);
            const experiments = data.experiments;
            
            if (!Array.isArray(experiments)) {
                console.error('❌ Experiments data is not an array:', experiments);
                return;
            }
            
            console.log('🔍 Experiments to display:', experiments.map(exp => exp.id));

            // Populate the table with experiment data
            experiments.forEach((experiment, index) => {
                if (!experiment || typeof experiment.id === 'undefined') {
                    console.error(`❌ Invalid experiment at index ${index}:`, experiment);
                    return;
                }
            
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><a href="experiment-detail.html?id=${experiment.id}">${experiment.name}</a></td>
                    <td>${experiment.owner.name}</td>
                    <td>${experiment.configuration.dataSource}</td>
                    <td>${experiment.configuration.querySetSelection}</td>
                    <td>${experiment.members && Array.isArray(experiment.members) ? experiment.members.length : 0} Members</td>
                    <td>${experiment.createdAt}</td>
                    <td>${
                        experiment.progress.completedPercentage === 100
                            ? "Completed"
                            : experiment.progress.inProgress > 0
                            ? "In progress"
                            : "Not started"
                    }</td>
                `;
                experimentList.appendChild(row);
                console.log(`✅ Successfully added experiment: ${experiment.id}`);
            });
            console.log('✅ All experiments have been successfully added to the list.');
        })
        .catch(error => console.error("Error loading experiment data:", error));
});