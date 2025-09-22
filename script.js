// Datos de productos
const productos = [
    { id: 1, nombre: 'Destilado Relax', precio: 50000 },
    { id: 2, nombre: 'Destilado Energía', precio: 50000 },
    { id: 3, nombre: 'Destilado Sueño', precio: 60000 },
    { id: 4, nombre: 'Extracto WAX', precio: 60000, stock: 10 },
    { id: 5, nombre: 'Wax Mix Flower Al 99.9%', precio: 70000, stock: 5 }
];

// Carrito
let carrito = [];

// Cargar ventas desde localStorage
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];

// Event delegation para agregar al carrito
document.querySelector('.productos-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('agregar-carrito')) {
        const id = parseInt(e.target.parentElement.dataset.id);
        const cantidad = parseInt(e.target.parentElement.querySelector('.cantidad').value);
        const sabor = e.target.parentElement.querySelector('.sabor').value;
        const producto = productos.find(p => p.id === id);
        const itemExistente = carrito.find(item => item.producto.id === id && item.sabor === sabor);
        const totalCantidad = (itemExistente ? itemExistente.cantidad : 0) + cantidad;
        if (producto.stock && totalCantidad > producto.stock) {
            alert(`Stock limitado. Solo quedan ${producto.stock} unidades disponibles.`);
            return;
        }
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            carrito.push({ producto, cantidad, sabor });
        }
        // Restar del stock
        producto.stock -= cantidad;
        actualizarCarrito();
        document.getElementById('carrito-modal').style.display = 'block';
        alert('Artículo agregado al carrito de compras. Ve y cancela ya tu producto.');
    }
});

// Actualizar carrito
function actualizarCarrito() {
    const carritoItems = document.getElementById('carrito-items');
    carritoItems.innerHTML = '';
    let total = 0;
    carrito.forEach((item, index) => {
        const div = document.createElement('div');
        const subtotal = item.producto.precio * item.cantidad;
        div.innerHTML = `
            ${item.producto.nombre} (${item.sabor}) - Cantidad:
            <button class="restar" data-index="${index}">-</button>
            ${item.cantidad}
            <button class="sumar" data-index="${index}">+</button>
            - $${item.producto.precio} cada uno - Subtotal: $${subtotal}
            <button class="quitar" data-index="${index}">Cancelar</button>
        `;
        carritoItems.appendChild(div);
        total += subtotal;
    });
    const envio = 3000;
    const totalConEnvio = total + envio;
    const envioDiv = document.createElement('div');
    envioDiv.innerHTML = `Envío: $${envio}`;
    carritoItems.appendChild(envioDiv);
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<strong>Total: $${totalConEnvio}</strong>`;
    carritoItems.appendChild(totalDiv);

    document.getElementById('checkout-btn').disabled = carrito.length === 0;
    if (document.getElementById('checkout').style.display !== 'none') {
        document.querySelector('#checkout-form button').disabled = carrito.length === 0;
    }
    // Actualizar contador en index.html si existe
    const countEl = document.getElementById('carrito-count');
    if (countEl) {
        countEl.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    }
    // Actualizar cantidades por producto
    document.querySelectorAll('.cantidad-carrito').forEach(span => {
        const id = parseInt(span.dataset.id);
        const item = carrito.find(item => item.producto.id === id);
        span.textContent = item ? item.cantidad : 0;
    });
    // Actualizar stocks
    document.querySelectorAll('.stock').forEach(p => {
        const id = parseInt(p.dataset.id);
        const producto = productos.find(p => p.id === id);
        if (producto.stock !== undefined) {
            p.textContent = `Producto premium de alta pureza. Edición Limitada - Stock: ${producto.stock} unidades`;
        }
    });
}

// Event delegation para botones del carrito
document.getElementById('carrito-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('restar')) {
        const index = parseInt(e.target.dataset.index);
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1);
        }
        actualizarCarrito();
    } else if (e.target.classList.contains('sumar')) {
        const index = parseInt(e.target.dataset.index);
        carrito[index].cantidad++;
        actualizarCarrito();
    } else if (e.target.classList.contains('quitar')) {
        const index = parseInt(e.target.dataset.index);
        carrito.splice(index, 1);
        actualizarCarrito();
    }
});

// Mostrar checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('checkout').style.display = 'block';
    const subtotal = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    const envio = 3000;
    const total = subtotal + envio;
    document.getElementById('checkout-total').innerHTML = `<p>Subtotal: $${subtotal}</p><p>Envío: $${envio}</p><p><strong>Total a pagar: $${total}</strong></p>`;
});

// Procesar pago con Nequi
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;

    // Simular pago con Nequi (en realidad, redirigir a Nequi app o API)
    alert('Redirigiendo a Nequi para pago...');
    // Aquí se integraría la API real de Nequi

    // Registrar venta
    const venta = {
        nombre: nombre,
        telefono: telefono,
        productos: carrito,
        fecha: new Date().toISOString()
    };
    ventas.push(venta);
    localStorage.setItem('ventas', JSON.stringify(ventas));

    // Construir mensaje con detalles de la venta
    let mensajeVenta = 'Quiero completar mi pago. Detalles del pedido:\n';
    carrito.forEach(item => {
        mensajeVenta += `- ${item.producto.nombre} (${item.sabor}): ${item.cantidad} x $${item.producto.precio} = $${item.producto.precio * item.cantidad}\n`;
    });
    const subtotal = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    const envio = 3000;
    const total = subtotal + envio;
    mensajeVenta += `Subtotal: $${subtotal}\nEnvío: $${envio}\nTotal: $${total}\nMe regalas número de Nequi?`;

    // Limpiar carrito y ocultar checkout
    carrito = [];
    actualizarCarrito();
    document.getElementById('checkout').style.display = 'none';

    // Reportar venta por WhatsApp
    window.open(`https://wa.me/573217029329?text=${encodeURIComponent(mensajeVenta)}`, '_blank');

    alert(`Compra exitosa!!! Total pagado: $${total}. Te esperamos vuelvas pronto!!!`);

    // Mostrar modal de calificación después de compra si no ha sido enviado
    setTimeout(() => {
        if (!localStorage.getItem('ratingSubmitted')) {
            document.getElementById('rating-modal').style.display = 'block';
        }
        actualizarRatingsDisplay();
    }, 3000);
});

// Actualizar lista de ventas
function actualizarVentas() {
    const ventasLista = document.getElementById('ventas-lista');
    ventasLista.innerHTML = '';
    ventas.forEach(venta => {
        const totalProductos = venta.productos.reduce((sum, item) => sum + item.cantidad, 0);
        const subtotal = venta.productos.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
        const envio = 3000;
        const total = subtotal + envio;
        const productosDetalle = venta.productos.map(item => `${item.producto.nombre} (${item.sabor}) x${item.cantidad}`).join(', ');
        const div = document.createElement('div');
        div.innerHTML = `<strong>${venta.nombre}</strong> (${venta.telefono}) - Productos: ${productosDetalle} - Subtotal: $${subtotal} + Envío: $${envio} = Total: $${total} - ${totalProductos} destilados - ${venta.fecha}`;
        ventasLista.appendChild(div);
    });
}

// Actualizar lista de calificaciones
function actualizarRatings() {
    const ratingsLista = document.getElementById('ratings-lista');
    if (!ratingsLista) return;
    const ratings = JSON.parse(localStorage.getItem('ratings')) || [];
    ratingsLista.innerHTML = '';
    ratings.forEach(rating => {
        const div = document.createElement('div');
        div.innerHTML = `Calificación: ${'★'.repeat(rating.rating)} (${rating.rating}/5) - Fecha: ${new Date(rating.date).toLocaleString()}`;
        ratingsLista.appendChild(div);
    });
}

// Actualizar display de calificaciones en frontend
function actualizarRatingsDisplay() {
    const ratingsDisplay = document.getElementById('ratings-display');
    if (!ratingsDisplay) return;
    const ratings = JSON.parse(localStorage.getItem('ratings')) || [];
    if (ratings.length === 0) {
        ratingsDisplay.innerHTML = '';
        return;
    }
    const avg = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
    ratingsDisplay.innerHTML = `<p style="text-align: center; font-size: 18px; color: #2f4f2f;">Calificación promedio: ${'★'.repeat(Math.round(avg))} (${avg}/5)</p>`;
}


// Icono del carrito
const carritoIcon = document.getElementById('carrito-icon');
if (carritoIcon) {
    carritoIcon.addEventListener('click', () => {
        document.getElementById('carrito-modal').style.display = 'block';
        actualizarCarrito();
    });
}

// Cerrar modal
const closeBtn = document.querySelector('.close');
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        document.getElementById('carrito-modal').style.display = 'none';
    });
}

// Cerrar modal al hacer click fuera
window.addEventListener('click', (e) => {
    const modal = document.getElementById('carrito-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});



// Verificación de edad solo en frontend
if (document.getElementById('edad-modal')) {
    if (!localStorage.getItem('edadVerificada')) {
        // Modal ya visible
    } else {
        document.getElementById('edad-modal').style.display = 'none';
    }

    // Botones de edad
    document.getElementById('si-edad').addEventListener('click', () => {
        localStorage.setItem('edadVerificada', 'true');
        document.getElementById('edad-modal').style.display = 'none';
    });

    document.getElementById('no-edad').addEventListener('click', () => {
        alert('Debes ser mayor de 18 años para acceder a este sitio.');
        window.location.href = 'https://www.google.com';
    });
}

// Rating modal
let selectedRating = 0;

setTimeout(() => {
    if (localStorage.getItem('ratingSubmitted')) return;
    document.getElementById('rating-modal').style.display = 'block';
}, 10000); // 10 segundos

document.querySelector('.stars').addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
        selectedRating = parseInt(e.target.dataset.value);
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        for (let i = 0; i < selectedRating; i++) {
            document.querySelectorAll('.star')[i].classList.add('active');
        }
    }
});

document.getElementById('submit-rating').addEventListener('click', () => {
    if (selectedRating > 0) {
        let ratings = JSON.parse(localStorage.getItem('ratings')) || [];
        ratings.push({ rating: selectedRating, date: new Date().toISOString() });
        localStorage.setItem('ratings', JSON.stringify(ratings));
        localStorage.setItem('ratingSubmitted', 'true');
        document.getElementById('rating-modal').style.display = 'none';
        alert('¡Gracias por tu calificación!');
        actualizarRatingsDisplay();
    } else {
        alert('Por favor selecciona una calificación.');
    }
});

document.getElementById('close-rating').addEventListener('click', () => {
    document.getElementById('rating-modal').style.display = 'none';
});

// Reloj
function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-CO');
    const time = now.toLocaleTimeString('es-CO', { hour12: true });
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.textContent = `${date} - ${time}`;
    }
}

setInterval(updateClock, 1000);
updateClock();

// Inicializar
actualizarRatingsDisplay();