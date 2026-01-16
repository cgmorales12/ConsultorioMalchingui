<?php
// C:\xampp\htdocs\consultorio\get_consultas_paciente.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO
// **********************************************
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Falta ID de paciente.');

if (isset($data['id_paciente'])) {
    
    $id_paciente = $conn->real_escape_string($data['id_paciente']);

    // LEFT JOIN para que no falle si el médico fue borrado (aunque no debería pasar)
    // O INNER JOIN si mandatorio. Usaremos INNER para garantizar datos de médico.
    $sql = "SELECT m.*, med.nombres as medico_nombres, med.apellidos as medico_apellidos 
            FROM mensajes_telemedicina m
            INNER JOIN medicos med ON m.id_medico = med.id_medico
            WHERE m.id_paciente = '$id_paciente'
            ORDER BY m.fecha_envio DESC";

    $result = $conn->query($sql);
    
    if ($result) {
        $mensajes = [];
        while($row = $result->fetch_assoc()) {
            $mensajes[] = $row;
        }
        $response = array("status" => "success", "data" => $mensajes);
    } else {
        $response = array("status" => "error", "message" => "Error SQL: " . $conn->error);
    }
}

echo json_encode($response);
$conn->close();
?>