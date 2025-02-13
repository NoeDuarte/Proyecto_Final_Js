let cartContainer = document.getElementById("cart-section")
let totalContainer = document.getElementById("total-container")
let finalizarCompraBtn = document.getElementById("finalizar-compra")

// Obtener productos del LocalStorage
let cartStorage = JSON.parse(localStorage.getItem("cartProducts")) || []

function renderCarrito(cartItems) {
    cartContainer.innerHTML = "" // Limpiar contenido previo

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>🛒 El carrito está vacío</p>"
        totalContainer.innerHTML = ""
        return
    }

    cartItems.forEach((producto, index) => {
        const cartItem = document.createElement("div")
        cartItem.classList.add("cart-item")
        cartItem.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button class="eliminar-producto" data-index="${index}">Eliminar</button>
        `
        cartContainer.appendChild(cartItem)
    })

    // Mostrar total
    calcularTotal()

    // Agregar eventos a los botones de eliminar
    addRemoveEvent()
}

// Función para calcular el total del carrito
function calcularTotal() {
    let total = cartStorage.reduce((acc, producto) => acc + producto.precio, 0)
    totalContainer.innerHTML = `<h3>Total: $${total}</h3>`
}

// Función para eliminar productos del carrito
function addRemoveEvent() {
    let eliminarButtons = document.querySelectorAll(".eliminar-producto")
    eliminarButtons.forEach(button => {
        button.onclick = (e) => {
            let index = e.currentTarget.dataset.index
            cartStorage.splice(index, 1) // Elimina el producto del array
            localStorage.setItem("cartProducts", JSON.stringify(cartStorage)) // Actualiza el LocalStorage
            renderCarrito(cartStorage) // Re-renderiza el carrito

            // Notificación con SweetAlert
            Swal.fire({
                icon: "success",
                title: "Producto eliminado",
                text: "El producto ha sido eliminado del carrito",
                timer: 1500,
                showConfirmButton: false
            })
        }
    })
}

// Evento para finalizar compra
finalizarCompraBtn.onclick = () => {
    if (cartStorage.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Agrega productos antes de finalizar la compra",
        })
        return
    }

    Swal.fire({
        title: "Completa tus datos",
        html: `
            <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
            <input type="email" id="email" class="swal2-input" placeholder="Email">
            <select id="pago" class="swal2-select">
                <option value="tarjeta">Tarjeta de Crédito</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="efectivo">Efectivo</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: "Finalizar Compra",
        preConfirm: () => {
            const nombre = document.getElementById("nombre").value
            const email = document.getElementById("email").value
            const metodoPago = document.getElementById("pago").value

            if (!nombre || !email) {
                Swal.showValidationMessage("Todos los campos son obligatorios")
                return false
            }

            return { nombre, email, metodoPago }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Generar comprobante de compra
            generarComprobante(result.value)
        }
    })
}

// Función para generar el comprobante de compra
function generarComprobante(datos) {
    Swal.fire({
        icon: "success",
        title: "Compra realizada",
        html: `
            <p>Gracias, ${datos.nombre}!</p>
            <p>Se ha enviado el comprobante a <b>${datos.email}</b></p>
            <p>Método de pago: <b>${datos.metodoPago}</b></p>
        `,
        confirmButtonText: "Aceptar"
    })

    // Vaciar carrito después de la compra
    cartStorage = []
    localStorage.removeItem("cartProducts")
    renderCarrito(cartStorage)
}

// Renderizar carrito al cargar la página
renderCarrito(cartStorage)
