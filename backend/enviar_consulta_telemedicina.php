<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_paciente'], $data['id_medico'], $data['mensaje'])) {
    
    // Escapamos los datos para seguridad
    $id_paciente = $conn->real_escape_string($data['id_paciente']);
    $id_medico   = $conn->real_escape_string($data['id_medico']);
    $mensaje     = $conn->real_escape_string($data['mensaje']);
    $tipo        = isset($data['tipo']) ? $conn->real_escape_string($data['tipo']) : 'chat';

    // Iniciamos una transacción para asegurar que ambos inserts ocurran
    $conn->begin_transaction();

    try {
        // 1. Inserción en la tabla operativa (Mensajes en vivo)
        $sql1 = "INSERT INTO mensajes_telemedicina (id_paciente, id_medico, mensaje_paciente, estado) 
                 VALUES ('$id_paciente', '$id_medico', '$mensaje', 'pendiente')";
        $conn->query($sql1);

        // 2. Inserción en la tabla de historial (Registro clínico)
        // Usamos la columna 'pregunta_paciente' según la estructura de tu tabla historial_telemedicina
        $sql2 = "INSERT INTO historial_telemedicina (id_paciente, id_medico, tipo_comunicacion, pregunta_paciente) 
                 VALUES ('$id_paciente', '$id_medico', '$tipo', '$mensaje')";
        $conn->query($sql2);

        // Si llegamos aquí sin errores, confirmamos los cambios
        $conn->commit();
        
        echo json_encode(["status" => "success", "message" => "Tu consulta ha sido enviada y registrada en el historial."]);

    } catch (Exception $e) {
        // Si algo falla, revertimos todo
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => "Error al procesar la consulta: " . $conn->error]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Faltan datos requeridos."]);
}

$conn->close();
?>