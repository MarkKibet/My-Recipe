document.addEventListener("DOMContentLoaded", () => {
    let recipes = [];

    // Fetch initial data from the JSON Server
    fetch('http://localhost:3000/recipes')
        .then(response => response.json())
        .then(data => {
            recipes = data;
            recipes.forEach(recipe => renderRecipe(recipe));
        })
        .catch(error => {
            console.error('Error fetching the recipes:', error);
        });

    // Show/Hide Recipe Form
    const addRecipeButton = document.getElementById('addRecipeButton');
    const recipeFormContainer = document.getElementById('recipeFormContainer');
    const closeFormButton = document.getElementById('closeFormButton');

    addRecipeButton.addEventListener('click', () => {
        recipeFormContainer.style.display = 'block';
        document.getElementById('recipeForm').reset(); // Clear the form
    });

    closeFormButton.addEventListener('click', () => {
        recipeFormContainer.style.display = 'none';
    });

    // Handle Recipe Form Submission for adding new recipes
    const recipeForm = document.getElementById('recipeForm');
    recipeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newRecipe = {
            id: `card${Date.now()}`, // Unique ID based on timestamp
            recipeName: document.getElementById('recipeName').value,
            recipeImage: document.getElementById('recipeImage').value,
            modalId: `myModal${Date.now()}`,
            modalClass: 'custom-modal', // You can customize the class as needed
            modalImage: document.getElementById('modalImage').value,
            ingredients: document.getElementById('ingredients').value.split('\n'),
            steps: document.getElementById('steps').value.split('\n')
        };

        // Add new recipe to JSON Server
        fetch('http://localhost:3000/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRecipe)
        })
        .then(response => response.json())
        .then(data => {
            recipes.push(data);
            renderRecipe(data);
            recipeFormContainer.style.display = 'none';
        })
        .catch(error => {
            console.error('Error adding the recipe:', error);
        });
    });

    // Handle Remove Recipe button
    const removeRecipeButton = document.getElementById('removeRecipeButton');
    removeRecipeButton.addEventListener('click', () => {
        const recipeName = prompt("Enter the name of the recipe you want to remove:");
        if (recipeName) {
            const recipeCard = Array.from(document.getElementsByClassName("card")).find(card => {
                return card.querySelector(".card-title").textContent === recipeName;
            });
            if (recipeCard) {
                const recipeId = recipeCard.id;
                const modalId = recipeCard.id.replace("card", "myModal");

                // Remove recipe from JSON Server
                fetch(`http://localhost:3000/recipes/${recipeId}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    recipeCard.remove();
                    document.getElementById(modalId).remove();

                    // Update recipes array
                    recipes = recipes.filter(recipe => recipe.id !== recipeId);
                })
                .catch(error => {
                    console.error('Error removing the recipe:', error);
                });
            } else {
                alert("Recipe not found.");
            }
        }
    });

    // Handle Edit Recipe button
    const editRecipeButton = document.getElementById('editRecipeButton');
    editRecipeButton.addEventListener('click', () => {
        const recipeName = prompt("Enter the name of the recipe you want to edit:");
        if (recipeName) {
            const recipeCard = Array.from(document.getElementsByClassName("card")).find(card => {
                return card.querySelector(".card-title").textContent === recipeName;
            });
            if (recipeCard) {
                const recipeId = recipeCard.id;
                const recipe = recipes.find(r => r.id === recipeId);
                document.getElementById('recipeName').value = recipe.recipeName;
                document.getElementById('recipeImage').value = recipe.recipeImage;
                document.getElementById('modalImage').value = recipe.modalImage;
                document.getElementById('ingredients').value = recipe.ingredients.join('\n');
                document.getElementById('steps').value = recipe.steps.join('\n');
                recipeFormContainer.style.display = 'block';

                // Handle Recipe Form Submission for editing
                recipeForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    recipe.recipeName = document.getElementById('recipeName').value;
                    recipe.recipeImage = document.getElementById('recipeImage').value;
                    recipe.modalImage = document.getElementById('modalImage').value;
                    recipe.ingredients = document.getElementById('ingredients').value.split('\n');
                    recipe.steps = document.getElementById('steps').value.split('\n');

                    // Update recipe on JSON Server
                    fetch(`http://localhost:3000/recipes/${recipeId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(recipe)
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Update the UI
                        recipeCard.querySelector(".card-title").textContent = data.recipeName;
                        recipeCard.querySelector(".card-img-top").src = data.recipeImage;
                        const modal = document.getElementById(data.modalId);
                        modal.querySelector("h1").textContent = data.recipeName;
                        modal.querySelector(".image-container img").src = data.modalImage;
                        modal.querySelector("ul").innerHTML = data.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
                        modal.querySelector("ol").innerHTML = data.steps.map(step => `<li>${step}</li>`).join('');

                        // Update recipes array
                        recipes = recipes.map(r => r.id === data.id ? data : r);
                        recipeFormContainer.style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error updating the recipe:', error);
                    });
                }, { once: true });
            } else {
                alert("Recipe not found.");
            }
        }
    });

    // Function to create bubbles
    function createBubble() {
        const bubbleContainer = document.getElementById('bubble-container');
        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 60 + 20; // Random size between 20px and 80px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`; // Random horizontal position

        bubbleContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.remove(); 
        }, 20000); 
    }

    // Generate bubbles continuously
    setInterval(createBubble, 500); // Adjust the interval as needed
});

function renderRecipe(recipe) {
    const recipeCardsContainer = document.getElementById("recipeCardsContainer");
    const modalsContainer = document.getElementById("modalsContainer");

    // Create the card element
    let recipeCard = document.createElement("div");
    recipeCard.classList.add("col-md-3");
    recipeCard.innerHTML = `
        <div class="card" id="${recipe.id}">
            <img src="${recipe.recipeImage}" class="card-img-top clickable" alt="${recipe.recipeName}">
            <div class="card-body">
                <h5 class="card-title">${recipe.recipeName}</h5>
                <button class="btn btn-primary read-more">Read More</button>
                <button class="btn btn-danger remove-recipe">Remove</button>
            </div>
        </div>
    `;
    recipeCardsContainer.appendChild(recipeCard);

    // Create the modal element
    let modal = document.createElement("div");
    modal.classList.add("modal", recipe.modalClass);
    modal.id = recipe.modalId;
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h1>${recipe.recipeName}</h1>
            <div class="image-container">
                <img src="${recipe.modalImage}" alt="${recipe.recipeName}">
            </div>
            <h2>Ingredients</h2>
            <ul>
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <h2>Step By Step Procedure</h2>
            <ol>
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `;
    modalsContainer.appendChild(modal);

    // Add event listeners for opening the modal
    const openModalBtns = document.querySelectorAll(`#${recipe.id} .clickable, #${recipe.id} .read-more`);
    openModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById(recipe.modalId).style.display = "block";
        });
    });

       // Add event listener for closing the modal
       const closeModalBtn = modal.querySelector(".close");
       closeModalBtn.addEventListener("click", () => {
           modal.style.display = "none";
       });
   
       // Add event listener for closing the modal when clicking outside of it
       window.addEventListener("click", (event) => {
           if (event.target == modal) {
               modal.style.display = "none";
           }
       });
   
       // Add event listener for removing the recipe
       const removeRecipeBtn = recipeCard.querySelector(".remove-recipe");
       removeRecipeBtn.addEventListener("click", () => {
           recipeCard.remove();
           modal.remove();
   
           // Update recipes in local storage
           fetch(`http://localhost:3000/recipes/${recipe.id}`, {
               method: 'DELETE'
           })
           .then(() => {
               recipes = recipes.filter(r => r.id !== recipe.id);
               localStorage.setItem('recipes', JSON.stringify(recipes));
           })
           .catch(error => {
               console.error('Error removing the recipe:', error);
           });
       });
   }
   