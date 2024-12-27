<?php
// Include the Twilio PHP SDK
require_once './vendor/autoload.php';
use Twilio\Rest\Client;

// Set header for JSON response
header('Content-Type: application/json');

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate that all required fields are present
    if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['subject']) || empty($_POST['complaint'])) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
        exit;
    }

    // Sanitize input
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $complaint = htmlspecialchars($_POST['complaint']);

    // Twilio credentials
    $sid = "AC2015e1f29a63bf5ea7005c4e3de06089"; 
    $token = "7e60ef33e4e04c5552b74a47012292e9";

    try {
        // Initialize Twilio client
        $twilio = new Client($sid, $token);

        // WhatsApp numbers
        $to_number = "whatsapp:+917794022444";
        $from_number = "whatsapp:+14155238886";

        // Format message with all fields including subject
        $body = "New Complaint Received:\n\n" .
                "Name: $name\n" .
                "Email: $email\n" .
                "Subject: $subject\n" .
                "Complaint: $complaint";

        // Send WhatsApp message
        $message = $twilio->messages->create(
            $to_number,
            [
                "from" => $from_number,
                "body" => $body
            ]
        );

        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>