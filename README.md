# File-Chatbot
An intelligent chatbot that enables natural language interaction with your files and documents. Upload, analyze, and chat with various file formats using advanced AI capabilities.

 🚀 Features

- **Multi-format Support**: Work with PDFs, Word documents, text files, spreadsheets, and more
- **Natural Language Queries**: Ask questions about your documents in plain English
- **Document Analysis**: Extract insights, summaries, and key information from uploaded files
- **Intelligent Search**: Find specific information across multiple documents
- **Interactive Chat Interface**: User-friendly web interface for seamless interaction
- **File Management**: Upload, organize, and manage your document library
- **Context-Aware Responses**: Maintains conversation context for follow-up questions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 16+** (if using web interface)
- **pip** (Python package manager)
- **API Keys** for AI services (OpenAI, Anthropic, etc.)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/File-chatbot/File-Chatbot.git
cd File-Chatbot
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./file_chatbot.db

# File Storage
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=50MB

# Security
SECRET_KEY=your_secret_key_here
```

### 4. Initialize Database

```bash
python init_db.py
```

### 5. Start the Application

```bash
# Start the backend server
python app.py

# If using web interface, in a new terminal:
cd frontend
npm install
npm start
```

## 🎯 Quick Start

1. **Upload a File**: Use the web interface to upload your document
2. **Start Chatting**: Ask questions about your uploaded file
3. **Explore Features**: Try different types of queries and analysis

### Example Queries

- "What is the main topic of this document?"
- "Summarize the key points from page 3"
- "Find all mentions of 'machine learning' in the document"
- "What are the conclusions in this research paper?"
- "Extract all the email addresses from this file"

## 📁 Supported File Formats

| Format | Extensions | Features |
|--------|------------|----------|
| **Documents** | `.pdf`, `.docx`, `.txt`, `.md` | Text extraction, content analysis |
| **Spreadsheets** | `.xlsx`, `.csv`, `.tsv` | Data analysis, table queries |
| **Presentations** | `.pptx` | Slide content extraction |
| **Images** | `.jpg`, `.png`, `.pdf` | OCR text extraction |
| **Code Files** | `.py`, `.js`, `.html`, `.css` | Code analysis, documentation |

## 🔧 Configuration

### AI Model Settings

Edit `config.py` to customize AI model settings:

```python
# Model Configuration
DEFAULT_MODEL = "gpt-4"
MAX_TOKENS = 4000
TEMPERATURE = 0.7

# Document Processing
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
```

### Advanced Features

- **Vector Database**: Enable semantic search across documents
- **OCR Processing**: Extract text from images and scanned documents
- **Multi-language Support**: Process documents in various languages
- **Export Options**: Save conversations and analysis results

## 🚀 Usage Examples

### Python API

```python
from file_chatbot import FileChatbot

# Initialize chatbot
chatbot = FileChatbot()

# Upload and process file
file_id = chatbot.upload_file("document.pdf")

# Ask questions
response = chatbot.chat(
    message="What are the main conclusions?",
    file_id=file_id
)

print(response)
```

### REST API

```bash
# Upload file
curl -X POST "http://localhost:5000/api/upload" \
  -F "file=@document.pdf"

# Chat with file
curl -X POST "http://localhost:5000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize this document", "file_id": "123"}'
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `pytest tests/`
5. Submit a pull request

### Code Style

- Follow PEP 8 for Python code
- Use Black for code formatting: `black .`
- Run linting: `flake8 .`

## 📚 Documentation

- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Configuration Reference](docs/configuration.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🐛 Troubleshooting

### Common Issues

**File Upload Fails**
- Check file size limits in configuration
- Ensure supported file format
- Verify disk space availability

**AI Responses Are Slow**
- Check API key limits
- Consider using a lighter model
- Optimize chunk size settings

**Memory Issues**
- Reduce batch size for large files
- Enable file compression
- Clear cache regularly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [LangChain](https://github.com/hwchase17/langchain) for document processing
- UI powered by [Streamlit](https://streamlit.io/) or [React](https://reactjs.org/)
- Vector search using [ChromaDB](https://github.com/chroma-core/chroma)
- OCR capabilities via [Tesseract](https://github.com/tesseract-ocr/tesseract)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/File-chatbot/File-Chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/File-chatbot/File-Chatbot/discussions)
- **Email**: support@file-chatbot.com

## 🔄 Changelog

### v1.0.0 (Latest)
- Initial release
- Basic file upload and chat functionality
- Support for major document formats
- Web interface implementation

---
