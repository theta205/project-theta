import re
from typing import str

def clean_text(text: str) -> str:
    """
    Clean and normalize text content.
    
    Args:
        text: Input text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common slide artifacts
    text = re.sub(r'Slide \d+ of \d+', '', text)
    text = re.sub(r'Page \d+', '', text)
    
    # Remove headers/footers (basic pattern)
    text = re.sub(r'©.*?$', '', text, flags=re.MULTILINE)
    
    return text.strip()

def normalize_text(text: str) -> str:
    """
    Normalize text for consistent processing.
    
    Args:
        text: Input text to normalize
        
    Returns:
        Normalized text
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters
    text = re.sub(r'[^\w\s]', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip() 