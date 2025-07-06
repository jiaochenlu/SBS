document.addEventListener("DOMContentLoaded", () => {
    const experimentList = document.getElementById("experiment-list");

    // Fetch experiment data from the configuration file
    fetch("experiment-detail-config.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const experiment = data.experiment;

            // Populate the table with experiment data
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><a href="experiment-detail.html?id=${experiment.id}">${experiment.name}</a></td>
                <td>${experiment.owner.name}</td>
                <td>${experiment.members && Array.isArray(experiment.members) ? experiment.members.length : 0} Members</td>
                <td>${experiment.createdAt}</td>
                <td>${experiment.status}</td>
            `;

            experimentList.appendChild(row);
        })
        .catch(error => console.error("Error loading experiment data:", error));
});