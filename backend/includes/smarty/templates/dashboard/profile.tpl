<div class="profile-header">
    <div class="cover-photo">
        <div class="cover-gradient"></div>
    </div>
    <div class="profile-picture-container">
        <div class="profile-picture-wrapper">
            <img src="{if is_empty($user->_data['image'])}https://apilageai.lk/assets/images/user.png{else}https://apilageai.lk/uploads/{$user->_data['image']}{/if}" alt="{$user->_data['first_name']} {$user->_data['last_name']}" class="profile-picture">
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
                    <input type="text" id="name" placeholder="John" value="{$user->_data['first_name']}">
                </div>
                <div class="form-group">
                    <label for="name">Last name</label>
                    <input type="text" id="name" placeholder="Doe" value="{$user->_data['last_name']}">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="button primary-button">Save Changes</button>
            </div>
        </form>
    </div>
</div>