<?php
require_once('../../config/database.php');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido. Use POST."
    ]);
    exit;
}

// Obtener y decodificar los datos JSON
$input = json_decode(file_get_contents("php://input"), true);

// Verificar que todos los campos requeridos estén presentes
if (!isset($input['correo']) || !isset($input['tipo_emergencia']) || 
    !isset($input['latitud']) || !isset($input['longitud'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos requeridos: correo, tipo_emergencia, latitud, longitud."
    ]);
    exit;
}

// Extraer los datos
$correo = $input['correo'];
$tipo_emergencia = $input['tipo_emergencia'];
$latitud = $input['latitud'];
$longitud = $input['longitud'];

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
    // Iniciar transacción
    $conn->beginTransaction();
    
    // 1. Obtener el ID del usuario
    $query = "SELECT id FROM usuarios WHERE correo = :correo";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':correo', $correo);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception("Usuario no encontrado con el correo: $correo");
    }
    
    $usuario_id = $user['id'];
    
    // 2. Verificar si ya existe una alerta activa para este usuario
    $query = "SELECT id FROM alertas 
              WHERE usuario_id = :usuario_id 
              AND activa = 1 
              AND fecha_fin IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->execute();
    
    $alerta_existente = $stmt->fetch(PDO::FETCH_ASSOC);
    $alerta_id = null;
    
    if ($alerta_existente) {
        // Si ya existe una alerta activa, usamos esa
        $alerta_id = $alerta_existente['id'];
    } else {
        // 3. Crear una nueva alerta
        $query = "INSERT INTO alertas 
                  (usuario_id, tipo_emergencia, activa, estado_alerta) 
                  VALUES (:usuario_id, :tipo_emergencia, 1, 'pendiente')";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->bindParam(':tipo_emergencia', $tipo_emergencia);
        $stmt->execute();
        
        $alerta_id = $conn->lastInsertId();
    }
    
    // 4. Registrar la ubicación de la alerta
    $query = "INSERT INTO ubicaciones_alerta 
              (alerta_id, usuario_id, latitud, longitud) 
              VALUES (:alerta_id, :usuario_id, :latitud, :longitud)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':alerta_id', $alerta_id);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->bindParam(':latitud', $latitud);
    $stmt->bindParam(':longitud', $longitud);
    $stmt->execute();
    
    // Confirmar la transacción
    $conn->commit();
    
    // Respuesta exitosa
    echo json_encode([
        "success" => true,
        "message" => "Alerta registrada correctamente",
        "data" => [
            "alerta_id" => $alerta_id,
            "ubicacion_id" => $conn->lastInsertId(),
            "es_nueva_alerta" => !$alerta_existente
        ]
    ]);
    
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conn->rollBack();
    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al procesar la alerta: " . $e->getMessage()
    ]);
}
?>