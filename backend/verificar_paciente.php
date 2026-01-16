<?php
// C:\xampp\htdocs\consultorio\verificar_paciente.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO
// **********************************************
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With'); 
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE VERIFICACIÓN
// **********************************************

include 'conexion.php'; // Asegúrate de que $conn esté definido aquí

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de verificación.');

if (isset($data['cedula'], $data['fecha_nacimiento'])) {
    $cedula = $data['cedula'];
    $fecha_nacimiento = $data['fecha_nacimiento'];

    // Consulta la tabla pacientes
    $sql = "SELECT id_paciente FROM pacientes WHERE cedula = ? AND fecha_nacimiento = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ss", $cedula, $fecha_nacimiento);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 1) {
            // Éxito: Paciente encontrado
            $response = array(
                'status' => 'success',
                'message' => 'Paciente verificado exitosamente.'
            );
        } else {
            // Error: No hay coincidencia
            $response['message'] = 'Verificación fallida: La Cédula o Fecha de Nacimiento no coinciden con nuestros registros.';
        }

        $stmt->close();
    } else {
        $response['message'] = 'Error en la preparación SQL: ' . $conn->error;
    }
}

echo json_encode($response);
$conn->close();
?>