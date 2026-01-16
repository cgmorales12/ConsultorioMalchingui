<?php
// C:\xampp\htdocs\consultorio\create_sistema_user.php

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
// 2. LÓGICA DE INSERCIÓN DE USUARIO
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de usuario y clave.');

if (isset($data['usuario']) && isset($data['clave'])) {
    
    $usuario = $data['usuario'];
    $clave = $data['clave']; 
    // Si viene id_medico, es rol Medico (2), sino es rol Sistema (1) por defecto (o lo que venga en data)
    $id_rol = isset($data['id_medico']) ? 2 : ($data['id_rol'] ?? 1); 
    
    $conn->begin_transaction();

    try {
        // 1. Insertar USUARIO
        $sql = "INSERT INTO usuarios (usuario, clave, id_rol) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $usuario, $clave, $id_rol);

        if (!$stmt->execute()) {
            throw new Exception("Error al crear usuario: " . $stmt->error);
        }
        $id_nuevo_usuario = $conn->insert_id;
        $stmt->close();
        
        // 2. Si hay ID_MEDICO, vincularlo
        if (isset($data['id_medico']) && !empty($data['id_medico'])) {
            $id_medico = $data['id_medico'];
            $sql_update = "UPDATE medicos SET id_usuario = ? WHERE id_medico = ?";
            $stmt_update = $conn->prepare($sql_update);
            $stmt_update->bind_param("ii", $id_nuevo_usuario, $id_medico);
            
            if (!$stmt_update->execute()) {
                throw new Exception("Error al vincular médico: " . $stmt_update->error);
            }
            $stmt_update->close();
        }
        
        $conn->commit();
        
        $response = array(
            'status' => 'success',
            'message' => 'Usuario creado exitosamente.' . (isset($data['id_medico']) ? ' Vinculado al médico.' : '')
        );

    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = $e->getMessage();
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             $response['message'] = 'Error: El nombre de usuario ya existe.';
        }
    }
}

echo json_encode($response);
$conn->close();
?>