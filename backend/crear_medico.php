<?php
// C:\xampp\htdocs\consultorio\create_medico.php

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
// 2. LÓGICA DE INSERCIÓN (Transacción)
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo solo contenga la conexión a MySQL

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos requeridos.');

// Datos mínimos requeridos para crear un médico (usuario + datos personales)
if (isset($data['usuario'], $data['clave'], $data['nombres'], $data['apellidos'], $data['especialidad'], $data['cedula_profesional'])) {
    
    $conn->begin_transaction(); // Iniciar transacción para asegurar atomicidad
    
    try {
        // Datos de USUARIO
        $usuario = $data['usuario'];
        $clave = $data['clave']; // NOTA: Aquí deberías hashear la clave (password_hash)
        $id_rol_medico = 2; // Rol 2 = Médico

        // 1. Insertar en la tabla USUARIOS
        $sql_user = "INSERT INTO usuarios (usuario, clave, id_rol) VALUES (?, ?, ?)";
        $stmt_user = $conn->prepare($sql_user);
        $stmt_user->bind_param("ssi", $usuario, $clave, $id_rol_medico);
        
        if (!$stmt_user->execute()) {
            throw new Exception("Error al crear usuario: " . $stmt_user->error);
        }
        $id_usuario = $conn->insert_id; // Obtener la ID del usuario recién creado
        $stmt_user->close();

        // Datos de MÉDICO
        $nombres = $data['nombres'];
        $apellidos = $data['apellidos'];
        $especialidad = $data['especialidad'];
        $cedula_profesional = $data['cedula_profesional'];
        $telefono = $data['telefono'] ?? null;
        
        // 2. Insertar en la tabla MEDICOS (usando la ID de usuario)
        $sql_medico = "INSERT INTO medicos (id_usuario, nombres, apellidos, especialidad, cedula_profesional, telefono) 
                       VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_medico = $conn->prepare($sql_medico);
        $stmt_medico->bind_param("isssss", $id_usuario, $nombres, $apellidos, $especialidad, $cedula_profesional, $telefono);

        if (!$stmt_medico->execute()) {
            throw new Exception("Error al registrar médico: " . $stmt_medico->error);
        }
        $stmt_medico->close();

        $conn->commit(); // Confirmar la transacción
        
        $response = array(
            'status' => 'success',
            'message' => 'Médico y usuario creados exitosamente.'
        );

    } catch (Exception $e) {
        $conn->rollback(); // Revertir si algo falló
        $response['message'] = $e->getMessage();
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             $response['message'] = 'Error: El usuario o la cédula profesional ya existen.';
        }
    }
    
}

echo json_encode($response);
$conn->close();
?>