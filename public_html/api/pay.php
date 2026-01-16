<?php
require_once __DIR__ . '/../../backend/bootstrap.php';

/**
 * PAYABLE Callback + Webhook Handler
 * - Verifies payment status
 * - Updates DB (transactions + user balance)
 * - Redirects user to https://apilageai.lk/app
 */

// ---------------- CONFIG ----------------
$sandbox = true;
$statusUrl = $sandbox
    ? 'https://payable-ipg-payment.web.app/ipg/sandbox/status'
    : 'https://payable-ipg-payment.web.app/ipg/production/status';

// ---------------- INPUT ----------------
$uidParam = $_GET['uid'] ?? '';
$resultIndicator = $_GET['resultIndicator'] ?? '';

if (!$uidParam || !$resultIndicator) {
    error_log("Missing Payable params");
    header("Location: https://apilageai.lk/app?status=failed");
    exit;
}

// ---------------- VERIFY WITH PAYABLE ----------------
$url = $statusUrl . "?uid=" . urlencode($uidParam) . "&resultIndicator=" . urlencode($resultIndicator);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);
$response = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http !== 200) {
    error_log("PAYABLE STATUS FAIL: HTTP=$http RESP=$response");
    header("Location: https://apilageai.lk/app?status=failed");
    exit;
}

$data = json_decode($response, true);
$status = strtoupper($data['data']['statusMessage'] ?? '');
$invoiceId = $data['data']['invoiceNo'] ?? null;
$amount = floatval($data['data']['payableAmount'] ?? 0);

if ($status !== 'SUCCESS' || !$invoiceId) {
    error_log("PAYMENT NOT SUCCESS: $response");
    header("Location: https://apilageai.lk/app?status=failed");
    exit;
}

// ---------------- UPDATE DATABASE ----------------
try {
    $db->begin_transaction();

    // Find transaction
    $stmt = $db->prepare("SELECT user_id, paid FROM transactions WHERE invoice_id = ? LIMIT 1");
    $stmt->bind_param("s", $invoiceId);
    $stmt->execute();
    $tx = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$tx) {
        throw new Exception("Transaction not found ($invoiceId)");
    }

    if ((int)$tx['paid'] === 0) {
        // Mark as paid
        $stmt = $db->prepare("UPDATE transactions SET paid = 1, updated_at = NOW() WHERE invoice_id = ?");
        $stmt->bind_param("s", $invoiceId);
        $stmt->execute();
        $stmt->close();

        // Update user balance
        $stmt = $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
        $stmt->bind_param("di", $amount, $tx['user_id']);
        $stmt->execute();
        $stmt->close();
    }

    $db->commit();

    error_log("PAYMENT SUCCESS invoice=$invoiceId amount=$amount user={$tx['user_id']}");
    header("Location: https://apilageai.lk/app?status=success");
    exit;

} catch (Exception $e) {
    $db->rollback();
    error_log("PAYMENT DB ERROR: " . $e->getMessage());
    header("Location: https://apilageai.lk/app?status=failed");
    exit;
}
