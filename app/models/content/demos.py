import uuid
from datetime import datetime

from app.models.content.helpers import load_json, save_json

def get_demos(category=None):
    """Get interactive demos, optionally filtered by category"""
    data = load_json('demos.json')
    if not data:
        return {"demos": []}
        
    result = data.copy()
    
    if category:
        result['demos'] = [d for d in result['demos'] if d['category_id'] == category]
                
    return result

def add_demo(data):
    """Add a new interactive demo"""
    try:
        demos = load_json('demos.json')
        if not demos:
            demos = {"demos": []}
        
        # Add new demo
        demo = {
            "id": str(uuid.uuid4()),
            "title": data['title'],
            "description": data['description'],
            "category_id": data['category_id'],
            "html_content": data['html_content'],
            "js_content": data['js_content'],
            "created_at": datetime.now().isoformat()
        }
        demos['demos'].append(demo)
        
        save_json(demos, 'demos.json')
        return {"success": True, "demo_id": demo['id']}
    except Exception as e:
        print(f"Error adding demo: {str(e)}")
        return {"success": False, "error": str(e)}
