document.addEventListener("DOMContentLoaded", () => {
  fetch("/users", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("user-list");
      container.innerHTML = "";

      data.forEach((user) => {
        const card = document.createElement("div");
        card.className = "user-card";

        const name = document.createElement("h3");
        name.textContent = user.name;
        card.appendChild(name);

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit";
        editButton.addEventListener("click", () => openEditModal(user));
        buttonGroup.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", () => deleteUser(user.id));
        buttonGroup.appendChild(deleteButton);

        card.appendChild(buttonGroup);

        container.appendChild(card);
      });
    });

  function openEditModal(user) {
    document.getElementById("edit-name").value = user.name;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-role").value = user.role;
    document.getElementById("edit-id").value = user.id;
    document.getElementById("edit-modal").style.display = "block";
  }

  document.getElementById("close-edit-modal").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
  });

  document.getElementById("edit-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("edit-id").value;
    const updatedUser = {
      name: document.getElementById("edit-name").value,
      email: document.getElementById("edit-email").value,
      role: document.getElementById("edit-role").value,
    };

    fetch(`/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then(() => {
        document.getElementById("edit-modal").style.display = "none";
        location.reload();
      });
  });

  function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
      fetch(`/users/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          location.reload();
        });
    }
  }
});

fetch("/auth/status", { method: "GET", credentials: "include" })
  .then((res) => res.json())
  .then((data) => {
    if (!data.loggedIn || data.role !== "admin") {
      window.location.href = "index.html";
    }
  })
  .catch(() => {
    window.location.href = "index.html";
  });
