<?php
// C:\xampp\htdocs\consultorio\get_reporte_bot.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include 'conexion.php';

// Consulta para obtener promedio y cantidad de votos
$sqlStats = "SELECT 
                AVG(puntuacion) as promedio, 
                COUNT(*) as total_votos 
             FROM chatbot_valoraciones";

// Consulta para obtener el conteo por cada estrella (para el gráfico de barras)
$sqlDistribucion = "SELECT puntuacion, COUNT(*) as cantidad 
                    FROM chatbot_valoraciones 
                    GROUP BY puntuacion 
                    ORDER BY puntuacion DESC";

$resStats = $conn->query($sqlStats);
$resDist = $conn->query($sqlDistribucion);

// 🚨 NUEVO: Obtener dudas no resueltas para entrenar
$sqlFallas = "SELECT id_bot, pregunta_usuario, fecha_interaccion 
              FROM historial_chatbot 
              WHERE intencion_detectada = 'no_entendido'
              ORDER BY fecha_interaccion DESC 
              LIMIT 20";
$resFallas = $conn->query($sqlFallas);

$reporte = [
    "stats" => $resStats->fetch_assoc(),
    "distribucion" => [],
    "preguntas_fallidas" => []
];

while ($row = $resDist->fetch_assoc()) {
    $reporte["distribucion"][] = $row;
}

while ($row = $resFallas->fetch_assoc()) {
    $reporte["preguntas_fallidas"][] = $row;
}

echo json_encode($reporte);
$conn->close();
?>