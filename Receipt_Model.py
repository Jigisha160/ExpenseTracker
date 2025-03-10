import pytesseract
import cv2
import re
import tkinter as tk
from tkinter import filedialog
from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
from PIL import Image
import torch
import os

# Tesseract executable path (change this to your path if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Merchant categories and keywords for categorization (Indian market stores)
categories = {
    "Groceries": ["supermarket", "grocery", "kirana", "market", "fresh", "produce", "supermart", "bigbasket", "spencers", "more", "dmart", "reliance fresh", "grofers", "amazon pantry"],
    "Dining": ["restaurant", "cafe", "coffee", "dining", "eatery", "fast food", "takeaway", "bistro", "pizzeria", "sweets", "indian cuisine", "domino's", "zomato", "swiggy", "dunkin", "kfc", "pizza hut"],
    "Shopping": ["shop", "store", "mall", "retail", "fashion", "clothing", "electronics", "apparel", "department store", "myntra", "flipkart", "amazon", "ajio", "tata cliq", "pantaloons", "shoppers stop", "vijay sales", "chroma"],
    "Transportation": ["taxi", "auto", "bus", "train", "car", "uber", "ola", "shuttle", "fare", "ola", "metro", "bmtc", "mytaxi", "make my trip", "irctc", "cleartrip", "goibibo"],
    "Entertainment": ["movie", "cinema", "concert", "event", "theater", "arcade", "show", "entertainment", "music", "pvr", "inox", "bookmyshow", "swiggy", "zomato", "craftsvilla", "flipkart"],
    "Healthcare": ["pharmacy", "clinic", "hospital", "doctor", "medication", "health", "dental", "wellness", "apollo", "fortis", "medplus", "1mg", "netmeds", "farmacia"],
    "Utilities": ["electricity", "water", "gas", "phone", "internet", "utilities", "cable", "electric", "service", "airtel", "vodafone", "jio", "broadband", "electricity bill", "tata power", "bescom"],
    "Services": ["repair", "service", "cleaning", "delivery", "maintenance", "laundry", "consulting", "subscription", "urbanclap", "urban company", "zomato", "swiggy"],
    "Education": ["tuition", "school", "books", "stationery", "coaching", "classes", "online courses", "unacademy", "byjus", "vedantu", "testbook", "simplilearn"],
    "Travel": ["flight", "train", "hotel", "airline", "travel", "tour", "expedia", "makemytrip", "goibibo", "cleartrip", "irctc", "mmt", "jet airways", "indigo"],
    "Mobile Recharges": ["recharge", "mobile", "airtel", "jio", "vodafone", "idea", "dth recharge", "paytm", "phonepe", "freecharge", "mobiKwik"]
}

# Pretrained LayoutLMv3 model and processor from HuggingFace
processor = LayoutLMv3Processor.from_pretrained("microsoft/layoutlmv3-base")
model = LayoutLMv3ForTokenClassification.from_pretrained("microsoft/layoutlmv3-base")

# Function to extract total amount using regular expressions
def extract_amount(extracted_text):
    amount_pattern = r"\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?"
    amounts = re.findall(amount_pattern, extracted_text)
    return amounts[-1] if amounts else "Amount not found"

# Function to determine the category of the receipt based on keywords
def determine_category(extracted_text):
    extracted_text = extracted_text.lower()
    for category, keywords in categories.items():
        if any(keyword in extracted_text for keyword in keywords):
            return category
    return "Uncategorized"

# Function to extract merchant name from the top of the receipt image (heuristic approach)
def extract_merchant_name(image_path):
    # Open the image
    image = Image.open(image_path)
    
    # Use pytesseract to extract text from the top portion of the receipt (merchant name is usually on top)
    width, height = image.size
    cropped_image = image.crop((0, 0, width, height // 4))  # Crop top quarter of the image for merchant name
    
    # OCR to extract text from the cropped image (merchant name part)
    extracted_text = pytesseract.image_to_string(cropped_image)
    return extracted_text.strip()

# Function to process image and extract details
def process_image(image_path):
    # Extract merchant name
    merchant_name = extract_merchant_name(image_path)
    
    # Open the image and use OCR to extract all text
    image = Image.open(image_path)
    extracted_text = pytesseract.image_to_string(image)
    
    # Extract total amount
    total_amount = extract_amount(extracted_text)
    
    # Determine category of expense
    category = determine_category(extracted_text)
    
    return merchant_name, total_amount, category

# Function to open file dialog and select receipt image
def upload_file_dialog():
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    file_path = filedialog.askopenfilename(title="Select Receipt Image", filetypes=[("Image Files", "*.png;*.jpg;*.jpeg")])
    return file_path

# Function to scan receipt (upload or capture)
def scan_receipt():
    print("Welcome to the receipt processing system!")
    print("Choose an option to scan receipt:")
    print("1. Upload Receipt Image")
    print("2. Live Capture Receipt (Webcam)")
    
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == "1":
        # Upload Receipt Image
        uploaded_image = upload_file_dialog()
        if uploaded_image:
            print(f"Selected file: {uploaded_image}")
            merchant_name, total_amount, category = process_image(uploaded_image)
        else:
            print("No file selected.")
            return
        
    elif choice == "2":
        # Live Capture Receipt (Webcam)
        print("Press 'c' to capture receipt.")
        
        cap = cv2.VideoCapture(0)  # Open webcam
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            cv2.imshow("Live Capture", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('c'):
                # Save the captured image
                cv2.imwrite("captured_receipt.png", frame)
                print("Captured receipt saved.")
                merchant_name, total_amount, category = process_image("captured_receipt.png")
                break
        
        cap.release()
        cv2.destroyAllWindows()

    else:
        print("Invalid choice. Please select either 1 or 2.")
        return

    # Display results
    print(f"Merchant: {merchant_name}")
    print(f"Total Amount: {total_amount}")
    print(f"Category: {category}")

    # Ask if another scan is needed
    another_scan = input("Do you want to scan another receipt? (y/n): ").strip().lower()
    if another_scan == 'y':
        scan_receipt()

if __name__ == "__main__":
    scan_receipt()
