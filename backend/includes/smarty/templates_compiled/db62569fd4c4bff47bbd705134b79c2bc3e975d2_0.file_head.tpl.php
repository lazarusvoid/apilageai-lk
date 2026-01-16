<?php
/* Smarty version 5.6.0, created on 2025-11-27 15:53:31
  from 'file:components/head.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_692826a3869219_71492542',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'db62569fd4c4bff47bbd705134b79c2bc3e975d2' => 
    array (
      0 => 'components/head.tpl',
      1 => 1764239008,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_692826a3869219_71492542 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/components';
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title><?php echo $_smarty_tpl->getSmarty()->getModifierCallback('truncate')($_smarty_tpl->getValue('page_title'),70);?>
</title>

    <!-- Favicon / Site Icon -->
    <link rel="icon" type="image/png" href="https://apilageai.lk/assets/images/icon.png">
    <link rel="shortcut icon" type="image/png" href="https://apilageai.lk/assets/images/icon.png">
    
<!--SEO-->
<meta name="description" content="<?php echo $_smarty_tpl->getValue('page_description');?>
" />
<meta name="keywords" content="Apilage AI, Sri Lankan AI, Sinhala AI assistant, OpenAI, Chatbot, Education AI" />
  <meta name="author" content="Apilageai (PVT) LTD" />
  <meta property="og:title" content="Apilage AI - Sri Lankan's AI assistant" />
  <meta property="og:description" content="Sri Lankan AI agent for day today tasks and education" />
  <meta property="og:image" content="https://apilageai.lk/assets/images/welcome.jpg" />
  <meta property="og:url" content="https://apilageai.lk" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Apilage AI - Sri Lankan's AI assistant" />
  <meta name="twitter:description" content="Sri Lankan AI agent for day today tasks and education" />
  <meta name="twitter:image" content="https://apilageai.lk/assets/images/welcome.jpg" />
  <meta name="twitter:site" content="@ApilageAI" />
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Kite+One&display=swap" rel="stylesheet">
 <!-- Font Awesome CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
   <?php if ($_smarty_tpl->getValue('page') != "app") {?>
   <?php echo '<script'; ?>
 src="https://cdn.tailwindcss.com"><?php echo '</script'; ?>
>
   <?php echo '<script'; ?>
>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['"Plus Jakarta Sans"', 'sans-serif'],
              display: ['"Outfit"', 'sans-serif'],
              hand: ['"Patrick Hand"', 'cursive'],
            },
            colors: {
              brand: {
                red: '#FF3B30',
                blue: '#38BDF8',
                blueLight: '#E0F2FE',
                dark: '#172554',
                gray: '#F8FAFC',
              }
            },
            boxShadow: {
              'hard': '4px 4px 0px 0px #172554',
              'hard-sm': '2px 2px 0px 0px #172554',
              'hard-lg': '8px 8px 0px 0px #172554',
            },
            backgroundImage: {
              'dots': 'radial-gradient(#94a3b8 1px, transparent 1px)',
            },
            animation: {
              'float': 'float 6s ease-in-out infinite',
              'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
              float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
              wiggle: {
                '0%, 100%': { transform: 'rotate(-3deg)' },
                '50%': { transform: 'rotate(3deg)' },
              }
            }
          }
        }
      }
    <?php echo '</script'; ?>
>
   <?php }?>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">      
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
          
        <?php if ($_smarty_tpl->getValue('page') == "app") {?>
            <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <!-- Prism plugin for line numbers -->
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js"><?php echo '</script'; ?>
>
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <!-- html2canvas for saving as PNG -->
    <?php echo '<script'; ?>
 src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><?php echo '</script'; ?>
>
            
<?php echo '<script'; ?>
>
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: {
    fontCache: 'global'
  }
};
<?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async><?php echo '</script'; ?>
>

<!-- Marked.js -->
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><?php echo '</script'; ?>
>
<!-- cssadded -->
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/mp.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/gm.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/ob.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
<!-- Prism.js for syntax highlighting -->
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet" />
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"><?php echo '</script'; ?>
>


            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/app.min.css?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_number')();?>
">
        <?php } elseif ($_smarty_tpl->getValue('page') == "dashboard") {?>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
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
    <body></file><?php }
}
