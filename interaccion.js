// 1. Seleccionar el botón por su ID
const botonDeCompra = document.getElementById("btn-comprar");

// 2. Agregar un "escuchador de eventos" (event listener)
botonDeCompra.addEventListener("click", function() {
  // 3. Definir la acción que ocurrirá cuando se haga clic
  alert("¡Producto agregado al carrito!");
});