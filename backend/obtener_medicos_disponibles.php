<?php
/**
 * obtener_medicos_disponibles.php
 * 
 * Este script devuelve una lista de IDs de médicos que tienen disponibilidad programada 
 * desde la fecha actual en adelante. Se usa para mostrar indicadores de "Disponible" en la App.
 */

// Configuración Headers y CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

// Configuración de errores para respuesta JSON segura
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Captura de errores fatales
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        ob_clean(); // Limpiar salida corrupta
        echo json_encode(["status" => "error", "message" => "Error Fatal en Servidor: " . $error['message']]);
        exit();
    }
});

ob_start(); // Iniciar buffer de salida

$medicosIds = [];

try {
    // Verificar si la tabla 'disponibilidad' existe para evitar errores
    $check = $conn->query("SHOW TABLES LIKE 'disponibilidad'");
    if ($check && $check->num_rows > 0) {

        $hoy = date('Y-m-d');

        // Consultar IDs únicos de médicos con horarios desde hoy
        $sql = "SELECT DISTINCT id_medico FROM disponibilidad WHERE fecha_dia >= '$hoy'";

        if ($res = $conn->query($sql)) {
            while ($row = $res->fetch_assoc()) {
                $medicosIds[] = intval($row['id_medico']);
            }
        }
    }
} catch (Exception $e) {
    // Si hay error, se retorna lista vacía pero con formato éxito válido
}

ob_clean(); // Limpiar errores previos
echo json_encode(["status" => "success", "data" => $medicosIds]);

$conn->close();
?>