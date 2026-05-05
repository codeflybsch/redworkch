#!/usr/bin/env python3
"""
Backend API Testing for redwork.ch
Tests all endpoints as specified in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://agitated-heyrovsky-5.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Blevh4np1@@"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log_test(test_name, status, details=""):
    color = Colors.GREEN if status == "PASS" else Colors.RED if status == "FAIL" else Colors.YELLOW
    print(f"{color}[{status}]{Colors.ENDC} {test_name}")
    if details:
        print(f"    {details}")

def test_public_endpoints():
    """Test all public endpoints that don't require authentication"""
    print(f"\n{Colors.BOLD}=== TESTING PUBLIC ENDPOINTS ==={Colors.ENDC}")
    
    # Test 1: Root health check
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("GET /api/ - Root health check", "PASS", f"Message: {data['message']}")
            else:
                log_test("GET /api/ - Root health check", "FAIL", "Missing message field")
        else:
            log_test("GET /api/ - Root health check", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/ - Root health check", "FAIL", f"Error: {str(e)}")
    
    # Test 2: List projects (should return 6 seeded items)
    try:
        response = requests.get(f"{BASE_URL}/projects")
        if response.status_code == 200:
            projects = response.json()
            if isinstance(projects, list) and len(projects) == 6:
                # Check if sorted by order
                orders = [p.get('order', 0) for p in projects]
                if orders == sorted(orders):
                    log_test("GET /api/projects - List projects", "PASS", f"Found {len(projects)} projects, sorted by order")
                else:
                    log_test("GET /api/projects - List projects", "FAIL", "Projects not sorted by order")
            else:
                log_test("GET /api/projects - List projects", "FAIL", f"Expected 6 projects, got {len(projects) if isinstance(projects, list) else 'non-list'}")
        else:
            log_test("GET /api/projects - List projects", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/projects - List projects", "FAIL", f"Error: {str(e)}")
    
    # Test 3: List blogs (should return 5 seeded items)
    try:
        response = requests.get(f"{BASE_URL}/blogs")
        if response.status_code == 200:
            blogs = response.json()
            if isinstance(blogs, list) and len(blogs) == 5:
                log_test("GET /api/blogs - List blogs", "PASS", f"Found {len(blogs)} blogs")
            else:
                log_test("GET /api/blogs - List blogs", "FAIL", f"Expected 5 blogs, got {len(blogs) if isinstance(blogs, list) else 'non-list'}")
        else:
            log_test("GET /api/blogs - List blogs", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/blogs - List blogs", "FAIL", f"Error: {str(e)}")
    
    # Test 4: List testimonials (should return 6 seeded items)
    try:
        response = requests.get(f"{BASE_URL}/testimonials")
        if response.status_code == 200:
            testimonials = response.json()
            if isinstance(testimonials, list) and len(testimonials) == 6:
                log_test("GET /api/testimonials - List testimonials", "PASS", f"Found {len(testimonials)} testimonials")
            else:
                log_test("GET /api/testimonials - List testimonials", "FAIL", f"Expected 6 testimonials, got {len(testimonials) if isinstance(testimonials, list) else 'non-list'}")
        else:
            log_test("GET /api/testimonials - List testimonials", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/testimonials - List testimonials", "FAIL", f"Error: {str(e)}")
    
    # Test 5: List services (should return 6 seeded items)
    try:
        response = requests.get(f"{BASE_URL}/services")
        if response.status_code == 200:
            services = response.json()
            if isinstance(services, list) and len(services) == 6:
                log_test("GET /api/services - List services", "PASS", f"Found {len(services)} services")
            else:
                log_test("GET /api/services - List services", "FAIL", f"Expected 6 services, got {len(services) if isinstance(services, list) else 'non-list'}")
        else:
            log_test("GET /api/services - List services", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/services - List services", "FAIL", f"Error: {str(e)}")
    
    # Test 6: Create quote
    quote_data = {
        "fullName": "Max Mustermann",
        "email": "max.mustermann@example.com",
        "phone": "+41 79 123 45 67",
        "company": "Mustermann GmbH",
        "serviceType": "ecommerce",
        "projectDetails": "Wir benötigen einen modernen E-Commerce Shop für unsere Produkte mit Zahlungsintegration",
        "budget": "5to10k",
        "timeline": "3months",
        "contactMethod": "email",
        "contactTime": "any"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/quotes", json=quote_data)
        if response.status_code == 200:
            quote = response.json()
            if quote.get("fullName") == quote_data["fullName"] and quote.get("id"):
                log_test("POST /api/quotes - Create quote", "PASS", f"Quote created with ID: {quote['id']}")
                return quote["id"]  # Return for later use in admin tests
            else:
                log_test("POST /api/quotes - Create quote", "FAIL", "Invalid response data")
        else:
            log_test("POST /api/quotes - Create quote", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/quotes - Create quote", "FAIL", f"Error: {str(e)}")
        return None
    
    # Test 7: Create contact
    contact_data = {
        "fullName": "Anna Beispiel",
        "email": "anna.beispiel@example.com",
        "phone": "+41 44 123 45 67",
        "subject": "Frage zu Webdesign Services",
        "message": "Hallo, ich interessiere mich für Ihre Webdesign-Services und hätte gerne weitere Informationen."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contacts", json=contact_data)
        if response.status_code == 200:
            contact = response.json()
            if contact.get("fullName") == contact_data["fullName"] and contact.get("id"):
                log_test("POST /api/contacts - Create contact", "PASS", f"Contact created with ID: {contact['id']}")
                return contact["id"]  # Return for later use in admin tests
            else:
                log_test("POST /api/contacts - Create contact", "FAIL", "Invalid response data")
        else:
            log_test("POST /api/contacts - Create contact", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/contacts - Create contact", "FAIL", f"Error: {str(e)}")
        return None

def test_authentication():
    """Test authentication endpoints"""
    print(f"\n{Colors.BOLD}=== TESTING AUTHENTICATION ==={Colors.ENDC}")
    
    # Test 1: Valid login
    try:
        login_data = {"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                log_test("POST /api/admin/login - Valid credentials", "PASS", "Token received")
                return data["access_token"]
            else:
                log_test("POST /api/admin/login - Valid credentials", "FAIL", "Missing token or user in response")
        else:
            log_test("POST /api/admin/login - Valid credentials", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/admin/login - Valid credentials", "FAIL", f"Error: {str(e)}")
        return None
    
    # Test 2: Invalid login
    try:
        login_data = {"username": ADMIN_USERNAME, "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        if response.status_code == 401:
            log_test("POST /api/admin/login - Invalid credentials", "PASS", "Correctly rejected with 401")
        else:
            log_test("POST /api/admin/login - Invalid credentials", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/login - Invalid credentials", "FAIL", f"Error: {str(e)}")
    
    # Test 3: /admin/me without token
    try:
        response = requests.get(f"{BASE_URL}/admin/me")
        if response.status_code == 401:
            log_test("GET /api/admin/me - No token", "PASS", "Correctly rejected with 401")
        else:
            log_test("GET /api/admin/me - No token", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/me - No token", "FAIL", f"Error: {str(e)}")

def test_admin_endpoints(token, quote_id=None, contact_id=None):
    """Test admin endpoints that require authentication"""
    print(f"\n{Colors.BOLD}=== TESTING ADMIN ENDPOINTS ==={Colors.ENDC}")
    
    if not token:
        log_test("Admin endpoints", "SKIP", "No valid token available")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: /admin/me with valid token
    try:
        response = requests.get(f"{BASE_URL}/admin/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            if user.get("username") == ADMIN_USERNAME:
                log_test("GET /api/admin/me - With valid token", "PASS", f"User: {user['username']}")
            else:
                log_test("GET /api/admin/me - With valid token", "FAIL", "Invalid user data")
        else:
            log_test("GET /api/admin/me - With valid token", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/me - With valid token", "FAIL", f"Error: {str(e)}")
    
    # Test 2: List quotes
    try:
        response = requests.get(f"{BASE_URL}/admin/quotes", headers=headers)
        if response.status_code == 200:
            quotes = response.json()
            if isinstance(quotes, list):
                log_test("GET /api/admin/quotes - List quotes", "PASS", f"Found {len(quotes)} quotes")
            else:
                log_test("GET /api/admin/quotes - List quotes", "FAIL", "Response is not a list")
        else:
            log_test("GET /api/admin/quotes - List quotes", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/quotes - List quotes", "FAIL", f"Error: {str(e)}")
    
    # Test 3: Update quote status (if we have a quote_id)
    if quote_id:
        try:
            update_data = {"status": "in_progress"}
            response = requests.patch(f"{BASE_URL}/admin/quotes/{quote_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                log_test("PATCH /api/admin/quotes/{id} - Update status", "PASS", "Quote status updated")
            else:
                log_test("PATCH /api/admin/quotes/{id} - Update status", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_test("PATCH /api/admin/quotes/{id} - Update status", "FAIL", f"Error: {str(e)}")
    
    # Test 4: List contacts
    try:
        response = requests.get(f"{BASE_URL}/admin/contacts", headers=headers)
        if response.status_code == 200:
            contacts = response.json()
            if isinstance(contacts, list):
                log_test("GET /api/admin/contacts - List contacts", "PASS", f"Found {len(contacts)} contacts")
            else:
                log_test("GET /api/admin/contacts - List contacts", "FAIL", "Response is not a list")
        else:
            log_test("GET /api/admin/contacts - List contacts", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/contacts - List contacts", "FAIL", f"Error: {str(e)}")
    
    # Test 5: Admin stats
    try:
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            expected_keys = ["quotes", "newQuotes", "contacts", "newContacts", "projects", "blogs", "testimonials", "services"]
            if all(key in stats for key in expected_keys):
                log_test("GET /api/admin/stats - Get statistics", "PASS", f"Stats: {stats}")
            else:
                log_test("GET /api/admin/stats - Get statistics", "FAIL", "Missing expected keys in stats")
        else:
            log_test("GET /api/admin/stats - Get statistics", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/stats - Get statistics", "FAIL", f"Error: {str(e)}")

def test_admin_crud_operations(token):
    """Test CRUD operations for projects, blogs, testimonials, services"""
    print(f"\n{Colors.BOLD}=== TESTING ADMIN CRUD OPERATIONS ==={Colors.ENDC}")
    
    if not token:
        log_test("Admin CRUD operations", "SKIP", "No valid token available")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test creating a new project
    project_data = {
        "title": "Test Project",
        "category": "Test Category",
        "img": "https://example.com/test.jpg",
        "description": "Test project description",
        "url": "https://example.com",
        "order": 999
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/projects", json=project_data, headers=headers)
        if response.status_code == 200:
            project = response.json()
            project_id = project.get("id")
            if project_id:
                log_test("POST /api/admin/projects - Create project", "PASS", f"Project created with ID: {project_id}")
                
                # Test updating the project
                update_data = {
                    "title": "Updated Test Project",
                    "category": "Updated Category",
                    "img": "https://example.com/updated.jpg",
                    "description": "Updated description",
                    "url": "https://example.com/updated",
                    "order": 1000
                }
                
                try:
                    response = requests.put(f"{BASE_URL}/admin/projects/{project_id}", json=update_data, headers=headers)
                    if response.status_code == 200:
                        log_test("PUT /api/admin/projects/{id} - Update project", "PASS", "Project updated successfully")
                    else:
                        log_test("PUT /api/admin/projects/{id} - Update project", "FAIL", f"Status: {response.status_code}")
                except Exception as e:
                    log_test("PUT /api/admin/projects/{id} - Update project", "FAIL", f"Error: {str(e)}")
                
                # Test deleting the project
                try:
                    response = requests.delete(f"{BASE_URL}/admin/projects/{project_id}", headers=headers)
                    if response.status_code == 200:
                        log_test("DELETE /api/admin/projects/{id} - Delete project", "PASS", "Project deleted successfully")
                    else:
                        log_test("DELETE /api/admin/projects/{id} - Delete project", "FAIL", f"Status: {response.status_code}")
                except Exception as e:
                    log_test("DELETE /api/admin/projects/{id} - Delete project", "FAIL", f"Error: {str(e)}")
            else:
                log_test("POST /api/admin/projects - Create project", "FAIL", "No ID in response")
        else:
            log_test("POST /api/admin/projects - Create project", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/projects - Create project", "FAIL", f"Error: {str(e)}")
    
    # Test similar CRUD for blogs
    blog_data = {
        "title": "Test Blog Post",
        "category": "Test",
        "img": "https://example.com/blog.jpg",
        "excerpt": "Test excerpt",
        "content": "Test content",
        "date": "01. Januar 2026",
        "order": 999
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/blogs", json=blog_data, headers=headers)
        if response.status_code == 200:
            blog = response.json()
            blog_id = blog.get("id")
            if blog_id:
                log_test("POST /api/admin/blogs - Create blog", "PASS", f"Blog created with ID: {blog_id}")
                # Clean up
                requests.delete(f"{BASE_URL}/admin/blogs/{blog_id}", headers=headers)
            else:
                log_test("POST /api/admin/blogs - Create blog", "FAIL", "No ID in response")
        else:
            log_test("POST /api/admin/blogs - Create blog", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/blogs - Create blog", "FAIL", f"Error: {str(e)}")

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}REDWORK.CH BACKEND API TESTING{Colors.ENDC}")
    print(f"{Colors.BOLD}Testing URL: {BASE_URL}{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    
    # Run public endpoint tests
    quote_id = test_public_endpoints()
    contact_id = None  # We'll get this from the contact creation test
    
    # Run authentication tests
    token = test_authentication()
    
    # Run admin endpoint tests
    test_admin_endpoints(token, quote_id, contact_id)
    
    # Run CRUD operation tests
    test_admin_crud_operations(token)
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}TESTING COMPLETED{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")

if __name__ == "__main__":
    main()