<?php
require_once('../../config/database.php');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Check if user ID or email is provided
$userId = isset($_GET['id']) ? $_GET['id'] : null;
$userEmail = isset($_GET['correo']) ? $_GET['correo'] : null;

if (!$userId && !$userEmail) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Se requiere ID o correo de usuario."
    ]);
    exit;
}

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

// Build query based on what was provided
if ($userId) {
    $query = "SELECT id, correo, nombre_completo, avatar FROM usuarios WHERE id = :param AND activo = 1";
    $paramName = ':param';
    $paramValue = $userId;
} else {
    $query = "SELECT id, correo, nombre_completo, avatar FROM usuarios WHERE correo = :param AND activo = 1";
    $paramName = ':param';
    $paramValue = $userEmail;
}

$stmt = $conn->prepare($query);
$stmt->bindParam($paramName, $paramValue);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Usuario no encontrado o inactivo."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => [
        "id" => $user['id'],
        "correo" => $user['correo'],
        "nombre_completo" => $user['nombre_completo'],
        "avatar" => $user['avatar']
    ]
]);
?>