<?php
// C:\xampp\htdocs\consultorio\delete_medico.php

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos requeridos (ID de médico o usuario).');

if (isset($data['id_medico']) && isset($data['id_usuario'])) {
    
    $id_medico = $data['id_medico'];
    $id_usuario = $data['id_usuario'];
    
    $conn->begin_transaction(); 
    
    try {
        // 1. Eliminar de la tabla MEDICOS
        $sql_medico = "DELETE FROM medicos WHERE id_medico = ?";
        $stmt_medico = $conn->prepare($sql_medico);
        $stmt_medico->bind_param("i", $id_medico);
        
        if (!$stmt_medico->execute()) {
            throw new Exception("Error al eliminar registro de médico: " . $stmt_medico->error);
        }
        $stmt_medico->close();
        
        // 2. Eliminar de la tabla USUARIOS
        $sql_user = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt_user = $conn->prepare($sql_user);
        $stmt_user->bind_param("i", $id_usuario);
        
        if (!$stmt_user->execute()) {
            throw new Exception("Error al eliminar usuario de acceso: " . $stmt_user->error);
        }
        $stmt_user->close();

        $conn->commit(); 
        
        $response = array(
            'status' => 'success',
            'message' => 'Médico y usuario eliminados exitosamente.'
        );

    } catch (Exception $e) {
        $conn->rollback(); 
        $response['message'] = $e->getMessage();
    }
    
}

echo json_encode($response);
$conn->close();
?>