
# helper functions
import pdfplumber
import re
from flask import Blueprint, request, jsonify
extract_routes = Blueprint('extract', __name__)

tags = ["bold", "italic", "color", "size", "ssize", "underline"]
nested_tags = ["nbold", "nitalic", "ncolor", "nsize", "nssize", "nunderline"]
tags_pairs = [
    ("<bold>", "</bold>", "<nbold>", "</nbold>"),
    ("<size>", "</size>", "<nsize>", "</nsize>"),
    ("<ssize>", "</ssize>", "<nssize>", "</nssize>"),
    ("<italic>", "</italic>", "<nitalic>", "</nitalic>"),
    ("<color>", "</color>", "<ncolor>", "</ncolor>"),
    ("<underline>", "</underline>", "<nunderline>", "</nunderline>")
]

tags_enclosing_pairs = {
    '</bold>': ['<bold>', '<nbold>'],
    '</color>': ['<color>', '<ncolor>'],
    '</italic>': ['<italic>', '<nitalic>'],
    '</size>': ['<size>', '<nsize>'],
    '</ssize>': ['<ssize>', '<nssize>'],
    '</underline>': ['<underline>', '<nunderline>'],

    '</nbold>': ['<bold>', '<nbold>'],
    '</ncolor>': ['<color>', '<ncolor>'],
    '</nitalic>': ['<italic>', '<nitalic>'],
    '</nsize>': ['<size>', '<nsize>'],
    '</nssize>': ['<ssize>', '<nssize>'],
    '</nunderline>': ['<underline>', '<nunderline>']
}

default_char_style = {
    'bold': False,
    'italic': False,
    'color': False,
    'size': False,
    'ssize': False,
    'underline': False
}

def is_bold(char):
    fontname = char['fontname']
    return 'Bold' in fontname or 'bold' in fontname

def is_underline(char, lines, vertical_threshold=2, horizontal_leeway=1):
    char_bottom = char['bottom']
    char_x0 = char['x0']
    char_x1 = char['x1']

    for line in lines:
        line_top = line['top']
        line_x0 = line['x0']
        line_x1 = line['x1']

        # Adjust vertical_threshold as needed for accuracy
        # Consider line thickness in your comparison (not just line_top)
        if char_bottom < line_top < char_bottom + vertical_threshold:
            # Allow for some horizontal leeway in case the line does not perfectly align with the char's width
            if line_x0 <= char_x0 + horizontal_leeway and line_x1 >= char_x1 - horizontal_leeway:
                return True
    return False

def is_colored(char, avg_color, coefficient = 0.15):
    non_stroking_color = char['non_stroking_color']
    stroking_color = char['stroking_color']

    r_avg, g_avg, b_avg = avg_color

    if non_stroking_color:
        color = non_stroking_color
        r_char = color[0]
        g_char = color[1] if len(color) > 1 else 0
        b_char = color[2] if len(color) > 2 else 0
        return abs(r_char - r_avg) > coefficient or abs(g_char - g_avg) > coefficient or abs(b_char - b_avg) > coefficient

    if stroking_color:
        color = stroking_color
        r_char = color[0]
        g_char = color[1] if len(color) > 1 else 0
        b_char = color[2] if len(color) > 2 else 0
        return abs(r_char - r_avg) > coefficient or abs(g_char - g_avg) > coefficient or abs(b_char - b_avg) > coefficient

    return False

def is_italic(char):
    fontname = char['fontname']
    return 'Italic' in fontname or 'italic' in fontname

def is_sized(char, avg_size, coeficient = 2.0): # set coeficient that determines if sentence should be tagged.
    size = char['size']
    diff = size - avg_size
    return diff > coeficient # currently going both sides. so smaller fonts are also tagged.

def is_sized_smaller(char, avg_size, coeficient = 2.0): # set coeficient that determines if sentence should be tagged.
    size = char['size']
    diff = avg_size - size
    return diff > coeficient # currently going both sides. so smaller fonts are also tagged.


def get_avg_size_and_color(pdf_path):
    total_size = 0
    r_sum, g_sum, b_sum = 0, 0, 0  # Sum of RGB components
    count = 0
    colors = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for char in page.chars:
                if 'size' in char and 'non_stroking_color' in char:
                    # Update size
                    total_size += char['size']

                    # Update color components
                    color = char['non_stroking_color']
                    if isinstance(color, tuple):  # Ensure it's an RGB color
                        r_sum += color[0]
                        g_sum += color[1] if len(color) > 1 else 0
                        b_sum += color[2] if len(color) > 2 else 0

                    count += 1

    # Calculate averages
    avg_size = total_size / count if count else 0
    avg_color = (
        r_sum / count if count else 0,
        g_sum / count if count else 0,
        b_sum / count if count else 0
    )

    return avg_size, avg_color

def remove_empty_lines(text):
    lines = []
    for l in text.split('\n'):
        if l.strip() == '':
            continue
        lines.append(l)

    return '\n'.join(lines)

def strip_lines(text):
    lines = []
    for l in text.split('\n'):
        lines.append(l.strip())

    return '\n'.join(lines)

def remove_blank_tags(text):
    # Regular expression pattern to match empty tags (tags enclosing only whitespace or nothing at all)
    # This pattern also captures nested empty tags
    empty_tag_pattern = re.compile(r'<(\w+)>[\s]*<\/\1>')

    # Function to identify and remove empty tag pairs
    def remove_empty_tags(input_text):
        # Find all empty tags in the text
        matches = empty_tag_pattern.findall(input_text)
        if not matches:
            return input_text  # Return the text if no empty tags are found

        # Remove the empty tags from the text
        cleaned_text = empty_tag_pattern.sub('', input_text)

        # Recursively call the function until no empty tags are left
        return remove_empty_tags(cleaned_text)

    # Start the recursive removal process
    return remove_empty_tags(text)

def move_solo_opening_tags_to_next_line(text, tags):
    # Split the text into lines
    lines = text.split('\n')

    # Function to process lines recursively
    def recursive_move(lines, tags):
        modified_lines = []
        carry_forward_tag = None  # To carry forward a tag to the next non-blank line

        for i, line in enumerate(lines):
            line_strip = line.strip()
            is_solo_tag_line = any(line_strip == f"<{tag}>" for tag in tags)

            if is_solo_tag_line:
                # If the line contains a solo opening tag, carry it forward to be prefixed to the next line
                carry_forward_tag = line_strip
                continue  # Skip adding this line to modified_lines

            if carry_forward_tag:
                # If there's a tag to carry forward, prefix it to this line
                line = f"{carry_forward_tag}{line}"
                carry_forward_tag = None  # Reset after moving the tag

            modified_lines.append(line)

        # After processing all lines, check if any tag is still to be moved (case of the last line being a solo tag line)
        if carry_forward_tag:
            # Add the carried tag as a new line if no suitable next line was found
            modified_lines.append(carry_forward_tag)

        # Check if modifications were made; if yes, there might be more tags to move
        if len(modified_lines) != len(lines):
            return recursive_move(modified_lines, tags)
        else:
            return modified_lines  # No modifications made; return the lines

    # Start the recursive moving process
    processed_lines = recursive_move(lines, tags)

    # Join the processed lines back into a single text string
    return "\n".join(processed_lines)

def merge_solo_tags(lines, tags):
    # Base case: If no lines or only one line, no merging is needed
    if not lines or len(lines) == 1:
        return lines

    # Function to merge tags recursively
    def recursive_merge(lines, iteration, tags):
        if iteration == 2:  # Stop after two iterations to prevent infinite recursion
            return lines

        merged_lines = []
        skip_next = False  # To skip blank lines after moving an ending tag

        for i, line in enumerate(lines):
            if skip_next:
                skip_next = False  # Reset skip flag
                continue

            # Flag to indicate if any tag's ending was moved
            moved_tag = False

            for tag in tags:
                close_tag = f"</{tag}>"
                open_tag = f"<{tag}>"

                # Check if line is just an ending tag or starts with an ending tag
                if line.strip() == close_tag or (i > 0 and line.startswith(close_tag)):
                    # Append ending tag to the end of the previous non-blank line
                    for j in range(len(merged_lines)-1, -1, -1):
                        if merged_lines[j].strip() != "":
                            merged_lines[j] = merged_lines[j] + close_tag
                            moved_tag = True
                            break

                    # If the line has content beyond the closing tag, add that content as a new line
                    if line.strip() != close_tag:
                        new_line = line.replace(close_tag, "", 1).strip()
                        if new_line:
                            merged_lines.append(new_line)

                    # If a blank line follows, skip it in the next iteration
                    if i < len(lines) - 1 and lines[i+1].strip() == "":
                        skip_next = True
                    break  # Break after handling the first matching tag

            if not moved_tag and not skip_next:  # If no tag was moved and next line is not to be skipped
                merged_lines.append(line)

        # Recursive call with incremented iteration
        return recursive_merge(merged_lines, iteration + 1, tags)

    # Start the recursive merging process
    return recursive_merge(lines, 0, tags)

def add_nested_tags(text, tags_pairs):
    for open_tag, close_tag, nested_open_tag, nested_close_tag in tags_pairs:
        # Find all occurrences of the current tag pair with content that spans multiple lines
        matches = re.findall(rf'{re.escape(open_tag)}(.*?){re.escape(close_tag)}', text, re.DOTALL)

        for match in matches:
            split = match.split('\n')
            # Skip if the content within the tag does not span multiple lines
            if len(split) == 1:
                continue

            lines = []
            for i, line in enumerate(split):
                if i == 0:
                    line = line + nested_close_tag
                elif i == len(split) - 1:
                    line = nested_open_tag + line
                else:
                    line = nested_open_tag + line + nested_close_tag
                lines.append(line)

            # Replace the original match in the text with the new one, adding nested tags around line breaks
            text = text.replace(open_tag + match + close_tag, open_tag + "\n".join(lines) + close_tag, 1)

    return text

def format_tags(text, tags):
    for tag in tags:
        # Add space after opening and before closing tags for readability
        text = re.sub(rf'<({tag})>(\S)', rf' <\1> \2', text)
        text = re.sub(rf'(\S)</({tag})>', r'\1 </\2> ', text)
    return text

def remove_spaces_within_tags(text):
    result = []
    for l in text.split('\n'):
        l = concat_single_char_sequences(l)
        result.append(l.strip())

    return '\n'.join(result)

def concat_single_char_sequences(text):
    words = text.split()  # Split the text into words
    result_words = []  # List to hold the final words for reconstruction
    buffer = []  # Temporary buffer to hold sequences of single characters

    for word in words:
        # Check if the word is a single character (not considering punctuation)
        if len(word) == 1 and word.isalpha():
            buffer.append(word)  # Add to buffer if it's a single character
        else:
            # If buffer has 3 or more characters, concatenate them
            if len(buffer) >= 3:
                result_words.append("".join(buffer))
                buffer = []  # Reset buffer
            elif buffer:
                # If buffer has fewer than 3 characters, add them as separate words
                result_words.extend(buffer)
                buffer = []  # Reset buffer
            result_words.append(word)  # Add the current word to the result

    # Check buffer again at the end of the loop to catch any remaining sequences
    if len(buffer) >= 3:
        result_words.append("".join(buffer))
    elif buffer:
        result_words.extend(buffer)

    return " ".join(result_words)


def contains_any_tag(text):
    tag_pattern = re.compile(r'<[^>]+>')
    if re.search(tag_pattern, text):
        return True
    else:
        return False

def remove_unopened_closing_tags(text, tag_pairs):
    lines = text.split('\n')  # Split text into lines
    processed_lines = []  # To store processed lines

    for line in lines:
        # Apply the original logic to each line individually
        for close_tag, open_tags in tag_pairs.items():
            # Find all instances of the closing tag in the line
            matches = re.finditer(close_tag, line)
            for match in reversed(list(matches)):  # Reverse to handle from end to start
                # Check if there's a corresponding opening tag before this closing tag in the line
                pre_text = line[:match.start()]
                if not any(open_tag in pre_text for open_tag in open_tags):
                    # No corresponding opening tag found; remove the closing tag from the line
                    line = line[:match.start()] + line[match.end():]

        processed_lines.append(line)  # Add the processed line to the list
    return "\n".join(processed_lines)


def extract_text(pdf_path):
  with pdfplumber.open(pdf_path) as pdf:
    text = ''
    # Extract text from each page
    for page in pdf.pages:
      text += page.extract_text() + '\n'
  return text

def extract_text_line_by_line_with_styles(pdf_path, bold = True, italic = True, colored = True, sized = True, ssized = False, underline = False):
    avg_size, avg_color = get_avg_size_and_color(pdf_path) if sized or colored else (0, (0,0,0))

    with pdfplumber.open(pdf_path) as pdf:
        all_lines = []
        for page in pdf.pages:
            current_styles = []
            text_line = ''
            previous_char = default_char_style
            prev_char = None
            char_lines = page.lines

            for char in page.chars:
                # Determine current character's styles
                char_styles = {
                    'bold': bold and is_bold(char),
                    'italic': italic and is_italic(char),
                    'color': colored and is_colored(char, avg_color),
                    'size': sized and is_sized(char, avg_size),
                    'ssize': ssized and is_sized_smaller(char, avg_size),
                    'underline': underline and is_underline(char, char_lines)
                }

                if prev_char:
                    if char['top'] > prev_char['top'] + char['size'] * 0.5:
                        all_lines.append(text_line)
                        text_line = ''

                # Compare with previous character's styles
                if previous_char:
                    ending_styles = [style for style in previous_char if previous_char[style] != char_styles[style] and previous_char[style]]
                    starting_styles = [style for style in char_styles if previous_char[style] != char_styles[style] and char_styles[style]]

                    # Close tags for any styles that have ended, in reverse order
                    for style in reversed(ending_styles):
                        text_line += f"</{style}>"
                        if len(current_styles) > 0:
                            current_styles.pop()

                    # Open tags for any new styles
                    for style in starting_styles:
                        text_line += f"<{style}>"
                        current_styles.append(style)

                text_line += char['text']
                previous_char = char_styles
                prev_char = char

            # Close any remaining open styles
            for style in reversed(current_styles):
                text_line += f"</{style}>"

            all_lines.append(text_line)

    return "\n".join(all_lines)

def pre_process(text):
    result = strip_lines(text)
    result = remove_blank_tags(result)

    result = "\n".join(merge_solo_tags(result.split('\n'), tags))
    result = move_solo_opening_tags_to_next_line(result, tags)

    result = add_nested_tags(result, tags_pairs)
    result = remove_blank_tags(result)
    result = remove_empty_lines(result)

    result = format_tags(result, tags + nested_tags)
    result = strip_lines(result)

    result = remove_unopened_closing_tags(result, tags_enclosing_pairs)
    result = remove_spaces_within_tags(result)

    result = format_tags(result, tags + nested_tags)
    result = strip_lines(result)

    return result


def extract_and_preprocess_pdf(file_stream):
    with pdfplumber.open(file_stream) as pdf:
        all_text = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                processed_text = pre_process(text)
                all_text.append(processed_text)
        return "\n".join(all_text)
    


project_routes = Blueprint('project_routes', __name__)