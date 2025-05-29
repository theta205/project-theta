# Canonical import for all document conversion and parsing utilities.
# Use this module to access PDFParser, AudioParser, and future document handlers in a unified way.

from .pdf_parser import PDFParser
from .audio_parser import AudioParser

__all__ = ["PDFParser", "AudioParser"]
