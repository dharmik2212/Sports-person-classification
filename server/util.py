# import re
# import cv2
# import joblib
# import numpy as np  
# import base64
# import json
# from .wavelet import w2d

# __class_name_to_number = {}
# __class_number_to_name = {}
# __model = None

# def classify_img(image_base64_data, file_path=None):
#     """
#     Classifies an image by processing cropped faces.

#     Args:
#         image_base64_data: Base64 encoded string of the image.
#         file_path: Path to the image file (optional).

#     Returns:
#         A reshaped numpy array combining raw and wavelet-processed images,
#         ready for a classification model. Returns None if no faces are found.
#     """
#     imgs = get_cropped_image_if_2_eyes(file_path, image_base64_data)

#     if not imgs:
#         return None
#     result = []
#     # This implementation will only process the first detected face
#     for img in imgs:
#         scalled_raw_img = cv2.resize(img, (32, 32))
#         img_har = w2d(img, 'db1', 5)
#         scalled_img_har = cv2.resize(img_har, (32, 32))

#         combined_img = np.vstack((scalled_raw_img.reshape(32 * 32 * 3, 1),
#                                   scalled_img_har.reshape(32 * 32, 1)))

#         len_image_array = 32 * 32 * 3 + 32 * 32

#         final = combined_img.reshape(1, len_image_array).astype(float)
#         result.append({
#             'class': class_number_to_name(__model.predict(final)[0]),
#             'class_probability': np.round(__model.predict_proba(final) * 100, 2).tolist()[0],
#             'class_dictionary': __class_name_to_number
#         })   
#     return result
        

# def load_saved_artifacts():
#     """
#     Loads the saved classification model and class dictionary.
#     """
#     print("loading saved artifacts...start")
#     global __class_name_to_number
#     global __class_number_to_name

#     # Load the class dictionary
#     try:
#         with open("D:/sport_Person_Classifier_model/server/artifacts/class_dictionary.json", "r") as f:
#             __class_name_to_number = json.load(f)
#             __class_number_to_name = {v: k for k, v in __class_name_to_number.items()}
#     except FileNotFoundError:
#         print("Warning: class_dictionary.json not found.")
#         return

#     global __model
#     # Load the model if it hasn't been loaded already
#     if __model is None:
#         try:
#             with open('D:/sport_Person_Classifier_model/server/artifacts/saved_model.pkl', 'rb') as f:
#                 __model = joblib.load(f)
#         except FileNotFoundError:
#             print("Warning: saved_model.pkl not found.")
#             return
            
#     print("loading saved artifacts...done")

# def class_number_to_name(class_num):
#     return __class_number_to_name[class_num]

# def get_cv2_image_from_base64_string(b64str):
#     """
#     Decodes a base64 encoded image string into an OpenCV image format.

#     Args:
#         b64str: The base64 encoded string.

#     Returns:
#         An OpenCV image (NumPy array).
    
#     credit: https://stackoverflow.com/questions/33754935/read-a-base64-encoded-image-from-memory-using-opencv-python-library
#     """
#     if ',' not in b64str:
#         # Handle cases where the metadata part is missing
#         encoded_data = b64str
#     else:
#         encoded_data = b64str.split(',')[1]
        
#     nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
#     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#     return img

# def get_cropped_image_if_2_eyes(image_path, image_base64_data):
#     """
#     Detects faces and crops them if two eyes are present.
    
#     Args:
#         image_path: Path to the image file.
#         image_base64_data: Base64 encoded string of the image.
        
#     Returns:
#         A list of cropped face images (as NumPy arrays).
#     """
#     HAAR_PATH = cv2.data.haarcascades

#     face_cascade = cv2.CascadeClassifier(HAAR_PATH + 'haarcascade_frontalface_default.xml')
#     eye_cascade = cv2.CascadeClassifier(HAAR_PATH + 'haarcascade_eye.xml')
#     if image_path:
#         img = cv2.imread(image_path)
#     else:
#         img = get_cv2_image_from_base64_string(image_base64_data)

#     if img is None:
#         return []
        
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     faces = face_cascade.detectMultiScale(gray, 1.3, 5)

#     cropped_faces = []
#     for (x, y, w, h) in faces:
#         roi_gray = gray[y:y+h, x:x+w]
#         roi_color = img[y:y+h, x:x+w]
#         eyes = eye_cascade.detectMultiScale(roi_gray)
#         if len(eyes) >= 2:
#             cropped_faces.append(roi_color)
            
#     return cropped_faces

# # The image also shows a function definition starting with `def get_b64_test_image_for_virat():`
# # but the body of the function is not visible.

# def get_b64_test_img_for_virat():
#     with open('b64.txt') as f:
#         return f.read()

# if __name__ == "__main__":
#     load_saved_artifacts()
#     # print(classify_img(get_b64_test_img_for_virat(),None)) 
#     # print(classify_img(None,"C:/Users/admin/Pictures/Saved Pictures/bt.jpeg")) 
#     # print(classify_img(None,"C:/Users/admin/Pictures/Saved Pictures/22.jpeg")) 
#     print(classify_img(None,"D:/sport_Person_Classifier_model/dataset/cropped/marykom/3.png"))
#     print(classify_img(None,"D:/sport_Person_Classifier_model/dataset/bolt/gettyimages-592598472-612x612.jpg")) 
#     print(classify_img(None,"D:/sport_Person_Classifier_model/dataset/niraj/Neeraj Chopra provides silver lining to ....jpg")) 


import re
import cv2
import joblib
import numpy as np  
import base64
import json
import os
from .wavelet import w2d

__class_name_to_number = {}
__class_number_to_name = {}
__model = None

def classify_img(image_base64_data, file_path=None):
    """
    Classifies an image by processing cropped faces.

    Args:
        image_base64_data: Base64 encoded string of the image.
        file_path: Path to the image file (optional).

    Returns:
        A list of classification results with probabilities.
        Returns None if no faces are found.
    """
    try:
        imgs = get_cropped_image_if_2_eyes(file_path, image_base64_data)

        if not imgs or len(imgs) == 0:
            print("⚠ No faces detected with 2 eyes")
            return None
        
        result = []
        # Process each detected face
        for img in imgs:
            scalled_raw_img = cv2.resize(img, (32, 32))
            img_har = w2d(img, 'db1', 5)
            scalled_img_har = cv2.resize(img_har, (32, 32))

            combined_img = np.vstack((scalled_raw_img.reshape(32 * 32 * 3, 1),
                                      scalled_img_har.reshape(32 * 32, 1)))

            len_image_array = 32 * 32 * 3 + 32 * 32

            final = combined_img.reshape(1, len_image_array).astype(float)
            
            result.append({
                'class': class_number_to_name(__model.predict(final)[0]),
                'class_probability': np.round(__model.predict_proba(final) * 100, 2).tolist()[0],
                'class_dictionary': __class_name_to_number
            })
            
        print(f"✓ Classification completed: {len(result)} face(s) processed")
        return result
        
    except Exception as e:
        print(f"✗ Error in classify_img: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None

def load_saved_artifacts():
    """
    Loads the saved classification model and class dictionary.
    Uses relative paths that work in any environment.
    """
    print("loading saved artifacts...start")
    global __class_name_to_number
    global __class_number_to_name
    global __model

    # Get the directory where this util.py file is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Build paths relative to the current file location
    artifacts_dir = os.path.join(current_dir, 'artifacts')
    class_dict_path = os.path.join(artifacts_dir, 'class_dictionary.json')
    model_path = os.path.join(artifacts_dir, 'saved_model.pkl')
    
    print(f"Looking for artifacts in: {artifacts_dir}")
    print(f"Class dictionary path: {class_dict_path}")
    print(f"Model path: {model_path}")

    # Load the class dictionary
    try:
        if not os.path.exists(class_dict_path):
            print(f"✗ ERROR: class_dictionary.json not found at {class_dict_path}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Files in artifacts dir: {os.listdir(artifacts_dir) if os.path.exists(artifacts_dir) else 'DIR NOT FOUND'}")
            return False
            
        with open(class_dict_path, "r") as f:
            __class_name_to_number = json.load(f)
            __class_number_to_name = {v: k for k, v in __class_name_to_number.items()}
            print(f"✓ Class dictionary loaded: {__class_name_to_number}")
            
    except Exception as e:
        print(f"✗ Error loading class_dictionary.json: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

    # Load the model
    try:
        if not os.path.exists(model_path):
            print(f"✗ ERROR: saved_model.pkl not found at {model_path}")
            return False
            
        with open(model_path, 'rb') as f:
            __model = joblib.load(f)
            print(f"✓ Model loaded successfully: {type(__model)}")
            
    except Exception as e:
        print(f"✗ Error loading saved_model.pkl: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False
            
    print("✓ loading saved artifacts...done")
    return True

def class_number_to_name(class_num):
    """Convert class number to class name"""
    if class_num in __class_number_to_name:
        return __class_number_to_name[class_num]
    else:
        print(f"⚠ Warning: Unknown class number {class_num}")
        return "Unknown"

def get_cv2_image_from_base64_string(b64str):
    """
    Decodes a base64 encoded image string into an OpenCV image format.

    Args:
        b64str: The base64 encoded string.

    Returns:
        An OpenCV image (NumPy array) or None if decoding fails.
    """
    try:
        if not b64str:
            print("✗ Empty base64 string")
            return None
            
        # Remove the data URL prefix if present
        if ',' in b64str:
            encoded_data = b64str.split(',')[1]
        else:
            encoded_data = b64str
        
        # Decode base64 to bytes
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        
        # Decode bytes to image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("✗ Failed to decode image from base64")
            return None
            
        print(f"✓ Image decoded successfully: shape {img.shape}")
        return img
        
    except Exception as e:
        print(f"✗ Error decoding base64 image: {str(e)}")
        return None

def get_cropped_image_if_2_eyes(image_path, image_base64_data):
    """
    Detects faces and crops them if two eyes are present.
    
    Args:
        image_path: Path to the image file.
        image_base64_data: Base64 encoded string of the image.
        
    Returns:
        A list of cropped face images (as NumPy arrays).
    """
    try:
        # Get Haar Cascade paths
        HAAR_PATH = cv2.data.haarcascades
        
        face_cascade = cv2.CascadeClassifier(HAAR_PATH + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(HAAR_PATH + 'haarcascade_eye.xml')
        
        # Verify cascades loaded
        if face_cascade.empty():
            print("✗ Failed to load face cascade")
            return []
        if eye_cascade.empty():
            print("✗ Failed to load eye cascade")
            return []
        
        # Load image
        if image_path:
            img = cv2.imread(image_path)
            if img is None:
                print(f"✗ Failed to read image from path: {image_path}")
                return []
        else:
            img = get_cv2_image_from_base64_string(image_base64_data)
            if img is None:
                print("✗ Failed to get image from base64")
                return []

        print(f"✓ Image loaded: shape {img.shape}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        print(f"Found {len(faces)} face(s)")

        cropped_faces = []
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = img[y:y+h, x:x+w]
            
            # Detect eyes in face region
            eyes = eye_cascade.detectMultiScale(roi_gray)
            print(f"  Face has {len(eyes)} eye(s) detected")
            
            if len(eyes) >= 2:
                cropped_faces.append(roi_color)
                print(f"  ✓ Face accepted (has 2+ eyes)")
            else:
                print(f"  ✗ Face rejected (needs 2+ eyes)")
        
        print(f"✓ Returning {len(cropped_faces)} valid face(s)")
        return cropped_faces
        
    except Exception as e:
        print(f"✗ Error in get_cropped_image_if_2_eyes: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return []

def get_b64_test_img_for_virat():
    """Load test base64 image (for testing only)"""
    try:
        with open('b64.txt') as f:
            return f.read()
    except FileNotFoundError:
        print("b64.txt not found")
        return None

if __name__ == "__main__":
    load_saved_artifacts()
    print("\nTesting classification...")
    # Add your test code here