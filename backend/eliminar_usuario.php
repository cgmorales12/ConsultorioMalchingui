<?php
// C:\xampp\htdocs\consultorio\delete_usuario.php

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
// 2. LÓGICA DE ELIMINACIÓN TRANSACCIONAL
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Falta el ID del usuario a eliminar.');

if (isset($data['id_usuario'])) {
    
    $id_usuario = $data['id_usuario'];
    
    $conn->begin_transaction(); // Iniciar transacción

    try {
        // --- 1. Verificar si el usuario está asociado a un médico ---
        $sql_check_medico = "SELECT id_medico FROM medicos WHERE id_usuario = ?";
        $stmt_check = $conn->prepare($sql_check_medico);
        $stmt_check->bind_param("i", $id_usuario);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();
        $stmt_check->close();

        if ($result_check->num_rows > 0) {
            // Si es un médico, eliminamos primero el registro de la tabla medicos.
            // Esto libera la FK para poder eliminar de la tabla usuarios.
            $sql_delete_medico = "DELETE FROM medicos WHERE id_usuario = ?";
            $stmt_delete_medico = $conn->prepare($sql_delete_medico);
            $stmt_delete_medico->bind_param("i", $id_usuario);
            
            if (!$stmt_delete_medico->execute()) {
                throw new Exception("Error al eliminar el registro de médico asociado: " . $stmt_delete_medico->error);
            }
            $stmt_delete_medico->close();
            // Nota: Se asume que las restricciones FK de citas/disponibilidad están configuradas
            // para manejar la eliminación en cascada si es necesario.
        }

        // --- 2. Eliminar el usuario de la tabla USUARIOS ---
        $sql_delete_user = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt_delete_user = $conn->prepare($sql_delete_user);
        $stmt_delete_user->bind_param("i", $id_usuario);
        
        if (!$stmt_delete_user->execute()) {
            throw new Exception("Error al eliminar el usuario: " . $stmt_delete_user->error);
        }
        
        if ($stmt_delete_user->affected_rows > 0) {
            $conn->commit(); // Confirmar cambios
            $response = array(
                'status' => 'success',
                'message' => 'Usuario eliminado exitosamente.'
            );
        } else {
            $conn->rollback(); // Revertir si no se encontró el usuario
            $response = array(
                'status' => 'error',
                'message' => 'No se encontró el usuario con el ID proporcionado.'
            );
        }
        $stmt_delete_user->close();

    } catch (Exception $e) {
        $conn->rollback(); // Revertir si hay una excepción
        $response['message'] = $e->getMessage();
    }
    
}

echo json_encode($response);
$conn->close();
?>