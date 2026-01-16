<?php
// onepage.php
// Realtime dashboard: users, conversations, messages

// --- DB settings ---
$DB_HOST = "localhost";
$DB_NAME = "apilageai_lk";
$DB_USER = "apilageai_lk";
$DB_PASS = "Dam9WVqPAciD62O";

$DEBUG = true;

// --- AJAX endpoint ---
if (isset($_GET['ajax'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate, max-age=0');

    try {
        $pdo = new PDO(
            "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );

        $row = $pdo->query("SELECT id FROM users ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        $latest_user = $row['id'] ?? 0;

        $row = $pdo->query("SELECT conversation_id FROM conversations ORDER BY conversation_id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        $latest_convo = $row['conversation_id'] ?? 0;
        $total_convo = $pdo->query("SELECT COUNT(*) FROM conversations")->fetchColumn() ?? 0;

        $row = $pdo->query("SELECT message_id FROM messages ORDER BY message_id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        $latest_msg = $row['message_id'] ?? 0;
        $total_msg = $pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn() ?? 0;

        echo json_encode([
            'latest_user' => (int)$latest_user,
            'latest_convo' => (int)$latest_convo,
            'total_convo' => (int)$total_convo,
            'latest_msg' => (int)$latest_msg,
            'total_msg' => (int)$total_msg,
            'time' => date('H:i:s')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        $out = ['error' => 'DB error'];
        if ($DEBUG) $out['detail'] = $e->getMessage();
        echo json_encode($out);
    }
    exit;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>ApilageAI Dashboard</title>
<style>
  :root{
    --bg:#f6f7fb;
    --card-bg:rgba(255,255,255,0.7);
    --glass:blur(18px) saturate(180%);
    --fg:#1d1d1f;
    --accent:#6366f1;
    --danger:#ef4444;
    --muted:#6b7280;
  }
  body{
    margin:0;
    font-family:Inter, "Segoe UI", Roboto, Arial, sans-serif;
    background:linear-gradient(135deg,#eef2ff,#fdf2f8);
    min-height:100vh;
    display:flex;
    flex-direction:column;
    color:var(--fg);
  }
  header{
    text-align:center;
    padding:28px 12px;
    font-size:2rem;
    font-weight:800;
    color:var(--accent);
    letter-spacing:-0.5px;
  }
  .dashboard{
    flex:1;
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
    gap:24px;
    padding:24px;
    box-sizing:border-box;
    max-width:1200px;
    margin:0 auto;
  }
  .card{
    background:var(--card-bg);
    backdrop-filter:var(--glass);
    border-radius:20px;
    padding:28px;
    box-shadow:0 10px 30px rgba(0,0,0,0.08);
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    transition:transform .25s ease, box-shadow .25s ease;
  }
  .card:hover{
    transform:translateY(-6px);
    box-shadow:0 18px 40px rgba(0,0,0,0.12);
  }
  .label{font-size:1rem;font-weight:600;color:var(--muted);}
  .value{font-size:2.4rem;font-weight:900;color:var(--accent);margin-top:8px;transition:transform .2s;}
  .meta{text-align:center;font-size:.9rem;color:var(--muted);margin-top:16px;}
  .controls{
    display:flex;gap:12px;justify-content:center;margin:20px auto;
  }
  button{
    background:var(--accent);color:white;border:0;padding:12px 18px;border-radius:12px;font-weight:600;cursor:pointer;font-size:15px;
    transition:all 0.25s;box-shadow:0 6px 18px rgba(99,102,241,0.3);
  }
  button:hover{background:#4f46e5;}
  button:active{transform:scale(.96);}
  #error{color:var(--danger);text-align:center;font-weight:600;margin-top:8px;}
  .spinner{
    width:20px;height:20px;border:3px solid rgba(99,102,241,0.2);border-top-color:var(--accent);
    border-radius:50%;animation:spin 1s linear infinite;margin-left:6px;opacity:0;display:inline-block;
  }
  .spinner.show{opacity:1;}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<header>? ApilageAI Realtime Dashboard</header>
<div class="dashboard">
  <div class="card"><div class="label">Total Users</div><div id="latest_user" class="value">0<span id="spinner1" class="spinner"></span></div></div>
  <div class="card"><div class="label">Total Conversations</div><div id="total_convo" class="value">0<span id="spinner3" class="spinner"></span></div></div>
  <div class="card"><div class="label">Latest Conversation ID</div><div id="latest_convo" class="value">0<span id="spinner2" class="spinner"></span></div></div>
  <div class="card"><div class="label">Total Messages</div><div id="total_msg" class="value">0<span id="spinner5" class="spinner"></span></div></div>
  <div class="card"><div class="label">Latest Message ID</div><div id="latest_msg" class="value">0<span id="spinner4" class="spinner"></span></div></div>
</div>
<div class="meta" id="meta">Loading…</div>
<div class="controls">
  <button id="reloadBtn">? Reload</button>
  <button id="darkModeBtn">? Dark Mode</button>
</div>
<div id="error" style="display:none"></div>

<script>
const fields = {
  latest_user: document.getElementById('latest_user'),
  latest_convo: document.getElementById('latest_convo'),
  total_convo: document.getElementById('total_convo'),
  latest_msg: document.getElementById('latest_msg'),
  total_msg: document.getElementById('total_msg')
};
const spinners = {
  latest_user: document.getElementById('spinner1'),
  latest_convo: document.getElementById('spinner2'),
  total_convo: document.getElementById('spinner3'),
  latest_msg: document.getElementById('spinner4'),
  total_msg: document.getElementById('spinner5')
};
const meta=document.getElementById('meta');
const errEl=document.getElementById('error');
const reloadBtn=document.getElementById('reloadBtn');
const darkBtn=document.getElementById('darkModeBtn');

let values={latest_user:0,latest_convo:0,total_convo:0,latest_msg:0,total_msg:0};
let isFetching=false;
let pollInterval=5000;

function ease(t){return 0.5*(1-Math.cos(Math.PI*t));}
function animateNumber(el,from,to,duration=700){
  if(from===to)return;
  const start=performance.now(),diff=to-from;
  function frame(now){
    const t=Math.min(1,(now-start)/duration);
    const v=Math.round(from+diff*ease(t));
    el.firstChild.nodeValue=v.toLocaleString();
    if(t<1)requestAnimationFrame(frame);
    else{values[el.id]=to;el.style.transform="scale(1.05)";setTimeout(()=>el.style.transform="",150);}
  }
  requestAnimationFrame(frame);
}

async function fetchAll(){
  if(isFetching)return;
  isFetching=true;
  errEl.style.display="none";
  Object.values(spinners).forEach(s=>s.classList.add("show"));
  try{
    const res=await fetch("?ajax=1",{cache:"no-store"});
    const text=await res.text();
    let data;
    try{data=JSON.parse(text);}catch(e){throw new Error("Invalid server response");}
    if(!res.ok)throw new Error(data.detail||data.error||"Server error");

    for(const key in fields){
      animateNumber(fields[key],values[key]||0,Number(data[key]||0));
    }
    meta.textContent="Updated: "+(data.time||new Date().toLocaleTimeString());
  }catch(e){
    errEl.style.display="block";errEl.textContent=e.message||"Unknown error";meta.textContent="Error";
  }finally{
    Object.values(spinners).forEach(s=>s.classList.remove("show"));
    isFetching=false;
  }
}

reloadBtn.addEventListener("click",fetchAll);
darkBtn.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  if(document.body.classList.contains("dark")){
    document.documentElement.style.setProperty("--bg","#111827");
    document.documentElement.style.setProperty("--card-bg","rgba(31,41,55,0.7)");
    document.documentElement.style.setProperty("--fg","#f9fafb");
    document.documentElement.style.setProperty("--accent","#60a5fa");
    document.documentElement.style.setProperty("--muted","#9ca3af");
  }else{
    document.documentElement.style.setProperty("--bg","#f6f7fb");
    document.documentElement.style.setProperty("--card-bg","rgba(255,255,255,0.7)");
    document.documentElement.style.setProperty("--fg","#1d1d1f");
    document.documentElement.style.setProperty("--accent","#6366f1");
    document.documentElement.style.setProperty("--muted","#6b7280");
  }
});
fetchAll();
setInterval(fetchAll,pollInterval);
</script>
</body>
</html>
