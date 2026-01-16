<?php
// C:\xampp\htdocs\consultorio\delete_disponibilidad.php

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

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Falta el ID de disponibilidad a eliminar.');

if (isset($data['id_disponibilidad'])) {
    
    $id_disponibilidad = $data['id_disponibilidad'];
    
    // Estados de cita que NO permiten eliminación: 1, 2, 4
    $estados_activos = [1, 2, 4];
    $estados_str = implode(',', $estados_activos);
    
    $conn->begin_transaction(); // Iniciar transacción

    try {
        // --- 1. VERIFICAR si existen citas activas en este bloque ---
        $sql_check = "SELECT COUNT(*) AS total_citas 
                      FROM citas 
                      WHERE id_disponibilidad = ? AND id_estado IN ({$estados_str})";
        
        $stmt_check = $conn->prepare($sql_check);
        $stmt_check->bind_param("i", $id_disponibilidad);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();
        $total_citas = $result_check->fetch_assoc()['total_citas'];
        $stmt_check->close();

        if ($total_citas > 0) {
            throw new Exception("No se puede eliminar este bloque: Hay {$total_citas} citas confirmadas o pendientes asociadas.");
        }
        
        // --- 2. Eliminar el bloque de disponibilidad ---
        $sql_delete = "DELETE FROM disponibilidad WHERE id_disponibilidad = ?";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bind_param("i", $id_disponibilidad);
        
        if (!$stmt_delete->execute()) {
            throw new Exception("Error al eliminar la disponibilidad: " . $stmt_delete->error);
        }
        
        if ($stmt_delete->affected_rows > 0) {
            $conn->commit(); // Confirmar cambios
            $response = array(
                'status' => 'success',
                'message' => 'Bloque de disponibilidad eliminado exitosamente.'
            );
        } else {
            $conn->rollback(); // Revertir si no se encontró el ID
            $response = array(
                'status' => 'error',
                'message' => 'No se encontró el bloque de disponibilidad con el ID proporcionado.'
            );
        }
        $stmt_delete->close();

    } catch (Exception $e) {
        $conn->rollback(); // Revertir si hay una excepción
        $response['message'] = $e->getMessage();
    }
    
}

echo json_encode($response);
$conn->close();
?>