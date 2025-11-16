$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });
});

document.addEventListener('DOMContentLoaded', () => {
            const generateBtn = document.getElementById('generate-btn');
            const topicInput = document.getElementById('topic');
            const cardContainer = document.getElementById('flashcard-container');
            const messageArea = document.getElementById('message-area');

            // --- Gemini API Configuration ---
            const apiKey = ""; 
            const API_MODEL = 'gemini-2.5-flash-preview-09-2025';
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;

            // Define the structured JSON response for the flashcards
            const flashcardSchema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "q": { "type": "STRING", "description": "The question or term." },
                        "a": { "type": "STRING", "description": "The answer or definition." }
                    },
                    "propertyOrdering": ["q", "a"]
                }
            };

            // --- Main Event Listener for Generation ---
            generateBtn.addEventListener('click', async () => {
                const topic = topicInput.value.trim();

                if (!topic) {
                    messageArea.textContent = 'Please enter a topic to generate flashcards!';
                    return;
                }

                messageArea.textContent = 'Generating 5 flashcards for your topic... ✨';
                generateBtn.disabled = true;
                generateBtn.textContent = 'Generating...';
                cardContainer.innerHTML = ''; // Clear old cards

                try {
                    const userPrompt = `Generate exactly 5 detailed flashcards about "${topic}". The question (q) should be a term or concept, and the answer (a) should be its definition or explanation.`;
                    
                    const payload = {
                        contents: [{ parts: [{ text: userPrompt }] }],
                        tools: [{ "google_search": {} }], // Use search grounding for accuracy
                        systemInstruction: { parts: [{ text: "You are a concise, helpful academic tutor that generates high-quality study materials." }] },
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: flashcardSchema
                        }
                    };

                    const flashcards = await fetchGeminiApi(payload);

                    if (flashcards && flashcards.length > 0) {
                        messageArea.textContent = `Generated ${flashcards.length} cards for "${topic}". Click a card to flip it!`;
                        displayFlashcards(flashcards);
                    } else {
                        messageArea.textContent = 'Failed to generate cards. The model returned no structured data.';
                    }

                } catch (error) {
                    console.error('API Error:', error);
                    messageArea.textContent = 'Oops! Failed to connect to the generator. Please check the console.';
                } finally {
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generate Cards';
                }
            });

            // --- Gemini API Fetch Helper with Retry ---
            async function fetchGeminiApi(payload, retries = 3) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const result = await response.json();
                        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                        
                        if (jsonText) {
                            // Always try to parse JSON
                            const parsedJson = JSON.parse(jsonText);
                            return parsedJson;
                        } else {
                            throw new Error('No content returned from API.');
                        }
                    } catch (error) {
                        console.warn(`Attempt ${i + 1} failed:`, error.message);
                        if (i === retries - 1) throw error; // Re-throw on last attempt
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)); // Exponential backoff
                    }
                }
                return null;
            }


            // --- Display and Navigation Logic ---
            function displayFlashcards(flashcards) {
                let currentCardIndex = 0;

                function renderCard() {
                    if (currentCardIndex >= flashcards.length) {
                        cardContainer.innerHTML = `
                            <p class="text-center text-green-600 font-semibold text-xl pt-4">
                                All done! 🎉 You've reviewed ${flashcards.length} cards.
                            </p>
                        `;
                        return;
                    }

                    const cardData = flashcards[currentCardIndex];
                    
                    cardContainer.innerHTML = `
                        <p class="text-center text-sm text-amber-600 mb-4">
                            Card ${currentCardIndex + 1} of ${flashcards.length}
                        </p>
                        <div class="scene w-full">
                            <div class="card">
                                <div class="card-face card-front">
                                    <p>${cardData.q}</p>
                                </div>
                                <div class="card-face card-back">
                                    <p>${cardData.a}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between mt-8">
                            <button id="prev-btn" class="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                &larr; Prev
                            </button>
                            <button id="next-btn" class="py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                                Next &rarr;
                            </button>
                        </div>
                    `;

                    const card = cardContainer.querySelector('.card');
                    
                    // 1. Flip on click
                    card.addEventListener('click', () => {
                        // Flips the card
                        card.classList.toggle('is-flipped');
                    });

                    // 2. Navigation
                    document.getElementById('next-btn').addEventListener('click', () => {
                        currentCardIndex++;
                        renderCard();
                    });

                    document.getElementById('prev-btn').addEventListener('click', () => {
                        if (currentCardIndex > 0) {
                            currentCardIndex--;
                            renderCard();
                        }
                    });

                    // 3. Disable/style buttons
                    if (currentCardIndex === 0) {
                        document.getElementById('prev-btn').disabled = true;
                        document.getElementById('prev-btn').classList.add('opacity-50', 'cursor-not-allowed');
                    }
                    if (currentCardIndex === flashcards.length - 1) {
                        document.getElementById('next-btn').textContent = 'Finish';
                    }
                }

                renderCard();
            }
        });