<?php
// C:\xampp\htdocs\consultorio\get_citas_medico.php

// **********************************************
// 1. CÓDIGO CORS ESTANDARIZADO (Corregido)
// **********************************************

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// Línea CORREGIDA para permitir Content-Type y X-Requested-With
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejar la solicitud OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// **********************************************
// 2. LÓGICA DE CONSULTA (READ - Citas Pendientes)
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$response = array('status' => 'error', 'message' => 'Falta el ID del médico.');

// Se usa POST para pasar el id_medico, generalmente obtenido de la sesión (Capacitor Storage)
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_medico'])) {
    $id_medico = $data['id_medico'];
    $citas = [];

    // ******************************************************************
    // 🚨 LIMPIEZA AUTOMÁTICA: Borrar TODAS las citas con fecha pasada
    // ******************************************************************
    $sql_delete = "DELETE FROM citas WHERE fecha_cita < CURDATE()";
    $conn->query($sql_delete);


    // Consulta SQL para obtener citas con los datos del paciente y el estado
    // Consulta SQL para obtener citas con los datos del paciente y el estado
    $sql = "SELECT 
                c.id_cita, 
                c.fecha_cita, 
                c.hora_cita, 
                c.motivo, 
                p.nombres AS paciente_nombres, 
                p.apellidos AS paciente_apellidos, 
                p.cedula AS paciente_cedula,
                p.telefono AS paciente_telefono,
                e.nombre_estado,
                c.id_estado
            FROM citas c
            LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente
            LEFT JOIN estados_cita e ON c.id_estado = e.id_estado
            WHERE c.id_medico = ? AND c.id_estado IN (1, 2) -- Citas Pendientes (1) y Confirmadas (2)
            ORDER BY c.fecha_cita ASC, c.hora_cita ASC";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $id_medico);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $citas[] = $row;
            }
            $response = array(
                'status' => 'success',
                'citas' => $citas
            );
        } else {
            $response = array(
                'status' => 'success',
                'citas' => [],
                'message' => 'No tiene citas pendientes por confirmar.'
            );
        }
        $stmt->close();
    } else {
        $response['message'] = 'Error en la preparación SQL: ' . $conn->error;
    }

}

echo json_encode($response);
$conn->close();
?>