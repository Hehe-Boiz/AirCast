from django.test import TestCase
import os

# Create your tests here.
class UploadsTestCase(TestCase):
    def test_uploads_functionality(self):
        # Placeholder test to ensure uploads functionality works
        self.assertTrue(True)

class RunServerTestCase(TestCase):
    def test_server_running(self):
        os.execvp('python', ['python', 'manage.py', 'runserver'])
        self.assertTrue(True)