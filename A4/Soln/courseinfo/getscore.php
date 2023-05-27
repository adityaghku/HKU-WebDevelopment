<?php

session_start();

if (isset($_SESSION['token']) && isset($_SESSION['timestamp'])) {

if (time() - $_SESSION['timestamp'] <=300){

if (isset($_GET['course'])){
	
	$decodedToken = receiveToken($_SESSION['token']);
	$uid = $decodedToken['uid'];

	$course = $_GET['course'];

	$db_conn=mysqli_connect("mydb", "dummy", "c3322b", "db3322") or die("Connection Error!".mysqli_connect_error());
        
	$query="SELECT assign, score FROM courseinfo WHERE uid = '$uid' AND course = '$course'";

	$result=mysqli_query($db_conn, $query) or die("<p>Query Error!<br>".mysqli_error($db_conn)."</p>");

	echo "<h1> $course - Gradebook </h1>";
	echo "<!doctype html><head><link rel='stylesheet' href='../styles/styles.css'/></head>";

        $sum = 0;

        if (mysqli_num_rows($result) > 0){
        	
        	
        	echo "<p style='font-size: 20px'>Assessment Scores:</p>";

        	echo "<table><thead><tr><th>Item</th><th>Score</th></tr></thead><tbody>";

	        while ($row = mysqli_fetch_assoc($result)) {
	            echo "<tr>";
	            echo "<td>" . $row['assign'] . "</td>";
	            echo "<td>" . $row['score'] . "</td>";
	            echo "</tr>";
	            $sum += $row['score'];
	        }
	        echo "<tr>";
	        echo "<td></td>";
	        echo "<td>Total: <b>" . $sum . "</b></td>";
	        echo "</tr></tbody></table>";
    	}

    	else{
    		echo "<p style='font-size: 20px'>You do not have the gradebook for the course: ".$course." in the system.</p>";
    	}

}

}

else {

	$_SESSION['expired'] = 1;
	header('location: ../login.php');

}


}


function receiveToken($token){
	return json_decode(hex2bin($token), true);
}

?>