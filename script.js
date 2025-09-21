// Datos de productos
const productos = [
    { id: 1, nombre: 'Destilado Relax', precio: 50000 },
    { id: 2, nombre: 'Destilado Energía', precio: 55000 },
    { id: 3, nombre: 'Destilado Sueño', precio: 60000 },
    { id: 4, nombre: 'Extracto WAX', precio: 60000, stock: 10 },
    { id: 5, nombre: 'Wax Mix Flower Al 99.9%', precio: 80000, stock: 5 }
];

// Carrito
let carrito = [];

// Cargar ventas desde localStorage
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];

// Función para agregar al carrito
document.querySelectorAll('.agregar-carrito').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.parentElement.dataset.id);
        const cantidad = parseInt(e.target.parentElement.querySelector('.cantidad').value);
        const producto = productos.find(p => p.id === id);
        const itemExistente = carrito.find(item => item.producto.id === id);
        const totalCantidad = (itemExistente ? itemExistente.cantidad : 0) + cantidad;
        if (producto.stock && totalCantidad > producto.stock) {
            alert(`Stock limitado. Solo quedan ${producto.stock} unidades disponibles.`);
            return;
        }
        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            carrito.push({ producto, cantidad });
        }
        actualizarCarrito();
        document.getElementById('carrito-modal').style.display = 'block';
        alert('Artículo agregado al carrito de compras. Ve y cancela ya tu producto.');
    });
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
            ${item.producto.nombre} - Cantidad:
            <button class="restar" data-index="${index}">-</button>
            ${item.cantidad}
            <button class="sumar" data-index="${index}">+</button>
            - $${item.producto.precio} cada uno - Subtotal: $${subtotal}
            <button class="quitar" data-index="${index}">Cancelar</button>
        `;
        carritoItems.appendChild(div);
        total += subtotal;
    });
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<strong>Total: $${total}</strong>`;
    carritoItems.appendChild(totalDiv);

    // Event listeners para botones
    document.querySelectorAll('.restar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad--;
            } else {
                carrito.splice(index, 1);
            }
            actualizarCarrito();
        });
    });
    document.querySelectorAll('.sumar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            carrito[index].cantidad++;
            actualizarCarrito();
        });
    });
    document.querySelectorAll('.quitar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            carrito.splice(index, 1);
            actualizarCarrito();
        });
    });
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
}

// Mostrar checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('checkout').style.display = 'block';
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
        mensajeVenta += `- ${item.producto.nombre}: ${item.cantidad} x $${item.producto.precio} = $${item.producto.precio * item.cantidad}\n`;
    });
    const total = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    mensajeVenta += `Total: $${total}\nMe regalas número de Nequi?`;

    // Limpiar carrito y ocultar checkout
    carrito = [];
    actualizarCarrito();
    document.getElementById('checkout').style.display = 'none';

    // Reportar venta por WhatsApp
    window.open(`https://wa.me/573217029329?text=${encodeURIComponent(mensajeVenta)}`, '_blank');

    alert('Compra realizada exitosamente! Revisa WhatsApp para completar el pago.');
});

// Actualizar lista de ventas
function actualizarVentas() {
    const ventasLista = document.getElementById('ventas-lista');
    ventasLista.innerHTML = '';
    ventas.forEach(venta => {
        const totalProductos = venta.productos.reduce((sum, item) => sum + item.cantidad, 0);
        const productosDetalle = venta.productos.map(item => `${item.producto.nombre} x${item.cantidad}`).join(', ');
        const div = document.createElement('div');
        div.innerHTML = `<strong>${venta.nombre}</strong> (${venta.telefono}) - Productos: ${productosDetalle} - Total: ${totalProductos} destilados - ${venta.fecha}`;
        ventasLista.appendChild(div);
    });
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


// Inicializar