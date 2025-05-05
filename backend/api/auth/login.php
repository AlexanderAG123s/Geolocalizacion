<?php
require_once('../../config/database.php');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['correo']) || !isset($input['contrasena'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos requeridos."
    ]);
    exit;
}

$correo = $input['correo'];
$contrasena = $input['contrasena'];

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

$query = "SELECT id, contrasena, nombre_completo, activo FROM usuarios WHERE correo = :correo";
$stmt = $conn->prepare($query);
$stmt->bindParam(':correo', $correo);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Si no se encuentra el usuario
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Usuario incorrecto."
    ]);
    exit;
}

if ($user['activo'] == 0) {
    // Si el usuario está desactivado
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Usuario inactivo."
    ]);
    exit;
}

// Verificar la contraseña utilizando bcrypt
if (!password_verify($contrasena, $user['contrasena'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Contraseña incorrecta."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Login exitoso",
    "user" => [
        "correo" => $correo,
        "nombre_completo" => $user['nombre_completo']
    ]
]);
?>
