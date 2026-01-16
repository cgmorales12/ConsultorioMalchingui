<?php
/**
 * agendar_cita.php
 * 
 * Este script se encarga de registrar una nueva cita médica en el sistema.
 * Realiza las siguientes validaciones:
 * 1. Verifica que los datos mínimos (Médico, Fecha, Hora, Paciente) estén presentes.
 * 2. Verifica si el paciente ya tiene una cita en ese mismo horario.
 * 3. Verifica si el médico ya tiene un turno ocupado en ese horario.
 * 4. Inserta la cita en la tabla 'citas' con estado 'Pendiente' (1).
 * 5. Registra la transacción en 'historial_citas' para trazabilidad.
 */

// Desactivar salida de errores en pantalla para no corromper la respuesta JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Encabezados CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejo de solicitud preliminar (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON Invalido: ' . json_last_error_msg());
    }

    $response = array('status' => 'error', 'message' => 'Datos de cita incompletos.');

    // 1. Validar datos mínimos obligatorios
    if (isset($data['id_medico'], $data['fecha_cita'], $data['hora_cita']) && (isset($data['cedula_paciente']) || isset($data['id_paciente']))) {

        $id_medico = $data['id_medico'];
        $fecha_cita = $data['fecha_cita'];
        $hora_cita = $data['hora_cita'];
        $motivo = isset($data['motivo']) ? trim($data['motivo']) : '';

        // 2. Resolver ID del Paciente (por ID directo o buscando por Cédula)
        $id_paciente = null;

        if (isset($data['id_paciente']) && !empty($data['id_paciente'])) {
            $id_paciente = $data['id_paciente'];
        } elseif (isset($data['cedula_paciente'])) {
            $cedula = $data['cedula_paciente'];
            // Consultar ID usando la cédula
            $sql_paciente = "SELECT id_paciente FROM pacientes WHERE cedula = ?";
            if ($stmt_paciente = $conn->prepare($sql_paciente)) {
                $stmt_paciente->bind_param("s", $cedula);
                $stmt_paciente->execute();
                $result_paciente = $stmt_paciente->get_result();

                if ($result_paciente->num_rows > 0) {
                    $row_p = $result_paciente->fetch_assoc();
                    $id_paciente = $row_p['id_paciente'];
                }
                $stmt_paciente->close();
            } else {
                throw new Exception("Error preparando consulta paciente: " . $conn->error);
            }
        }

        if (!$id_paciente) {
            echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado o no especificado.']);
            exit();
        }

        // 3. Formato de hora y validaciones
        $hora_simple = date('H:i', strtotime($hora_cita)); // Convertir a HH:MM
        $id_medico = (int) $id_medico;
        $id_paciente = (int) $id_paciente;

        // Validar si el paciente ya tiene cita (Evitar duplicados)
        // Se buscan citas en estado 1 (Pendiente) o 2 (Confirmada)
        $sql_check = "SELECT id_cita FROM citas WHERE id_paciente = ? AND fecha_cita = ? AND TIME_FORMAT(hora_cita, '%H:%i') = ? AND id_estado IN (1, 2)";
        if ($stmt_check = $conn->prepare($sql_check)) {
            $stmt_check->bind_param("iss", $id_paciente, $fecha_cita, $hora_simple);
            $stmt_check->execute();
            $stmt_check->store_result();

            if ($stmt_check->num_rows > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Ya tienes una cita agendada en este horario.']);
                $stmt_check->close();
                exit();
            }
            $stmt_check->close();
        }

        // Validar disponibilidad del médico (Evitar doble agendamiento)
        $sql_check_medico = "SELECT id_cita FROM citas WHERE id_medico = ? AND fecha_cita = ? AND TIME_FORMAT(hora_cita, '%H:%i') = ? AND id_estado IN (1, 2)";
        if ($stmt_check_m = $conn->prepare($sql_check_medico)) {
            $stmt_check_m->bind_param("iss", $id_medico, $fecha_cita, $hora_simple);
            $stmt_check_m->execute();
            $stmt_check_m->store_result();

            if ($stmt_check_m->num_rows > 0) {
                echo json_encode(['status' => 'error', 'message' => 'El médico ya tiene una cita ocupada en este horario.']);
                $stmt_check_m->close();
                exit();
            }
            $stmt_check_m->close();
        }

        // 4. Insertar la Cita
        $estado_pendiente = 1;
        $id_disponibilidad = isset($data['id_disponibilidad']) ? $data['id_disponibilidad'] : NULL;

        $sql_insert = "INSERT INTO citas (id_paciente, id_medico, fecha_cita, hora_cita, motivo, id_estado, id_disponibilidad) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)";

        if ($stmt_insert = $conn->prepare($sql_insert)) {
            $stmt_insert->bind_param("iisssii", $id_paciente, $id_medico, $fecha_cita, $hora_cita, $motivo, $estado_pendiente, $id_disponibilidad);

            if ($stmt_insert->execute()) {
                $id_cita_generada = $conn->insert_id;

                // 5. Registrar en Historial
                $accion = "CREADA";
                $tipo_usuario = "paciente"; // Por defecto
                $id_usuario_accion = $id_paciente;

                $motivo_historial = "Cita creada.";

                $sql_historial = "INSERT INTO historial_citas 
                    (id_cita, id_paciente, id_medico, fecha_cita, hora_cita, motivo_cita, 
                     id_usuario_accion, tipo_usuario, accion, motivo, motivo_accion) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                if ($stmt_h = $conn->prepare($sql_historial)) {
                    $stmt_h->bind_param(
                        "iiisssissss",
                        $id_cita_generada,
                        $id_paciente,
                        $id_medico,
                        $fecha_cita,
                        $hora_cita,
                        $motivo,
                        $id_usuario_accion,
                        $tipo_usuario,
                        $accion,
                        $motivo,
                        $motivo_historial
                    );
                    $stmt_h->execute();
                    $stmt_h->close();
                }

                $response = array(
                    'status' => 'success',
                    'message' => 'Cita solicitada con éxito.',
                    'id_cita' => $id_cita_generada
                );
            } else {
                $response['message'] = 'Error al insertar la cita: ' . $stmt_insert->error;
            }
            $stmt_insert->close();
        } else {
            throw new Exception("Error preparando inserción: " . $conn->error);
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(200);
    echo json_encode(['status' => 'error', 'message' => 'Error del Servidor: ' . $e->getMessage()]);
}

$conn->close();
?>