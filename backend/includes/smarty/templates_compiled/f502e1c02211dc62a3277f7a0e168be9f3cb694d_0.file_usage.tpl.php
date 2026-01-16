<?php
/* Smarty version 5.5.1, created on 2025-06-05 13:12:19
  from 'file:dashboard/usage.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68414a5bc17089_08231759',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'f502e1c02211dc62a3277f7a0e168be9f3cb694d' => 
    array (
      0 => 'dashboard/usage.tpl',
      1 => 1744376343,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_68414a5bc17089_08231759 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/dashboard';
?><div class="card">
    <div class="card-header">
        <h2 class="card-title">Usage Statistics</h2>
        <p class="card-description">Monitor your Apilage AI usage</p>
    </div>
    <div class="card-content">
        <div class="stats-grid">
            <div class="stat-box">
                <p class="stat-label">Balance</p>
                <h3 class="stat-value">Rs. <?php echo $_smarty_tpl->getSmarty()->getModifierCallback('number_format')($_smarty_tpl->getValue('current_balance'),2);?>
</h3>
            </div>
            <div class="stat-box">
                <p class="stat-label">Messages Sent</p>
                <h3 class="stat-value"><?php echo $_smarty_tpl->getValue('messages_count');?>
</h3>
            </div>
            <div class="stat-box">
                <p class="stat-label">Avg. Conversations per Day</p>
                <h3 class="stat-value"><?php echo $_smarty_tpl->getValue('conversations_count');?>
</h3>
            </div>
        </div>

            </div>
    </div><?php }
}
