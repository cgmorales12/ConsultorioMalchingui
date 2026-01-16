<?php
// C:\xampp\htdocs\consultorio\get_all_pacientes.php

// 1. CÓDIGO CORS ESTANDARIZADO
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. CONEXIÓN
include 'conexion.php';

$response = array('status' => 'error', 'message' => 'Error inesperado.');

// 3. CONSULTA SQL
$sql = "SELECT id_paciente, cedula, nombres, apellidos, telefono, email FROM pacientes ORDER BY apellidos ASC, nombres ASC";

if ($result = $conn->query($sql)) {
    $pacientes = array();
    while ($row = $result->fetch_assoc()) {
        $pacientes[] = $row;
    }
    
    // 4. RESPUESTA
    $response = array(
        'status' => 'success',
        'message' => 'Listado de pacientes recuperado.',
        'data' => $pacientes
    );
} else {
    $response = array('status' => 'error', 'message' => 'Error en la consulta: ' . $conn->error);
}

echo json_encode($response);
$conn->close();
?>
