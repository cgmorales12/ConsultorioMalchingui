<?php
// C:\xampp\htdocs\consultorio\delete_paciente.php

// **********************************************
// 1. CONFIGURACIÓN CORS Y ENCABEZADOS
// **********************************************

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. CONEXIÓN Y RECEPCIÓN DE DATOS
// **********************************************

include 'conexion.php'; 

// Recibir los datos JSON (esperamos solo la cédula)
$data = json_decode(file_get_contents("php://input"), true);

$response = array('status' => 'error', 'message' => 'Solicitud inválida.');

if (isset($data['cedula'])) {
    
    // Sanear y obtener datos
    $cedula = $conn->real_escape_string($data['cedula']);

    // **********************************************
    // 3. LÓGICA DE ELIMINACIÓN (DELETE)
    // **********************************************

    // 🚨 ADVERTENCIA: Se asume que la base de datos maneja la integridad referencial (citas)
    // Si el paciente tiene citas activas y la tabla citas depende de pacientes, esta eliminación fallará
    // a menos que la DB esté configurada para 'ON DELETE CASCADE'.

    $sql = "DELETE FROM pacientes WHERE cedula = ?";
    
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        $response['message'] = 'Error al preparar la consulta: ' . $conn->error;
    } else {
        $stmt->bind_param("s", $cedula); // 's' para string
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response = array('status' => 'success', 'message' => 'Paciente eliminado exitosamente.');
            } else {
                $response = array('status' => 'error', 'message' => 'No se encontró el paciente con la cédula proporcionada o ya fue eliminado.');
            }
        } else {
            // Este error puede ser causado por FK (Foreign Key constraint, si tiene citas activas)
            $response['message'] = 'Error al eliminar el paciente. Posiblemente tiene citas pendientes o activas: ' . $stmt->error;
        }
        $stmt->close();
    }
} else {
    $response['message'] = 'Cédula no proporcionada para la eliminación.';
}

echo json_encode($response);
$conn->close();
?>