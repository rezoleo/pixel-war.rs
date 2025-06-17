import requests
from PIL import Image
import os
import time

def get_website_content(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        return 'Error: ' + str(response.status_code)

pixel_war_active = get_website_content('https://pixelwar.rezoleo.fr/is_pixel_war_active.php')
if pixel_war_active.lower() != 'true':
    print("The pixel war is not active. Exiting.")
    exit()
delay = int(get_website_content('https://pixelwar.rezoleo.fr/get_timer.php')) + 1
canva_size = list(map(int, get_website_content('https://pixelwar.rezoleo.fr/readTaille.php').split(',')))
current_directory = os.path.dirname(os.path.abspath(__file__))
image_files = [f for f in os.listdir(current_directory) if f.endswith(('.png', '.jpg', 'PNG', 'JPG'))]
if not image_files:
    print("No image found in the directory. Exiting.")
    exit()
print(f"Processing with '{image_files[0]}', if this is not the right image, please remove the other images from the directory.")
image = Image.open(image_files[0])

# Convert PNG to JPG if necessary
if image_files[0].lower().endswith('.png'):
    rgb_image = image.convert('RGB')
    jpg_image_path = os.path.splitext(image_files[0])[0] + '.jpg'
    rgb_image.save(jpg_image_path)
    image = Image.open(jpg_image_path)

print(f"Canva's size: ({canva_size[0]}, {canva_size[1]})")

nb_try = 0
while True:
    if nb_try >= 3:
        print("Too many invalid inputs. Exiting.")
        exit()
    try:
        x_first = int(input('Enter the x coordinate of the first pixel: '))
        y_first = int(input('Enter the y coordinate of the first pixel: '))
        if x_first < 0 or y_first < 0 or x_first >= canva_size[0] or y_first >= canva_size[1]:
            nb_try += 1
            raise ValueError("Coordinates are out of canvas bounds.")
        break
    except ValueError as e:
        print(f"Invalid input: {e}. Please enter valid coordinates.")

nb_try = 0
while True:
    if nb_try >= 3:
        print("Too many invalid inputs. Exiting.")
        exit()
    try:
        x_last = int(input('Enter the x coordinate of the last pixel: '))
        y_last = int(input('Enter the y coordinate of the last pixel: '))
        if x_last >= canva_size[0] or y_last >= canva_size[1]:
            nb_try += 1
            raise ValueError("Coordinates are out of canvas bounds.")
        elif x_last <= x_first or y_last <= y_first:
            nb_try += 1
            raise ValueError("Coordinates are not in the right order. If this is not a mistake press ctrl+c to retry from 0.")
        break
    except ValueError as e:
        print(f"Invalid input: {e}. Please enter valid coordinates.")

image_size = (x_last - x_first + 1, y_last - y_first + 1)

image = image.resize(image_size)

colors = [
    "#ffffff", "#e4e4e4", "#888888", "#222222",
    "#ffa7d1", "#e50000", "#e59500", "#a06a42",
    "#e5d900", "#94e044", "#02be01", "#00d3dd",
    "#0083c7", "#0000ea", "#cd6eea", "#820080"
]

def closest_color(rgb):
    r, g, b = rgb
    color_diffs = []
    for color in colors:
        cr, cg, cb = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)
        color_diff = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
        color_diffs.append((color_diff, color))
    return min(color_diffs)[1]

image_pixel_colors = []

for x in range(image_size[0]):
    for y in range(image_size[1]):
        pixel = image.getpixel((x, y))
        nearest_color = closest_color(pixel)
        image.putpixel((x, y), tuple(int(nearest_color[i:i+2], 16) for i in (1, 3, 5)))
        image_pixel_colors.append(nearest_color)

image.show(title="Resized "+image_files[0]+".PNG")
input("If the result is as expected, press enter to continue. Otherwise, press ctrl+c to retry from 0.")

nb_pixels_tot = len(image_pixel_colors)
print(f"the total time taken for placing pixels is {(delay * nb_pixels_tot) // 60}min {(delay * nb_pixels_tot)%60}s")
nb_pixels_put = 0
for y in range(y_first, y_last+1):
    for x in range(x_first, x_last+1):
        json_data = {
            "x": y,
            "y": x,
            "color": image_pixel_colors[nb_pixels_put]
        }
        response = requests.post('https://pixelwar.rezoleo.fr/write_pixel.php', json=json_data)
        if response.status_code == 200:
            print(f"Successfully posted pixel at ({x}, {y}) with color {json_data['color']}")
        else:
            print(f"Failed to post pixel at ({x}, {y}) with color {json_data['color']}. Status code: {response.status_code}")
        nb_pixels_put += 1
        time.sleep(delay)
