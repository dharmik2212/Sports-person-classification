from flask import Flask, request, jsonify,render_template
from . import util
import os

template_dir = os.path.join(os.path.dirname(__file__), '..', 'UI')
app = Flask(__name__,template_folder=template_dir,static_folder=template_dir,static_url_path='')

util.load_saved_artifacts()

@app.route('/')
def home():
    """
    Serves the main HTML page (the frontend).
    """
    # This looks for 'app.html' in the 'templates' folder
    return render_template('app.html')

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_img():
    """
    Handles the image classification request.
    It expects image data in the 'image_data' field of a form submission.
    """
    # Retrieve the base64 encoded image data from the form submission.
    image_data = request.form['image_data']

    # Call the classify_image function from the util module to get the classification results.
    # The result is then converted to a JSON response.
    response = jsonify(util.classify_img(image_data))

    # Add a CORS (Cross-Origin Resource Sharing) header to the response.
    # This allows the API to be called from any domain, which is useful for web frontends.
    response.headers.add('Access-Control-Allow-Origin', '*')

    # Return the JSON response to the client.
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Sport Person Classifier...")
    app.run(port=5000)