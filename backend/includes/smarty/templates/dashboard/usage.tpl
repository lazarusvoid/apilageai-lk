<div class="card">
    <div class="card-header">
        <h2 class="card-title">Usage Statistics</h2>
        <p class="card-description">Monitor your Apilage AI usage</p>
    </div>
    <div class="card-content">
        <div class="stats-grid">
            <div class="stat-box">
                <p class="stat-label">Balance</p>
                <h3 class="stat-value">Rs. {$current_balance|number_format:2}</h3>
            </div>
            <div class="stat-box">
                <p class="stat-label">Messages Sent</p>
                <h3 class="stat-value">{$messages_count}</h3>
            </div>
            <div class="stat-box">
                <p class="stat-label">Avg. Conversations per Day</p>
                <h3 class="stat-value">{$conversations_count}</h3>
            </div>
        </div>

        {*<div class="usage-chart">
            <h3 class="section-title">Usage Over Time</h3>
            <div class="chart-placeholder">
                <p>Chart showing usage trends would be displayed here</p>
            </div>
        </div>*}
    </div>
    {*<div class="card-footer">
        <button class="button outline-button">Download Report</button>
    </div>*}
</div>