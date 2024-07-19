import json
import random
import string
import datetime
import qrcode
import qrcode.image.svg
from flask import  request, redirect, render_template, send_file, abort
import xml.etree.ElementTree as ET
from user_agents import parse
import os

DATABASE = 'data.json'

def load_data():
    with open(DATABASE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATABASE, 'w') as f:
        json.dump(data, f, indent=4)

def index():
    data = load_data()
    links = data['links']
    return render_template('index.html', links=links)

def create_link():
    destination = request.form['destination']
    custom_slug = request.form.get('slug')
    slug = custom_slug if custom_slug else ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    new_link = {
        "slug": slug,
        "destination": destination,
        "clicks": 0,
        "visit_count": {},
        "browsers": {},
        "platforms": {},
        "user_agents": {}
    }
    data = load_data()
    data['links'].append(new_link)
    save_data(data)
    return redirect('/')

def redirect_link(slug):
    data = load_data()
    link = next((l for l in data['links'] if l['slug'] == slug), None)
    if not link:
        abort(404)

    user_agent_string = request.headers.get('User-Agent')
    user_agent = parse(user_agent_string)
    
    visit_count = datetime.date.today().isoformat()
    browser = user_agent.browser.family
    platform = user_agent.os.family

    link['clicks'] += 1

    if visit_count in link['visit_count']:
        link['visit_count'][visit_count] += 1
    else:
        link['visit_count'][visit_count] = 1

    if browser in link['browsers']:
        link['browsers'][browser] += 1
    else:
        link['browsers'][browser] = 1

    if platform in link['platforms']:
        link['platforms'][platform] += 1
    else:
        link['platforms'][platform] = 1

    if user_agent_string in link['user_agents']:
        link['user_agents'][user_agent_string] += 1
    else:
        link['user_agents'][user_agent_string] = 1

    save_data(data)
    
    return redirect(link['destination'])

def edit_link(slug):
    new_destination = request.form['destination']
    data = load_data()
    link = next((l for l in data['links'] if l['slug'] == slug), None)
    if link:
        link['destination'] = new_destination
        save_data(data)
    return redirect('/')

def save_qr_code_to_file(slug):
    data = load_data()
    factory = qrcode.image.svg.SvgPathImage
    link = next((l for l in data['links'] if l['slug'] == slug), None)
    if not link:
        abort(404)

    url = f"http://localhost:4444/s/{slug}"

    # Generate QR code with the specified factory
    img = qrcode.make(url, image_factory=factory)

    # Convert the QR code image to SVG string
    svg_element = img.get_image()
    
    # Convert SVG Element to string
    svg_data = ET.tostring(svg_element, encoding='unicode')

    # Define the path where you want to save the SVG file
    file_path = f"qr-codes/{slug}.svg"

    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # Write the SVG string to a file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(svg_data)

    return file_path

def qr_code(slug):
    file_path = save_qr_code_to_file(slug)
    return send_file(file_path, mimetype='image/svg+xml')