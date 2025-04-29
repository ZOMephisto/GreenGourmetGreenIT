document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const container = document.getElementById("recipe-list");

  let allRecipes = [];

  function fetchAndDisplayRecipes() {
    fetch("/recipes")
      .then((res) => res.json())
      .then((data) => {
        allRecipes = data;
        displayRecipes(allRecipes);
      });
  }

  function displayRecipes(recipes) {
    container.innerHTML = "";

    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      card.innerHTML = `
        <h3>${recipe.name}</h3>
      `;

      card.addEventListener("click", () => openModal(recipe));
      container.appendChild(card);
    });
  }

  searchBar.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();

    const filteredRecipes = allRecipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        )
      );
    });

    displayRecipes(filteredRecipes);
  });

  function openModal(recipe) {
    document.getElementById("modal-title").textContent = recipe.name;
    document.getElementById("modal-alcoholic").textContent = recipe.alcoholic;
    document.getElementById("modal-category").textContent = recipe.category;
    document.getElementById("modal-instructions").textContent =
      recipe.instructions;
    document.getElementById("modal-ingredients").textContent =
      recipe.ingredients.join(", ");

    const thumbnail = document.getElementById("modal-thumbnail");
    if (recipe.drinkthumbnail) {
      thumbnail.src = recipe.drinkthumbnail;
      thumbnail.loading = "lazy";
      thumbnail.style.display = "block";
    } else {
      thumbnail.style.display = "none";
    }

    document.getElementById("recipe-modal").style.display = "block";
  }

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("recipe-modal").style.display = "none";
  });

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("recipe-modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  fetchAndDisplayRecipes();
});
