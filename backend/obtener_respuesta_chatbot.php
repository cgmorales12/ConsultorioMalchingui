<?php
// 1. Configuración de Errores para Debugging (Captura errores fatales y los devuelve como JSON)
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar en HTML, capturar en buffer

// Función para capturar errores fatales (500)
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        ob_clean(); // Borrar cualquier lo que haya salido antes
        http_response_code(200); // Forzar 200 para que el cliente lea el JSON
        echo json_encode(["status" => "error", "message" => "FATAL ERROR: " . $error['message'] . " en línea " . $error['line']]);
        exit();
    }
});

ob_start(); // Iniciar buffer de salida

// 2. Encabezados CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// 3. Conexión Directa a BD
$server = 'localhost';
$user = 'root';
$pass = '';
$db = 'luz_y_vida_db';

$conn = new mysqli($server, $user, $pass, $db);

if ($conn->connect_error) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Error de Conexión BD: " . $conn->connect_error]);
    exit();
}
$conn->set_charset("utf8");

// 4. Leer Input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "No JSON recibido o JSON inválido"]);
    exit();
}

// 5. Lógica del Chatbot
if (isset($data['mensaje']) && isset($data['id_paciente'])) {

    // Usamos strtolower estándar para máxima compatibilidad
    $mensajeUsuario = strtolower($conn->real_escape_string($data['mensaje']));
    $idPaciente = intval($data['id_paciente']);
    $respuestaFinal = "";
    $intencion = "consulta_general";
    $mostrarEstrellas = false;

    // --- CONFIGURACIÓN ---
    $telefonoEmergencia = "+593900000000"; // 🚨 CAMBIAR AQUÍ EL NÚMERO DE EMERGENCIA

    // --- A. EMERGENCIAS ---
    $emergencias = ['emergencia', 'grave', 'dolor fuerte', 'accidente', 'urgencia'];
    foreach ($emergencias as $e) {
        if (strpos($mensajeUsuario, $e) !== false) {
            $respuestaFinal = "⚠️ <b>¡ATENCIÓN!</b><br>Si es una emergencia, contacta de inmediato:<br><br><a href='tel:$telefonoEmergencia'>📞 LLAMAR A EMERGENCIAS</a>";
            $intencion = "alerta_emergencia";
            break;
        }
    }

    // --- B. SALUDOS / DESPEDIDAS ---
    if (empty($respuestaFinal)) {
        $saludos = ['hola', 'buenos dias', 'buenas'];
        foreach ($saludos as $s) {
            if (strpos($mensajeUsuario, $s) !== false) {
                $respuestaFinal = "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?";
                $intencion = "saludo";
                break;
            }
        }
    }

    if (empty($respuestaFinal)) {
        $despedidas = ['gracias', 'adios', 'chao', 'excelente'];
        foreach ($despedidas as $d) {
            if (strpos($mensajeUsuario, $d) !== false) {
                $respuestaFinal = "¡Ha sido un gusto ayudarte! 😊<br><b>¿Cómo calificarías mi atención?</b>";
                $intencion = "pedido_valoracion";
                $mostrarEstrellas = true;
                break;
            }
        }
    }

    // --- C. MÉDICOS ---
    if (empty($respuestaFinal) && (strpos($mensajeUsuario, 'medico') !== false || strpos($mensajeUsuario, 'especialidad') !== false)) {
        $res = $conn->query("SELECT nombres, especialidad FROM medicos LIMIT 5");
        $respuestaFinal = "<b>Nuestros especialistas:</b><br>";
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $respuestaFinal .= "• Dr. " . $row['nombres'] . " (" . $row['especialidad'] . ")<br>";
            }
        }
        $respuestaFinal .= "<br>Puedes agendar en la sección de Citas.";
        $intencion = "listado_medicos";
    }

    // --- D. BASE DE CONOCIMIENTOS (chatbot_preguntas) ---
    if (empty($respuestaFinal)) {
        // Verificar existencia de tabla primero para evitar crash
        $checkTable = $conn->query("SHOW TABLES LIKE 'chatbot_preguntas'");
        if ($checkTable && $checkTable->num_rows > 0) {
            $sql = "SELECT respuesta, pregunta_clave FROM chatbot_preguntas WHERE '$mensajeUsuario' LIKE CONCAT('%', pregunta_clave, '%') LIMIT 1";
            $result = $conn->query($sql);
            if ($result && $row = $result->fetch_assoc()) {
                $respuestaFinal = $row['respuesta'];
                $intencion = $row['pregunta_clave'];
            }
        }
    }

    // Default
    if (empty($respuestaFinal)) {
        $respuestaFinal = "No entiendo tu consulta. ¿Deseas agendar una cita?";
        $intencion = "no_entendido";
    }

    // --- E. FEEDBACK AUTOMÁTICO ---
    // Si la respuesta es útil (no es hola, ni error, ni emergencia), pedimos calificación.
    $intencionesExcluidas = ['saludo', 'no_entendido', 'alerta_emergencia', 'pedido_valoracion'];

    if (!in_array($intencion, $intencionesExcluidas) && !empty($respuestaFinal)) {
        $respuestaFinal .= "<br><br><b>¿Deseas realizar otra consulta? Si no, ¡Califícanos!</b> ⭐";
        $mostrarEstrellas = true;
    }

    // --- F. GUARDAR HISTORIAL (Lógica Robusta v3) ---
    $idPacienteFinal = null; // Por defecto NULL para evitar crash por FK

    // 1. Verificar si el número recibido ya es un ID de paciente válido
    $checkDirect = $conn->query("SELECT id_paciente FROM pacientes WHERE id_paciente = $idPaciente LIMIT 1");
    if ($checkDirect && $checkDirect->num_rows > 0) {
        $idPacienteFinal = $idPaciente;
    } else {
        // 2. Si no es directo, verificamos si existe columna 'id_usuario' en tabla pacientes para buscar por ahí
        $checkCol = $conn->query("SHOW COLUMNS FROM pacientes LIKE 'id_usuario'");
        if ($checkCol && $checkCol->num_rows > 0) {
            $findP = $conn->query("SELECT id_paciente FROM pacientes WHERE id_usuario = $idPaciente LIMIT 1"); // Asumimos que lo que llega es id_usuario
            if ($findP && $rowP = $findP->fetch_assoc()) {
                $idPacienteFinal = $rowP['id_paciente'];
            }
        }
    }

    try {
        // Solo intentamos insertar si la tabla existe
        $checkHistorial = $conn->query("SHOW TABLES LIKE 'historial_chatbot'");
        if ($checkHistorial && $checkHistorial->num_rows > 0) {

            // Query preparada manejando NULL explícitamente
            $query = "INSERT INTO historial_chatbot (id_paciente, pregunta_usuario, respuesta_bot, intencion_detectada) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($query);

            if ($stmt) {
                // Truco para bind_param con NULL: Si idPacienteFinal es null, el tipo 'i' a veces falla en versiones viejas.
                // Mejor controlamos los tipos dinamicamente o pasamos NULL correctamente.
                if ($idPacienteFinal === null) {
                    // Si es NULL, enviamos null en el bind
                    $nullVar = null;
                    $stmt->bind_param("isss", $nullVar, $data['mensaje'], $respuestaFinal, $intencion);
                } else {
                    $stmt->bind_param("isss", $idPacienteFinal, $data['mensaje'], $respuestaFinal, $intencion);
                }
                $stmt->execute();
            }
        }
    } catch (Exception $e) {
        // Si falla, no detenemos la respuesta al usuario
    }

    ob_clean(); // Limpiar buffer antes de enviar JSON limpio
    echo json_encode([
        "status" => "success",
        "respuesta" => $respuestaFinal,
        "mostrarEstrellas" => $mostrarEstrellas
    ]);

} else {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Faltan parámetros (mensaje o id_paciente)"]);
}

$conn->close();
?>