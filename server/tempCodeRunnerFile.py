from flask import Flask, request, jsonify
import util
app = Flask(__name__)

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
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
    util.load_saved_artifacts()
    app.run(port=5000)