#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class StreamSettingsAPITester:
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

    def test_get_stream_config(self):
        """Test GET /api/stream-config endpoint"""
        success, response = self.run_test(
            "Get Stream Config",
            "GET",
            "stream-config",
            200
        )
        if success:
            print(f"   Stream URL: {response.get('stream_url', 'Not set')}")
            print(f"   Station Name: {response.get('station_name', 'Not set')}")
            print(f"   Tagline: {response.get('tagline', 'Not set')}")
            return response
        return None

    def test_update_stream_config(self):
        """Test PUT /api/stream-config endpoint"""
        test_data = {
            "stream_url": "https://das-edge62-live365-dal03.cdnstream.com/a55796",
            "station_name": "The Beat 515",
            "tagline": "Proud. Loud. Local."
        }
        
        success, response = self.run_test(
            "Update Stream Config",
            "PUT",
            "stream-config",
            200,
            data=test_data
        )
        if success:
            print(f"   Updated Stream URL: {response.get('stream_url')}")
            print(f"   Updated Station Name: {response.get('station_name')}")
            print(f"   Updated Tagline: {response.get('tagline')}")
            return response
        return None

    def test_update_now_playing(self):
        """Test PUT /api/now-playing endpoint"""
        test_data = {
            "song_title": "Test Stream Song",
            "artist": "Test Stream Artist",
            "album": "Test Album"
        }
        
        success, response = self.run_test(
            "Update Now Playing",
            "PUT",
            "now-playing",
            200,
            data=test_data
        )
        if success:
            print(f"   Updated Song: {response.get('song_title')}")
            print(f"   Updated Artist: {response.get('artist')}")
            print(f"   DJ: {response.get('dj_name')}")
            return response
        return None

    def test_get_now_playing(self):
        """Test GET /api/now-playing endpoint"""
        success, response = self.run_test(
            "Get Now Playing",
            "GET",
            "now-playing",
            200
        )
        if success:
            print(f"   Current Song: {response.get('song_title')}")
            print(f"   Current Artist: {response.get('artist')}")
            print(f"   DJ: {response.get('dj_name')}")
            return response
        return None

    def test_stream_config_validation(self):
        """Test stream config with different URL formats"""
        test_cases = [
            {
                "name": "HTTP URL",
                "data": {"stream_url": "http://example.com/stream"},
                "should_pass": True
            },
            {
                "name": "HTTPS URL", 
                "data": {"stream_url": "https://example.com/stream"},
                "should_pass": True
            },
            {
                "name": "Only Station Name",
                "data": {"station_name": "Test Station"},
                "should_pass": True
            },
            {
                "name": "Only Tagline",
                "data": {"tagline": "Test Tagline"},
                "should_pass": True
            }
        ]

        for test_case in test_cases:
            success, response = self.run_test(
                f"Stream Config - {test_case['name']}",
                "PUT",
                "stream-config",
                200 if test_case['should_pass'] else 400,
                data=test_case['data']
            )
            if success == test_case['should_pass']:
                print(f"   ✅ {test_case['name']} validation passed")
            else:
                print(f"   ❌ {test_case['name']} validation failed")

def main():
    print("🚀 Starting Stream Settings API Tests...")
    print("=" * 60)
    
    tester = StreamSettingsAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1

    print("\n📡 Testing Stream Configuration APIs...")
    
    # Test getting current stream config
    current_config = tester.test_get_stream_config()
    
    # Test updating stream config
    updated_config = tester.test_update_stream_config()
    
    # Verify the update worked by getting config again
    if updated_config:
        print("\n🔄 Verifying stream config update...")
        verify_config = tester.test_get_stream_config()
        if verify_config and verify_config.get('stream_url') == "https://das-edge62-live365-dal03.cdnstream.com/a55796":
            print("   ✅ Stream config update verified")
        else:
            print("   ❌ Stream config update verification failed")
            tester.failed_tests.append("Stream config update verification failed")

    print("\n🎵 Testing Now Playing APIs...")
    
    # Test updating now playing
    updated_np = tester.test_update_now_playing()
    
    # Verify the now playing update
    if updated_np:
        print("\n🔄 Verifying now playing update...")
        verify_np = tester.test_get_now_playing()
        if verify_np and verify_np.get('song_title') == "Test Stream Song":
            print("   ✅ Now playing update verified")
        else:
            print("   ❌ Now playing update verification failed")
            tester.failed_tests.append("Now playing update verification failed")

    print("\n🧪 Testing Stream Config Validation...")
    tester.test_stream_config_validation()

    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            print(f"   - {failed}")
    else:
        print("\n✅ All stream settings tests passed!")

    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())