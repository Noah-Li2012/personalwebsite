import sys
import threading
import time
import json
from pathlib import Path
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QWidget, QVBoxLayout, QLabel, QFrame,
    QDialog, QHBoxLayout, QPushButton, QComboBox, QSpinBox, QLineEdit, QMessageBox
)
from PySide6.QtCore import Qt, Signal, QObject, QPoint, QTimer
from PySide6.QtGui import QFont, QTextCharFormat, QColor

SETTINGS_PATH = Path.home() / '.notebed_settings.json'

class HotkeyBridge(QObject):
    toggle = Signal()

bridge = HotkeyBridge()
last_toggle_time = 0

# ------------------------ Markdown highlighter ------------------------
from PySide6.QtGui import QSyntaxHighlighter
class MarkdownHighlighter(QSyntaxHighlighter):
    def __init__(self, parent):
        super().__init__(parent)

        self.rules = []

        def fmt(color, bold=False):
            f = QTextCharFormat()
            f.setForeground(QColor(color))
            if bold:
                f.setFontWeight(QFont.Bold)
            return f

        self.rules.append((r"\*\*(.*?)\*\*", fmt("#005577", True)))
        self.rules.append((r"`[^`]+`", fmt("#007799")))
        self.rules.append((r"> .*", fmt("#004466", True)))
        self.rules.append((r"^# .*$", fmt("#003344", True)))

    def highlightBlock(self, text):
        import re
        for pattern, form in self.rules:
            for m in re.finditer(pattern, text):
                self.setFormat(m.start(), m.end() - m.start(), form)

# ------------------------ Settings management ------------------------
DEFAULT_SETTINGS = {
    'theme': 'Aqua Breeze',
    'width': 370,
    'height': 450,
    'hotkey': 'windows+space'
}

PRESET_THEMES = [
    'Aqua Breeze', 'Midnight Blue','Christmas 2025','Solarized Light', 'Solarized Dark', 'Monokai',
    'Sunset Glow', 'Forest Mist', 'Cyberpunk', 'Lavender Dreams', 'Coffee Bean',
    'Ocean Depths', 'Neon Pulse', 'Retro Green', 'Cherry Blossom', 'Stormy Gray'
]

THEME_TEMPLATES = {
    'Aqua Breeze': {
        'topbar': "background: rgba(210,240,255,0.95); color:#033;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(235, 250, 255, 230), stop:1 rgba(220, 245, 255, 220)); color:#083344;"
    },
    'Midnight Blue': {
        'topbar': "background: rgba(10,20,40,0.95); color:#cfe8ff;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(6,10,20,240), stop:1 rgba(16,26,46,235)); color:#cfe8ff;"
    },
    'Christmas 2025': {
        'topbar': "background: rgba(139,0,0,0.95); color:#FFD700;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(50,205,50,240), stop:1 rgba(0,100,0,235)); color:#FFFACD;"
    },
    'Solarized Light': {
        'topbar': "background: rgba(253,246,227,0.95); color:#657b83;",
        'editor': "background: #fdf6e3; color:#657b83;"
    },
    'Solarized Dark': {
        'topbar': "background: rgba(0,43,54,0.95); color:#93a1a1;",
        'editor': "background: #002b36; color:#93a1a1;"
    },
    'Monokai': {
        'topbar': "background: rgba(39,40,34,0.95); color:#f8f8f2;",
        'editor': "background: #272822; color:#f8f8f2;"
    },
    'Sunset Glow': {
        'topbar': "background: rgba(255,180,100,0.95); color:#3a0a00;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(255,220,180,230), stop:1 rgba(255,160,80,220)); color:#3a0a00;"
    },
    'Forest Mist': {
        'topbar': "background: rgba(60,80,60,0.95); color:#e6ffe6;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(200,245,200,230), stop:1 rgba(100,160,100,220)); color:#e6ffe6;"
    },
    'Cyberpunk': {
        'topbar': "background: rgba(20,0,40,0.95); color:#ff00ff;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(30,0,60,230), stop:1 rgba(80,0,120,220)); color:#ff00ff;"
    },
    'Lavender Dreams': {
        'topbar': "background: rgba(230,200,255,0.95); color:#330033;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(245,220,255,230), stop:1 rgba(200,180,255,220)); color:#330033;"
    },
    'Coffee Bean': {
        'topbar': "background: rgba(90,60,40,0.95); color:#ffeacc;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(150,100,60,230), stop:1 rgba(70,50,35,220)); color:#ffeacc;"
    },
    'Ocean Depths': {
        'topbar': "background: rgba(0,50,70,0.95); color:#a0f0ff;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(0,80,100,230), stop:1 rgba(0,30,50,220)); color:#a0f0ff;"
    },
    'Neon Pulse': {
        'topbar': "background: rgba(10,10,0,0.95); color:#39ff14;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(20,20,0,230), stop:1 rgba(0,0,0,220)); color:#39ff14;"
    },
    'Retro Green': {
        'topbar': "background: rgba(0,60,0,0.95); color:#ccffcc;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(100,200,100,230), stop:1 rgba(0,50,0,220)); color:#ccffcc;"
    },
    'Cherry Blossom': {
        'topbar': "background: rgba(255,190,210,0.95); color:#550022;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(255,220,230,230), stop:1 rgba(255,150,180,220)); color:#550022;"
    },
    'Stormy Gray': {
        'topbar': "background: rgba(70,70,90,0.95); color:#dcdcdc;",
        'editor': "background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 rgba(100,100,120,230), stop:1 rgba(50,50,70,220)); color:#dcdcdc;"
    }
}



def load_settings():
    if SETTINGS_PATH.exists():
        try:
            with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
                s = json.load(f)
            for k, v in DEFAULT_SETTINGS.items():
                s.setdefault(k, v)
            return s
        except Exception:
            return DEFAULT_SETTINGS.copy()
    else:
        return DEFAULT_SETTINGS.copy()


def save_settings(s):
    try:
        with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(s, f, indent=2)
    except Exception as e:
        print('Failed to save settings:', e)

# ------------------------ Settings dialog ------------------------
class SettingsDialog(QDialog):
    def __init__(self, parent, settings):
        super().__init__(parent)
        self.setWindowTitle('Notebed Settings')
        self.settings = settings
        self.setModal(True)

        layout = QVBoxLayout(self)

        # Theme selector
        th_layout = QHBoxLayout()
        th_layout.addWidget(QLabel('Theme:'))
        self.theme_combo = QComboBox()
        self.theme_combo.addItems(PRESET_THEMES)
        self.theme_combo.setCurrentText(settings.get('theme', DEFAULT_SETTINGS['theme']))
        th_layout.addWidget(self.theme_combo)
        layout.addLayout(th_layout)

        # Window size
        sz_layout = QHBoxLayout()
        sz_layout.addWidget(QLabel('Width:'))
        self.width_spin = QSpinBox(); self.width_spin.setRange(200, 2000); self.width_spin.setValue(settings.get('width', DEFAULT_SETTINGS['width']))
        sz_layout.addWidget(self.width_spin)
        sz_layout.addWidget(QLabel('Height:'))
        self.height_spin = QSpinBox(); self.height_spin.setRange(120, 2000); self.height_spin.setValue(settings.get('height', DEFAULT_SETTINGS['height']))
        sz_layout.addWidget(self.height_spin)
        layout.addLayout(sz_layout)

        # Hotkey
        hk_layout = QHBoxLayout()
        hk_layout.addWidget(QLabel('Hotkey:'))
        self.hotkey_edit = QLineEdit(settings.get('hotkey', DEFAULT_SETTINGS['hotkey']))
        hk_layout.addWidget(self.hotkey_edit)
        layout.addLayout(hk_layout)

        # Buttons
        btn_layout = QHBoxLayout()
        self.save_btn = QPushButton('Save')
        self.cancel_btn = QPushButton('Cancel')
        btn_layout.addStretch()
        btn_layout.addWidget(self.save_btn)
        btn_layout.addWidget(self.cancel_btn)
        layout.addLayout(btn_layout)

        label = QLabel("Warning: everything you write on the notebook will not be saved anywhere")
        label.setStyleSheet("color: red;")
        label.setFont(QFont("Arial", 5))
        layout.addWidget(label)

        self.save_btn.clicked.connect(self.on_save)
        self.cancel_btn.clicked.connect(self.reject)

    def on_save(self):
        new_theme = self.theme_combo.currentText()
        new_width = int(self.width_spin.value())
        new_height = int(self.height_spin.value())
        new_hotkey = self.hotkey_edit.text().strip() or DEFAULT_SETTINGS['hotkey']

        # Basic validation: require non-empty hotkey
        if not new_hotkey:
            QMessageBox.warning(self, 'Invalid hotkey', 'Please enter a non-empty hotkey (e.g. "windows+space", "ctrl+alt+h", "f1").')
            return


        self.settings['theme'] = new_theme
        self.settings['width'] = new_width
        self.settings['height'] = new_height
        self.settings['hotkey'] = new_hotkey

        save_settings(self.settings)
        self.accept()

# ------------------------ Main window ------------------------
class NotebedWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('Notebed')
        self.setWindowFlag(Qt.FramelessWindowHint)
        self.setWindowFlag(Qt.WindowStaysOnTopHint)
        self.setAttribute(Qt.WA_TranslucentBackground, True)

        self.settings = load_settings()

        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0,0,0,0)

        self.topbar = QLabel('  Notebed')
        self.topbar.setFixedHeight(32)
        self.topbar.setAlignment(Qt.AlignVCenter | Qt.AlignLeft)

        self.dragging = False
        self.drag_pos = QPoint()

        layout.addWidget(self.topbar)

        self.editor = QTextEdit()
        self.editor.setAcceptRichText(False)
        self.editor.setPlaceholderText('hello~ text will never be saved, try F4!')
        self.editor.setFont(QFont('Consolas', 11))

        MarkdownHighlighter(self.editor.document())

        self.editor.setStyleSheet('border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; padding: 12px;')

        layout.addWidget(self.editor)
        self.setCentralWidget(container)

        # Apply settings
        self.apply_theme(self.settings.get('theme'))
        w = int(self.settings.get('width', DEFAULT_SETTINGS['width']))
        h = int(self.settings.get('height', DEFAULT_SETTINGS['height']))
        self.resize(w, h)
        self.center_on_screen()

        bridge.toggle.connect(self.toggle_visibility)

        QTimer.singleShot(10, self.hide)

    def center_on_screen(self):
        g = QApplication.primaryScreen().availableGeometry()
        x = (g.width() - self.width()) // 2
        y = (g.height() - self.height()) // 2
        self.move(x, y)

    def apply_theme(self, theme_name):
        t = THEME_TEMPLATES.get(theme_name, THEME_TEMPLATES['Aqua Breeze'])
        topbar_style = t['topbar'] + ' border-top-left-radius:14px; border-top-right-radius:14px;'
        editor_style = 'QTextEdit {' + t['editor'] + ' border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; padding: 12px; }'
        self.topbar.setStyleSheet(topbar_style)
        self.editor.setStyleSheet(editor_style)

    def mousePressEvent(self, e):
        if e.button() == Qt.LeftButton and self.topbar.geometry().contains(e.position().toPoint()):
            self.dragging = True
            self.drag_pos = e.globalPosition().toPoint() - self.frameGeometry().topLeft()
        super().mousePressEvent(e)

    def mouseMoveEvent(self, e):
        if self.dragging:
            self.move(e.globalPosition().toPoint() - self.drag_pos)
        super().mouseMoveEvent(e)

    def mouseReleaseEvent(self, e):
        self.dragging = False
        super().mouseReleaseEvent(e)

    def toggle_visibility(self):
        global last_toggle_time
        now = time.time()
        if now - last_toggle_time < 0.1:
            return
        last_toggle_time = now

        if self.isVisible():
            self.hide()
        else:
            self.show()
            self.raise_()
            self.activateWindow()
            self.editor.setFocus()

    def keyPressEvent(self, e):
        # F1 opens settings dialog
        if e.key() == Qt.Key_Escape:
            self.hide()
        elif e.key() == Qt.Key_F4:
            self.open_settings()
        else:
            super().keyPressEvent(e)

    def open_settings(self):
        dlg = SettingsDialog(self, self.settings)
        if dlg.exec() == QDialog.Accepted:
            # re-load settings and apply
            self.settings = load_settings()
            self.apply_theme(self.settings.get('theme'))
            self.resize(int(self.settings.get('width', DEFAULT_SETTINGS['width'])), int(self.settings.get('height', DEFAULT_SETTINGS['height'])))
            self.center_on_screen()
            # re-register hotkey
            register_hotkey(self.settings.get('hotkey', DEFAULT_SETTINGS['hotkey']))

# ------------------------ Hotkey listener ------------------------
# We'll use a robust pattern: keep a single background waiter thread and manage
# the most-recent hotkey id returned by keyboard.add_hotkey(), removing it when
# changing hotkeys. This avoids touching internal attributes of the keyboard
# listener object which vary across versions.

hotkey_thread = None
hotkey_waiter_started = False
current_hotkey_id = None
keyboard_available = True

try:
    import keyboard
except Exception as e:
    keyboard_available = False
    print('keyboard module not available:', e)


def hotkey_waiter():
    # Run in background to keep the keyboard listener alive on some platforms
    try:
        keyboard.wait()
    except Exception:
        pass


def register_hotkey(hotkey):
    global hotkey_thread, hotkey_waiter_started, current_hotkey_id, keyboard_available
    if not keyboard_available:
        print('keyboard module not available; hotkeys disabled')
        return

    try:
        # Remove previous hotkey if present
        if current_hotkey_id is not None:
            try:
                keyboard.remove_hotkey(current_hotkey_id)
            except Exception:
                # Try removing by string as fallback
                try:
                    keyboard.remove_hotkey(str(current_hotkey_id))
                except Exception:
                    pass
            current_hotkey_id = None

        # Register new hotkey
        current_hotkey_id = keyboard.add_hotkey(hotkey, lambda: bridge.toggle.emit())

    except Exception as e:
        # Some keyboard versions/platforms may raise for unsupported hotkey strings
        print('Failed to register hotkey:', e)
        current_hotkey_id = None

    # Ensure a single background waiter thread is running
    if not hotkey_waiter_started:
        hotkey_thread = threading.Thread(target=hotkey_waiter, daemon=True)
        hotkey_thread.start()
        hotkey_waiter_started = True

# ------------------------ main ------------------------

def main():
    app = QApplication(sys.argv)
    win = NotebedWindow()

    # Register saved hotkey (if keyboard module is present)
    register_hotkey(win.settings.get('hotkey', DEFAULT_SETTINGS['hotkey']))

    sys.exit(app.exec())

if __name__ == '__main__':
    main()
