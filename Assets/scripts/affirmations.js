$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });

// Affirmations database
    const affirmations = [
        "You're doing amazing! Keep going! 🌟",
        "Small progress is still progress! 💪",
        "Believe in yourself! You've got this! ✨",
        "Take it one step at a time! 🌸",
        "You're stronger than you think! 🦋",
        "Every mistake is a lesson learned! 📚",
        "Rest is productive too! 🌙",
        "You're capable of amazing things! 🎯",
        "Celebrate small wins! 🎉",
        "Your effort matters! 💝",
        "Be kind to yourself today! 🌺",
        "You deserve good things! 🌈",
        "Your journey is unique and beautiful! 🦄",
        "It's okay to take breaks! ☕",
        "You're making a difference! 🌍",
        "Trust the process! 🌱",
        "You're not alone in this! 🤝",
        "Your best is enough! 💖",
        "Keep shining bright! ⭐",
        "You inspire others! 🌟",
        "Today is a fresh start! 🌅",
        "You're learning and growing! 🌿",
        "Your dreams are valid! 💭",
        "You have so much potential! 🚀",
        "Be proud of how far you've come! 🏆",
        "You are worthy of love and respect! 💕",
        "Every day is a new opportunity! 🌄",
        "Your kindness makes a difference! 🤗",
        "You are enough, just as you are! 🌼",
        "Believe in the magic within you! ✨",
        "You're doing better than you think! 🎈",
        "Take a deep breath, you've got this! 🌬️",
        "Your smile brightens the world! 😊",
        "You are brave and courageous! 🦁",
        "Success is a journey, not a destination! 🛤️",
        "Your hard work will pay off! 💎",
        "You make the world a better place! 🌏",
        "Every challenge makes you stronger! 💪",
        "You deserve all the happiness! 🎊",
        "Keep pushing forward, star! ⭐"
    ];

    // Show random affirmation with animation
    function showAffirmation() {
        // Pick random affirmation
        const randomIndex = Math.floor(Math.random() * affirmations.length);
        const affirmation = affirmations[randomIndex];

        // Fade out, change text, fade in 
        $('#affirm-text').fadeOut(300, function() {
            $(this).html(affirmation).fadeIn(500);
        });

        // Button click animation
        $('#new-affirm-btn').css('transform', 'scale(0.95)');
        setTimeout(function() {
            $('#new-affirm-btn').css('transform', 'scale(1)');
        }, 150);
    }

    // Button click event
    $('#new-affirm-btn').click(function() {
        showAffirmation();
    });

    // Keyboard shortcut - Spacebar for new affirmation
    $(document).keypress(function(e) {
        if (e.which === 32) { // Spacebar
            e.preventDefault();
            showAffirmation();
        }
    });

    // Auto-show first affirmation after 1 second
    setTimeout(function() {
        showAffirmation();
    }, 1000);

    console.log('Affirmations ready! Press spacebar or click button');
    console.log(`${affirmations.length} affirmations available`);

    });
