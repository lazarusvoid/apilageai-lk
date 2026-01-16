<?php
/* Smarty version 5.5.2, created on 2025-08-30 23:33:06
  from 'file:components/payhead.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.2',
  'unifunc' => 'content_68b33cda3a9e21_61716699',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'd21ff682dc60975d3cb1f2e229666def8d4c3592' => 
    array (
      0 => 'components/payhead.tpl',
      1 => 1747554918,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_68b33cda3a9e21_61716699 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/components';
?><div id="preloader">
    <img id="loading-image" src="https://apilageai.lk/assets/images/icon.png" alt="Loading">
</div>

<div id="content" style="display: none;">

<header class="fixed-top">
    <nav class="navbar navbar-expand-lg navbar-light py-3">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="#">
                <div class="brand-icon me-2">
                    <img src="https://apilageai.lk/assets/images/icon.png" alt="අපිලගේ AI" width="70" height="70" style="padding: 5px;">
                </div>
                <span class="fw-bold fs-4">APILAGE AI</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                 <li class="nav-item">
                        <a class="nav-link" href="https://www.apilageai.lk">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="https://blog.apilageai.lk">Blog</a>
                    </li>
                    <li class="nav-item ms-lg-3">
                        <a class="btn btn-primary" href="https://apilageai.lk<?php if (!$_smarty_tpl->getValue('user')->_logged_in) {?>/auth/login<?php } else { ?>/app<?php }?>"><?php if (!$_smarty_tpl->getValue('user')->_logged_in) {?>Login<?php } else { ?>Continue<?php }?></a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header><?php }
}
