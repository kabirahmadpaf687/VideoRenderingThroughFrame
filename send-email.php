<?php
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Recipient email
$to = "Layla@bylaylasaleh.com";

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$type = isset($data['type']) ? $data['type'] : 'contact';
$email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';
$name = isset($data['name']) ? htmlspecialchars($data['name']) : '';
$message = isset($data['message']) ? htmlspecialchars($data['message']) : '';

$mail = new PHPMailer(true);
$debugOutput = '';

try {
    // --- SMTP SERVER SETTINGS ---
    $mail->SMTPDebug  = 0;                      // SET TO 0 FOR PRODUCTION (no logs in browser)
    $mail->isSMTP();
    $mail->SMTPAuth   = true;
    
    // // For GMAIL:
    // $mail->Host       = 'smtp.gmail.com'; 
    // $mail->Username   = 'kabirahmadkhanpaf@gmail.com'; 
    // $mail->Password   = 'yvfmiseskgtaaoaw';       
    
    $mail->Host       = 'smtp.hostinger.com';
    $mail->Username   = 'Layla@bylaylasaleh.com';
    $mail->Password   = 'NEW_PASSWORD_YOU_SET';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587; 
    // --- RECIPIENTS ---
    $mail->setFrom('webmaster@bylaylasaleh.com', 'By Layla Saleh');
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

    // --- CONTENT ---
    $mail->isHTML(false);
    if ($type === 'newsletter') {
        $mail->Subject = "New Newsletter Subscription";
        $mail->Body    = "You have a new subscriber!\n\nEmail: $email";
    } else {
        $mail->Subject = "New Contact Form Submission from $name";
        $mail->Body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    }

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => "Mailer Error: {$mail->ErrorInfo}",
        'debug' => $debugOutput
    ]);
}
?>
