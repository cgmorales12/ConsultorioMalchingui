<?php
// C:\xampp\htdocs\consultorio\entrenar_bot.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['pregunta'], $data['respuesta'])) {
    $pregunta = $conn->real_escape_string($data['pregunta']);
    $respuesta = $conn->real_escape_string($data['respuesta']);
    $idHistorial = isset($data['id_historial']) ? intval($data['id_historial']) : 0;

    // 1. Insertamos en la tabla de conocimiento
    $sqlInsert = "INSERT INTO chatbot_preguntas (pregunta_clave, respuesta, categoria) 
                  VALUES ('$pregunta', '$respuesta', 'Aprendizaje')";

    if ($conn->query($sqlInsert)) {

        // 2. Si viene de un reporte de fallo, actualizamos el historial para que no vuelva a salir como pendiente
        if ($idHistorial > 0) {
            $conn->query("UPDATE historial_chatbot SET intencion_detectada = 'entrenado' WHERE id_bot = $idHistorial");
        }

        echo json_encode(["status" => "success", "message" => "Bot entrenado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
$conn->close();
?>