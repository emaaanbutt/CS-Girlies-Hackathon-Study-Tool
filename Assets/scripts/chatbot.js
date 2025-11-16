const API_BASE = "http://127.0.0.1:8000";

// Build Index
document.getElementById("buildBtn").onclick = async () => {
    let files = document.getElementById("fileInput").files;
    let urlInput = document.getElementById("urlInput").value;

    let formData = new FormData();
    for (let file of files) formData.append("files", file);
    formData.append("url", urlInput);

    const res = await fetch(`${API_BASE}/build-index`, { method: "POST", body: formData });
    let data = await res.json();
    alert(data.message || "Index built successfully!");
};
console.log(1)
document.getElementById("sendBtn").onclick = async () => {
    const message = document.getElementById("userMessage").value;
    if (!message) return;
    addMessage(message, "user");
    document.getElementById("userMessage").value = "";

    console.log(2)
    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message })
    });

    let data = await res.json();
    console.log(data)
    addMessage(typeof data.answer === "string" ? data.answer : JSON.stringify(data.answer.content), "bot");

};

// Support sending with Enter key
document.getElementById("userMessage").addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("sendBtn").click();
    }
});

function addMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
