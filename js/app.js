// Main application logic
class PromptApp {
  constructor() {
    this.generator = new PromptGenerator();
    this.historyKey = 'promptMakerHistory';
    this.maxHistory = 20;
    this.lockedFields = new Set(); // track locked select IDs
    this.activePreset = 'none';
    this.init();
  }

  init() {
    this.populateDropdowns();
    this.populatePresetSelect();
    this.attachEventListeners();
    this._setupKeyboardShortcuts();
    this.renderAccessoriesTags();
    this.injectLockButtons();
    this.updateOutput();
    this.renderHistory();
  }

  populateDropdowns() {
    this.populateSelect('photo-device', SELECTOR_OPTIONS.photo.device);
    this.populateSelect('photo-lens-type', SELECTOR_OPTIONS.photo.lens_type);
    this.populateSelect('photo-custom', SELECTOR_OPTIONS.photo.custom);
    this.populateSelect('art-style', SELECTOR_OPTIONS.art.style);
    this.populateSelect('art-colors', SELECTOR_OPTIONS.art.colors);
    this.populateSelect('art-medium', SELECTOR_OPTIONS.art.medium);
    // Design
    this.populateSelect('design-type', SELECTOR_OPTIONS.design.type);
    this.populateSelect('design-aesthetic', SELECTOR_OPTIONS.design.aesthetic);
    this.updateDesignReferences();
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

  updateDesignReferences() {
    const typeSelect = document.getElementById('design-type');
    const type = typeSelect ? typeSelect.value : '';
    const refs = SELECTOR_OPTIONS.design.reference[type] || [];
    this.populateSelect('design-reference', refs);
  }

  // Populate preset filter dropdown
  populatePresetSelect() {
    const sel = document.getElementById('random-preset');
    if (!sel) return;
    sel.innerHTML = '';
    for (const [key, preset] of Object.entries(RANDOM_PRESETS)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = preset.label;
      sel.appendChild(opt);
    }
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

  // Inject lock toggle buttons next to each select & accessories
  injectLockButtons() {
    // Wrap each select with lock button
    document.querySelectorAll('.input-section select').forEach(sel => {
      const wrapper = document.createElement('div');
      wrapper.className = 'field-lock-wrap';
      sel.parentNode.insertBefore(wrapper, sel);
      wrapper.appendChild(sel);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lock-btn';
      btn.dataset.target = sel.id;
      btn.title = 'Lock this field from randomization';
      btn.textContent = '🔓';
      btn.addEventListener('click', () => this._toggleLock(sel.id, btn));
      wrapper.appendChild(btn);
    });

    // Lock button for accessories group
    const accContainer = document.getElementById('accessories-tags');
    if (accContainer) {
      const wrap = document.createElement('div');
      wrap.className = 'field-lock-wrap tags-lock-wrap';
      accContainer.parentNode.insertBefore(wrap, accContainer);
      wrap.appendChild(accContainer);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lock-btn';
      btn.dataset.target = 'accessories-tags';
      btn.title = 'Lock accessories from randomization';
      btn.textContent = '🔓';
      btn.addEventListener('click', () => this._toggleLock('accessories-tags', btn));
      wrap.appendChild(btn);
    }
  }

  _toggleLock(fieldId, btn) {
    if (this.lockedFields.has(fieldId)) {
      this.lockedFields.delete(fieldId);
      btn.textContent = '🔓';
      btn.classList.remove('locked');
    } else {
      this.lockedFields.add(fieldId);
      btn.textContent = '🔒';
      btn.classList.add('locked');
    }
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

    const designType = document.getElementById('design-type');
    if (designType) {
      designType.addEventListener('change', () => this.updateDesignReferences());
    }

    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => this.updateOutput());
    });

    document.getElementById('copy-btn').addEventListener('click', () => this.copyOutput());
    document.getElementById('random-btn').addEventListener('click', () => this.randomizeSelectors());
    document.getElementById('random-preset').addEventListener('change', (e) => {
      this.activePreset = e.target.value;
    });
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
    document.getElementById('photo-settings').classList.toggle('active', selectedType === 'photo');
    document.getElementById('art-settings').classList.toggle('active', selectedType === 'art');
    document.getElementById('render-settings').classList.toggle('active', selectedType === 'render');
    document.getElementById('design-settings').classList.toggle('active', selectedType === 'design');
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

  // Randomize visible selectors, respecting locks + preset exclusions
  randomizeSelectors() {
    const preset = RANDOM_PRESETS[this.activePreset] || RANDOM_PRESETS.none;
    const excludes = preset.exclude || {};

    document.querySelectorAll('.input-section select').forEach(select => {
      // Skip hidden conditional sections
      if (select.closest('.conditional-section:not(.active)')) return;
      // Skip locked fields
      if (this.lockedFields.has(select.id)) return;

      const fieldExcludes = excludes[select.id] || [];
      // Build valid indices (skip index 0 = placeholder)
      const valid = [];
      for (let i = 1; i < select.options.length; i++) {
        if (!fieldExcludes.includes(select.options[i].value)) valid.push(i);
      }
      if (valid.length > 0) {
        select.selectedIndex = valid[Math.floor(Math.random() * valid.length)];
        if (select.id === 'design-type') {
          this.updateDesignReferences();
        }
      }
    });

    // Accessories — respect lock + preset
    if (!this.lockedFields.has('accessories-tags')) {
      const accExcludes = excludes['subject-accessory'] || [];
      document.querySelectorAll('#accessories-tags input[type="checkbox"]').forEach(cb => {
        if (accExcludes.includes(cb.value)) {
          cb.checked = false;
        } else {
          cb.checked = Math.random() > 0.7;
        }
      });
    }

    this.updateOutput();
    const label = preset.label !== 'No Filter' ? ` (${preset.label})` : '';
    this.showToast(`Randomized!${label}`);
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
      if (state.style.art) {
        document.getElementById('art-style').value = state.style.art.style || '';
        document.getElementById('art-colors').value = state.style.art.colors || '';
        document.getElementById('art-medium').value = state.style.art.medium || '';
      }
      if (state.style.design) {
        document.getElementById('design-type').value = state.style.design.type || '';
        this.updateDesignReferences();
        document.getElementById('design-aesthetic').value = state.style.design.aesthetic || '';
        document.getElementById('design-reference').value = state.style.design.reference || '';
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
    document.querySelectorAll('.input-section select').forEach(select => { select.selectedIndex = 0; });
    document.querySelectorAll('#accessories-tags input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    // Clear all locks
    this.lockedFields.clear();
    document.querySelectorAll('.lock-btn.locked').forEach(btn => {
      btn.classList.remove('locked');
      btn.textContent = '🔓';
    });
    this.updateDesignReferences();
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
