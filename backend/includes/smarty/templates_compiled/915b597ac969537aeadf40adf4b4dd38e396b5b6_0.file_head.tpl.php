<?php
/* Smarty version 5.5.1, created on 2025-06-05 09:44:12
  from 'file:components/head.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68411994604531_51589523',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '915b597ac969537aeadf40adf4b4dd38e396b5b6' => 
    array (
      0 => 'components/head.tpl',
      1 => 1749096845,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_68411994604531_51589523 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/components';
?><!DOCTYPE html>
<html lang="en_US">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php echo $_smarty_tpl->getSmarty()->getModifierCallback('truncate')($_smarty_tpl->getValue('page_title'),70);?>
</title>
        <link rel="icon" href="https://apilageai.lk/images/icon.png">
        <link rel="shortcut icon" href="https://apilageai.lk/assets/images/icon.png">

                <meta name="description" content="<?php echo $_smarty_tpl->getValue('page_description');?>
" />

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

        <?php if ($_smarty_tpl->getValue('page') == "app") {?>
            <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/app.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
        <?php } elseif ($_smarty_tpl->getValue('page') == "dashboard") {?>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://apilageai.lk/assets/styles/dashboard.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
" />
        <?php } elseif ($_smarty_tpl->getSmarty()->getModifierCallback('in_array')($_smarty_tpl->getValue('page'),array("login","register","password_reset"))) {?>
            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/auth.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
        <?php } else { ?>
            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/main.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
        <?php }?>
 
    </head>
    <body><?php }
}
