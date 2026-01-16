<?php
/**
 * obtener_medicos.php
 * 
 * Este script consulta y devuelve la lista completa de médicos registrados en el sistema,
 * incluyendo su información personal y de usuario asociado.
 */

// Configuración Headers y CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$response = array('status' => 'error', 'message' => 'Error al obtener la lista de médicos.');
$medicos = [];

try {
    // Consulta SQL: Obtener datos de médicos y su usuario asociado
    // Se usa LEFT JOIN para no perder el médico si el usuario fue borrado (aunque no debería pasar)
    $sql = "SELECT 
                m.id_medico, 
                m.nombres, 
                m.apellidos, 
                m.especialidad, 
                m.cedula_profesional, 
                m.telefono,
                u.usuario,
                u.id_usuario
            FROM medicos m
            LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
            ORDER BY m.apellidos ASC";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $medicos[] = $row;
            }
            $response = array(
                'status' => 'success',
                'data' => $medicos
            );
        } else {
            $response = array(
                'status' => 'success',
                'data' => [],
                'message' => 'No hay médicos registrados en el sistema.'
            );
        }
    } else {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>