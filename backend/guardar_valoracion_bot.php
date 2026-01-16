<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'conexion.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data['id_paciente']) && isset($data['puntuacion'])) {

    // 1. AUTO-CREACIÓN DE TABLA SI NO EXISTE
    $checkTable = $conn->query("SHOW TABLES LIKE 'chatbot_valoraciones'");
    if ($checkTable->num_rows == 0) {
        $sqlCreate = "CREATE TABLE chatbot_valoraciones (
            id_valoracion INT(11) AUTO_INCREMENT PRIMARY KEY,
            id_paciente INT(11) NULL,
            puntuacion INT(1) NOT NULL,
            fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $conn->query($sqlCreate);
    }

    $idPaciente = intval($data['id_paciente']);
    $puntuacion = intval($data['puntuacion']);

    // Si el id_paciente es 0 o negativo (usuario no logueado), lo guardamos como NULL
    $idPacienteSQL = ($idPaciente > 0) ? $idPaciente : "NULL";

    $sql = "INSERT INTO chatbot_valoraciones (id_paciente, puntuacion) VALUES ($idPacienteSQL, $puntuacion)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Valoración guardada"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error SQL: " . $conn->error]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}

$conn->close();
?>