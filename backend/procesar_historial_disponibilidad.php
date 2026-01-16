<?php
// C:\xampp\htdocs\consultorio\procesar_historial_disponibilidad.php

header('Access-Control-Allow-Origin: *'); 
header('Content-Type: application/json');

include 'conexion.php'; 

$response = array('status' => 'error', 'message' => 'Error al procesar historial.');

try {
    // 1. Crear tabla de historial si no existe
    $sql_create = "CREATE TABLE IF NOT EXISTS historial_disponibilidad (
        id_historial INT AUTO_INCREMENT PRIMARY KEY,
        id_disponibilidad_original INT,
        id_medico INT,
        fecha_dia DATE,
        hora_inicio TIME,
        hora_fin TIME,
        confirmada_por_medico TINYINT,
        fecha_archivado DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql_create)) {
        throw new Exception("Error creando tabla historial: " . $conn->error);
    }

    // 2. Copiar registros pasados (menores a HOY) al historial
    // Usamos CURDATE() que devuelve la fecha actual del servidor MySQL (YYYY-MM-DD)
    $sql_move = "INSERT INTO historial_disponibilidad (id_disponibilidad_original, id_medico, fecha_dia, hora_inicio, hora_fin, confirmada_por_medico)
                 SELECT id_disponibilidad, id_medico, fecha_dia, hora_inicio, hora_fin, confirmada_por_medico
                 FROM disponibilidad
                 WHERE fecha_dia < CURDATE()";

    if ($conn->query($sql_move)) {
        $rows_moved = $conn->affected_rows;
        
        // 3. Eliminar los registros originales de la tabla disponibilidad
        // Solo si se movieron (o intentamos borrar igual por consistencia, pero mejor usar la misma condición)
        $sql_delete = "DELETE FROM disponibilidad WHERE fecha_dia < CURDATE()";
        
        if ($conn->query($sql_delete)) {
            $rows_deleted = $conn->affected_rows;
            $response = array(
                'status' => 'success',
                'message' => 'Proceso completado.',
                'registros_archivados' => $rows_moved,
                'registros_eliminados' => $rows_deleted
            );
        } else {
            throw new Exception("Error eliminando registros antiguos: " . $conn->error);
        }
    } else {
        throw new Exception("Error moviendo registros al historial: " . $conn->error);
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
