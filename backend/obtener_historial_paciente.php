<?php
// PHP/get_historial_paciente.php
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); 
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data['id_paciente'])) {
    $id_paciente = $data['id_paciente'];
    $historial = [];

    // Query compleja para obtener datos legibles
    // Unimos con medicos -> usuarios para saber el nombre del médico de la cita
    // Ordenamos por fecha de registro descendente (lo más reciente primero)
    
    // Query con LEFT JOIN para obtener nombres del médico (si existe)
    $sql = "SELECT 
                h.id_historial,
                h.id_cita,
                h.fecha_cita,
                h.hora_cita,
                h.motivo_cita,
                h.accion,
                h.motivo_accion,
                h.fecha_registro,
                m.nombres AS medico_nombres,
                m.apellidos AS medico_apellidos
            FROM historial_citas h
            LEFT JOIN medicos m ON h.id_medico = m.id_medico
            WHERE h.id_paciente = ?
            ORDER BY h.fecha_registro DESC";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $id_paciente);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $historial[] = $row;
        }
        
        echo json_encode(['status' => 'success', 'data' => $historial]);
        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error en consulta SQL: ' . $conn->error]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Falta id_paciente']);
}

$conn->close();
?>
