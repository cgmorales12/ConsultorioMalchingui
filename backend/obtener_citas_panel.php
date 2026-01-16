<?php
// C:\xampp\htdocs\consultorio\get_citas_dashboard.php
// Objetivo: Obtener el recuento de citas futuras agrupadas por estado.

// **********************************************
// 1. CONFIGURACIÓN CORS
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. CONEXIÓN Y CONSULTA
// **********************************************

include 'conexion.php'; 

$response = array('status' => 'error', 'message' => 'Error al obtener datos de citas.');

try {
    // Usamos fecha de PHP para evitar discrepancias de zona horaria en MySQL
    // Intentamos usar la fecha local del servidor
    $fechaHoy = date('Y-m-d');

    // 1. Calcular Capacidad Total (Slots de 30 min)
    // Basado en la tabla disponibilidad (fechas futuras)
    $sql_capacity = "SELECT SUM(TIMESTAMPDIFF(MINUTE, hora_inicio, hora_fin) / 30) as total_slots 
                     FROM disponibilidad 
                     WHERE fecha_dia >= '$fechaHoy'";
    $res_cap = $conn->query($sql_capacity);
    $row_cap = $res_cap->fetch_assoc();
    $total_capacity = $row_cap['total_slots'] ? (int)$row_cap['total_slots'] : 0;

    // 2. Calcular Ocupados (Citas Activas: Pendientes o Confirmadas)
    $sql_occupied = "SELECT COUNT(*) as occupied 
                     FROM citas 
                     WHERE fecha_cita >= '$fechaHoy' AND id_estado IN (1, 2)";
    $res_occ = $conn->query($sql_occupied);
    if (!$res_occ) throw new Exception("Error SQL Ocupados: " . $conn->error);
    $row_occ = $res_occ->fetch_assoc();
    $occupied = (int)$row_occ['occupied'];

    // 3. Calcular Liberados (Espacios que quedaron vacíos por cancelación/rechazo)
    // El usuario indica que las rechazadas SE BORRAN de 'citas' y van a 'historial_citas'.
    // Buscamos en el historial citas futuras con acciones de eliminación o rechazo.
    // Usamos LIKE para abarcar posibles nombres del trigger ('ELIMINAR', 'ELIMINADO', 'RECHAZO', etc.)
    $sql_liberated = "SELECT COUNT(DISTINCT id_cita) as liberated 
                      FROM historial_citas 
                      WHERE fecha_cita >= '$fechaHoy' 
                      AND (accion LIKE '%ELIMIN%' OR accion LIKE '%CANCEL%' OR accion LIKE '%RECHAZ%')";
                      
    $res_lib = $conn->query($sql_liberated);
    if (!$res_lib) $liberated = 0; // Si falla por alguna razón (ej. tabla no existe), asumimos 0
    else {
        $row_lib = $res_lib->fetch_assoc();
        $liberated = (int)$row_lib['liberated'];
    }

    // 4. Calcular Disponibles (Capacidad - Ocupados)
    $available = max(0, $total_capacity - $occupied);

    // Estructura de respuesta
    $stats = [
        'ocupados'    => $occupied,
        'disponibles' => $available,
        'liberados'   => $liberated
    ];

    $response = array(
        'status' => 'success',
        'stats' => $stats,
        'from_server_date' => $fechaHoy
    );

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>