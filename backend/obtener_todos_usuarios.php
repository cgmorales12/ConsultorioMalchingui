<?php
// C:\xampp\htdocs\consultorio\get_all_usuarios.php

// **********************************************
// 1. HEADERS & CORS
// **********************************************
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json; charset=utf-8');

// Manejo de solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE CONSULTA
// **********************************************
include 'conexion.php'; 

$response = array('status' => 'error', 'message' => 'Error al obtener la lista de usuarios.');
$usuarios = [];

try {
    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    $sql = "SELECT 
                u.id_usuario, 
                u.usuario, 
                u.clave, 
                r.nombre_rol,
                r.id_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY r.nombre_rol, u.usuario ASC";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Asegurar encoding correcto
                $usuarios[] = array_map('utf8_encode', $row); 
                // OJO: Si tu DB ya está en utf8mb4, puedes usar $row directamente
                // $usuarios[] = $row;
            }
            $response = array(
                'status' => 'success',
                'data' => $usuarios
            );
        } else {
            $response = array(
                'status' => 'success',
                'data' => [],
                'message' => 'No hay usuarios registrados.'
            );
        }
    } else {
        throw new Exception("Error en la consulta: " . $conn->error);
    }

} catch (Exception $e) {
    $response = array(
        'status' => 'error',
        'message' => $e->getMessage()
    );
}

echo json_encode($response);
$conn->close();
?>