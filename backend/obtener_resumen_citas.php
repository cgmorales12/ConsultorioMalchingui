<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include 'conexion.php';

// 1. Configuración de Errores Robust
error_reporting(E_ALL);
ini_set('display_errors', 0);

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "FATAL ERROR: " . $error['message']]);
        exit();
    }
});

ob_start();

$stats = [
    "ocupados" => 0,
    "disponibles" => 0,
    "liberados" => 0
];

try {
    // A. Ocupados: Citas Activas (Pendientes=1, Confirmadas=2)
    // Usamos id_estado en lugar de estado string
    $sqlOcupados = "SELECT COUNT(*) as total FROM citas WHERE id_estado IN (1, 2)";
    if ($res = $conn->query($sqlOcupados)) {
        $row = $res->fetch_assoc();
        $stats['ocupados'] = intval($row['total']);
    } else {
        $stats['debug_ocupados'] = $conn->error;
    }

    // B. Disponibles: Espacios libres (Slots de 30 min)
    // Tabla correcta: 'disponibilidad' (no dias_disponibilidad)
    // Fórmula: (Fin - Inicio) / 30 min. Solo fechas futuras.
    $sqlDisp = "SELECT SUM(FLOOR((TIME_TO_SEC(hora_fin) - TIME_TO_SEC(hora_inicio)) / 1800)) as total 
                FROM disponibilidad 
                WHERE fecha_dia >= CURDATE()";

    if ($res = $conn->query($sqlDisp)) {
        $row = $res->fetch_assoc();
        $stats['disponibles'] = intval($row['total']); // Si es NULL (sin horarios), intval lo hace 0
    } else {
        $stats['debug_disp'] = $conn->error;
    }

    // C. Liberados/Cancelados: Cualquier estado distinto de 1 o 2 (ej: 3=Cancelada)
    $sqlLiberados = "SELECT COUNT(*) as total FROM citas WHERE id_estado NOT IN (1, 2)";
    if ($res = $conn->query($sqlLiberados)) {
        $row = $res->fetch_assoc();
        $stats['liberados'] = intval($row['total']);
    } else {
        $stats['debug_lib'] = $conn->error;
    }

} catch (Exception $e) {
    $stats['error'] = $e->getMessage();
}

ob_clean();
echo json_encode(["status" => "success", "stats" => $stats]);
$conn->close();
?>