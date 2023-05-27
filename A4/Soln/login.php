<?php

session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// print_r($_SESSION); 
// print_r($_POST);

start();


function start() {

  if(isset($_POST['email'])) { //if is a POST request

  	$email = $_POST['email'];
  	$uid = inDatabase($email);

  	unset($_POST);

  	if ($uid < 0){
       display_login_form("Unknown user - we don't have the records for $email in the system.");
  	}

	else {

		$token = generateToken($uid);

		mailerPHP($email, $token);
		updateDB($email, $uid, $token);


		display_login_form("Please check your email for the authentication URL");

    } 

  }

  	else {
    	// is a GET request
	    if (isset($_GET['token'])) {

	    	$secret = receiveToken($_GET['token'])['secret'];
	    	$uid = receiveToken($_GET['token'])['uid'];
	    	$db_conn=mysqli_connect("mydb", "dummy", "c3322b", "db3322") or die("Connection Error!".mysqli_connect_error());

    		$query="SELECT secret, timestamp FROM user WHERE uid='$uid'";

			$result=mysqli_query($db_conn, $query) or die("<p>Query Error!<br>".mysqli_error($db_conn)."</p>");

			if (mysqli_num_rows($result) > 0) {
  				while ($row=mysqli_fetch_array($result)) {

  					$elapsed = time() - $row['timestamp'];
  					$correctSecret = strcmp($row['secret'] , $secret);

				}
			}


			if ($elapsed <=60 && $correctSecret==0){

				$query="UPDATE user SET secret = NULL, timestamp = NULL WHERE uid ='$uid'";

				if (mysqli_query($db_conn, $query)) {
					mysqli_close($db_conn);
				}

				else {
				  echo die("Query Error".mysqli_error($db_conn));
				} 

				$_SESSION['token'] = $_GET['token'];//add to session variable
				$_SESSION['timestamp'] = time();

				header('location: /courseinfo/index.php');

			}

			else if ($correctSecret!=0){
				mysqli_free_result($result);
				mysqli_close($db_conn);			
				display_login_form("Fail to authenticate - incorrect secret!");	
			}

			else{

				$query="UPDATE user SET secret = NULL, timestamp = NULL WHERE uid ='$uid'";

				if (mysqli_query($db_conn, $query)) {
					mysqli_close($db_conn);
				}

				else {
				  echo die("Query Error".mysqli_error($db_conn));
				}
				
				display_login_form("Fail to authenticate - OTP expired!");
			}
	     	
	    }

	    else {

	    	if (isset($_SESSION['expired']) && $_SESSION['expired']==1){
	    		$_SESSION['expired'] == 0;
	    		session_unset();
	    		// session_destroy();
	    		display_login_form("Session expired. Please login again.");

	    	}

	    	else{
	    		display_login_form();
	    	}
	    }
  	}
}

function display_login_form($msg='') {
  ?>
  	<!doctype html>
	<head>
		<link rel="stylesheet" href="styles/styles.css"/>
	</head>

	<h1>My Gradebooks Page</h1>

	<form action="login.php" method="post">
	<?php

	if (strlen($msg) > 0){
		echo "<div> <p class='error'>$msg</p> </div>";
	}

	?>
	<fieldset name="logininfo">
	  <legend>My Gradebooks</legend>
	  <label>Email:</label> 
	  <input type="text" name="email" id="email" pattern ="^[a-zA-Z0-9._-]+@(connect|cs)\.hku\.hk" title="The email must end with @cs.hku.hk or @connect.hku.hk" required ="">
	  <br>
	  <br>
	  <input type="submit" name="Login" value="Login">
	</fieldset>
	</form>


  <?php
  $_POST = array();

}
 
function inDatabase($email){

	$db_conn=mysqli_connect("mydb", "dummy", "c3322b", "db3322") or die("Connection Error!".mysqli_connect_error());
	        
	$query="SELECT uid FROM user WHERE email='$email'"; // 

	$result=mysqli_query($db_conn, $query) or die("<p>Query Error!<br>".mysqli_error($db_conn)."</p>");


	#Display the records
	if (mysqli_num_rows($result) > 0) {
		$uid = mysqli_fetch_object($result)->uid;
		mysqli_free_result($result);
		mysqli_close($db_conn);	
	  	return $uid;
	}

	else {
		mysqli_free_result($result);
		mysqli_close($db_conn);	
	  	return -1;
	}
}


function generateToken($uid){

	return bin2hex(json_encode(array("uid" => $uid ,"secret" => bin2hex(random_bytes(8)))));
}

function receiveToken($token){
	return json_decode(hex2bin($token), true);
}

function mailerPHP($email, $token){

	$mail = new PHPMailer(true);

	  try {
	      //Server settings
	      $mail->SMTPDebug = SMTP::DEBUG_OFF;//DEBUG_SERVER;                      //Enable verbose debug output
	      $mail->isSMTP();                                            //Send using SMTP
	      $mail->Host       = 'testmail.cs.hku.hk';                     //Set the SMTP server to send through
	      $mail->SMTPAuth   = false;                                   //Enable SMTP authentication
	  
	      $mail->Port       = 25;                                    
	      //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
	  
	      //Sender
	      $mail->setFrom('c3322@cs.hku.hk', 'COMP3322');
	      //******** Add a recipient to receive your email *************
	      $mail->addAddress($email);     
	  
	      //Content
	      $mail->isHTML(true);                                  //Set email format to HTML
	      $mail->Subject = 'Verification for login.php';

	      $link = "http://localhost:9080/login.php?token=".$token;

	      $mail->Body = "Dear Student,<br><br> You can log on to the system via the following link:<br><br>"."<a href=".$link.">".$link."</a>";
	  
	      $mail->send();

	  } catch (Exception $e) {
	      echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
	  }

}

function updateDB($email, $uid, $token){

	$db_conn=mysqli_connect("mydb", "dummy", "c3322b", "db3322") or die("Connection Error!".mysqli_connect_error());

	$receivedSecret = receiveToken($token)['secret'];

	$t = time();
	        
	$query="UPDATE user SET secret = '$receivedSecret', timestamp = '$t' WHERE uid ='$uid'";

	if (mysqli_query($db_conn, $query)) {
		mysqli_close($db_conn);
	}

	else {
	  echo die("Query Error".mysqli_error($db_conn));
	}
}


?>