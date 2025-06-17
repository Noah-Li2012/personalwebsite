# smartimporter

`smartimporter` is a Python utility package that lets you safely import modules with a fallback installation using pip if they aren't already installed.

## 🔧 Usage

```python
from smartimporter import smart_import, force_import

# Try to import normally
cv2 = smart_import("cv2")

# If it fails, install it
if cv2 is None:
    cv2 = force_import("cv2")
```

## 📦 Features

- `smart_import("mod")` — tries importing, warns if missing
- `force_import("mod")` — installs with pip and then imports

## 🛠 Install Locally

```bash
pip install .
```

## 🧠 Author

Made by Noah
