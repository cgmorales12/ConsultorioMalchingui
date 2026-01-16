<?php
// Archivo: get_paciente_data.php - Web Service para obtener datos de un paciente por cédula.

// **********************************************
// 1. CÓDIGO CORS (CRÍTICO PARA LA COMUNICACIÓN ANGULAR/PHP)
// **********************************************
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE CONSULTA
// **********************************************

// Asegúrate de que este archivo incluya la configuración de la base de datos y la variable $conn
include 'conexion.php'; 

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Cédula no proporcionada.');

if (isset($data['cedula'])) {
    $cedula = $data['cedula'];

    // Consulta SQL para obtener los datos básicos del paciente (nombres y apellidos son necesarios para el front-end)
    $sql = "SELECT cedula, nombres, apellidos FROM pacientes WHERE cedula = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($paciente = $result->fetch_assoc()) {
            // Éxito: Paciente encontrado
            $response = array(
                'status' => 'success',
                'message' => 'Datos de paciente recuperados.',
                'data' => $paciente // Devuelve el objeto con cédula, nombres y apellidos
            );
        } else {
            $response['message'] = 'Paciente no encontrado en la base de datos.';
        }

        $stmt->close();
    } else {
        $response['message'] = 'Error en la preparación SQL: ' . $conn->error;
    }
}

echo json_encode($response);
$conn->close();
?>