// ==== DESKTOP ==== //
document.getElementById("imageInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById("preview");
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

// === Custom description for each condition ===
const conditionDescriptions = {
  "Mpox": "Mpox (Monkeypox) is a rare viral illness. Early symptoms may include fever, swollen lymph nodes, muscle aches, and a rash that develops into lesions. Consult a doctor for confirmation. If symptoms persist, seek medical advice.",
  "Measles": "Measles is a highly contagious disease spread by respiratory droplets. Common early symptoms include fever, cough, runny nose, red, watery eyes, and sometimes tiny white spots inside the mouth. Consult a doctor for confirmation. If symptoms persist, seek medical advice.",
  "Cowpox": "Cowpox is a rare infection that causes small red sores or blister-like lesions, often on the hands or face. It may resemble other skin conditions. Consult a doctor for confirmation. If symptoms persist, seek medical advice.",
  "Chickenpox": "Chickenpox is a common illness that causes an itchy rash with red spots and fluid-filled blisters. It can be accompanied by fever and fatigue. Consult a doctor for confirmation. If symptoms persist, seek medical advice.",
  "Healthy": "No obvious signs of a skin condition were detected. If any symptoms appear or worsen, please consult a healthcare professional for proper diagnosis."
};

document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById("imageInput").files[0];
    const errorBox = document.getElementById("error-message");
    errorBox.innerText = ""; // Clear previous errors

    if (!fileInput) {
        errorBox.innerText = "Please upload an image before clicking Analyze.";
        return;
    }

    if (!fileInput.type.startsWith("image/")) {
        errorBox.innerText = "Please upload a valid image file (JPG, PNG, etc).";
        return;
    }

    formData.append("image", fileInput);
    updateProgressBar(1);

    try {
        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!result.class) {
            errorBox.innerText = "Unable to analyze the image. Please upload a different image.";
            return;
        }

        const conditionEls = document.querySelectorAll("#condition");
        const descriptionEls = document.querySelectorAll("#description");

        conditionEls.forEach(el => el.innerText = result.class);
        
	const descriptionText = conditionDescriptions[result.class] || 
            "Consult a doctor for confirmation. If symptoms persist, seek medical advice.";

	descriptionEls.forEach(el => el.innerText = descriptionText);

        updateProgressBar(2);
        showDiagnosisResult();
        errorBox.innerText = ""; // Clear error on success

    } catch (error) {
        console.error("Error:", error);
        errorBox.innerText = "An error occurred while processing the image. Please try again.";

        document.getElementById("results-section").style.display = "none";
        document.getElementById("condition").innerText = "-";
        document.getElementById("description").innerText = "-";
    }
});

function updateProgressBar(stepSelectorOrIndex, stepIndex = null) {
    let steps;

    if (typeof stepSelectorOrIndex === "string") {
        steps = document.querySelectorAll(stepSelectorOrIndex);
    } else {
        steps = document.querySelectorAll(".step");
        stepIndex = stepSelectorOrIndex;
    }

    steps.forEach((step, index) => {
        step.classList.remove("active", "completed");
        if (index < stepIndex) step.classList.add("completed");
        if (index === stepIndex) step.classList.add("active");
    });
}

const dropArea = document.querySelector(".drop-area");

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (!file) {
        alert("No file was dropped.");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (JPG, PNG, etc).");
        return;
    }

    document.getElementById("imageInput").files = event.dataTransfer.files;

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById("preview");
        preview.src = e.target.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

function showDiagnosisResult(sectionId = "results-section") {
    const resultSection = document.getElementById(sectionId);
    if (resultSection) {
        resultSection.style.display = "block";
        resultSection.scrollIntoView({ behavior: "smooth" });
    }
}

// ==== MOBILE ==== //
const imageInputMobile = document.getElementById("imageInputMobile");
const previewMobile = document.getElementById("previewMobile");

if (imageInputMobile && previewMobile) {
    imageInputMobile.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewMobile.src = e.target.result;
                previewMobile.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });
}

const mobileForm = document.getElementById("uploadFormMobile");
if (mobileForm) {
    mobileForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const fileInput = document.getElementById("imageInputMobile").files[0];
        const errorBoxMobile = document.getElementById("error-message-mobile");
        errorBoxMobile.innerText = ""; // Clear previous errors

        if (!fileInput) {
            errorBoxMobile.innerText = "Please upload an image before clicking Analyze.";
            return;
        }

        if (!fileInput.type.startsWith("image/")) {
            errorBoxMobile.innerText = "Please upload a valid image file (JPG, PNG, etc).";
            return;
        }

        const formData = new FormData();
        formData.append("image", fileInput);

        updateProgressBar(".mobile-layout .step", 1);

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!result.class) {
                errorBoxMobile.innerText = "Unable to analyze the image. Please upload a different image.";
                return;
            }

            const descriptionTextMobile = conditionDescriptions[result.class] || 
            "Consult a doctor for confirmation. If symptoms persist, seek medical advice.";

	    document.getElementById("conditionMobile").innerText = result.class;
	    document.getElementById("descriptionMobile").innerText = descriptionTextMobile;

            updateProgressBar(".mobile-layout .step", 2);
            showDiagnosisResult("results-section-mobile");
            errorBoxMobile.innerText = ""; // Clear error

        } catch (error) {
            console.error("Error:", error);
            errorBoxMobile.innerText = "An error occurred while processing the image. Please try again.";

            document.getElementById("results-section-mobile").style.display = "none";
            document.getElementById("conditionMobile").innerText = "-";
            document.getElementById("descriptionMobile").innerText = "-";
        }
    });
}

updateProgressBar(".mobile-layout .step", 0);

document.addEventListener("DOMContentLoaded", function () {
    const toggleHeader = document.getElementById("toggleGuidelines");
    const list = document.getElementById("guidelinesList");

    if (window.innerWidth <= 768) {
        list.style.display = "none";
    }

    toggleHeader.addEventListener("click", () => {
        if (list.style.display === "none" || list.style.display === "") {
            list.style.display = "block";
            toggleHeader.innerText = "Hide Guidelines ▲";
        } else {
            list.style.display = "none";
            toggleHeader.innerText = "Click here for Quick Guidelines ▼";
        }
    });
});
