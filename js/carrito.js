let cartContainer = document.getElementById("cart-section");
let totalContainer = document.getElementById("total-container");
let finalizarCompraBtn = document.getElementById("finalizar-compra");

// Obtener productos del LocalStorage
let cartStorage = JSON.parse(localStorage.getItem("cartProducts")) || [];

function renderCarrito(cartItems) {
    cartContainer.innerHTML = ""; // Limpiar contenido previo

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>🛒 El carrito está vacío</p>";
        totalContainer.innerHTML = "";
        return;
    }

    cartItems.forEach((producto, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button class="eliminar-producto" data-index="${index}">Eliminar</button>
        `;
        cartContainer.appendChild(cartItem);
    });

    // Mostrar total
    calcularTotal();

    // Agregar eventos a los botones de eliminar
    addRemoveEvent();
}

// Función para calcular el total del carrito
function calcularTotal() {
    let total = cartStorage.reduce((acc, producto) => acc + producto.precio, 0);
    totalContainer.innerHTML = `<h3>Total: $${total}</h3>`;
    return total;
}

// Función para eliminar productos del carrito
function addRemoveEvent() {
    let eliminarButtons = document.querySelectorAll(".eliminar-producto");
    eliminarButtons.forEach(button => {
        button.onclick = (e) => {
            let index = e.currentTarget.dataset.index;
            cartStorage.splice(index, 1); // Elimina el producto del array
            localStorage.setItem("cartProducts", JSON.stringify(cartStorage)); // Actualiza el LocalStorage
            renderCarrito(cartStorage); // Re-renderiza el carrito

            // Notificación con SweetAlert
            Swal.fire({
                icon: "success",
                title: "Producto eliminado",
                text: "El producto ha sido eliminado del carrito",
                timer: 1500,
                showConfirmButton: false
            });
        };
    });
}

// Evento para finalizar compra
finalizarCompraBtn.onclick = () => {
    if (cartStorage.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Agrega productos antes de finalizar la compra",
        });
        return;
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
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const metodoPago = document.getElementById("pago").value;

            if (!nombre || !email) {
                Swal.showValidationMessage("Todos los campos son obligatorios");
                return false;
            }

            return { nombre, email, metodoPago };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Generar comprobante de compra
            generarComprobante(result.value);
        }
    });
};

// Función para generar el comprobante de compra
function generarComprobante(datos) {
    // Crear el contenido del comprobante
    const comprobanteContent = `
        <h1>Comprobante de Compra</h1>
        <p><b>Nombre:</b> ${datos.nombre}</p>
        <p><b>Email:</b> ${datos.email}</p>
        <p><b>Método de pago:</b> ${datos.metodoPago}</p>
        <h2>Productos comprados:</h2>
        <ul>
            ${cartStorage.map(producto => `<li>${producto.nombre} - $${producto.precio}</li>`).join('')}
        </ul>
        <h3>Total: $${calcularTotal()}</h3>
    `;

    // Mostrar el comprobante en SweetAlert
    Swal.fire({
        icon: "success",
        title: "Compra realizada",
        html: comprobanteContent,
        confirmButtonText: "Aceptar"
    });

    // Generar PDF
    generarPDF(datos);

    // Vaciar carrito después de la compra
    cartStorage = [];
    localStorage.removeItem("cartProducts");
    renderCarrito(cartStorage);
}

// Función para generar el PDF
function generarPDF(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Agregar contenido al PDF
    doc.text("Comprobante de Compra", 10, 10);
    doc.text(`Nombre: ${datos.nombre}`, 10, 20);
    doc.text(`Email: ${datos.email}`, 10, 30);
    doc.text(`Método de pago: ${datos.metodoPago}`, 10, 40);
    doc.text("Productos comprados:", 10, 50);

    let yPosition = 60;
    cartStorage.forEach(producto => {
        doc.text(`${producto.nombre} - $${producto.precio}`, 10, yPosition);
        yPosition += 10;
    });

    doc.text(`Total: $${calcularTotal()}`, 10, yPosition + 10);

    // Guardar el PDF
    doc.save("comprobante.pdf");
}

// Renderizar carrito al cargar la página
renderCarrito(cartStorage);