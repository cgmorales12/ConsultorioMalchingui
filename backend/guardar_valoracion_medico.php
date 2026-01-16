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

if (isset($data['id_medico']) && isset($data['puntuacion'])) {

    // 1. AUTO-CREACIÓN DE TABLA SI NO EXISTE
    $checkTable = $conn->query("SHOW TABLES LIKE 'medico_valoraciones'");
    if ($checkTable->num_rows == 0) {
        $sqlCreate = "CREATE TABLE medico_valoraciones (
            id_valoracion INT(11) AUTO_INCREMENT PRIMARY KEY,
            id_medico INT(11) NOT NULL,
            id_paciente INT(11) NULL,
            puntuacion INT(1) NOT NULL,
            comentario TEXT NULL,
            fecha_valoracion DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $conn->query($sqlCreate);
    }

    $idMedico = intval($data['id_medico']);
    $idPaciente = isset($data['id_paciente']) ? intval($data['id_paciente']) : "NULL";
    $puntuacion = intval($data['puntuacion']);
    $comentario = isset($data['comentario']) ? $conn->real_escape_string($data['comentario']) : "";

    // Validación básica de rango
    if ($puntuacion < 1)
        $puntuacion = 1;
    if ($puntuacion > 5)
        $puntuacion = 5;

    $sql = "INSERT INTO medico_valoraciones (id_medico, id_paciente, puntuacion, comentario) 
            VALUES ($idMedico, $idPaciente, $puntuacion, '$comentario')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Valoración guardada existosamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error SQL: " . $conn->error]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}

$conn->close();
?>