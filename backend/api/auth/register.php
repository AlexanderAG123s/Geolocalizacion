<?php
header('Content-Type: application/json; charset=UTF-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$host = "localhost";
$db_name = "panico";
$username = "root";        
$password = "";            

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$nombre_completo = $_POST['nombre_completo'] ?? null;
$fech_nac        = $_POST['fech_nac'] ?? null;
$sexo            = $_POST['sexo'] ?? null;
$calle           = $_POST['calle'] ?? null;
$numero          = $_POST['numero'] ?? null;
$colonia         = $_POST['colonia'] ?? null;
$municipio       = $_POST['municipio'] ?? null;
$curp            = $_POST['curp'] ?? null;
$correo          = $_POST['correo'] ?? null;
$contrasena      = $_POST['contrasena'] ?? null;
$avatar          = $_FILES['avatar'] ?? null;

if (!$nombre_completo || !$fech_nac || !$sexo || !$calle || !$numero || !$colonia || !$municipio || !$curp || !$correo || !$contrasena) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Correo no válido']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ? OR curp = ?");
$stmt->execute([$correo, $curp]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'El correo o CURP ya está registrado']);
    exit;
}

$avatar_url = null;
if ($avatar && $avatar['error'] === UPLOAD_ERR_OK) {
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxFileSize = 5 * 1024 * 1024;

    if (!in_array($avatar['type'], $allowedMimeTypes)) {
        echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido']);
        exit;
    }

    if ($avatar['size'] > $maxFileSize) {
        echo json_encode(['success' => false, 'message' => 'El archivo es demasiado grande']);
        exit;
    }

    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $fileName = uniqid() . '_' . basename($avatar['name']);
    $uploadPath = $uploadDir . $fileName;

    if (move_uploaded_file($avatar['tmp_name'], $uploadPath)) {
        $avatar_url = $fileName; 
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al subir la imagen']);
        exit;
    }
}

$contrasena = trim($contrasena); 
$hashedPassword = password_hash($contrasena, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO usuarios (
    nombre_completo, fech_nac, sexo, calle, numero, colonia, municipio, curp, correo, avatar, contrasena, activo
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1
)");

$success = $stmt->execute([
    $nombre_completo,
    $fech_nac,
    $sexo,
    $calle,
    $numero,
    $colonia,
    $municipio,
    $curp,
    $correo,
    $avatar_url,
    $hashedPassword
]);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Registro exitoso']);
} else {
    error_log("Error al registrar usuario: " . print_r($stmt->errorInfo(), true));
    echo json_encode(['success' => false, 'message' => 'Error al registrar usuario']);
}
?>
