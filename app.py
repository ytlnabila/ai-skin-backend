from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Load the TFLite model
interpreter = tf.lite.Interpreter(model_path="best_model.tflite")
interpreter.allocate_tensors()

# Get input & output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Define class names (ensure it matches training)
class_names = ['Chickenpox', 'Cowpox', 'Healthy', 'Measles', 'Mpox']

def preprocess_image(image):
    """Preprocess the uploaded image to match model input"""
    image = image.resize((224, 224))  # Resize to model input size
    image = np.array(image, dtype=np.float32)  # Convert to numpy array
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Route for Home Page
@app.route('/')
def index():
    return render_template("upload.html")  # Landing page

# Route for handling predictions
@app.route('/predict', methods=['POST'])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    image = Image.open(io.BytesIO(file.read()))
    
    processed_image = preprocess_image(image)
    
    interpreter.set_tensor(input_details[0]['index'], processed_image)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    predicted_index = np.argmax(output_data)
    predicted_class = class_names[predicted_index]
    confidence = float(output_data[0][predicted_index]) * 100  # Convert to percentage

    return jsonify({"class": predicted_class, "confidence": round(confidence, 2)})

# Folder to store uploaded feedback images
FEEDBACK_FOLDER = "static/feedback_images"
if not os.path.exists(FEEDBACK_FOLDER):
    os.makedirs(FEEDBACK_FOLDER)

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    name = request.form.get("name", "Anonymous")
    message = request.form.get("message")

    # Handle optional image upload
    image_file = request.files.get("feedback_image")
    image_path = "No image uploaded"

    if image_file and image_file.filename != "":
        image_path = os.path.join(FEEDBACK_FOLDER, image_file.filename)
        image_file.save(image_path)

    # Save feedback in text file
    with open("feedback.txt", "a", encoding="utf-8") as file:
        file.write(f"From: {name}\n")
        file.write(f"Message: {message}\n")
        file.write(f"Image: {image_path}\n")
        file.write("-" * 50 + "\n")  # Separator for better readability

    return jsonify({"success": True, "message": "Feedback submitted successfully"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
