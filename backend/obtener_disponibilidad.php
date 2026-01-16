<?php
// C:\xampp\htdocs\consultorio\get_disponibilidad.php

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$fecha_consulta = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');
$id_medico = isset($_GET['id_medico']) ? $_GET['id_medico'] : null;

$response = array('status' => 'error', 'message' => 'No se pudo obtener la disponibilidad.');
$data_final = [];

// 1. Obtener citas ocupadas
$citas_ocupadas = [];
// Si hay médico específico, filtros por él. Si no, traemos todas las del día.
$sql_citas = "SELECT id_medico, hora_cita FROM citas WHERE fecha_cita = ?";
if ($id_medico) {
    $sql_citas .= " AND id_medico = ?";
}

if ($stmt_citas = $conn->prepare($sql_citas)) {
    if ($id_medico) {
        $stmt_citas->bind_param("si", $fecha_consulta, $id_medico);
    } else {
        $stmt_citas->bind_param("s", $fecha_consulta);
    }
    
    $stmt_citas->execute();
    $res_citas = $stmt_citas->get_result();
    while ($row_cita = $res_citas->fetch_assoc()) {
        // Clave compuest para identificar ocupación: ID_MEDICO + HORA
        // Si no hay id_medico (global), necesitamos identificar a quién pertenece la hora
        $key = ($id_medico ? "" : $row_cita['id_medico'] . "_") . date("H:i", strtotime($row_cita['hora_cita']));
        $citas_ocupadas[] = $key;
    }
    $stmt_citas->close();
}

// 2. Obtener Disponibilidad Base
$sql = "SELECT id_medico, id_disponibilidad, hora_inicio, hora_fin 
        FROM disponibilidad 
        WHERE fecha_dia = ?";
if ($id_medico) {
    $sql .= " AND id_medico = ?";
}
$sql .= " ORDER BY id_medico, hora_inicio ASC";

if ($stmt = $conn->prepare($sql)) {
    if ($id_medico) {
        $stmt->bind_param("si", $fecha_consulta, $id_medico);
    } else {
        $stmt->bind_param("s", $fecha_consulta);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $inicio = strtotime($row['hora_inicio']);
            $fin = strtotime($row['hora_fin']);
            $current_medico_id = $row['id_medico'];
            
            for ($i = $inicio; $i < $fin; $i += 1800) {
                $hora_slot = date("H:i", $i);
                $key_check = ($id_medico ? "" : $current_medico_id . "_") . $hora_slot;
                
                // Si NO está ocupado, agregamos
                if (!in_array($key_check, $citas_ocupadas)) {
                    $data_final[] = array(
                        'id_medico' => $current_medico_id, // Importante para el frontend
                        'hora_inicio' => $hora_slot,
                        'id_disponibilidad' => $row['id_disponibilidad']
                    );
                }
            }
        }
        $response = array(
            'status' => 'success',
            'fecha' => $fecha_consulta,
            'data' => $data_final
        );
    } else {
        // ... (no changes needed for empty, returns success empty)
        $response = array('status' => 'success', 'data' => [], 'message' => 'No hay turnos.');
    }
    $stmt->close();
} else {
    $response['message'] = 'Error SQL: ' . $conn->error;
}

echo json_encode($response);
$conn->close();
?>