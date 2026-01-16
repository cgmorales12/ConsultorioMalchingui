<?php
// C:\xampp\htdocs\consultorio\registro_paciente.php

// **********************************************
// 0. GESTIÓN DE ERRORES (DESARROLLO)
// **********************************************
// ÚNICAMENTE para depuración en desarrollo: Muestra errores fatales.
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE REGISTRO DE PACIENTE
// **********************************************

// Asegúrate de que conexion.php establece $conn
include 'conexion.php'; 

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos requeridos.');

// Verifica que los campos NOT NULL requeridos estén presentes
if (isset($data['cedula'], $data['nombres'], $data['apellidos'], $data['fecha_nacimiento'])) {
    
    $cedula = $data['cedula'];
    $nombres = $data['nombres'];
    $apellidos = $data['apellidos'];
    $fecha_nacimiento = $data['fecha_nacimiento'];
    $telefono = $data['telefono'] ?? null; 
    $email = $data['email'] ?? null;
    $direccion = $data['direccion'] ?? null;

    // Sentencia SQL de Inserción
    $sql = "INSERT INTO pacientes (cedula, nombres, apellidos, fecha_nacimiento, telefono, email, direccion) 
             VALUES (?, ?, ?, ?, ?, ?, ?)";

    if ($stmt = $conn->prepare($sql)) {
        
        // Enlazar parámetros: sssssss (todos se tratan como strings)
        $stmt->bind_param("sssssss", $cedula, $nombres, $apellidos, $fecha_nacimiento, $telefono, $email, $direccion);

        if ($stmt->execute()) {
            $response = array(
                'status' => 'success',
                'message' => 'Paciente registrado exitosamente.',
                'id_paciente' => $conn->insert_id 
            );
        } else {
            // Manejo de error de duplicidad (SQL Error Code 1062)
            if ($stmt->errno == 1062) {
                // Se intentó registrar una cédula o email que ya existe (UNIQUE KEY)
                $response['message'] = 'Error: La cédula o el email ya están registrados. Por favor, verifique sus datos.';
            } else {
                // Otro error de la base de datos (ej. fecha no válida)
                $response['message'] = 'Error al registrar el paciente: ' . $stmt->error;
            }
        }

        $stmt->close();
    } else {
        // Error de preparación SQL
        $response['message'] = 'Error en la preparación SQL: ' . $conn->error;
    }
}

echo json_encode($response);
$conn->close();
?>
