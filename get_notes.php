<?php

include('mysql_info.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$table = $conn->real_escape_string($_GET['table']);

$sql = "SELECT * FROM $table";

if(!$result = $conn->query($sql)){
    die('There was an error running the query [' . $conn->error . ']');
}

$to_ret = array();

if ($table == "notes_list") {
	while ($row = $result->fetch_assoc()) {
		$note = new \stdClass();
		$note->id = $row['id'];
		$note->text = $row['note_text'];
		$note->date = $row['last_edit'];
		$to_ret[] = $note;
	}
} else if ($table == "todo_list") {
	while ($row = $result->fetch_assoc()) {
		$todo = new \stdClass();
		$todo->id = $row['id'];
		$todo->text = $row['todo_text'];
		$todo->done = $row['done'];
		$todo->date = $row['last_edit'];
		$to_ret[] = $todo;
	}
}

// $obj = new \stdClass();
// $obj->id = "Mark";
// $obj->text = "The quick brown fox";
// $obj->date = "5280";

// $json_obj = json_encode($obj);

echo json_encode($to_ret);

$conn->close();
?>