// Cargar productos desde un archivo JSON con fetch
fetch("db/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data
        renderProductos(productos)
    })
    .catch(error => console.error("Error cargando los productos:", error))

let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || []
const productsContainer = document.getElementById("products-container")

// Función para renderizar productos en el DOM
function renderProductos(productsArray) {
    productsContainer.innerHTML = "" // Limpiar antes de renderizar
    productsArray.forEach((producto) => {
        const card = document.createElement("div")
        card.classList.add("producto-card") // Agregar clase CSS
        card.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button class="productoAgregar" data-id="${producto.id}">Agregar al carrito</button>
        `
        productsContainer.appendChild(card)
    })
    addToCartButton()
}

// Función para agregar eventos a los botones "Agregar"
function addToCartButton() {
    const addButton = document.querySelectorAll(".productoAgregar")
    addButton.forEach(button => {
        button.onclick = (e) => {
            const productId = e.currentTarget.dataset.id
            const selectedProduct = productos.find(producto => producto.id == productId)
            cartProducts.push(selectedProduct)

            // Guardar en localStorage
            localStorage.setItem("cartProducts", JSON.stringify(cartProducts))

            // Notificación con Toastify
            Toastify({
                text: `🛒 ${selectedProduct.nombre} agregado al carrito`,
                duration: 2000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#4CAF50",
            }).showToast()
        }
    })
}
