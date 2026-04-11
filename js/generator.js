// JSON generation logic
class PromptGenerator {
  constructor() {
    this.formState = {};
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
        accessories: document.getElementById('subject-accessories').value,
        weapon: document.getElementById('subject-weapon').value
      },
      environment: {
        scene_1: document.getElementById('scene-1').value,
        scene_2: document.getElementById('scene-2').value
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

    // Add type-specific fields
    if (state.type === 'photo') {
      state.style = {
        photo: {
          device: document.getElementById('photo-device').value,
          lens_type: document.getElementById('photo-lens-type').value,
          custom: document.getElementById('photo-custom').value
        },
        painting_drawing: null
      };
    } else {
      state.style = {
        photo: null,
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
    
    // Clean up empty values
    const cleaned = this.cleanEmptyValues(state);
    
    // Format with proper indentation
    return JSON.stringify(cleaned, null, 2);
  }

  // Remove empty/null values from object
  cleanEmptyValues(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj;
    }

    const cleaned = {};
    for (const key in obj) {
      const value = obj[key];
      
      if (value === null || value === undefined || value === '') {
        continue;
      }

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

  // Update output textarea
  updateOutput() {
    const jsonOutput = this.generateJSON();
    document.getElementById('json-output').value = jsonOutput;
  }
}
