// JSON generation logic
class PromptGenerator {
  constructor() {
    this.formState = {};
  }

  // Get multi-select values as array (for accessories)
  getMultiSelectValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checked).map(cb => cb.value);
  }

  // Update form state from DOM elements
  updateState() {
    const state = {
      prompt: document.getElementById('prompt').value,
      negative_prompt: document.getElementById('negative_prompt').value,
      type: document.querySelector('input[name="type"]:checked')?.value || 'photo',
      subject: {
        characteristic: document.getElementById('subject-characteristic').value,
        clothes: document.getElementById('subject-clothes').value,
        action: document.getElementById('subject-action').value,
        top_type: document.getElementById('subject-top-type').value,
        bottom_type: document.getElementById('subject-bottom-type').value,
        accessories: this.getMultiSelectValues('accessories-tags'),
        weapon: document.getElementById('subject-weapon').value,
        hair_color: document.getElementById('subject-hair-color').value,
        hair_style: document.getElementById('subject-hair-style').value
      },
      environment: {
        scene_1: document.getElementById('scene-1').value,
        scene_2: document.getElementById('scene-2').value,
        effect: document.getElementById('scene-effect').value,
        photo_filter: document.getElementById('scene-photo-filter').value
      },
      view: {
        perspective: document.getElementById('view-perspective').value,
        distance: document.getElementById('view-distance').value
      },
      lighting: {
        lighting_1: document.getElementById('lighting-1').value,
        lighting_2: document.getElementById('lighting-2').value
      }
    };

    if (state.type === 'photo') {
      state.style = {
        photo: {
          device: document.getElementById('photo-device').value,
          lens_type: document.getElementById('photo-lens-type').value,
          custom: document.getElementById('photo-custom').value
        }
      };
    } else if (state.type === 'render') {
      state.style = {
        render: {
          style: document.getElementById('render-style').value,
          quality: document.getElementById('render-quality').value,
          engine: document.getElementById('render-engine').value
        }
      };
    } else {
      state.style = {
        painting_drawing: {
          style: document.getElementById('painting-style').value,
          colors: document.getElementById('painting-colors').value,
          custom: document.getElementById('painting-custom').value
        }
      };
    }

    this.formState = state;
    return state;
  }

  // Generate JSON from form state
  generateJSON() {
    const state = this.updateState();
    const cleaned = this.cleanEmptyValues(state);
    return JSON.stringify(cleaned, null, 2);
  }

  // Remove empty/null/"None" values from object
  cleanEmptyValues(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      const cleaned = obj.filter(item => item !== '' && item !== null && item !== undefined);
      return cleaned.length > 0 ? cleaned : null;
    }

    const cleaned = {};
    for (const key in obj) {
      const value = obj[key];
      if (value === null || value === undefined || value === '' || value === 'None') continue;
      if (Array.isArray(value) && value.length === 0) continue;

      if (typeof value === 'object') {
        const cleanedValue = this.cleanEmptyValues(value);
        if (cleanedValue !== null && Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  // Generate natural language prompt from state
  generateNaturalLanguage() {
    const state = this.updateState();
    const parts = [];

    const subjectParts = [];
    if (state.subject.characteristic) subjectParts.push(state.subject.characteristic.toLowerCase());
    if (state.subject.clothes) subjectParts.push(`in ${state.subject.clothes.toLowerCase()} clothes`);
    if (state.subject.hair_color || state.subject.hair_style) {
      const hair = [state.subject.hair_color, state.subject.hair_style].filter(Boolean).join(' ').toLowerCase();
      subjectParts.push(`with ${hair} hair`);
    }
    if (subjectParts.length > 0) parts.push(`A ${subjectParts.join(', ')} person`);

    if (state.subject.action) parts.push(state.subject.action.toLowerCase());

    const clothingParts = [];
    if (state.subject.top_type) clothingParts.push(state.subject.top_type.toLowerCase());
    if (state.subject.bottom_type) clothingParts.push(state.subject.bottom_type.toLowerCase());
    if (clothingParts.length > 0) parts.push(`wearing ${clothingParts.join(' and ')}`);

    if (state.subject.accessories && state.subject.accessories.length > 0) {
      parts.push(`with ${state.subject.accessories.map(a => a.toLowerCase()).join(', ')}`);
    }

    if (state.subject.weapon) parts.push(`holding a ${state.subject.weapon.toLowerCase()}`);

    const sceneParts = [];
    if (state.environment.scene_1) sceneParts.push(state.environment.scene_1.toLowerCase());
    if (state.environment.scene_2) sceneParts.push(state.environment.scene_2.toLowerCase());
    if (sceneParts.length > 0) parts.push(`in a ${sceneParts.join(' ')} setting`);

    if (state.environment.effect) parts.push(`${state.environment.effect.toLowerCase()} effect`);
    if (state.environment.photo_filter) parts.push(`${state.environment.photo_filter.toLowerCase()} filter`);

    if (state.view.perspective) parts.push(`${state.view.perspective.toLowerCase()} view`);
    if (state.view.distance) parts.push(`${state.view.distance.toLowerCase()} shot`);

    const lightingParts = [];
    if (state.lighting.lighting_1) lightingParts.push(state.lighting.lighting_1.toLowerCase());
    if (state.lighting.lighting_2) lightingParts.push(state.lighting.lighting_2.toLowerCase());
    if (lightingParts.length > 0) parts.push(`with ${lightingParts.join(' and ')} lighting`);

    if (state.type === 'photo' && state.style?.photo) {
      const photoParts = [];
      if (state.style.photo.device) photoParts.push(`shot on ${state.style.photo.device}`);
      if (state.style.photo.lens_type) photoParts.push(`${state.style.photo.lens_type} lens`);
      if (state.style.photo.custom) photoParts.push(state.style.photo.custom.toLowerCase());
      if (photoParts.length > 0) parts.push(photoParts.join(', '));
    } else if (state.type === 'render' && state.style?.render) {
      const renderParts = [];
      if (state.style.render.style) renderParts.push(state.style.render.style.toLowerCase());
      if (state.style.render.quality) renderParts.push(`${state.style.render.quality.toLowerCase()} quality`);
      if (state.style.render.engine) renderParts.push(`made in ${state.style.render.engine}`);
      if (renderParts.length > 0) parts.push(renderParts.join(', '));
    } else if (state.style?.painting_drawing) {
      const artParts = [];
      if (state.style.painting_drawing.style) artParts.push(state.style.painting_drawing.style.toLowerCase());
      if (state.style.painting_drawing.colors) artParts.push(`${state.style.painting_drawing.colors.toLowerCase()} colors`);
      if (state.style.painting_drawing.custom) artParts.push(state.style.painting_drawing.custom.toLowerCase());
      if (artParts.length > 0) parts.push(`in ${artParts.join(', ')} style`);
    }

    if (state.prompt) parts.unshift(state.prompt);

    const result = parts.join(', ');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Get output based on current format
  getOutput() {
    const format = document.querySelector('input[name="output-format"]:checked')?.value || 'json';
    return format === 'json' ? this.generateJSON() : this.generateNaturalLanguage();
  }

  // Update output textarea
  updateOutput() {
    const output = this.getOutput();
    const textarea = document.getElementById('json-output');
    const format = document.querySelector('input[name="output-format"]:checked')?.value || 'json';
    textarea.value = output;
    textarea.classList.toggle('text-format', format === 'text');
  }
}
