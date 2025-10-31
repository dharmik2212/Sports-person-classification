
# Sportsman Image Classification

**Sportsman Image Classifier using ML & OpenCV**

This project is a classic machine learning pipeline built to identify specific sports personalities from a collection of images.

It does not use deep learning. Instead, it relies on a traditional computer vision approach involving rigorous data preprocessing, manual feature extraction, and a classic machine learning classifier. The core of the project is to first isolate high-quality faces from the raw images and then train a model to recognize the unique facial features of each athlete.

**Project Workflow**

The model is built and makes predictions by following these key steps:

**1. Data Collection**:   

    A raw dataset of images is gathered for each sportsman to be classified (e.g., 'Player A', 'Player B', etc.).

**2. Face & Eye Detection (OpenCV)**:

    Each raw image is processed using Haar Cascade Classifiers.

    First, the haarcascade_frontalface_default.xml classifier is used to detect the location (bounding box) of a face in the image.

    If a face is found, the haarcascade_eye.xml classifier is run on that specific face region.

**3. Data Filtering & Cleaning**:

    A strict rule is applied to ensure data quality: only images that contain one clear face and two detected eyes are kept.

    All other images (e.g., side profiles, blurry images, back of the head, or images with no face) are discarded.

**4. Cropping**: 
    
    The "good" images are cropped to the bounding box of the detected face, removing all background noise (like the crowd, jersey, or stadium).

**5. Feature Extraction**:

    The cropped face images are converted to grayscale.

    A feature descriptor, such as Histogram of Oriented Gradients (HOG), is applied to each face. This converts the visual face into a numerical feature vector that represents its unique shape and contours.

**6. Model Training**:

    The final dataset of HOG feature vectors (and their corresponding labels, e.g., "Player A") is used to train a classifier.

    A Support Vector Machine (SVM) model is trained to learn the complex patterns that differentiate the feature vectors of one player from another.

**7. Prediction**:

To classify a new, unseen image, it must pass through the exact same pipeline:

    1.Face/eye detection.

    2.Cropping.

    3.HOG feature extraction.

The resulting feature vector is then fed to the trained SVM, which predicts the name of the sportsman.
## Demo

![Demo of my project](https://github.com/dharmik2212/Sports-person-classification/blob/main/demo.gif?raw=true)
## Tech Stack

**Python**

**OpenCV (cv2)**: Used for all computer vision tasks, specifically Haar Cascade classifiers for face and eye detection.

**Scikit-learn (sklearn)**: Used to implement the Histogram of Oriented Gradients (HOG) feature extractor and the Support Vector Machine (SVM) classifier.

**NumPy**: Used for numerical operations on image arrays.