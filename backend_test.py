#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class AdminPanelAPITester:
    def __init__(self, base_url="https://build-hub-401.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@thebeat515.com", "password": "Beat515Admin!"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Admin user: {response.get('user', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        if success:
            print(f"   Stats: Users={response.get('total_users')}, News={response.get('total_news')}, Requests={response.get('total_requests')}")
        return success

    def test_admin_users(self):
        """Test admin users endpoint"""
        success, response = self.run_test(
            "Admin Users",
            "GET",
            "admin/users",
            200
        )
        if success:
            print(f"   Found {len(response)} users")
        return success

    def test_admin_requests(self):
        """Test admin requests endpoint"""
        success, response = self.run_test(
            "Admin Requests",
            "GET",
            "admin/requests",
            200
        )
        if success:
            print(f"   Found {len(response)} requests")
        return success

    def test_admin_roles(self):
        """Test admin roles endpoint"""
        success, response = self.run_test(
            "Admin Roles",
            "GET",
            "admin/roles",
            200
        )
        if success:
            print(f"   Found {len(response)} roles")
        return success

    def test_admin_permissions(self):
        """Test admin permissions endpoint"""
        success, response = self.run_test(
            "Admin Permissions",
            "GET",
            "admin/permissions",
            200
        )
        if success:
            print(f"   Found {len(response)} permissions")
        return success

    def test_admin_comments_pending(self):
        """Test admin pending comments endpoint"""
        success, response = self.run_test(
            "Admin Pending Comments",
            "GET",
            "admin/comments/pending",
            200
        )
        if success:
            print(f"   Found {len(response)} pending comments")
        return success

    def test_admin_job_applications(self):
        """Test admin job applications endpoint"""
        success, response = self.run_test(
            "Admin Job Applications",
            "GET",
            "admin/job-applications",
            200
        )
        if success:
            print(f"   Found {len(response)} job applications")
        return success

    def test_admin_push_tokens(self):
        """Test admin push tokens endpoint"""
        success, response = self.run_test(
            "Admin Push Tokens",
            "GET",
            "admin/push/tokens",
            200
        )
        if success:
            print(f"   Found {response.get('total', 0)} push tokens")
        return success

    def test_news_endpoints(self):
        """Test news related endpoints"""
        # Test get news
        success, response = self.run_test(
            "Get News",
            "GET",
            "news",
            200
        )
        if success:
            print(f"   Found {len(response)} news articles")
        return success

    def test_schedule_endpoints(self):
        """Test schedule related endpoints"""
        success, response = self.run_test(
            "Get Schedule",
            "GET",
            "schedule",
            200
        )
        if success:
            print(f"   Found {len(response)} schedule slots")
        return success

    def test_now_playing(self):
        """Test now playing endpoint"""
        success, response = self.run_test(
            "Now Playing",
            "GET",
            "now-playing",
            200
        )
        if success:
            print(f"   Now Playing: {response.get('song_title')} by {response.get('artist')}")
        return success

def main():
    print("🚀 Starting Admin Panel API Tests...")
    print("=" * 50)
    
    tester = AdminPanelAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1

    # Test all admin endpoints
    admin_tests = [
        tester.test_admin_stats,
        tester.test_admin_users,
        tester.test_admin_requests,
        tester.test_admin_roles,
        tester.test_admin_permissions,
        tester.test_admin_comments_pending,
        tester.test_admin_job_applications,
        tester.test_admin_push_tokens,
    ]

    # Test public endpoints
    public_tests = [
        tester.test_news_endpoints,
        tester.test_schedule_endpoints,
        tester.test_now_playing,
    ]

    # Run all tests
    for test in admin_tests + public_tests:
        test()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            print(f"   - {failed}")
    else:
        print("\n✅ All tests passed!")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())