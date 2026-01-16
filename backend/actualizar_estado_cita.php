<?php
// C:\xampp\htdocs\consultorio\update_cita_estado.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO (Corregido)
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// Línea CORREGIDA para permitir Content-Type y X-Requested-With
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE ACTUALIZACIÓN DE ESTADO
// **********************************************

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de cita y estado.');

if (isset($data['id_cita']) && isset($data['id_estado'])) {
    $id_cita = $data['id_cita'];
    $id_estado = $data['id_estado'];

    // 1. Sentencia SQL de Actualización
    $sql = "UPDATE citas SET id_estado = ? WHERE id_cita = ?";

    if ($stmt = $conn->prepare($sql)) {
        // 2. Enlazar parámetros: ii (integer, integer)
        $stmt->bind_param("ii", $id_estado, $id_cita);

        // 3. Ejecutar
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Estado de la cita actualizado correctamente.'
                );
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'No se encontró la cita o el estado ya estaba actualizado.'
                );
            }
        } else {
            $response = array('status' => 'error', 'message' => 'Error al actualizar la cita: ' . $stmt->error);
        }

        $stmt->close();
    } else {
        $response = array('status' => 'error', 'message' => 'Error en la preparación SQL: ' . $conn->error);
    }
}

echo json_encode($response);
$conn->close();
?>