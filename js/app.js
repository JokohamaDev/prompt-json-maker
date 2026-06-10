// Main application logic
class PromptApp {
  constructor() {
    this.generator = new PromptGenerator();
    this.historyKey = 'promptMakerHistory';
    this.maxHistory = 20;
    this.init();
  }

  init() {
    this.populateDropdowns();
    this.attachEventListeners();
    this._setupKeyboardShortcuts();
    this.renderAccessoriesTags();
    this.updateOutput();
    this.renderHistory();
  }

  populateDropdowns() {
    this.populateSelect('photo-device', SELECTOR_OPTIONS.photo.device);
    this.populateSelect('photo-lens-type', SELECTOR_OPTIONS.photo.lens_type);
    this.populateSelect('photo-custom', SELECTOR_OPTIONS.photo.custom);
    this.populateSelect('painting-style', SELECTOR_OPTIONS.painting_drawing.style);
    this.populateSelect('painting-colors', SELECTOR_OPTIONS.painting_drawing.colors);
    this.populateSelect('painting-custom', SELECTOR_OPTIONS.painting_drawing.custom);
    this.populateSelect('render-style', SELECTOR_OPTIONS.render.style);
    this.populateSelect('render-quality', SELECTOR_OPTIONS.render.quality);
    this.populateSelect('render-engine', SELECTOR_OPTIONS.render.engine);
    this.populateSelect('view-perspective', SELECTOR_OPTIONS.view.perspective);
    this.populateSelect('view-distance', SELECTOR_OPTIONS.view.distance);
    this.populateSelect('subject-characteristic', SELECTOR_OPTIONS.subject.characteristic);
    this.populateSelect('subject-clothes', SELECTOR_OPTIONS.subject.clothes);
    this.populateSelect('subject-action', SELECTOR_OPTIONS.subject.action);
    this.populateSelect('subject-top-type', SELECTOR_OPTIONS.subject.top_type);
    this.populateSelect('subject-bottom-type', SELECTOR_OPTIONS.subject.bottom_type);
    this.populateSelect('subject-weapon', SELECTOR_OPTIONS.subject.weapon);
    this.populateSelect('subject-hair-color', SELECTOR_OPTIONS.subject.hair_color);
    this.populateSelect('subject-hair-style', SELECTOR_OPTIONS.subject.hair_style);
    this.populateSelect('scene-1', SELECTOR_OPTIONS.scene.scene_1);
    this.populateSelect('scene-2', SELECTOR_OPTIONS.scene.scene_2);
    this.populateSelect('scene-effect', SELECTOR_OPTIONS.scene.effect);
    this.populateSelect('scene-photo-filter', SELECTOR_OPTIONS.scene.photo_filter);
    this.populateSelect('lighting-1', SELECTOR_OPTIONS.lighting.lighting_1);
    this.populateSelect('lighting-2', SELECTOR_OPTIONS.lighting.lighting_2);
  }

  populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Select...</option>';
    options.forEach(option => {
      const el = document.createElement('option');
      el.value = option;
      el.textContent = option;
      select.appendChild(el);
    });
  }

  renderAccessoriesTags() {
    const container = document.getElementById('accessories-tags');
    if (!container) return;
    container.innerHTML = '';
    SELECTOR_OPTIONS.subject.accessories.forEach(item => {
      const tag = document.createElement('label');
      tag.className = 'tag';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = item;
      cb.addEventListener('change', () => this.updateOutput());
      tag.appendChild(cb);
      tag.appendChild(document.createTextNode(item));
      container.appendChild(tag);
    });
  }

  attachEventListeners() {
    document.getElementById('prompt').addEventListener('input', () => this.updateOutput());
    document.getElementById('negative_prompt').addEventListener('input', () => this.updateOutput());

    document.querySelectorAll('input[name="type"]').forEach(radio => {
      radio.addEventListener('change', () => this.handleTypeChange());
    });

    document.querySelectorAll('input[name="output-format"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateOutput());
    });

    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => this.updateOutput());
    });

    document.getElementById('copy-btn').addEventListener('click', () => this.copyOutput());
    document.getElementById('random-btn').addEventListener('click', () => this.randomizeSelectors());
    document.getElementById('export-btn').addEventListener('click', () => this.exportJSON());
    document.getElementById('import-btn').addEventListener('click', () => this.importJSON());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetForm());
    document.getElementById('save-history-btn').addEventListener('click', () => this.saveToHistory());
    document.getElementById('shortcuts-btn').addEventListener('click', () => this._toggleShortcutModal(true));
    document.getElementById('modal-close-btn').addEventListener('click', () => this._toggleShortcutModal(false));
    document.getElementById('shortcuts-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._toggleShortcutModal(false);
    });
  }

  _isInputFocused() {
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  _setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Prevent shortcuts when typing in form fields (except Cmd/Ctrl combos)
      if (this._isInputFocused() && !(e.metaKey || e.ctrlKey)) return;

      // Cmd/Ctrl + Enter → Copy (universally safe, no browser default conflict)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.copyOutput();
        return;
      }

      const key = e.key.toLowerCase();

      // R → Randomize
      if (key === 'r' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.randomizeSelectors();
        return;
      }

      // S → Save to history
      if (key === 's' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.saveToHistory();
        return;
      }

      // E → Export
      if (key === 'e' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.exportJSON();
        return;
      }

      // I → Import
      if (key === 'i' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.importJSON();
        return;
      }

      // Shift + D → Reset (Shift modifier prevents accidental press)
      if (key === 'd' && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        this.resetForm();
        return;
      }

      // ` → Open shortcut guide
      if (key === '`' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this._toggleShortcutModal(true);
        return;
      }

      // Escape → Close shortcut guide
      if (e.key === 'Escape') {
        this._toggleShortcutModal(false);
        return;
      }
    });
  }

  _toggleShortcutModal(open) {
    const modal = document.getElementById('shortcuts-modal');
    modal.classList.toggle('open', open);
  }

  handleTypeChange() {
    const selectedType = document.querySelector('input[name="type"]:checked').value;
    const photoSettings = document.getElementById('photo-settings');
    const paintingSettings = document.getElementById('painting-settings');
    const renderSettings = document.getElementById('render-settings');
    photoSettings.classList.toggle('active', selectedType === 'photo');
    paintingSettings.classList.toggle('active', selectedType === 'painting' || selectedType === 'drawing');
    renderSettings.classList.toggle('active', selectedType === 'render');
    this.updateOutput();
  }

  updateOutput() {
    this.generator.updateOutput();
  }

  // Copy current output (JSON or text based on toggle)
  copyOutput() {
    const output = document.getElementById('json-output').value;
    navigator.clipboard.writeText(output).then(() => {
      const format = document.querySelector('input[name="output-format"]:checked')?.value;
      this.showToast(format === 'json' ? 'JSON copied!' : 'Text prompt copied!');
    });
  }

  // Randomize visible selectors only
  randomizeSelectors() {
    document.querySelectorAll('select').forEach(select => {
      if (select.closest('.conditional-section:not(.active)')) return;
      const options = select.options;
      if (options.length > 1) {
        select.selectedIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
      }
    });
    document.querySelectorAll('#accessories-tags input[type="checkbox"]').forEach(cb => {
      cb.checked = Math.random() > 0.7;
    });
    this.updateOutput();
    this.showToast('Selectors randomized!');
  }

  // Export JSON as file download
  exportJSON() {
    const json = this.generator.generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    a.href = url;
    a.download = `prompt-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('JSON exported!');
  }

  // Import JSON from file
  importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const state = JSON.parse(event.target.result);
          this.restoreState(state);
          this.showToast('JSON imported!');
        } catch {
          this.showToast('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  // Restore form state from object
  restoreState(state) {
    document.getElementById('prompt').value = state.prompt || '';
    document.getElementById('negative_prompt').value = state.negative_prompt || '';

    if (state.type) {
      const typeRadio = document.querySelector(`input[name="type"][value="${state.type}"]`);
      if (typeRadio) {
        typeRadio.checked = true;
        this.handleTypeChange();
      }
    }

    if (state.subject) {
      document.getElementById('subject-characteristic').value = state.subject.characteristic || '';
      document.getElementById('subject-clothes').value = state.subject.clothes || '';
      document.getElementById('subject-action').value = state.subject.action || '';
      document.getElementById('subject-top-type').value = state.subject.top_type || '';
      document.getElementById('subject-bottom-type').value = state.subject.bottom_type || '';
      document.getElementById('subject-weapon').value = state.subject.weapon || '';
      document.getElementById('subject-hair-color').value = state.subject.hair_color || '';
      document.getElementById('subject-hair-style').value = state.subject.hair_style || '';
      const accessories = state.subject.accessories || [];
      document.querySelectorAll('#accessories-tags input[type="checkbox"]').forEach(cb => {
        cb.checked = Array.isArray(accessories) ? accessories.includes(cb.value) : cb.value === accessories;
      });
    }

    if (state.environment) {
      document.getElementById('scene-1').value = state.environment.scene_1 || '';
      document.getElementById('scene-2').value = state.environment.scene_2 || '';
      document.getElementById('scene-effect').value = state.environment.effect || '';
      document.getElementById('scene-photo-filter').value = state.environment.photo_filter || '';
    }
    if (state.view) {
      document.getElementById('view-perspective').value = state.view.perspective || '';
      document.getElementById('view-distance').value = state.view.distance || '';
    }
    if (state.lighting) {
      document.getElementById('lighting-1').value = state.lighting.lighting_1 || '';
      document.getElementById('lighting-2').value = state.lighting.lighting_2 || '';
    }
    if (state.style) {
      if (state.style.photo) {
        document.getElementById('photo-device').value = state.style.photo.device || '';
        document.getElementById('photo-lens-type').value = state.style.photo.lens_type || '';
        document.getElementById('photo-custom').value = state.style.photo.custom || '';
      }
      if (state.style.render) {
        document.getElementById('render-style').value = state.style.render.style || '';
        document.getElementById('render-quality').value = state.style.render.quality || '';
        document.getElementById('render-engine').value = state.style.render.engine || '';
      }
      if (state.style.painting_drawing) {
        document.getElementById('painting-style').value = state.style.painting_drawing.style || '';
        document.getElementById('painting-colors').value = state.style.painting_drawing.colors || '';
        document.getElementById('painting-custom').value = state.style.painting_drawing.custom || '';
      }
    }
    this.updateOutput();
  }

  // Reset all fields to defaults
  resetForm() {
    document.getElementById('prompt').value = '';
    document.getElementById('negative_prompt').value = '';
    const defaultRadio = document.querySelector('input[name="type"][value="photo"]');
    if (defaultRadio) {
      defaultRadio.checked = true;
      this.handleTypeChange();
    }
    document.querySelectorAll('select').forEach(select => { select.selectedIndex = 0; });
    document.querySelectorAll('#accessories-tags input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    this.updateOutput();
    this.showToast('Form reset!');
  }

  // --- History ---

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.historyKey)) || []; }
    catch { return []; }
  }

  saveToHistory() {
    const state = this.generator.updateState();
    const history = this.getHistory();
    history.unshift({ state, name: 'Untitled', timestamp: Date.now() });
    if (history.length > this.maxHistory) history.length = this.maxHistory;
    localStorage.setItem(this.historyKey, JSON.stringify(history));
    this.renderHistory();
    this.showToast('Saved to history!');
  }

  renameHistoryItem(index, newName) {
    const history = this.getHistory();
    if (history[index]) {
      history[index].name = newName || 'Untitled';
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    }
  }

  deleteHistoryItem(index) {
    const history = this.getHistory();
    history.splice(index, 1);
    localStorage.setItem(this.historyKey, JSON.stringify(history));
    this.renderHistory();
  }

  renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    const history = this.getHistory();

    if (history.length === 0) {
      container.innerHTML = '<p class="history-empty">No history yet. Click Save to store the current prompt.</p>';
      return;
    }

    container.innerHTML = history.map((item, i) => {
      const date = new Date(item.timestamp);
      const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const name = item.name || 'Untitled';
      return `
        <div class="history-item">
          <div class="history-item-info" data-index="${i}">
            <div class="history-name-row">
              <span class="history-name" data-index="${i}">${name}</span>
              <button class="history-rename" data-index="${i}" title="Rename">&#9998;</button>
            </div>
            <span class="history-time">${timeStr}</span>
          </div>
          <button class="history-delete" data-index="${i}" title="Delete">&times;</button>
        </div>
      `;
    }).join('');

    // Click to restore
    container.querySelectorAll('.history-item-info').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.history-rename')) return;
        const idx = parseInt(el.dataset.index);
        const history = this.getHistory();
        if (history[idx]) {
          this.restoreState(history[idx].state);
          this.showToast('Prompt restored from history');
        }
      });
    });

    // Rename
    container.querySelectorAll('.history-rename').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        const nameEl = container.querySelector(`.history-name[data-index="${idx}"]`);
        const currentName = history[idx]?.name || 'Untitled';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'history-name-input';
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        const save = () => {
          this.renameHistoryItem(idx, input.value.trim());
          this.renderHistory();
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (ke) => {
          if (ke.key === 'Enter') save();
          if (ke.key === 'Escape') this.renderHistory();
        });
      });
    });

    // Delete
    container.querySelectorAll('.history-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteHistoryItem(parseInt(btn.dataset.index));
      });
    });
  }

  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PromptApp();
});
