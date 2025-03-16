# Create a file called generate_sitemap.py in your project root
import os
from datetime import datetime

def generate_sitemap():
    # Base URL of your site
    base_url = "https://hvacprostudy.space"
    
    # List of routes/pages (add all your pages here)
    routes = [
        "/",  # Homepage
        "/flashcards",
        "/quizzes",
        "/demos",
        "/admin",
        # Add other important pages
    ]
    
    # Generate XML content
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for route in routes:
        xml += '  <url>\n'
        xml += f'    <loc>{base_url}{route}</loc>\n'
        xml += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
        xml += '    <changefreq>weekly</changefreq>\n'
        xml += '  </url>\n'
    
    xml += '</urlset>'
    
    # Write to file
    with open('sitemap.xml', 'w') as f:
        f.write(xml)
    
    print("Sitemap generated at sitemap.xml")

if __name__ == "__main__":
    generate_sitemap()
