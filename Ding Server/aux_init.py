import base64

TRANSLITERATIONS = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"
}

def transliterate_name(name: str):
    "Transliterates a given name from Cyrillic to Latin characters, replacing spaces with underscores and removing non-ASCII characters. Returns the transliterated name. Note: this function is very simple, so there can be abnormalities in the transliteration of some characters."
    new_name = ""

    for char in name:
        if char == " ":
            new_name += "_"
        if char.isascii():
            if char.isalpha():
                new_name += char.lower()
            elif char != " ":
                new_name += char
        else:
            new_name += TRANSLITERATIONS.get(char.lower(), "")

    return new_name

def get_file_as_base64(path: str):
    "Encodes file with given path"
    with open(path, "rb") as image_file:
        encoded_bytes = base64.b64encode(image_file.read())
        return encoded_bytes.decode("utf-8")