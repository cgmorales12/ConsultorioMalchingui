<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'conexion.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data['id_mensaje']) && isset($data['respuesta'])) {
    $idMensaje = intval($data['id_mensaje']);
    $respuesta = $conn->real_escape_string($data['respuesta']);

    // Actualizar respuesta y cambiar estado a 'respondido'
    $sql = "UPDATE mensajes_telemedicina 
            SET respuesta_medico = '$respuesta', 
                estado = 'respondido', 
                fecha_respuesta = NOW() 
            WHERE id_mensaje = $idMensaje";

    if ($conn->query($sql) === TRUE) {

        // --- LIMPIEZA AUTOMÁTICA ---
        // Recuperamos médico y paciente de este mensaje para borrar los viejos
        $sqlInfo = "SELECT id_medico, id_paciente FROM mensajes_telemedicina WHERE id_mensaje = $idMensaje";
        $resInfo = $conn->query($sqlInfo);

        if ($resInfo && $row = $resInfo->fetch_assoc()) {
            $idMedico = $row['id_medico'];
            $idPaciente = $row['id_paciente'];

            // Regla: "Solo guardar una respondido (la actual) y una pendiente"
            // Borramos todas las 'respondido' anteriores de este par médico-paciente que NO sean la actual
            $sqlDelete = "DELETE FROM mensajes_telemedicina 
                          WHERE id_medico = $idMedico 
                          AND id_paciente = $idPaciente 
                          AND estado = 'respondido' 
                          AND id_mensaje != $idMensaje";

            $conn->query($sqlDelete);
        }

        echo json_encode(["status" => "success", "message" => "Respuesta guardada y limpieza realizada"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al guardar respuesta: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}

$conn->close();
?>