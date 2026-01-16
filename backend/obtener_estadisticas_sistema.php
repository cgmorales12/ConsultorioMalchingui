<?php
// 1. Configuración de Errores Robust (Evita HTML en respuesta JSON)
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

// 2. Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

include 'conexion.php';

$stats = [
    "total_medicos" => 0,
    "total_citas" => 0,
    "medicos_disponibles_hoy" => 0
];

// 3. Consultas Seguras
try {
    // A. Médicos
    $sqlMed = "SELECT COUNT(*) as total FROM medicos";
    if ($res = $conn->query($sqlMed)) {
        $row = $res->fetch_assoc();
        $stats['total_medicos'] = $row['total'];
    }

    // B. Citas
    // Verificamos si la tabla citas existe antes de consultar
    $checkCitas = $conn->query("SHOW TABLES LIKE 'citas'");
    if ($checkCitas && $checkCitas->num_rows > 0) {
        $sqlCitas = "SELECT COUNT(*) as total FROM citas";
        if ($res = $conn->query($sqlCitas)) {
            $row = $res->fetch_assoc();
            $stats['total_citas'] = $row['total'];
        }
    }

    // C. Disponibilidad (Manejo de dias_disponibilidad)
    $checkDisp = $conn->query("SHOW TABLES LIKE 'dias_disponibilidad'");
    if ($checkDisp && $checkDisp->num_rows > 0) {
        $diaSemana = date('w');
        $diasMap = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 0 => 'Domingo'];
        $hoyNombre = $diasMap[$diaSemana];

        $sqlDisp = "SELECT COUNT(DISTINCT id_medico) as total FROM dias_disponibilidad WHERE dia = '$hoyNombre'";
        if ($res = $conn->query($sqlDisp)) {
            $row = $res->fetch_assoc();
            $stats['medicos_disponibles_hoy'] = $row['total'];
        }
    }
} catch (Exception $e) {
    // Si algo falla, stats se va con ceros, pero no rompe el JSON
    // Opcional: logear el error $e->getMessage()
}

ob_clean(); // Limpiar cualquier warning previo
echo json_encode(["status" => "success", "data" => $stats]);
$conn->close();
?>