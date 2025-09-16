// Configuración de Supabase
const SUPABASE_URL = 'https://ktwgpjxmlkazwbmpjfxo.supabase.coo'; // Reemplaza con tu URL
const SUPABASE_ANON_KEY = 'tu-clave-anon-publica'; // Reemplaza con tu clave anónima

// Crear cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para usar en otros archivos
window.supabaseClient = supabase;

// Función para mostrar alertas
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type} alert-dismissible fade show alert-auto-close`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

// Función para guardar boleta en Supabase
async function guardarBoleta(boletaData) {
    try {
        const { data, error } = await supabase
            .from('boletas')
            .insert([boletaData])
            .select();
        
        if (error) {
            console.error('Error guardando boleta:', error);
            showAlert('Error al guardar la boleta: ' + error.message, 'danger');
            return null;
        }
        
        console.log('Boleta guardada:', data);
        showAlert('Boleta guardada exitosamente', 'success');
        return data[0];
    } catch (error) {
        console.error('Error inesperado:', error);
        showAlert('Error inesperado al guardar la boleta', 'danger');
        return null;
    }
}

// Función para obtener todas las boletas
async function obtenerBoletas() {
    try {
        const { data, error } = await supabase
            .from('boletas')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error obteniendo boletas:', error);
            showAlert('Error al cargar el historial', 'danger');
            return [];
        }
        
        return data;
    } catch (error) {
        console.error('Error inesperado:', error);
        showAlert('Error inesperado al cargar el historial', 'danger');
        return [];
    }
}

// Función para obtener una boleta por ID
async function obtenerBoletaPorId(id) {
    try {
        const { data, error } = await supabase
            .from('boletas')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error obteniendo boleta:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error inesperado:', error);
        return null;
    }
}

// Función para actualizar una boleta
async function actualizarBoleta(id, boletaData) {
    try {
        const { data, error } = await supabase
            .from('boletas')
            .update(boletaData)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error actualizando boleta:', error);
            showAlert('Error al actualizar la boleta', 'danger');
            return null;
        }
        
        showAlert('Boleta actualizada exitosamente', 'success');
        return data[0];
    } catch (error) {
        console.error('Error inesperado:', error);
        showAlert('Error inesperado al actualizar la boleta', 'danger');
        return null;
    }
}

// Función para eliminar una boleta
async function eliminarBoleta(id) {
    try {
        const { error } = await supabase
            .from('boletas')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error eliminando boleta:', error);
            showAlert('Error al eliminar la boleta', 'danger');
            return false;
        }
        
        showAlert('Boleta eliminada exitosamente', 'success');
        return true;
    } catch (error) {
        console.error('Error inesperado:', error);
        showAlert('Error inesperado al eliminar la boleta', 'danger');
        return false;
    }
}

// Exportar funciones
window.supabaseFunctions = {
    guardarBoleta,
    obtenerBoletas,
    obtenerBoletaPorId,
    actualizarBoleta,
    eliminarBoleta,
    showAlert
};
