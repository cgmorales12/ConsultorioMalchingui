<?php
// C:\xampp\htdocs\consultorio\login_paciente.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

// 🚨 IMPORTANTE: Usamos 'correo' porque es el nombre que viene del Frontend
if (isset($data['cedula']) && isset($data['correo'])) {
    $cedula = $conn->real_escape_string($data['cedula']);
    $correo = $conn->real_escape_string($data['correo']);

    // 🔍 La columna en la DB es 'email'
    $sql = "SELECT * FROM pacientes WHERE cedula = '$cedula' AND email = '$correo' LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $paciente = $result->fetch_assoc();
        echo json_encode(["status" => "success", "data" => $paciente]);
    } else {
        // Si no hay filas, las credenciales no coinciden
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
}
$conn->close();
?>