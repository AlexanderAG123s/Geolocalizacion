<?php
class Database {
    private $host = "localhost";      // Cambia si tu host es diferente
    private $db_name = "panico";  // Nombre de tu base de datos
    private $username = "root";       // Tu usuario de MySQL
    private $password = "";           // Tu contraseña (vacía si usas XAMPP por defecto)
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
