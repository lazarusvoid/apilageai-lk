<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../backend/bootstrap.php'; 

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (! is_array($data)) {
    $data = $_POST;
}

$invoiceNo           = isset($data['invoiceNo'])             ? $data['invoiceNo'] : '';
$tx_id               = isset($data['payableTransactionId'])  ? $data['payableTransactionId'] : '';
$order_id            = isset($data['payableOrderId'])        ? $data['payableOrderId'] : '';
$statusCode          = isset($data['statusCode'])            ? intval($data['statusCode']) : 0;
$statusMessage       = isset($data['statusMessage'])         ? $data['statusMessage'] : '';
$amountPaid          = isset($data['payableAmount'])         ? floatval($data['payableAmount']) : 0;

if ($invoiceNo === '' || $statusCode !== 1) {
    http_response_code(200);
    echo "IGNORED";
    exit;
}

$stmt = $db->prepare("SELECT * FROM transactions WHERE invoice_id = ? LIMIT 1");
$stmt->bind_param("s", $invoiceNo);
$stmt->execute();
$res = $stmt->get_result();
$txn = $res->fetch_assoc();
$stmt->close();

if (! $txn) {
    http_response_code(200);
    echo "UNKNOWN_INVOICE";
    exit;
}

if ((int)$txn['paid'] === 1) {
    http_response_code(200);
    echo "ALREADY_PAID";
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
    $u1->bind_param("sss", $tx_id, $order_id, $invoiceNo);
    $u1->execute();
    $u1->close();

    $userId = (int)$txn['user_id'];
    $u2 = $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
    $u2->bind_param("di", $amountPaid, $userId);
    $u2->execute();
    $u2->close();

    $db->commit();

    http_response_code(200);
    echo "OK";
} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo "ERROR";
}
exit;