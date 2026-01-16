<?php
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_cita'], $data['id_medico'], $data['id_estado'], $data['motivo_cambio'])) {
    
    $id_cita = $data['id_cita'];
    $id_medico_accion = $data['id_medico']; // Usuario que ejecuta
    $nuevo_estado = $data['id_estado'];
    $motivo_cambio = trim($data['motivo_cambio']);
    
    // Obtener datos actuales de la cita antes de cualquier cambio (para el snapshot)
    $sql_get = "SELECT * FROM citas WHERE id_cita = ?";
    $stmt_g = $conn->prepare($sql_get);
    $stmt_g->bind_param("i", $id_cita);
    $stmt_g->execute();
    $res_g = $stmt_g->get_result();
    
    if ($res_g->num_rows == 0) {
        echo json_encode(['status' => 'error', 'message' => 'Cita no encontrada.']);
        $conn->close();
        exit();
    }
    
    $cita_actual = $res_g->fetch_assoc();
    $stmt_g->close();

    // Determinar valores para el historial (usar nuevos si se proveen, sino los actuales)
    $fecha_final = isset($data['fecha_cita']) ? $data['fecha_cita'] : $cita_actual['fecha_cita'];
    $hora_final = isset($data['hora_cita']) ? $data['hora_cita'] : $cita_actual['hora_cita'];
    $motivo_cita_final = isset($data['descripcion_cita']) ? $data['descripcion_cita'] : $cita_actual['motivo'];
    $id_paciente = $cita_actual['id_paciente'];
    $id_medico_cita = $cita_actual['id_medico']; // El médico dueño de la cita

    $accion = ($nuevo_estado == 3) ? 'CANCELADA' : 'MODIFICADA';

    // Iniciar transacción
    $conn->begin_transaction();

    try {
        if ($accion == 'CANCELADA') {
            // 1. Guardar en HISTORIAL (Snapshot con los datos que tenía al morir)
            $tipo_usuario = 'medico';
            $sql_historial = "INSERT INTO historial_citas 
                (id_cita, id_paciente, id_medico, fecha_cita, hora_cita, motivo_cita, 
                 id_usuario_accion, tipo_usuario, accion, motivo_accion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt_h = $conn->prepare($sql_historial);
            $stmt_h->bind_param("iiisssisss", 
                $id_cita, 
                $id_paciente, 
                $id_medico_cita, 
                $cita_actual['fecha_cita'], // Fecha que tenía
                $cita_actual['hora_cita'], // Hora que tenía
                $cita_actual['motivo'],     // Motivo que tenía
                $id_medico_accion, 
                $tipo_usuario, 
                $accion, 
                $motivo_cambio
            );
            $stmt_h->execute();

            // 2. ELIMINAR de CITAS (Limpieza)
            $sql_delete = "DELETE FROM citas WHERE id_cita = ?";
            $stmt_d = $conn->prepare($sql_delete);
            $stmt_d->bind_param("i", $id_cita);
            $stmt_d->execute();

            $msg = 'Cita cancelada y eliminada de agenda activa.';

        } else {
            // ES UNA MODIFICACIÓN (o APROBACIÓN con cambios)
            
            // 1. Actualizar tabla CITAS
            $sql_update = "UPDATE citas SET id_estado = ?, fecha_cita = ?, hora_cita = ?, motivo = ? WHERE id_cita = ?";
            $stmt_u = $conn->prepare($sql_update);
            $stmt_u->bind_param("isssi", $nuevo_estado, $fecha_final, $hora_final, $motivo_cita_final, $id_cita);
            $stmt_u->execute();

            // 2. Insertar en HISTORIAL (Snapshot con los NUEVOS datos)
            $tipo_usuario = 'medico';
            $sql_historial = "INSERT INTO historial_citas 
                (id_cita, id_paciente, id_medico, fecha_cita, hora_cita, motivo_cita, 
                 id_usuario_accion, tipo_usuario, accion, motivo_accion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt_h = $conn->prepare($sql_historial);
            $stmt_h->bind_param("iiisssisss", 
                $id_cita, 
                $id_paciente, 
                $id_medico_cita, 
                $fecha_final, 
                $hora_final, 
                $motivo_cita_final, 
                $id_medico_accion, 
                $tipo_usuario, 
                $accion, 
                $motivo_cambio
            );
            $stmt_h->execute();
            
            $msg = 'Cita modificada e historial registrado.';
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => $msg]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => 'Error en BD: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos.']);
}

$conn->close();
?>