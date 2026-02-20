<?php
/**
 * conexion.php
 * 
 * Este archivo gestiona la conexión centralizada a la base de datos MySQL 'luz_y_vida_db'.
 * Se utiliza en todos los scripts del sistema para interactuar con los datos.
 */

// Credenciales de conexión
define('DB_SERVER', 'localhost');
define('DB_USER', 'root');     // Usuario por defecto de XAMPP
define('DB_PASS', '');         // Contraseña por defecto de XAMPP (vacía)
define('DB_NAME', 'luz_y_vida_db');

// Intentar conectar a la base de datos
$conn = new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_NAME);

// Verificar si hubo error en la conexión
if ($conn->connect_error) {
    // Si falla, responder con JSON para alertar al frontend
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    $response = array(
        'status' => 'error',
        'message' => 'Fallo al conectar con la base de datos: ' . $conn->connect_error
    );
    echo json_encode($response);
    exit();
}

// Establecer codificación de caracteres UTF-8
$conn->set_charset("utf8");

?>