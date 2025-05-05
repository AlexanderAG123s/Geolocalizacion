<?php
// Archivo: backend/api/emergency/check_active_alert.php
require_once('../../config/database.php');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Verificar que se proporcione el correo
if (!isset($_GET['correo'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Se requiere el correo del usuario."
    ]);
    exit;
}

$correo = $_GET['correo'];

// Conectar a la base de datos
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos."
    ]);
    exit;
}

try {
    // Obtener el ID del usuario
    $query = "SELECT id FROM usuarios WHERE correo = :correo";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':correo', $correo);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            "success" => true,
            "has_active_alert" => false,
            "message" => "Usuario no encontrado."
        ]);
        exit;
    }
    
    $usuario_id = $user['id'];
    
    // Verificar si hay una alerta activa
    $query = "SELECT id, tipo_emergencia, fecha_inicio 
              FROM alertas 
              WHERE usuario_id = :usuario_id 
              AND activa = 1 
              AND fecha_fin IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->execute();
    
    $alerta = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($alerta) {
        echo json_encode([
            "success" => true,
            "has_active_alert" => true,
            "alerta_id" => $alerta['id'],
            "tipo_emergencia" => $alerta['tipo_emergencia'],
            "fecha_inicio" => $alerta['fecha_inicio']
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "has_active_alert" => false
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al verificar alertas activas: " . $e->getMessage()
    ]);
}
?>