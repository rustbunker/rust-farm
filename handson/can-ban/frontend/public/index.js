import init, {WorkItemManager} from './pkg/can_ban.js';

async function run() {
    await init();

    const form = document.getElementById("formNewWorkItem");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("inputTitle").value;
        const duration = document.getElementById("inputDuration").value;
        const durationType = document.getElementById("inputDurationType").value;
        const size = document.getElementById("inputSize").value;

        const manager = WorkItemManager.new();
        manager.create(title, duration, durationType, size)
            .then(payload => {
                const workItem = JSON.parse(payload);
                console.log("A new work item was successfully created!" + payload);
                addWorkItemToInProgress(workItem);
                form.reset();
                showAlert("A new work item was successfully created!", "success");
            })
            .catch(error => {
                console.log("API call failed");
                showAlert("Failed to create a new work item. Reason is '" + error + "'", "danger");
            });
    });

}

function addWorkItemToInProgress(workItem) {
    const divInProgress = document.getElementById("divTodo");
    const card = document.createElement("div");
    card.className = "card mb-3 bg-post-it-yellow";
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    cardBody.innerHTML = `
        <h5 class="card-title">${workItem.title}</h5>
        <p class="card-text">Duration: ${workItem.duration} ${workItem.duration_type}</p>
        <p class="card-text">Size: ${workItem.size}</p>
    `;
    card.appendChild(cardBody);

    divInProgress.appendChild(card);
}

function showAlert(message, type) {
    const alertPlaceholder = document.getElementById("alertPlaceholder");
    const alert = document.createElement("div");
    alert.className = "alert alert-${type} alert-dismissible fade show";
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"></button>
    `;
    alertPlaceholder.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

run();