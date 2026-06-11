import os
import json
import re
import sys
import subprocess

# --- AUTO-INSTALLER MAGIC ---
try:
    import fitz  
except ImportError:
    print("PyMuPDF not found in this specific environment. Installing it automatically now...")
    # This forces the exact Python running this script to install the package
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF"])
    import fitz  # Try importing it again after the installation
    print("Installation successful. Proceeding with the script!")
# ----------------------------

# CODE_DIR is where this script lives (/Portfolio/code/)
CODE_DIR = os.path.dirname(os.path.abspath(__file__))

# BASE_DIR is your main portfolio folder (/Portfolio/)
BASE_DIR = os.path.dirname(CODE_DIR)

# ... (The rest of your script remains exactly the same below here) ...

# Look for the configuration file inside the code directory
directory_path = os.path.join(CODE_DIR, 'directory.json')

try:
    with open(directory_path, 'r') as dir_file:
        dir_data = json.load(dir_file)
        categories = dir_data.get('categories', [])
        
        # Ensure the dictionaries exist
        if 'dates' not in dir_data:
            dir_data['dates'] = {}
        if 'portfolio' not in dir_data:
            dir_data['portfolio'] = {}
        if 'summaries left to write' not in dir_data:
            dir_data['summaries left to write'] = {}
            
except Exception as e:
    print(f"Error loading directory.json: {e}")
    exit()

if not categories:
    print("Warning: No categories found in directory.json.")

portfolio_data = {}
dates_dict = dir_data['dates']
summaries_dict = dir_data['summaries left to write']
updated_directory = False
default_text = "Description Coming Soon!"

for category in categories:
    category_path = os.path.join(BASE_DIR, category)
    
    if os.path.exists(category_path):
        folders = [f for f in os.listdir(category_path) if os.path.isdir(os.path.join(category_path, f))]
        portfolio_data[category] = folders

        for folder_name in folders:
            folder_path = os.path.join(category_path, folder_name)
            
            # --- 1. Manage Dates ---
            if folder_name not in dates_dict:
                dates_dict[folder_name] = ""
                updated_directory = True
            
            # --- 2. Manage Text Summaries ---
            txt_path = os.path.join(folder_path, f"{folder_name}.txt")
            
            # A. Did the user write a new summary in the JSON?
            if folder_name in summaries_dict:
                new_summary = summaries_dict[folder_name].strip()
                if new_summary != "" and new_summary != default_text:
                    # Overwrite the physical .txt file
                    with open(txt_path, 'w') as txt_file:
                        txt_file.write(new_summary)
                    print(f" -> Updated description from JSON for: {folder_name}")
                    
                    # Remove it from the to-do list
                    del summaries_dict[folder_name]
                    updated_directory = True

            # B. Check the physical .txt file state
            if not os.path.exists(txt_path):
                # Create it if missing
                with open(txt_path, 'w') as txt_file:
                    txt_file.write(default_text)
                print(f" -> Created missing description file: {folder_name}.txt")
                
                # Add it to the JSON to-do list
                if folder_name not in summaries_dict:
                    summaries_dict[folder_name] = ""
                    updated_directory = True
            else:
                # File exists, but check if it's still the default text
                with open(txt_path, 'r') as txt_file:
                    current_text = txt_file.read().strip()
                
                if current_text == default_text and folder_name not in summaries_dict:
                    summaries_dict[folder_name] = ""
                    updated_directory = True

            # --- 3. Manage PDFs and Images ---
            pdf_path = os.path.join(folder_path, f"{folder_name}.pdf")

            if os.path.exists(pdf_path):
                print(f"Processing PDF for: {folder_name}...")

                pattern = re.compile(re.escape(folder_name) + r'(\d+)\.jpe?g$', re.IGNORECASE)

                for filename in os.listdir(folder_path):
                    if pattern.match(filename):
                        file_to_delete = os.path.join(folder_path, filename)
                        os.remove(file_to_delete)

                doc = fitz.open(pdf_path)
                
                for page_index in range(len(doc)):
                    page = doc.load_page(page_index)
                    zoom_matrix = fitz.Matrix(2.0, 2.0)
                    pix = page.get_pixmap(matrix=zoom_matrix)
                    output_filename = f"{folder_name}{page_index + 1}.jpeg"
                    output_path = os.path.join(folder_path, output_filename)
                    pix.save(output_path)

                # ... (the matrix and pix.save code above this is fine) ...

                # 1. Print the success message WHILE the document is still open
                print(f" -> Created {len(doc)} gallery images for {folder_name}.")
                
                # 2. THEN close the document
                doc.close()

    else:
        portfolio_data[category] = []

# Inject the compiled data back into the main directory object
dir_data['portfolio'] = portfolio_data

# Save EVERYTHING back to directory.json
with open(directory_path, 'w') as dir_file:
    json.dump(dir_data, dir_file, indent=4)

print(f"\nSuccess! directory.json updated with all portfolio files, dates, summaries, and assets.")