<?php
// 1. Configuración de Errores Robust
error_reporting(E_ALL);
ini_set('display_errors', 0);

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "FATAL ERROR: " . $error['message']]);
        exit();
    }
});

ob_start(); // Iniciar buffer

// 2. Headers y Conexión
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include 'conexion.php';

// 3. Lógica
$ranking = [];
try {
    // Verificar tabla
    $check = $conn->query("SHOW TABLES LIKE 'medico_valoraciones'");
    if ($check && $check->num_rows > 0) {
        $sql = "SELECT m.id_medico, m.nombres, m.apellidos, m.especialidad, 
                    COUNT(v.id_valoracion) as total_votos, 
                    AVG(v.puntuacion) as promedio
                FROM medicos m
                LEFT JOIN medico_valoraciones v ON m.id_medico = v.id_medico
                GROUP BY m.id_medico
                ORDER BY promedio DESC, total_votos DESC";

        if ($result = $conn->query($sql)) {
            while ($row = $result->fetch_assoc()) {
                $row['promedio'] = $row['promedio'] ? number_format($row['promedio'], 1) : "0.0";
                $ranking[] = $row;
            }
        }
    }
} catch (Exception $e) {
}

ob_clean(); // Limpiar warnings
echo json_encode(["status" => "success", "data" => $ranking]);
$conn->close();
?>