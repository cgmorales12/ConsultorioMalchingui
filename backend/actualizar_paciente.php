<?php
// C:\xampp\htdocs\consultorio\update_paciente.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php'; 

// Recibir los datos JSON enviados desde Angular
$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Solicitud inválida.');

// Verificamos que al menos existan los campos que el paciente puede editar y su identificador
if (isset($data['cedula'], $data['telefono'], $data['email'])) {
    
    $cedula = $conn->real_escape_string($data['cedula']);
    $telefono = $conn->real_escape_string($data['telefono']);
    $email = $conn->real_escape_string($data['email']);
    
    // Estos campos suelen ser fijos, pero los incluimos por si el administrador también usa este archivo
    $nombres = isset($data['nombres']) ? $conn->real_escape_string($data['nombres']) : null;
    $apellidos = isset($data['apellidos']) ? $conn->real_escape_string($data['apellidos']) : null;

    // Consulta SQL: Actualizamos solo lo que el usuario envía
    $sql = "UPDATE pacientes SET 
            telefono = ?, 
            email = ? 
            WHERE cedula = ?";
    
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        $response['message'] = 'Error al preparar la consulta: ' . $conn->error;
    } else {
        // Enlazar parámetros (s = string)
        $stmt->bind_param("sss", $telefono, $email, $cedula);
        
        if ($stmt->execute()) {
            // affected_rows puede ser 0 si el usuario no cambió nada físicamente
            $response = array(
                'status' => 'success', 
                'message' => 'Información actualizada correctamente.'
            );
        } else {
            $response['message'] = 'Error al ejecutar la actualización: ' . $stmt->error;
        }
        $stmt->close();
    }
} else {
    $response['message'] = 'Faltan campos obligatorios (Cédula, Teléfono o Email).';
}

echo json_encode($response);
$conn->close();
?>