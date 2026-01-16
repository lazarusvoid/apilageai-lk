<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>{$page_title|truncate:70}</title>

    <!-- Favicon / Site Icon -->
    <link rel="icon" type="image/png" href="https://apilageai.lk/assets/images/icon.png">
    <link rel="shortcut icon" type="image/png" href="https://apilageai.lk/assets/images/icon.png">
    
<!--SEO-->
<meta name="description" content="{$page_description}" />
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
   {if $page != "app"}
   <script src="https://cdn.tailwindcss.com"></script>
   <script>
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
    </script>
   {/if}
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">      
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
          
        {if $page == "app"}
            <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <!-- Prism plugin for line numbers -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <!-- html2canvas for saving as PNG -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            
<script>
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: {
    fontCache: 'global'
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async></script>

<!-- Marked.js -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<!-- cssadded -->
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/mp.min.css?V={get_hash_number()}">
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/gm.min.css?V={get_hash_number()}">
 <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/ob.css?V={get_hash_number()}">
<!-- Prism.js for syntax highlighting -->
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>


            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/app.min.css?V={get_hash_number()}">
        {elseif $page == "dashboard"}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://apilageai.lk/assets/styles/dashboard.min.css?V={get_hash_number()}" />
        {elseif in_array($page, ["login", "register", "password_reset"])}
            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/auth.min.css?V={get_hash_number()}">
        {else}
            <link rel="stylesheet" type="text/css" href="https://apilageai.lk/assets/styles/main.min.css?V={get_hash_number()}">
        {/if}
 
    </head>
    <body></file>