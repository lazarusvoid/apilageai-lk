{*Preloader*}
<div id="preloader">
    <img id="loading-image" src="https://apilageai.lk/assets/images/icon.png" alt="Loading">
</div>

{*Page content*}
<div id="content" style="display: none;">

{*Header navigation bar*}
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
                        <a class="btn btn-primary" href="https://apilageai.lk{if !$user->_logged_in}/auth/login{else}/app{/if}">{if !$user->_logged_in}Login{else}Continue{/if}</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>