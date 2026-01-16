<?php
/* Smarty version 5.5.1, created on 2025-06-02 23:17:38
  from 'file:components/header.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_683de3ba3da525_65914525',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '7045a6ab6cefe0fb549d83b72a3ab7602014df58' => 
    array (
      0 => 'components/header.tpl',
      1 => 1747366438,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_683de3ba3da525_65914525 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/components';
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
                        <a class="nav-link" href="#about">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#features">Features</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#pricing">Pricing</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#blog">Blog</a>
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
