<?php
// C:\xampp\htdocs\consultorio\get_all_disponibilidad.php

header('Access-Control-Allow-Origin: *'); 
header('Content-Type: application/json');

include 'conexion.php'; 

$response = array('status' => 'error', 'message' => 'Error al consultar disponibilidad global.');

try {
    // Consulta SQL para obtener toda la disponibilidad y unir los datos del médico
    $sql = "
        SELECT 
            d.id_disponibilidad, 
            d.fecha_dia, 
            d.hora_inicio, 
            d.hora_fin,
            m.nombres AS medico_nombres,
            m.apellidos AS medico_apellidos
        FROM disponibilidad d
        JOIN medicos m ON d.id_medico = m.id_medico
        ORDER BY d.fecha_dia, d.hora_inicio
    ";
    
    $result = $conn->query($sql);
    $disponibilidad = [];

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $disponibilidad[] = $row;
        }
        $response = array(
            'status' => 'success',
            'message' => 'Disponibilidad global cargada exitosamente.',
            'data' => $disponibilidad
        );
    } else {
        $response = array(
            'status' => 'success',
            'message' => 'No hay bloques de horario registrados en el sistema globalmente.',
            'data' => []
        );
    }
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>