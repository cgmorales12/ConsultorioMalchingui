<?php
// C:\xampp\htdocs\consultorio\update_cita_admin.php

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
// 2. LÓGICA DE ACTUALIZACIÓN DINÁMICA (UPDATE)
// **********************************************

include 'conexion.php'; // Asegúrate de que este archivo exista

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Faltan datos de identificación de la cita.');

// Se requiere al menos la ID de la cita
if (isset($data['id_cita'])) {
    
    $id_cita = $data['id_cita'];
    
    // Validar y obtener todos los campos que pueden ser actualizados
    $fecha_cita = $data['fecha_cita'] ?? null;
    $hora_cita = $data['hora_cita'] ?? null;
    $motivo = $data['motivo'] ?? null;
    $id_medico = $data['id_medico'] ?? null;
    $id_estado = $data['id_estado'] ?? null;
    $id_paciente = $data['id_paciente'] ?? null; // Podría ser necesario si se permite cambiar el paciente

    // Construir la sentencia UPDATE dinámicamente
    $set_parts = [];
    $bind_params = '';
    $bind_values = [];

    // Llenar las partes SET y los valores de enlace solo si el campo está presente
    if ($fecha_cita !== null) { $set_parts[] = "fecha_cita=?"; $bind_params .= "s"; $bind_values[] = $fecha_cita; }
    if ($hora_cita !== null) { $set_parts[] = "hora_cita=?"; $bind_params .= "s"; $bind_values[] = $hora_cita; }
    if ($motivo !== null) { $set_parts[] = "motivo=?"; $bind_params .= "s"; $bind_values[] = $motivo; }
    if ($id_medico !== null) { $set_parts[] = "id_medico=?"; $bind_params .= "i"; $bind_values[] = $id_medico; }
    if ($id_estado !== null) { $set_parts[] = "id_estado=?"; $bind_params .= "i"; $bind_values[] = $id_estado; }
    if ($id_paciente !== null) { $set_parts[] = "id_paciente=?"; $bind_params .= "i"; $bind_values[] = $id_paciente; }

    if (empty($set_parts)) {
        $response['message'] = 'No se proporcionaron campos para actualizar.';
        echo json_encode($response);
        exit();
    }
    
    // Construir la SQL final
    $sql = "UPDATE citas SET " . implode(", ", $set_parts) . " WHERE id_cita = ?";
    $bind_params .= "i"; // El último parámetro es la ID de la cita (integer)
    $bind_values[] = $id_cita;
    
    try {
        if ($stmt = $conn->prepare($sql)) {
            // Unir los valores a los parámetros dinámicamente usando el operador de propagación (...)
            // NOTA: Esta sintaxis requiere PHP 5.6+, lo cual XAMPP generalmente cumple.
            $stmt->bind_param($bind_params, ...$bind_values);

            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar la cita: " . $stmt->error);
            }
            
            if ($stmt->affected_rows > 0) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Cita actualizada exitosamente.'
                );
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'No se realizaron cambios en la cita (puede que los datos sean iguales o el ID no exista).'
                );
            }
            $stmt->close();
        } else {
            throw new Exception("Error en la preparación SQL: " . $conn->error);
        }

    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
    }
    
}

echo json_encode($response);
$conn->close();
?>