// Participant data
const participants = [
    { id: 1, name: "דנה", type: "התלמידה החרוצה", description: "אוהבת ללמוד ותמיד מתנדבת לענות על שאלות" },
    { id: 2, name: "יוסי", type: "הספורטאי", description: "מעדיף פעילות גופנית על למידה אקדמית" },
    { id: 3, name: "מיכל", type: "המנהיגה", description: "אסרטיבית ואוהבת לארגן את הכיתה" },
    { id: 4, name: "עומר", type: "החולם בהקיץ", description: "מתקשה להתרכז ונוטה לחלום בזמן השיעור" },
    { id: 5, name: "נועה", type: "הסקרנית", description: "תמיד שואלת שאלות ורוצה ללמוד יותר" },
    { id: 6, name: "אלון", type: "הציניקן", description: "לא אוהב ללמוד ומחכה שהדיון יסתיים" }
];

// Global variables
let selectedParticipants = [];
let currentTopic = "";
let openaiApiKey = "";

// DOM elements
const apiKeyPage = document.getElementById("api-key-page");
const apiKeyInput = document.getElementById("api-key-input");
const submitApiKeyBtn = document.getElementById("submit-api-key");
const landingPage = document.getElementById("landing-page");
const discussionPage = document.getElementById("discussion-page");
const topicInput = document.getElementById("topic-input");
const participantsList = document.getElementById("participants-list");
const startDiscussionBtn = document.getElementById("start-discussion");
const discussionTopic = document.getElementById("discussion-topic");
const discussionArea = document.getElementById("discussion-area");
const questionInput = document.getElementById("question-input");
const sendQuestionBtn = document.getElementById("send-question");

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Initialize the application
function init() {
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    submitApiKeyBtn.addEventListener("click", submitApiKey);
    startDiscussionBtn.addEventListener("click", startDiscussion);
    sendQuestionBtn.addEventListener("click", sendQuestion);
}

// Submit API Key
function submitApiKey() {
    openaiApiKey = apiKeyInput.value.trim();
    if (openaiApiKey) {
        apiKeyPage.classList.add("hidden");
        landingPage.classList.remove("hidden");
        renderParticipants();
    } else {
        alert("אנא הזן מפתח API תקין");
    }
}

// Render participant cards with checkboxes
function renderParticipants() {
    participantsList.innerHTML = participants.map(participant => `
        <div class="participant-card flex items-center space-x-4 p-4 border rounded">
            <input type="checkbox" id="participant-${participant.id}" name="participant" value="${participant.id}" class="form-checkbox h-5 w-5 text-blue-600">
            <label for="participant-${participant.id}" class="flex-grow">
                <h3 class="font-semibold">${participant.name}</h3>
                <p class="text-sm text-gray-600">${participant.type}</p>
                <p class="text-xs text-gray-500">${participant.description}</p>
            </label>
        </div>
    `).join("");
}

// Start the discussion
function startDiscussion() {
    currentTopic = topicInput.value.trim();
    const selectedCheckboxes = document.querySelectorAll('input[name="participant"]:checked');
    
    if (currentTopic && selectedCheckboxes.length > 0) {
        selectedParticipants = Array.from(selectedCheckboxes).map(checkbox => 
            participants.find(p => p.id === parseInt(checkbox.value))
        );
        
        landingPage.classList.add("hidden");
        discussionPage.classList.remove("hidden");
        discussionTopic.textContent = `נושא הדיון: ${currentTopic}`;
        introduceParticipants();
    } else {
        alert("אנא בחר נושא לדיון ולפחות משתתף אחד");
    }
}

// Introduce participants
async function introduceParticipants() {
    for (const participant of selectedParticipants) {
        const introduction = await generateResponse(participant, "הצג את עצמך לקבוצה");
        addMessage(participant.name, introduction);
    }
}

// Send a question to the participants
async function sendQuestion() {
    const question = questionInput.value.trim();
    if (question) {
        addMessage("מנהל הדיון", question, true);
        questionInput.value = "";
        
        for (const participant of selectedParticipants) {
            const response = await generateResponse(participant, question);
            addMessage(participant.name, response);
        }
    }
}

// Add a message to the discussion area
function addMessage(sender, content, isUser = false) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isUser ? "user" : "agent");
    messageElement.innerHTML = `
        <div class="agent-name">${sender}</div>
        <div>${content}</div>
    `;
    discussionArea.appendChild(messageElement);
    discussionArea.scrollTop = discussionArea.scrollHeight;
}

// Generate a response using OpenAI API
async function generateResponse(participant, question) {
    const prompt = `
    אתה תלמיד כיתה ח' בשם ${participant.name}. אתה ${participant.type} ו${participant.description}.
    נושא הדיון הוא: "${currentTopic}".
    השאלה שנשאלה היא: "${question}".
    אנא ענה לשאלה בהתאם לאופי שלך ולנושא הדיון. התשובה צריכה להיות קצרה (עד 3 משפטים) ובעברית.
    `;

    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating response:", error);
        return "סליחה, לא הצלחתי לענות על השאלה הזו. אנא ודא שמפתח ה-API תקין.";
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
