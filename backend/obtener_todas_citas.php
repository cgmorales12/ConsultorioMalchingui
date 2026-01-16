<?php
// C:\xampp\htdocs\consultorio\get_all_citas.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO (Corregido)
// **********************************************

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
// Línea CORREGIDA para permitir Content-Type y X-Requested-With
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE CONSULTA (READ)
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$response = array('status' => 'error', 'message' => 'Error al obtener la lista de citas.');
$citas = [];

try {
    // Consulta SQL para obtener todas las citas con nombres de paciente, médico y estado.
    $sql = "SELECT 
                c.id_cita, 
                c.fecha_cita, 
                c.hora_cita, 
                c.motivo, 
                p.nombres AS paciente_nombres, 
                p.apellidos AS paciente_apellidos, 
                m.nombres AS medico_nombres, 
                m.apellidos AS medico_apellidos, 
                e.nombre_estado,
                c.id_estado,
                c.id_medico
            FROM citas c
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            INNER JOIN medicos m ON c.id_medico = m.id_medico
            INNER JOIN estados_cita e ON c.id_estado = e.id_estado
            ORDER BY c.fecha_cita DESC, c.hora_cita DESC";

    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $citas[] = $row;
            }
            $response = array(
                'status' => 'success',
                'data' => $citas
            );
        } else {
            $response = array(
                'status' => 'success',
                'data' => [],
                'message' => 'No hay citas registradas en el sistema.'
            );
        }
    } else {
        // Error de SQL (ej. tabla mal escrita)
        throw new Exception("Error en la consulta: " . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>