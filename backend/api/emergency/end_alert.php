<?php
// Archivo: emergency/end_alert.php
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
if (!isset($input['correo']) && !isset($input['alerta_id'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Se requiere correo o alerta_id."
    ]);
    exit;
}

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
    // Si se proporciona correo, buscar por usuario
    if (isset($input['correo'])) {
        $correo = $input['correo'];
        
        // Obtener el ID del usuario
        $query = "SELECT id FROM usuarios WHERE correo = :correo";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':correo', $correo);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception("Usuario no encontrado con el correo: $correo");
        }
        
        $usuario_id = $user['id'];
        
        // Actualizar todas las alertas activas del usuario
        $query = "UPDATE alertas 
                  SET activa = 0, 
                      fecha_fin = NOW(), 
                      estado_alerta = 'finalizada' 
                  WHERE usuario_id = :usuario_id 
                  AND activa = 1 
                  AND fecha_fin IS NULL";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->execute();
        
        $alertas_actualizadas = $stmt->rowCount();
        
        if ($alertas_actualizadas === 0) {
            echo json_encode([
                "success" => true,
                "message" => "No se encontraron alertas activas para finalizar."
            ]);
            exit;
        }
        
    } else {
        // Si se proporciona alerta_id, actualizar esa alerta específica
        $alerta_id = $input['alerta_id'];
        
        $query = "UPDATE alertas 
                  SET activa = 0, 
                      fecha_fin = NOW(), 
                      estado_alerta = 'finalizada' 
                  WHERE id = :alerta_id 
                  AND activa = 1 
                  AND fecha_fin IS NULL";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':alerta_id', $alerta_id);
        $stmt->execute();
        
        $alertas_actualizadas = $stmt->rowCount();
        
        if ($alertas_actualizadas === 0) {
            echo json_encode([
                "success" => true,
                "message" => "No se encontró la alerta especificada o ya estaba finalizada."
            ]);
            exit;
        }
    }
    
    // Respuesta exitosa
    echo json_encode([
        "success" => true,
        "message" => "Alerta(s) finalizada(s) correctamente",
        "alertas_actualizadas" => $alertas_actualizadas
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al finalizar la alerta: " . $e->getMessage()
    ]);
}
?>