# README.md

## Python Script Setup Instructions

Follow the steps below to set up and run the Python script:

### 1. Prerequisites
Ensure you have the following installed on your system:
- Python 3.6 or later
- pip (Python package manager)

### 2. Create a Virtual Environment
A virtual environment is recommended to isolate the dependencies for this project.

1. Open a terminal (or Command Prompt on Windows).
2. Navigate to the folder where this zip file is extracted.
3. Run the following command to create a virtual environment:
   - On Linux/Mac:
     ```bash
     python3 -m venv .venv
     ```
   - On Windows:
     ```powershell
     python -m venv .venv
     ```

### 3. Activate the Virtual Environment
Activate the virtual environment with the following command:

- On Linux/Mac:
  ```bash
  source .venv/bin/activate
  ```
- On Windows (PowerShell):
  ```powershell
  .\.venv\Scripts\Activate
  ```

### 4. Install Dependencies
While the virtual environment is active, install the required dependencies:

```bash
pip install -r requirements.txt
```

### 5. Run the Script
After installing the dependencies, you can run the Python script:

```bash
python python_writing.py
```

### 6. Deactivate the Virtual Environment
When you're done, deactivate the virtual environment:

```bash
deactivate
```
