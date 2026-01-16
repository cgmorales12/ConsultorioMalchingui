<?php
// C:\xampp\htdocs\consultorio\create_disponibilidad.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO (Corregido)
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
// Línea CORREGIDA para permitir Content-Type y otros encabezados
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE INSERCIÓN
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de disponibilidad.');

if (isset($data['id_medico'], $data['fecha_dia'], $data['hora_inicio'], $data['hora_fin'])) {
    
    $id_medico = $data['id_medico'];
    $fecha_dia = $data['fecha_dia'];
    $hora_inicio = $data['hora_inicio'];
    $hora_fin = $data['hora_fin'];
    // confirmada_por_medico = TRUE por defecto (1)

    try {
        // Sentencia SQL de Inserción
        $sql = "INSERT INTO disponibilidad (id_medico, fecha_dia, hora_inicio, hora_fin, confirmada_por_medico) 
                VALUES (?, ?, ?, ?, TRUE)";
        
        $stmt = $conn->prepare($sql);
        // Tipos de parámetros: i (integer), s (string), s (string), s (string)
        $stmt->bind_param("isss", $id_medico, $fecha_dia, $hora_inicio, $hora_fin);

        if (!$stmt->execute()) {
            throw new Exception("Error al registrar disponibilidad: " . $stmt->error);
        }
        
        $response = array(
            'status' => 'success',
            'message' => 'Disponibilidad registrada exitosamente.'
        );
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
        // Manejo de error de índice duplicado (si el médico ya registró esa hora)
        if (strpos($e->getMessage(), 'idx_medico_fecha_hora') !== false) {
            $response['message'] = 'Error: Ya existe un bloque de disponibilidad registrado para ese médico en ese día y hora de inicio.';
        }
    }
    
}

echo json_encode($response);
$conn->close();
?>