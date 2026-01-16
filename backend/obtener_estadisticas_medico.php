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

$idMedico = isset($_GET['id_medico']) ? intval($_GET['id_medico']) : 0;

if ($idMedico > 0) {
    try {
        $check = $conn->query("SHOW TABLES LIKE 'medico_valoraciones'");
        if ($check && $check->num_rows > 0) {
            // 1. Estadísticas Generales
            $sqlStats = "SELECT COUNT(*) as total_votos, AVG(puntuacion) as promedio 
                         FROM medico_valoraciones 
                         WHERE id_medico = $idMedico";
            $resStats = $conn->query($sqlStats);
            $stats = $resStats ? $resStats->fetch_assoc() : ['total_votos' => 0, 'promedio' => 0];

            // 2. Últimos 10 Comentarios
            $sqlComentarios = "SELECT comentario, puntuacion, fecha_valoracion 
                               FROM medico_valoraciones 
                               WHERE id_medico = $idMedico AND comentario != '' 
                               ORDER BY fecha_valoracion DESC LIMIT 10";
            $resComentarios = $conn->query($sqlComentarios);

            $comentarios = [];
            if ($resComentarios) {
                while ($row = $resComentarios->fetch_assoc()) {
                    $comentarios[] = $row;
                }
            }

            ob_clean(); // Limpiar antes del JSON
            echo json_encode([
                "status" => "success",
                "promedio" => $stats['promedio'] ? number_format($stats['promedio'], 1) : "0.0",
                "total_votos" => $stats['total_votos'],
                "comentarios" => $comentarios
            ]);
        } else {
            // Tabla no existe aún
            ob_clean();
            echo json_encode([
                "status" => "success",
                "promedio" => "0.0",
                "total_votos" => 0,
                "comentarios" => []
            ]);
        }
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Server Error"]);
    }

} else {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Falta id_medico"]);
}

$conn->close();