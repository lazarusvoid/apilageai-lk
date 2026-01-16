<?php
/* Smarty version 5.5.1, created on 2025-06-05 13:12:02
  from 'file:dashboard/profile.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68414a4a6284e3_12347416',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '213046310426675de6126e03b07501b0214e376b' => 
    array (
      0 => 'dashboard/profile.tpl',
      1 => 1744387905,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_68414a4a6284e3_12347416 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/dashboard';
?><div class="profile-header">
    <div class="cover-photo">
        <div class="cover-gradient"></div>
    </div>
    <div class="profile-picture-container">
        <div class="profile-picture-wrapper">
            <img src="<?php if ($_smarty_tpl->getSmarty()->getModifierCallback('is_empty')($_smarty_tpl->getValue('user')->_data['image'])) {?>https://apilageai.lk/assets/images/user.png<?php } else { ?>https://apilageai.lk/uploads/<?php echo $_smarty_tpl->getValue('user')->_data['image'];
}?>" alt="<?php echo $_smarty_tpl->getValue('user')->_data['first_name'];?>
 <?php echo $_smarty_tpl->getValue('user')->_data['last_name'];?>
" class="profile-picture">
            <button class="edit-profile-picture">
                <i class="fas fa-camera"></i>
            </button>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h2 class="card-title">Personal Information</h2>
        <p class="card-description">Update your account details and profile information</p>
    </div>
    <div class="card-content">
        <form class="profile-form">
            <div class="form-grid">
                <div class="form-group">
                    <label for="name">First name</label>
                    <input type="text" id="name" placeholder="John" value="<?php echo $_smarty_tpl->getValue('user')->_data['first_name'];?>
">
                </div>
                <div class="form-group">
                    <label for="name">Last name</label>
                    <input type="text" id="name" placeholder="Doe" value="<?php echo $_smarty_tpl->getValue('user')->_data['last_name'];?>
">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="button primary-button">Save Changes</button>
            </div>
        </form>
    </div>
</div><?php }
}
