$(document).ready(function () {

    // Back button navigation
    $(".back-btn").on("click", function(){
        window.location.href = "../../Assets/pages/main.html"
    });

    // Load mood history from localStorage
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];

    // Default study plans for each mood (FALLBACK)
    const plans = {
        happy: "You're full of energy! Try a 40-minute focused study session + 10-minute break ✨",
        sad: "Go slow today 💛 Do a 20-minute light review and then rest.",
        sleepy: "You need a recharge 😴 Take a 15-min nap first, then a short 25-minute session.",
        stressed: "Deep breath! 🌿 Try the Pomodoro: 25 minutes study + 5 minutes calm music.",
        neutral: "A balanced day! Start with your easiest task for momentum ⚡"
    };

    // Get AI response from YOUR backend server
    async function getAIResponse(mood) {
        const $resultDiv = $('#mood-result');
        
        // This is the URL of your local server
        const API_URL = 'http://localhost:3000/moodtracker'; 
    
        // Show loading spinner and default plan
        $resultDiv.html(`
            <div style="text-align: center;">
                <div style="font-size: 14px; margin-bottom: 10px;">🤔 AI is thinking...</div>
                <div style="font-size: 14px; color: #7a5d00; margin-top: 10px;">
                    ${plans[mood]}
                </div>
            </div>
        `);

        try {
            // This now calls YOUR server
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mood: mood // Send the mood to your API
                })
            });

            if (!response.ok) {
                // If your server has an error, this will catch it
                throw new Error('Server returned an error');
            }

            const data = await response.json();
            const aiMessage = data.plan; // Get the 'plan' from your server's response

            // Mood emojis
            const moodEmojis = {
                happy: "😊",
                sad: "😔",
                sleepy: "😴",
                stressed: "😫",
                neutral: "🙂"
            };

        
            $resultDiv.css({
                'background-color': 'rgba(255, 255, 255, 0.8)', 
                'backdrop-filter': 'blur(5px)', 
                'padding': '20px',
                'border-radius': '15px',
                'margin-top': '25px',
                'box-shadow': '0 4px 15px rgba(0,0,0,0.1)'
            });

            // Display AI response
            $resultDiv.html(`
                <div style="text-align: left;">
                    <div style="font-size: 24px; text-align: center; margin-bottom: 12px;">
                        ${moodEmojis[mood]} AI Personalized Plan
                    </div>
                    <!-- Added pre-wrap to respect newlines from the AI -->
                    <div style="line-height: 1.7; white-space: pre-wrap; font-size: 11px">${aiMessage}</div>
                    <div style="margin-top: 8px; padding-top: 0px; font-size: 0.85rem; color: #7a5d00;">
                        💡Your mood has been saved to history!
                    </div>
                </div>
            `);

            console.log("AI response received from your server!");

        } catch (error) {
            console.error("AI Error:", error);
    
            $resultDiv.css({
                'background-color': 'rgba(255, 255, 255, 0.8)',
                'backdrop-filter': 'blur(5px)',
                'padding': '20px',
                'border-radius': '15px',
                'margin-top': '25px',
                'box-shadow': '0 4px 15px rgba(0,0,0,0.1)'
            });

            // Fallback to default plan
            $resultDiv.html(`
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">📝</div>
                    <div style="line-height: 1.6;">
                        ${plans[mood]}
                    </div>
                    <div style="margin-top: 15px; font-size: 0.85rem; color: #999;">
                        (AI unavailable - showing default plan)
                    </div>
                </div>
            `);
        }
    }

    // Save mood to history
    function saveMoodToHistory(mood) {
        const moodEntry = {
            mood: mood,
            date: new Date().toISOString(),
            dateString: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };

        moodHistory.push(moodEntry);

        // Keep only last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        moodHistory = moodHistory.filter(entry => entry.timestamp > thirtyDaysAgo);

        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
        console.log(`Mood saved: ${mood} (Total: ${moodHistory.length} entries)`);
    }

    // Calculate mood statistics
    function getMoodStats() {
        if (moodHistory.length === 0) {
            return {
                total: 0,
                mostCommon: null,
                counts: {}
            };
        }

        const counts = {};
        moodHistory.forEach(entry => {
            counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        });

        const mostCommon = Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );

        return {
            total: moodHistory.length,
            mostCommon: mostCommon,
            counts: counts
        };
    }

    // Display mood history
    function showMoodHistory() {
        const stats = getMoodStats();
        
        if (stats.total === 0) {
            $('#mood-history-content').html(`
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
                    <h3 style="color: #7a5d00; margin-bottom: 10px;">No Mood History Yet!</h3>
                    <p style="font-size: 0.95rem; color: #7a5d00;">Start tracking by selecting a mood ✨</p>
                </div>
            `);
            $('#mood-history-modal').css('display', 'flex');
            return;
        }

        const moodEmojis = {
            happy: "😊",
            sad: "😔",
            sleepy: "😴",
            stressed: "😫",
            neutral: "🙂"
        };

        const moodColors = {
            happy: "#ffd3b6",
            sad: "#aec6cf",
            sleepy: "#b19cd9",
            stressed: "#d4a5a5",
            neutral: "#b2a851ff"
        };

        let historyHTML = `
            <div style="text-align: left;">
                <div style="font-size: 20px; text-align: center; margin-bottom: 15px; font-weight: bold;">
                    📊 Your Mood History
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; text-align: center;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.7); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${stats.total}</div>
                        <div style="font-size: 0.85rem; color: #7a5d00;">Total Entries</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.7); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 28px;">${moodEmojis[stats.mostCommon]}</div>
                        <div style="font-size: 0.85rem; color: #7a5d00; text-transform: capitalize;">${stats.mostCommon}</div>
                    </div>
                </div>

                <div style="margin-bottom: 20px; text-align: left;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #7a5d00;">
                        🎭 Mood Distribution
                    </div>
        `;

        // Show counts for each mood with visual bars
        Object.keys(stats.counts).sort((a, b) => stats.counts[b] - stats.counts[a]).forEach(mood => {
            const percentage = ((stats.counts[mood] / stats.total) * 100).toFixed(0);
            historyHTML += `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.9rem;">
                            ${moodEmojis[mood]} ${mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </span>
                        <span style="font-size: 0.85rem; font-weight: bold; color: #7a5d00;">
                            ${stats.counts[mood]} (${percentage}%)
                        </span>
                    </div>
                    <div style="background: rgba(35, 24, 24, 0.1); border-radius: 10px; height: 8px">
                        <div style="background: ${moodColors[mood]}; width: ${percentage}%; height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        });

        historyHTML += `</div>`;

        // Show last 5 entries in a compact way
        const recentEntries = moodHistory.slice(-5).reverse();
        historyHTML += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #f8c94f; text-align: left;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #7a5d00;">
                    📅 Recent Activity
                </div>
        `;

        recentEntries.forEach(entry => {
            historyHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; padding: 8px 12px; background: rgba(255,255,0.5); border-radius: 8px; border-left: 3px solid ${moodColors[entry.mood]};">
                    <span style="font-size: 1.2rem;">${moodEmojis[entry.mood]}</span>
                    <span style="font-size: 0.85rem; color: #7a5d00; text-transform: capitalize;">${entry.mood}</span>
                    <span style="font-size: 0.8rem; color: #999;">${entry.dateString}</span>
                </div>
            `;
        });

        historyHTML += `</div></div>`;
        
        $('#mood-history-content').html(historyHTML);
        $('#mood-history-modal').css('display', 'flex');
    }

    // Mood card click handler
    $(".mood-card").click(function () {
        let mood = $(this).data("mood");
        
        // Visual feedback
        $('.mood-card').css({
            'transform': 'scale(1)',
            'box-shadow': '0px 4px 15px rgba(0,0,0,0.12)'
        });
        $(this).css({
            'transform': 'scale(1.08)',
            'box-shadow': '0px 6px 25px rgba(248, 201, 79, 0.5)'
        });

        // Save mood to history
        saveMoodToHistory(mood);

        // Get AI response (with fallback)
        getAIResponse(mood);
    });

    // Add View History button if it doesn't exist
    if ($('#view-history-btn').length === 0) {
        $('.mood-container').append(`
            <button id="view-history-btn" style="
                margin-top: 25px;
                padding: 12px 24px;
                background: rgb(252, 205, 76);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: 0.3s ease;
                box-shadow: 0px 4px 15px rgba(0,0,0,0.15);
            ">📊 View Mood History</button>
        `);

        // Hover effect
        $(document).on('mouseenter', '#view-history-btn', function() {
            $(this).css('box-shadow', '0px 6px 20px rgba(0,0,0,0.25)');
        }).on('mouseleave', '#view-history-btn', function() {
            $(this).css('box-shadow', '0px 4px 15px rgba(0,0,0,0.15)');
        });
    }

    // View history button click
    $(document).on('click', '#view-history-btn', function() {
        showMoodHistory();
    });

    // Close modal functionality
    $(document).on('click', '#close-modal-btn', function() {
        $('#mood-history-modal').css('display', 'none');
    });

    // Close modal when clicking outside
    $(document).on('click', '#mood-history-modal', function(e) {
        if (e.target.id === 'mood-history-modal') {
            $('#mood-history-modal').css('display', 'none');
        }
    });

    // Console welcome message
    console.log('🎭 Mood Tracker with AI loaded!');
    console.log(`Current mood entries: ${moodHistory.length}`);
    if (moodHistory.length > 0) {
        const stats = getMoodStats();
        console.log(`Most common mood: ${stats.mostCommon}`);
    }
});