'''
Extracts text from Image while maintaining the original layout

Note: Need to install Tesseract-OCR: https://tesseract-ocr.github.io/tessdoc/Installation.html

'''

import cv2
import pytesseract
from pytesseract import Output
import pandas as pd
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract'

img = cv2.imread("page_1.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

custom_config = r'-l eng --oem 1 --psm 6 '
d = pytesseract.image_to_data(thresh, config=custom_config, output_type=Output.DICT)

##############################

# # UNCOMMENT THE FOLLOWING UNTIL NEXT MARKER TO SEE THE BETTER PARSING RESULTS:

# d = pytesseract.image_to_string(Image.open("page.png"))

# ''' Text extraction from OCR '''
#     # Erase existing text in the file
#     open('output_1.txt', 'w').close()

#     # Open the file in append mode
#     f = open("output_1.txt", "a")

#     # Write the processed text to the file.
#     f.write(text)
#     f.close()

###############################

# COMMENT THE FOLLOWING (TILL END) IF YOU UNCOMMENT THE PREVIOUS SECTION

df = pd.DataFrame(d)
# print(df)
df1 = df[(df.conf != '-1') & (df.text != ' ') & (df.text != '')]
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
print(df1)

sorted_blocks = df1.groupby('block_num').first().sort_values('top').index.tolist()
for block in sorted_blocks:
    curr = df1[df1['block_num'] == block]
    sel = curr[curr.text.str.len() > 3]
    # sel = curr
    char_w = (sel.width / sel.text.str.len()).mean()
    prev_par, prev_line, prev_left = 0, 0, 0
    text = ''
    for ix, ln in curr.iterrows():
        # add new line when necessary
        # print(ln)
        if prev_par != ln['par_num']:
            text += '\n'
            prev_par = ln['par_num']
            prev_line = ln['line_num']
            prev_left = 0
        elif prev_line != ln['line_num']:
            text += '\n'
            prev_line = ln['line_num']
            prev_left = 0

        added = 0  # num of spaces that should be added
        if ln['left'] / char_w > prev_left + 1:
            added = int((ln['left']) / char_w) - prev_left
            text += ' ' * added
        text += ln['text'] + ' '
        prev_left += len(ln['text']) + added + 1
    text += '\n'
    
    ''' Text extraction from OCR '''
    # Erase existing text in the file
    open('output.txt', 'w').close()

    # Open the file in append mode
    f = open("output.txt", "a")

    # Write the processed text to the file.
    f.write(text)
    f.close()
