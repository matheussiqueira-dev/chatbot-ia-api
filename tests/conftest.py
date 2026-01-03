"""Configuration for pytest."""
import os
import sys

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["API_PROVIDER"] = "test"
