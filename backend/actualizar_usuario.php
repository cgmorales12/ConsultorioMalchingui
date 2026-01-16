<?php
// C:\xampp\htdocs\consultorio\update_usuario.php

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
// 2. LÓGICA DE ACTUALIZACIÓN DINÁMICA DE USUARIO
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de identificación del usuario.');

// Se requiere la ID del usuario y el nuevo nombre de usuario
if (isset($data['id_usuario']) && isset($data['usuario'])) {
    
    $id_usuario = $data['id_usuario'];
    $usuario = $data['usuario'];
    $clave = $data['clave'] ?? null;
    
    // Construir la sentencia UPDATE base
    $sql = "UPDATE usuarios SET usuario=?";
    $bind_params = "s";
    $bind_values = [$usuario];
    
    // Si se proporciona una nueva clave, la incluimos en el UPDATE
    if (!empty($clave)) {
        // NOTA: Aquí se actualizaría la clave hasheada si usaras hashing
        $sql .= ", clave=?";
        $bind_params .= "s";
        $bind_values[] = $clave;
    }
    
    // Añadir la condición WHERE
    $sql .= " WHERE id_usuario = ?";
    $bind_params .= "i"; // id_usuario
    $bind_values[] = $id_usuario;
    
    try {
        if ($stmt = $conn->prepare($sql)) {
            
            // Bind dinámico
            $stmt->bind_param($bind_params, ...$bind_values);

            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar el usuario: " . $stmt->error);
            }
            
            if ($stmt->affected_rows > 0) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Usuario actualizado exitosamente.'
                );
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'No se realizaron cambios en el usuario (datos iguales o ID incorrecta).'
                );
            }
            $stmt->close();
        } else {
             throw new Exception("Error en la preparación SQL: " . $conn->error);
        }

    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             $response['message'] = 'Error: El nombre de usuario ya existe. Elija otro.';
        }
    }
    
}

echo json_encode($response);
$conn->close();
?>