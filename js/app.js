// Main application logic
class PromptApp {
  constructor() {
    this.generator = new PromptGenerator();
    this.init();
  }

  init() {
    this.populateDropdowns();
    this.attachEventListeners();
    this.updateOutput();
  }

  // Populate all dropdowns with options from data.js
  populateDropdowns() {
    // Photo settings
    this.populateSelect('photo-device', SELECTOR_OPTIONS.photo.device);
    this.populateSelect('photo-lens-type', SELECTOR_OPTIONS.photo.lens_type);
    this.populateSelect('photo-custom', SELECTOR_OPTIONS.photo.custom);

    // Painting/Drawing settings
    this.populateSelect('painting-style', SELECTOR_OPTIONS.painting_drawing.style);
    this.populateSelect('painting-colors', SELECTOR_OPTIONS.painting_drawing.colors);
    this.populateSelect('painting-custom', SELECTOR_OPTIONS.painting_drawing.custom);

    // View settings
    this.populateSelect('view-perspective', SELECTOR_OPTIONS.view.perspective);
    this.populateSelect('view-distance', SELECTOR_OPTIONS.view.distance);

    // Subject settings
    this.populateSelect('subject-characteristic', SELECTOR_OPTIONS.subject.characteristic);
    this.populateSelect('subject-clothes', SELECTOR_OPTIONS.subject.clothes);
    this.populateSelect('subject-action', SELECTOR_OPTIONS.subject.action);
    this.populateSelect('subject-top-type', SELECTOR_OPTIONS.subject.top_type);
    this.populateSelect('subject-bottom-type', SELECTOR_OPTIONS.subject.bottom_type);
    this.populateSelect('subject-accessories', SELECTOR_OPTIONS.subject.accessories);
    this.populateSelect('subject-weapon', SELECTOR_OPTIONS.subject.weapon);

    // Scene settings
    this.populateSelect('scene-1', SELECTOR_OPTIONS.scene.scene_1);
    this.populateSelect('scene-2', SELECTOR_OPTIONS.scene.scene_2);

    // Lighting settings
    this.populateSelect('lighting-1', SELECTOR_OPTIONS.lighting.lighting_1);
    this.populateSelect('lighting-2', SELECTOR_OPTIONS.lighting.lighting_2);
  }

  // Helper to populate a select element
  populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options (keep the first placeholder option)
    select.innerHTML = '<option value="">Select...</option>';

    // Add options from data
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
  }

  // Attach event listeners to all form elements
  attachEventListeners() {
    // Text inputs
    document.getElementById('prompt').addEventListener('input', () => this.updateOutput());
    document.getElementById('negative_prompt').addEventListener('input', () => this.updateOutput());

    // Type radio buttons
    document.querySelectorAll('input[name="type"]').forEach(radio => {
      radio.addEventListener('change', () => this.handleTypeChange());
    });

    // All select dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      select.addEventListener('change', () => this.updateOutput());
    });

    // Action buttons
    document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('random-btn').addEventListener('click', () => this.randomizeSelectors());
    document.getElementById('save-btn').addEventListener('click', () => this.saveState());
    document.getElementById('load-btn').addEventListener('click', () => this.loadState());
  }

  // Handle type change (photo vs painting/drawing)
  handleTypeChange() {
    const selectedType = document.querySelector('input[name="type"]:checked').value;
    const photoSettings = document.getElementById('photo-settings');
    const paintingSettings = document.getElementById('painting-settings');

    if (selectedType === 'photo') {
      photoSettings.classList.add('active');
      paintingSettings.classList.remove('active');
    } else {
      photoSettings.classList.remove('active');
      paintingSettings.classList.add('active');
    }

    this.updateOutput();
  }

  // Update JSON output
  updateOutput() {
    this.generator.updateOutput();
  }

  // Copy JSON to clipboard
  copyToClipboard() {
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.select();
    document.execCommand('copy');
    this.showToast('JSON copied to clipboard!');
  }

  // Randomize all selector fields (exclude text inputs)
  randomizeSelectors() {
    // Get all select elements
    const selects = document.querySelectorAll('select');

    selects.forEach(select => {
      const options = select.options;
      if (options.length > 1) {
        // Random index from 1 to length-1 (skip placeholder at index 0)
        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        select.selectedIndex = randomIndex;
      }
    });

    this.updateOutput();
    this.showToast('Selectors randomized!');
  }

  // Save current state to localStorage
  saveState() {
    const state = this.generator.updateState();
    localStorage.setItem('promptMakerState', JSON.stringify(state));
    this.showToast('State saved!');
  }

  // Load state from localStorage
  loadState() {
    const savedState = localStorage.getItem('promptMakerState');
    if (!savedState) {
      this.showToast('No saved state found');
      return;
    }

    try {
      const state = JSON.parse(savedState);

      // Restore text inputs
      document.getElementById('prompt').value = state.prompt || '';
      document.getElementById('negative_prompt').value = state.negative_prompt || '';

      // Restore type
      if (state.type) {
        const typeRadio = document.querySelector(`input[name="type"][value="${state.type}"]`);
        if (typeRadio) {
          typeRadio.checked = true;
          this.handleTypeChange();
        }
      }

      // Restore subject settings
      if (state.subject) {
        document.getElementById('subject-characteristic').value = state.subject.characteristic || '';
        document.getElementById('subject-clothes').value = state.subject.clothes || '';
        document.getElementById('subject-action').value = state.subject.action || '';
        document.getElementById('subject-top-type').value = state.subject.top_type || '';
        document.getElementById('subject-bottom-type').value = state.subject.bottom_type || '';
        document.getElementById('subject-accessories').value = state.subject.accessories || '';
        document.getElementById('subject-weapon').value = state.subject.weapon || '';
      }

      // Restore scene settings
      if (state.environment) {
        document.getElementById('scene-1').value = state.environment.scene_1 || '';
        document.getElementById('scene-2').value = state.environment.scene_2 || '';
      }

      // Restore view settings
      if (state.view) {
        document.getElementById('view-perspective').value = state.view.perspective || '';
        document.getElementById('view-distance').value = state.view.distance || '';
      }

      // Restore lighting settings
      if (state.lighting) {
        document.getElementById('lighting-1').value = state.lighting.lighting_1 || '';
        document.getElementById('lighting-2').value = state.lighting.lighting_2 || '';
      }

      // Restore type-specific settings
      if (state.style) {
        if (state.style.photo) {
          document.getElementById('photo-device').value = state.style.photo.device || '';
          document.getElementById('photo-lens-type').value = state.style.photo.lens_type || '';
          document.getElementById('photo-custom').value = state.style.photo.custom || '';
        }
        if (state.style.painting_drawing) {
          document.getElementById('painting-style').value = state.style.painting_drawing.style || '';
          document.getElementById('painting-colors').value = state.style.painting_drawing.colors || '';
          document.getElementById('painting-custom').value = state.style.painting_drawing.custom || '';
        }
      }

      this.updateOutput();
      this.showToast('State loaded!');
    } catch (error) {
      console.error('Error loading state:', error);
      this.showToast('Error loading state');
    }
  }

  // Show toast notification
  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PromptApp();
});
