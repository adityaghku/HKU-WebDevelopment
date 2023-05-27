<?php

session_start();

if (isset($_SESSION['token']) && isset($_SESSION['timestamp'])) {

			if (time() - $_SESSION['timestamp'] <=300){

				$decodedToken = receiveToken($_SESSION['token']);
				$uid = $decodedToken['uid'];

				$db_conn=mysqli_connect("mydb", "dummy", "c3322b", "db3322") or die("Connection Error!".mysqli_connect_error());
				        
				$query="SELECT DISTINCT course FROM courseinfo WHERE uid='$uid'"; 

				$result=mysqli_query($db_conn, $query) or die("<p>Query Error!<br>".mysqli_error($db_conn)."</p>");

				echo "<!doctype html><head><link rel='stylesheet' href='../styles/styles.css'/></head>";

				echo "<h1>Course Information</h1>";

				echo "<h3>Retrieve continuous assessment scores for:</h3>";

				#Display the records
				if (mysqli_num_rows($result) > 0) {

					while ($row=mysqli_fetch_assoc($result)){

						$course = $row['course'];
						echo "<a href=/courseinfo/getscore.php?course=$course>".$course."<a/>";
						echo "<br></br>";

					}
				}


				mysqli_free_result($result);
				mysqli_close($db_conn);	

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