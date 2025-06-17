import importlib
import os
import sys

def smart_import(module_name):
    try:
        return importlib.import_module(module_name)
    except ModuleNotFoundError:
        print(f"[SmartImport] Package '{module_name}' not found. Use force_import('{module_name}') to install.")

def force_import(module_name):
    print(f"[SmartImport] Installing '{module_name}'...")
    os.system(f"{sys.executable} -m pip install {module_name}")
    return importlib.import_module(module_name)
