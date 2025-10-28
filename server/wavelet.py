import cv2
import joblib
import numpy as np  
import base64
import json
import pywt
import os


def w2d(img, mode='haar', level=1):
    """
    Performs a 2D wavelet decomposition on an image.

    Args:
        img: The input image (as a NumPy array).
        mode: The type of wavelet to use (default is 'haar').
        level: The level of decomposition (default is 1).

    Returns:
        The reconstructed image after processing the wavelet coefficients.
    """
    # ---- Datatype conversions ----
    imArray = img

    # 1. Convert to grayscale
    imArray = cv2.cvtColor(imArray, cv2.COLOR_RGB2GRAY)

    # 2. Convert to float
    imArray = np.float32(imArray)
    imArray /= 255;

    # ---- Compute coefficients ----
    coeffs = pywt.wavedec2(imArray, mode, level=level)

    # ---- Process Coefficients ----
    # Create a copy of the coefficients
    coeffs_H = list(coeffs)
    # Set the approximation coefficients (LL) to zero
    coeffs_H[0] *= 0;

    # ---- Reconstruction ----
    # Reconstruct the image from the modified coefficients
    imArray_H = pywt.waverec2(coeffs_H, mode);
    # Rescale the image back to 0-255 range
    imArray_H *= 255;
    # Convert back to unsigned 8-bit integer format
    imArray_H = np.uint8(imArray_H)

    return imArray_H
