<?php
// C:\xampp\htdocs\consultorio\delete_cita.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO (Corregido)
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
// Línea CORREGIDA para permitir Content-Type y X-Requested-With
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE ELIMINACIÓN
// **********************************************

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Falta el ID de la cita a eliminar.');

if (isset($data['id_cita'])) {
    
    $id_cita = $data['id_cita'];
    
    try {
        // 1. Sentencia SQL de Eliminación
        $sql = "DELETE FROM citas WHERE id_cita = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_cita);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al eliminar la cita: " . $stmt->error);
        }
        
        // Verificar si se eliminó alguna fila
        if ($stmt->affected_rows > 0) {
            $response = array(
                'status' => 'success',
                'message' => 'Cita eliminada exitosamente.'
            );
        } else {
            $response = array(
                'status' => 'error',
                'message' => 'No se encontró la cita con el ID proporcionado.'
            );
        }
        $stmt->close();

    } catch (Exception $e) {
        // Captura errores como restricciones de clave externa (FK)
        $response['message'] = $e->getMessage();
    }
    
}

echo json_encode($response);
$conn->close();
?>