<?php
// C:\xampp\htdocs\consultorio\update_cita_paciente.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = array('status' => 'error', 'message' => 'Datos incompletos.');

if (isset($data['id_cita'], $data['accion'], $data['motivo_accion'])) {

    $id_cita = $data['id_cita'];
    $accion_solicitada = $data['accion']; // 'modificar' o 'rechazar'
    $motivo_accion = $data['motivo_accion'];

    // Usuario que realiza la acción (Paciente)
    // Deberíamos recibir id_paciente, pero si no, intentamos obtenerlo de la cita
    // Para el historial, asumiremos 'paciente' como tipo.
    $tipo_usuario = 'paciente';

    // Primero obtenemos datos actuales de la cita para el historial
    $sql_get = "SELECT * FROM citas WHERE id_cita = ?";
    if ($stmt_get = $conn->prepare($sql_get)) {
        $stmt_get->bind_param("i", $id_cita);
        $stmt_get->execute();
        $res_get = $stmt_get->get_result();

        if ($res_get->num_rows > 0) {
            $cita_actual = $res_get->fetch_assoc();

            $id_paciente = $cita_actual['id_paciente'];
            $id_medico = $cita_actual['id_medico'];
            $fecha_actual = $cita_actual['fecha_cita'];
            $hora_actual = $cita_actual['hora_cita'];
            $motivo_cita_original = $cita_actual['motivo'];

            // Lógica según acción
            if ($accion_solicitada === 'rechazar') {
                // 🚨 HARD DELETE: Eliminar físicamente la cita de la BD

                // 1. Guardar primero en el historial (Snapshot)
                // Usamos 'CANCELADA' porque 'ELIMINADA' no está permitido en el ENUM de la BD
                insertarHistorial($conn, $id_cita, $id_paciente, $id_medico, $fecha_actual, $hora_actual, $motivo_cita_original, $id_paciente, 'paciente', 'CANCELADA', $motivo_accion);

                $sql_delete = "DELETE FROM citas WHERE id_cita = ?";
                if ($stmt_del = $conn->prepare($sql_delete)) {
                    $stmt_del->bind_param("i", $id_cita);
                    if ($stmt_del->execute()) {
                        $response = array('status' => 'success', 'message' => 'Cita eliminada correctamente.');
                    } else {
                        $response['message'] = 'Error al eliminar cita: ' . $conn->error;
                    }
                }
            } elseif ($accion_solicitada === 'modificar') {
                // Requiere nueva fecha y hora
                if (isset($data['nueva_fecha'], $data['nueva_hora'])) {
                    $nueva_fecha = $data['nueva_fecha'];
                    $nueva_hora = $data['nueva_hora'];

                    // Al modificar, pasamos a estado 1 (Pendiente) para re-aprobación
                    $nuevo_estado = 1;

                    $sql_update = "UPDATE citas SET fecha_cita = ?, hora_cita = ?, id_estado = ? WHERE id_cita = ?";
                    if ($stmt_upd = $conn->prepare($sql_update)) {
                        $stmt_upd->bind_param("ssii", $nueva_fecha, $nueva_hora, $nuevo_estado, $id_cita);
                        if ($stmt_upd->execute()) {

                            // Guardar en Historial (Registramos la MODIFICACION)
                            // Nota: en historial guardamos los datos resultantes de la acción o snapshot?
                            // Solicitud: "guarde el registro".

                            $accion_texto = "MODIFICADA";
                            insertarHistorial($conn, $id_cita, $id_paciente, $id_medico, $nueva_fecha, $nueva_hora, $motivo_cita_original, $id_paciente, 'paciente', $accion_texto, $motivo_accion);

                            $response = array('status' => 'success', 'message' => 'Cita modificada. Esperando nueva aprobación.');
                        } else {
                            $response['message'] = 'Error al modificar cita: ' . $conn->error;
                        }
                    }
                } else {
                    $response['message'] = 'Faltan fecha y hora para modificar.';
                }
            } else {
                $response['message'] = 'Acción no válida.';
            }

        } else {
            $response['message'] = 'Cita no encontrada.';
        }
        $stmt_get->close();
    }
} else {
    $response['message'] = 'Datos insuficientes (id_cita, accion, motivo_accion).';
}

function insertarHistorial($conn, $id_cita, $id_pac, $id_med, $fecha, $hora, $motivo_cita, $id_actor, $tipo_actor, $accion, $motivo_accion)
{
    // Asumimos tabla historial_citas existe con estructura standard
    // Agregamos 'motivo' redundante
    $sql = "INSERT INTO historial_citas (id_cita, id_paciente, id_medico, fecha_cita, hora_cita, motivo_cita, id_usuario_accion, tipo_usuario, accion, motivo, motivo_accion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("iiisssissss", $id_cita, $id_pac, $id_med, $fecha, $hora, $motivo_cita, $id_actor, $tipo_actor, $accion, $motivo_cita, $motivo_accion);
        $stmt->execute();
        $stmt->close();
    }
}

echo json_encode($response);
$conn->close();
?>