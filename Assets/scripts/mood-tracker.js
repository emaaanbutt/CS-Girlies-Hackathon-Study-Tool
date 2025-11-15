$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });
});

$(document).ready(function () {

    const plans = {
        happy: "You're full of energy! Try a 40-minute focused study session + 10-minute break ✨",
        sad: "Go slow today 💛 Do a 20-minute light review and then rest.",
        sleepy: "You need a recharge 😴 Take a 15-min nap first, then a short 25-minute session.",
        stressed: "Deep breath! 🌿 Try the Pomodoro: 25 minutes study + 5 minutes calm music.",
        neutral: "A balanced day! Start with your easiest task for momentum ⚡"
    };

    $(".mood-card").click(function () {
        let mood = $(this).data("mood");
        $("#mood-result").html(plans[mood]);
    });

});

