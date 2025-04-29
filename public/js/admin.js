document.addEventListener("DOMContentLoaded", () => {
  fetch("/recipes")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("recipe-list");
      container.innerHTML = "";

      data.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const title = document.createElement("h3");
        title.textContent = recipe.name;
        card.appendChild(title);

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit";
        editButton.addEventListener("click", () => openEditModal(recipe));
        buttonGroup.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete ";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", () => deleteRecipe(recipe.id));
        buttonGroup.appendChild(deleteButton);

        card.appendChild(buttonGroup);

        container.appendChild(card);
      });
    });

  function openEditModal(recipe) {
    document.getElementById("edit-name").value = recipe.name;
    document.getElementById("edit-alcoholic").value = recipe.alcoholic;
    document.getElementById("edit-category").value = recipe.category;
    document.getElementById("edit-instructions").value = recipe.instructions;
    document.getElementById("edit-ingredients").value =
      recipe.ingredients.join(", ");
    document.getElementById("edit-drinkThumbnail").value =
      recipe.drinkthumbnail;
    document.getElementById("edit-id").value = recipe.id;
    document.getElementById("edit-modal").style.display = "block";
  }

  document.getElementById("close-edit-modal").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
  });

  document.getElementById("edit-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("edit-id").value;
    const updatedRecipe = {
      name: document.getElementById("edit-name").value,
      alcoholic: document.getElementById("edit-alcoholic").value,
      category: document.getElementById("edit-category").value,
      instructions: document.getElementById("edit-instructions").value,
      drinkThumbnail: document.getElementById("edit-drinkThumbnail").value,
      ingredients: document
        .getElementById("edit-ingredients")
        .value.split(",")
        .map((ing) => ing.trim()),
    };

    fetch(`/recipes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRecipe),
    })
      .then((res) => res.json())
      .then(() => {
        document.getElementById("edit-modal").style.display = "none";
        location.reload();
      });
  });

  function deleteRecipe(id) {
    if (confirm("Are you sure you want to delete this recipe?")) {
      fetch(`/recipes/${id}`, { method: "DELETE" })
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

document
  .getElementById("recipe-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const recipe = {
      name: form.name.value.trim(),
      alcoholic: form.alcoholic.value,
      category: form.category.value.trim(),
      instructions: form.instructions.value.trim(),
      drinkThumbnail: form.drinkThumbnail.value.trim(),
      ingredients: form.ingredients.value.split(",").map((ing) => ing.trim()),
    };

    const res = await fetch("/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });

    const msg = await res.json();
    document.getElementById("status").textContent =
      msg.message || "Error adding recipe.";
    form.reset();
  });
