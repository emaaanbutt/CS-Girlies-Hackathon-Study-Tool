// Back button functionality
$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });
});

//Timer functionality

$(document).ready(function() {
    console.log('Pomodoro timer loaded!');

    const durations = {
        pomodoro: 25 * 60,    // 25 minutes
        short: 5 * 60,        // 5 minutes
        long: 15 * 60         // 15 minutes
    };

    let timeLeft = durations.pomodoro;
    let isRunning = false;
    let interval = null;
    let currentMode = 'pomodoro';

    // Update timer display
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        $('#time').text(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
    }

    // Update mode label
    function updateModeLabel() {
        const labels = {
            pomodoro: 'Pomodoro',
            short: 'Short Break',
            long: 'Long Break'
        };
        $('#mode-label').text(labels[currentMode]);
    }

    // Highlight active mode button
    function updateModeButtons() {
        $('.mode-btn').removeClass('active');
        $(`.mode-btn[data-mode="${currentMode}"]`).addClass('active');
    }

    // Start timer
    $('#start-btn').click(function() {
        if (!isRunning) {
            isRunning = true;
            $(this).prop('disabled', true);
            
            interval = setInterval(function() {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                    document.title = `${$('#time').text()} - Pomodoro`;
                } else {
                    // Timer finished
                    clearInterval(interval);
                    isRunning = false;
                    $('#start-btn').prop('disabled', false);
                    document.title = 'Pomodoro Timer';
                    
                    // Play sound and show notification
                    playSound();
                    
                    const messages = {
                        pomodoro: 'Pomodoro complete! Time for a break!',
                        short: 'Short break over! Ready to focus?',
                        long: 'Long break done! Let\'s get back to work!'
                    };
                    
                    alert(messages[currentMode]);
                    
                    if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                    }
                }
            }, 1000);
        }
    });

    // Pause timer
    $('#pause-btn').click(function() {
        if (isRunning) {
            clearInterval(interval);
            isRunning = false;
            $('#start-btn').prop('disabled', false);
            document.title = 'Paused - Pomodoro';
        }
    });

    // Reset timer
    $('#reset-btn').click(function() {
        clearInterval(interval);
        isRunning = false;
        timeLeft = durations[currentMode];
        updateDisplay();
        $('#start-btn').prop('disabled', false);
        document.title = 'Pomodoro Timer';
    });

    // Mode selection buttons
    $('.mode-btn').click(function() {
        const mode = $(this).data('mode');
        
        // Stop current timer
        clearInterval(interval);
        isRunning = false;
        $('#start-btn').prop('disabled', false);
        
        // Update mode
        currentMode = mode;
        timeLeft = durations[mode];
        
        // Update UI
        updateDisplay();
        updateModeLabel();
        updateModeButtons();
        document.title = 'Pomodoro Timer';
    });

    // Play notification sound
    function playSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Sound not supported:', e);
        }
    }

    // Keyboard shortcuts
    $(document).keypress(function(e) {
        if (e.which === 32) { // Spacebar
            e.preventDefault();
            if (isRunning) {
                $('#pause-btn').click();
            } else {
                $('#start-btn').click();
            }
        } else if (e.which === 114) { // 'r' key
            $('#reset-btn').click();
        }
    });


    updateDisplay();
    updateModeLabel();
    updateModeButtons();
    
    console.log('Pomodoro ready! Press spacebar to start/pause, "r" to reset');
});