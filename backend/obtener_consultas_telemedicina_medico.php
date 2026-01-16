<?php
// C:\xampp\htdocs\consultorio\get_consultas_medico_telemedicina.php

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
$response = array('status' => 'error', 'message' => 'Falta ID del médico o usuario.');

if (isset($data['id_medico'])) {
    // NOTA: El frontend envía 'id_usuario' en el campo 'id_medico'
    $input_id = $conn->real_escape_string($data['id_medico']);
    
    // 1. Resolver el verdadero id_medico a partir del id_usuario
    $sql_resolve = "SELECT id_medico FROM medicos WHERE id_usuario = '$input_id'";
    $res_resolve = $conn->query($sql_resolve);
    
    if ($res_resolve && $res_resolve->num_rows > 0) {
        $row_r = $res_resolve->fetch_assoc();
        $real_id_medico = $row_r['id_medico'];
    } else {
        // Fallback: Si no se encuentra usuario, asumimos que el ID enviado YA ERA el id_medico
        $real_id_medico = $input_id;
    }

    // 2. Consulta Principal
    $sql = "SELECT m.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos 
            FROM mensajes_telemedicina m 
            INNER JOIN pacientes p ON m.id_paciente = p.id_paciente 
            WHERE m.id_medico = '$real_id_medico' 
            ORDER BY m.estado ASC, m.fecha_envio DESC";

    $result = $conn->query($sql);
    
    if ($result) {
        $res = [];
        while($row = $result->fetch_assoc()) { 
            $res[] = $row; 
        }
        $response = array('status' => 'success', 'data' => $res);
    } else {
        $response = array('status' => 'error', 'message' => $conn->error);
    }
}

echo json_encode($response);
$conn->close();
?>