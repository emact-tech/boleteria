document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página cargada, iniciando configuración...');
    
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
        if (fechaHora) {
            const [fecha, hora] = fechaHora.split('T');
            const [year, month, day] = fecha.split('-');
            const horaFormateada = hora ? hora.substring(0, 5) : '19:00';
            document.getElementById('previewFechaHora').textContent = `${day}/${month}/${year} - ${horaFormateada}`;
        }
    }
    
    // Actualizar cuando cambia la obra
    document.getElementById('obra').addEventListener('input', function() {
        document.getElementById('previewObra').textContent = this.value || 'La Divina Comedia';
    });
    
    // Actualizar cuando cambia el cliente
    document.getElementById('cliente').addEventListener('input', function() {
        document.getElementById('previewCliente').textContent = this.value || 'Nombre del cliente';
    });
    
    // Actualizar cuando cambia el teléfono
    document.getElementById('telCliente').addEventListener('input', function() {
        document.getElementById('previewTelCliente').textContent = this.value || '12345678';
    });
    
    // Actualizar cuando cambia la fila
    document.getElementById('fila').addEventListener('change', function() {
        document.getElementById('previewFila').textContent = this.value || '-';
        actualizarUbicacion();
    });
    
    // Actualizar cuando cambia la silla
    document.getElementById('silla').addEventListener('change', function() {
        document.getElementById('previewSilla').textContent = this.value || '-';
        actualizarUbicacion();
    });
    
    function actualizarUbicacion() {
        const fila = document.getElementById('fila').value;
        const silla = document.getElementById('silla').value;
        if (fila && silla) {
            document.getElementById('previewUbicacion').textContent = `Fila ${fila} - Silla ${silla}`;
        } else {
            document.getElementById('previewUbicacion').textContent = 'Fila - Silla -';
        }
    }
    
    // Generar boleta (vista previa)
    document.getElementById('generateBtn').addEventListener('click', function() {
        console.log('Botón Generar Boleta clickeado');
        
        const obra = document.getElementById('obra').value;
        const cliente = document.getElementById('cliente').value;
        const telCliente = document.getElementById('telCliente').value;
        const fila = document.getElementById('fila').value;
        const silla = document.getElementById('silla').value;
        
        // Validar campos obligatorios
        if (!cliente || !telCliente || !fila || !silla) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        // Actualizar vista previa
        document.getElementById('previewObra').textContent = obra;
        document.getElementById('previewCliente').textContent = cliente;
        document.getElementById('previewTelCliente').textContent = telCliente;
        document.getElementById('previewFila').textContent = fila;
        document.getElementById('previewSilla').textContent = silla;
        document.getElementById('previewUbicacion').textContent = `Fila ${fila} - Silla ${silla}`;
        
        alert('Boleta generada correctamente. Ahora puedes guardarla.');
    });
    
    // Guardar boleta en Supabase
    document.getElementById('saveBoleta').addEventListener('click', async function() {
        console.log('Botón Guardar Boleta clickeado');
        
        const obra = document.getElementById('obra').value;
        const cliente = document.getElementById('cliente').value;
        const telCliente = document.getElementById('telCliente').value;
        const fila = document.getElementById('fila').value;
        const silla = document.getElementById('silla').value;
        const fechaHora = document.getElementById('fecha').value;
        
        // Validar campos obligatorios
        if (!cliente || !telCliente || !fila || !silla) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        // Generar código de verificación único
        const codigoVerificacion = 'TD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        const boletaData = {
            obra: obra || 'La Divina Comedia',
            cliente: cliente,
            telefono: telCliente,
            fila: fila,
            silla: silla,
            fecha_funcion: fechaHora,
            tipo_entrada: 'General',
            precio: 40000,
            codigo_verificacion: codigoVerificacion
        };
        
        console.log('Datos a guardar:', boletaData);
        
        // Intentar guardar en Supabase si está configurado
        if (typeof window.supabaseFunctions !== 'undefined' && window.supabaseFunctions.guardarBoleta) {
            const resultado = await window.supabaseFunctions.guardarBoleta(boletaData);
            
            if (resultado) {
                // Actualizar vista previa con ID real
                document.getElementById('previewId').textContent = resultado.codigo_verificacion;
                document.getElementById('previewCodigo').textContent = resultado.codigo_verificacion;
                
                alert('Boleta guardada exitosamente con código: ' + resultado.codigo_verificacion);
                
                // Limpiar formulario
                document.getElementById('cliente').value = '';
                document.getElementById('telCliente').value = '';
                document.getElementById('fila').value = '';
                document.getElementById('silla').value = '';
                
                // Limpiar selección de asientos
                document.querySelectorAll('.seat.selected').forEach(seat => {
                    seat.classList.remove('selected');
                });
            } else {
                console.error('Error: resultado es null o undefined');
                alert('Error al guardar la boleta. Verifica la consola para más detalles.');
            }
        } else {
            // Fallback: guardar en localStorage
            guardarBoletaLocal(boletaData);
        }
    });
    
    // Función alternativa para guardar boletas en localStorage
    function guardarBoletaLocal(boletaData) {
        try {
            // Obtener boletas existentes
            const boletas = JSON.parse(localStorage.getItem('teatroDanteBoletas')) || [];
            
            // Agregar ID y fecha
            boletaData.id = Date.now();
            boletaData.created_at = new Date().toISOString();
            
            // Agregar nueva boleta
            boletas.push(boletaData);
            
            // Guardar en localStorage
            localStorage.setItem('teatroDanteBoletas', JSON.stringify(boletas));
            
            console.log('Boleta guardada en localStorage:', boletaData);
            
            // Actualizar vista previa con ID real
            document.getElementById('previewId').textContent = boletaData.codigo_verificacion;
            document.getElementById('previewCodigo').textContent = boletaData.codigo_verificacion;
            
            alert('Boleta guardada exitosamente en el navegador. Código: ' + boletaData.codigo_verificacion);
            
            // Limpiar formulario
            document.getElementById('cliente').value = '';
            document.getElementById('telCliente').value = '';
            document.getElementById('fila').value = '';
            document.getElementById('silla').value = '';
            
            // Limpiar selección de asientos
            document.querySelectorAll('.seat.selected').forEach(seat => {
                seat.classList.remove('selected');
            });
            
            return boletaData;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            alert('Error al guardar la boleta en el navegador');
            return null;
        }
    }
    
    // Simular funcionalidades de botones
    document.getElementById('downloadPDF').addEventListener('click', function() {
        const codigo = document.getElementById('previewCodigo').textContent;
        if (codigo && codigo !== 'TD-00001234') {
            alert('Descargando PDF para código: ' + codigo);
        } else {
            alert('Primero genere y guarde una boleta para descargar');
        }
    });
    
    document.getElementById('sendEmail').addEventListener('click', function() {
        const telCliente = document.getElementById('telCliente').value;
        const codigo = document.getElementById('previewCodigo').textContent;
        
        if (telCliente && codigo && codigo !== 'TD-00001234') {
            alert(`Enviando boleta ${codigo} al cliente con teléfono: ${telCliente}`);
        } else {
            alert('Complete los datos y guarde la boleta primero');
        }
    });
    
    // Validar formato de teléfono
    document.getElementById('telCliente').addEventListener('blur', function() {
        const phone = this.value;
        if (phone && !/^[\+]?[0-9]{3}[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)) {
            alert('Por favor, ingresa un número de teléfono válido para Colombia');
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
            
            alert(`Asiento seleccionado: Fila ${fila}, Silla ${silla}`);
        });
    });
    
    // Historial de boletas
    document.getElementById('historialBtn').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Función de historial en desarrollo');
    });
});
