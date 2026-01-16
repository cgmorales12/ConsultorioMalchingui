<?php
// C:\xampp\htdocs\consultorio\responder_mensaje.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

$response = array('status' => 'error', 'message' => 'Datos incompletos.');

if(isset($data->id_mensaje) && isset($data->respuesta)) {
    
    $id_mensaje = $data->id_mensaje;
    $respuesta = $data->respuesta;

    // Actualizar el mensaje con la respuesta, cambiar estado a 'respondido' y poner fecha
    $sql = "UPDATE mensajes_telemedicina 
            SET respuesta_medico = ?, estado = 'respondido', fecha_respuesta = NOW() 
            WHERE id_mensaje = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("si", $respuesta, $id_mensaje); // s = string, i = integer
        
        if ($stmt->execute()) {
             if ($stmt->affected_rows > 0) {
                $response = array("status" => "success", "message" => "Respuesta enviada correctamente.");
             } else {
                $response = array("status" => "error", "message" => "No se encontró el mensaje o ya fue respondido.");
             }
        } else {
            $response = array("status" => "error", "message" => "Error SQL: " . $stmt->error);
        }
        $stmt->close();
    } else {
        $response = array("status" => "error", "message" => "Error preparación SQL: " . $conn->error);
    }
} 

echo json_encode($response);
$conn->close();
?>
