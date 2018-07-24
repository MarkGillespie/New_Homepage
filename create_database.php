<?php

include('mysql_info.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully";

// sql to create notes table
$sql = "CREATE TABLE notes_list (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
note_text TEXT,
last_edit TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "notes_list created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

// sql to create todo table
$sql = "CREATE TABLE todo_list (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
todo_text TEXT,
last_edit TIMESTAMP,
done BOOLEAN
)";

if ($conn->query($sql) === TRUE) {
    echo "todo_list created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>