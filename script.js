document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha y hora por defecto
    const now = new Date();
    now.setDate(now.getDate() + 2); // Dos días después
    const formattedDate = now.toISOString().slice(0, 16);
    document.getElementById('fecha').value = formattedDate;
    
    // Actualizar vista previa de fecha y hora
    updateFechaHoraPreview();
    
    // Actualizar cuando cambia la fecha
    document.getElementById('fecha').addEventListener('change', function() {
        updateFechaHoraPreview();
    });
    
    function updateFechaHoraPreview() {
        const fechaHora = document.getElementById('fecha').value;
        const [fecha, hora] = fechaHora.split('T');
        const [year, month, day] = fecha.split('-');
        document.getElementById('previewFechaHora').textContent = `${day}/${month}/${year} - ${hora}`;
    }
    
    // Actualizar cuando cambia la obra
    document.getElementById('obra').addEventListener('input', function() {
        document.getElementById('previewObra').textContent = this.value;
    });
    
    // Generar boleta
    document.getElementById('generateBtn').addEventListener('click', function() {
        const obra = document.getElementById('obra').value;
        const cliente = document.getElementById('cliente').value;
        const telCliente = document.getElementById('telCliente').value;
        const fila = document.getElementById('fila').value;
        const silla = document.getElementById('silla').value;
        
        // Validar campos obligatorios
        if (!cliente || !telCliente || !fila || !silla) {
            window.supabaseFunctions.showAlert('Por favor, complete todos los campos obligatorios', 'warning');
            return;
        }
        
        // Actualizar vista previa
        document.getElementById('previewObra').textContent = obra;
        document.getElementById('previewCliente').textContent = cliente;
        document.getElementById('previewTelCliente').textContent = telCliente;
        document.getElementById('previewFila').textContent = fila;
        document.getElementById('previewSilla').textContent = silla;
        document.getElementById('previewUbicacion').textContent = `Fila ${fila} - Silla ${silla}`;
        
        window.supabaseFunctions.showAlert('Boleta generada correctamente. Ahora puedes guardarla.', 'success');
    });
    
    // Guardar boleta en Supabase
    document.getElementById('saveBoleta').addEventListener('click', async function() {
        const obra = document.getElementById('obra').value;
        const cliente = document.getElementById('cliente').value;
        const telCliente = document.getElementById('telCliente').value;
        const fila = document.getElementById('fila').value;
        const silla = document.getElementById('silla').value;
        const fechaHora = document.getElementById('fecha').value;
        
        // Validar campos obligatorios
        if (!cliente || !telCliente || !fila || !silla) {
            window.supabaseFunctions.showAlert('Por favor, complete todos los campos obligatorios', 'warning');
            return;
        }
        
        const boletaData = {
            obra: obra,
            cliente: cliente,
            telefono: telCliente,
            fila: fila,
            silla: silla,
            fecha_funcion: fechaHora,
            tipo_entrada: 'General',
            precio: 40000,
            codigo_verificacion: 'TD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        
        const resultado = await window.supabaseFunctions.guardarBoleta(boletaData);
        
        if (resultado) {
            // Actualizar vista previa con ID real
            document.getElementById('previewId').textContent = resultado.codigo_verificacion;
            document.getElementById('previewCodigo').textContent = resultado.codigo_verificacion;
            
            // Limpiar formulario
            document.getElementById('cliente').value = '';
            document.getElementById('telCliente').value = '';
            document.getElementById('fila').value = '';
            document.getElementById('silla').value = '';
        }
    });
    
    // Simular funcionalidades de botones
    document.getElementById('downloadPDF').addEventListener('click', function() {
        window.supabaseFunctions.showAlert('Funcionalidad de descarga de PDF en desarrollo', 'info');
    });
    
    document.getElementById('sendEmail').addEventListener('click', function() {
        const telCliente = document.getElementById('telCliente').value;
        if (telCliente) {
            window.supabaseFunctions.showAlert(`Simulación: Boleta enviada al cliente con teléfono: ${telCliente}`, 'info');
        } else {
            window.supabaseFunctions.showAlert('Por favor, ingresa el teléfono del cliente primero', 'warning');
        }
    });
    
    // Validar formato de teléfono
    document.getElementById('telCliente').addEventListener('blur', function() {
        const phone = this.value;
        if (phone && !/^[\+]?[0-9]{3}[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)) {
            window.supabaseFunctions.showAlert('Por favor, ingresa un número de teléfono válido para Colombia', 'warning');
            this.focus();
        }
    });
    
    // Interactividad con el mapa de asientos
    const seats = document.querySelectorAll('.seat:not(.occupied)');
    seats.forEach(seat => {
        seat.addEventListener('click', function() {
            const seatText = this.textContent;
            const fila = seatText.charAt(0);
            const silla = seatText.substring(1);
            
            document.getElementById('fila').value = fila;
            document.getElementById('silla').value = silla;
            
            // Resaltar asiento seleccionado
            seats.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            // Actualizar vista previa
            document.getElementById('previewFila').textContent = fila;
            document.getElementById('previewSilla').textContent = silla;
            document.getElementById('previewUbicacion').textContent = `Fila ${fila} - Silla ${silla}`;
            
            window.supabaseFunctions.showAlert(`Asiento seleccionado: Fila ${fila}, Silla ${silla}`, 'info');
        });
    });
    
    // Historial de boletas
    document.getElementById('historialBtn').addEventListener('click', async function(e) {
        e.preventDefault();
        
        const boletas = await window.supabaseFunctions.obtenerBoletas();
        const historialBody = document.getElementById('historialBody');
        
        if (boletas.length === 0) {
            historialBody.innerHTML = '<tr