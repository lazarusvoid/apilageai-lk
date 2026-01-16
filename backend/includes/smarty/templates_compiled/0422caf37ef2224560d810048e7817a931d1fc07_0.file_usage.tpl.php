<?php
/* Smarty version 5.5.2, created on 2025-09-15 02:39:05
  from 'file:dashboard/usage.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.2',
  'unifunc' => 'content_68c72ef1bc3f53_14337964',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '0422caf37ef2224560d810048e7817a931d1fc07' => 
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
function content_68c72ef1bc3f53_14337964 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/dashboard';
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
