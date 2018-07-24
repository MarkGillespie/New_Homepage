<?php

include('mysql_info.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$id = $conn->real_escape_string($_POST['id']);
$table = $conn->real_escape_string($_POST['table']);
if (isset($_POST['delete'])
	&& filter_var($_POST['delete'], FILTER_VALIDATE_BOOLEAN)) {

	$sql = "DELETE from notes_list WHERE id=$id";
} else if ($table == "notes_list"){
	$text = $conn->real_escape_string($_POST['text']);
	$now = time();
	if ($id > 0) {
		$sql = "UPDATE notes_list
				SET note_text=\"$text\", last_edit=FROM_UNIXTIME($now)
				WHERE id=$id";
	} else {
		$sql = "INSERT INTO notes_list (note_text, last_edit)
				VALUES (\"$text\", FROM_UNIXTIME($now))";
	}
} else if ($table == "todo_list") {
	$text = $conn->real_escape_string($_POST['text']);
	$done = $conn->real_escape_string($_POST['done']);
	$now = time();
	if ($id > 0) {
		$sql = "UPDATE todo_list
				SET todo_text=\"$text\", last_edit=FROM_UNIXTIME($now), done=$done
				WHERE id=$id";
	} else {
		$sql = "INSERT INTO todo_list (todo_text, last_edit, done)
				VALUES (\"$text\", FROM_UNIXTIME($now), $done)";
	}
}

echo $sql;

if(!$result = $conn->query($sql)){
    die('There was an error running the query ['. $conn->error . ']');
}

$conn->close();
?>