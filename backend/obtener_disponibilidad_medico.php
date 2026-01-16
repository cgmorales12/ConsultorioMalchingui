<?php
// C:\xampp\htdocs\consultorio\get_disponibilidad_medico.php

// 1. CONFIGURACIÓN DE CABECERAS CORS (Indispensable para Ionic/Angular)
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

// 2. CAPTURA FLEXIBLE DEL ID DEL MÉDICO
$id_medico = null;

// Intentar obtener desde el cuerpo de la petición (JSON POST)
$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['id_medico'])) {
    $id_medico = $input['id_medico'];
} 
// Intentar obtener desde la URL (GET)
elseif (isset($_GET['id_medico'])) {
    $id_medico = $_GET['id_medico'];
}

// 3. VALIDACIÓN Y CONSULTA
if (!$id_medico) {
    echo json_encode(['status' => 'error', 'message' => 'Falta el ID del médico.']);
    exit();
}

$bloques = [];

// Consulta SQL: Obtenemos las fechas únicas donde el médico tiene turnos
// Usamos DISTINCT para no repetir fechas y que el calendario pinte más rápido
$sql = "SELECT DISTINCT 
            fecha_dia
        FROM disponibilidad
        WHERE id_medico = ? AND fecha_dia >= CURDATE()
        ORDER BY fecha_dia ASC";

if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("i", $id_medico);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Aseguramos que la fecha vaya limpia (YYYY-MM-DD)
            $bloques[] = array(
                'fecha_dia' => trim($row['fecha_dia'])
            );
        }
        $response = array(
            'status' => 'success',
            'data' => $bloques
        );
    } else {
        $response = array(
            'status' => 'success',
            'data' => [],
            'message' => 'No hay disponibilidad registrada.'
        );
    }
    $stmt->close();
} else {
    $response = array(
        'status' => 'error', 
        'message' => 'Error en la preparación SQL: ' . $conn->error
    );
}

// 4. RESPUESTA FINAL
echo json_encode($response);
$conn->close();
?>