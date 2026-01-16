<?php
/**
 * login.php
 * 
 * Este script maneja la autenticación de usuarios del sistema administrativo (Administradores y Médicos).
 * Recibe las credenciales (usuario y clave), las verifica en la base de datos y devuelve 
 * la información de sesión incluyendo el rol y el ID de médico si corresponde.
 */

// Configuración de encabezados CORS para permitir peticiones desde la App Ionic
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejo de solicitud preliminar (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

// Leer datos JSON recibidos
$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Datos inválidos o incompletos.');

if (isset($data['usuario']) && isset($data['clave'])) {
    $usuario = $data['usuario'];
    $clave = $data['clave'];

    // Consulta de usuario uniendo con tabla roles y medicos (para obtener id_medico si aplica)
    $sql = "SELECT u.id_usuario, u.usuario, u.clave, u.id_rol, r.nombre_rol, m.id_medico 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN medicos m ON u.id_usuario = m.id_usuario
            WHERE u.usuario = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();

            // Verificación de contraseña (comparación directa)
            if ($clave === $row['clave']) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Autenticación exitosa.',
                    'id_usuario' => $row['id_usuario'],
                    'usuario' => $row['usuario'],
                    'id_rol' => $row['id_rol'],
                    'rol' => $row['nombre_rol'],
                    'id_medico' => $row['id_medico']
                );
            } else {
                $response = array('status' => 'error', 'message' => 'Credenciales incorrectas.');
            }
        } else {
            $response = array('status' => 'error', 'message' => 'Credenciales incorrectas.');
        }

        $stmt->close();
    } else {
        $response = array('status' => 'error', 'message' => 'Error interno del servidor.');
    }
}

echo json_encode($response);
$conn->close();
?>