<?php
// C:\xampp\htdocs\consultorio\update_medico.php

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
// 2. LÓGICA DE ACTUALIZACIÓN TRANSACCIONAL
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de identificación o actualización.');

// Requeridos: id_medico, id_usuario, usuario, nombres, especialidad (campos base)
if (isset($data['id_medico'], $data['id_usuario'], $data['usuario'], $data['nombres'], $data['especialidad'])) {
    
    $conn->begin_transaction(); // Iniciar transacción
    
    try {
        $id_medico = $data['id_medico'];
        $id_usuario = $data['id_usuario'];
        
        // Datos de MÉDICO
        $nombres = $data['nombres'];
        $apellidos = $data['apellidos'];
        $especialidad = $data['especialidad'];
        $cedula_profesional = $data['cedula_profesional'];
        $telefono = $data['telefono'] ?? null;
        
        // 1. Actualizar la tabla MEDICOS
        $sql_medico = "UPDATE medicos 
                        SET nombres=?, apellidos=?, especialidad=?, cedula_profesional=?, telefono=? 
                        WHERE id_medico = ?";
        $stmt_medico = $conn->prepare($sql_medico);
        // Parámetros: sssssi (strings, string, string, string, string, integer)
        $stmt_medico->bind_param("sssssi", $nombres, $apellidos, $especialidad, $cedula_profesional, $telefono, $id_medico);

        if (!$stmt_medico->execute()) {
            throw new Exception("Error al actualizar datos de médico: " . $stmt_medico->error);
        }
        $stmt_medico->close();
        
        // 2. Actualizar la tabla USUARIOS (dinámico para clave opcional)
        $usuario = $data['usuario'];
        $sql_user = "UPDATE usuarios SET usuario=?";
        $bind_params = "s";
        $bind_values = [$usuario];
        
        // Si se proporciona una nueva clave, la incluimos
        if (isset($data['clave']) && !empty($data['clave'])) {
            $clave = $data['clave'];
            $sql_user .= ", clave=?";
            $bind_params .= "s";
            $bind_values[] = $clave;
        }
        
        $sql_user .= " WHERE id_usuario = ?";
        $bind_params .= "i"; // id_usuario
        $bind_values[] = $id_usuario;

        $stmt_user = $conn->prepare($sql_user);
        // bind_param dinámico
        $stmt_user->bind_param($bind_params, ...$bind_values); 
        
        if (!$stmt_user->execute()) {
            throw new Exception("Error al actualizar usuario de acceso: " . $stmt_user->error);
        }
        $stmt_user->close();

        $conn->commit(); // Confirmar la transacción
        
        $response = array(
            'status' => 'success',
            'message' => 'Médico y credenciales actualizados exitosamente.'
        );

    } catch (Exception $e) {
        $conn->rollback(); // Revertir si algo falló
        $response['message'] = 'Error de actualización: ' . $e->getMessage();
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             $response['message'] = 'Error: El nombre de usuario o la cédula profesional ya existen.';
        }
    }
    
}

echo json_encode($response);
$conn->close();
?>