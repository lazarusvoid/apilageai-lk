<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../backend/bootstrap.php'; 

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (! is_array($data)) {
    echo json_encode(["status" => false, "msg" => "Invalid request"]);
    exit;
}

$invoice_id = isset($data['invoice_id']) ? trim($data['invoice_id']) : '';
$tx_id      = isset($data['payableTransactionId']) ? trim($data['payableTransactionId']) : '';
$order_id   = isset($data['payableOrderId']) ? trim($data['payableOrderId']) : '';
$amount     = isset($data['amount']) ? floatval($data['amount']) : 0;

if ($invoice_id === '' || $amount <= 0) {
    echo json_encode(["status" => false, "msg" => "Invalid data"]);
    exit;
}

$stmt = $db->prepare("SELECT * FROM transactions WHERE invoice_id = ? LIMIT 1");
$stmt->bind_param("s", $invoice_id);
$stmt->execute();
$res = $stmt->get_result();
$txn = $res->fetch_assoc();
$stmt->close();

if (! $txn) {
    echo json_encode(["status" => false, "msg" => "Invoice not found"]);
    exit;
}

if ((int)$txn['paid'] === 1) {
    echo json_encode(["status" => true, "msg" => "Already updated"]);
    exit;
}

$db->begin_transaction();
try {
    $u1 = $db->prepare("
      UPDATE transactions
      SET paid = 1,
          updated_at = NOW(),
          payable_uid = ?,
          status_indicator = ?
      WHERE invoice_id = ?
    ");
    $u1->bind_param("sss", $tx_id, $order_id, $invoice_id);
    $u1->execute();
    $u1->close();

    $userId = (int)$txn['user_id'];
    $u2 = $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
    $u2->bind_param("di", $amount, $userId);
    $u2->execute();
    $u2->close();

    $db->commit();

    echo json_encode(["status" => true, "msg" => "Balance updated"]);
} catch (Exception $e) {
    $db->rollback();
    echo json_encode(["status" => false, "msg" => "Database error"]);
}
exit;