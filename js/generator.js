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
      prompt: document.getElementById('prompt')?.value || '',
      negative_prompt: document.getElementById('negative_prompt')?.value || '',
      type: document.querySelector('input[name="type"]:checked')?.value || 'photo',
      subject: {
        characteristic: document.getElementById('subject-characteristic')?.value || '',
        clothes: document.getElementById('subject-clothes')?.value || '',
        action: document.getElementById('subject-action')?.value || '',
        top_type: document.getElementById('subject-top-type')?.value || '',
        bottom_type: document.getElementById('subject-bottom-type')?.value || '',
        accessories: this.getMultiSelectValues('accessories-tags'),
        weapon: document.getElementById('subject-weapon')?.value || '',
        hair_color: document.getElementById('subject-hair-color')?.value || '',
        hair_style: document.getElementById('subject-hair-style')?.value || ''
      },
      environment: {
        scene_1: document.getElementById('scene-1')?.value || '',
        scene_2: document.getElementById('scene-2')?.value || '',
        effect: document.getElementById('scene-effect')?.value || '',
        photo_filter: document.getElementById('scene-photo-filter')?.value || ''
      },
      view: {
        perspective: document.getElementById('view-perspective')?.value || '',
        distance: document.getElementById('view-distance')?.value || ''
      },
      lighting: {
        lighting_1: document.getElementById('lighting-1')?.value || '',
        lighting_2: document.getElementById('lighting-2')?.value || ''
      }
    };

    if (state.type === 'photo') {
      state.style = {
        photo: {
          device: document.getElementById('photo-device')?.value || '',
          lens_type: document.getElementById('photo-lens-type')?.value || '',
          custom: document.getElementById('photo-custom')?.value || ''
        }
      };
    } else if (state.type === 'render') {
      state.style = {
        render: {
          style: document.getElementById('render-style')?.value || '',
          quality: document.getElementById('render-quality')?.value || '',
          engine: document.getElementById('render-engine')?.value || ''
        }
      };
    } else if (state.type === 'design') {
      state.style = {
        design: {
          type: document.getElementById('design-type')?.value || '',
          aesthetic: document.getElementById('design-aesthetic')?.value || '',
          reference: document.getElementById('design-reference')?.value || ''
        }
      };
    } else {
      state.style = {
        art: {
          style: document.getElementById('art-style')?.value || '',
          colors: document.getElementById('art-colors')?.value || '',
          medium: document.getElementById('art-medium')?.value || ''
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
  // Note: 'None' is excluded to handle placeholder values from select dropdowns
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

  // Generate sectioned natural language prompt
  generateNaturalLanguage() {
    const state = this.updateState();
    const sections = [];

    // Main prompt (no label)
    if (state.prompt) sections.push(state.prompt.trim());

    // Subject section
    const subParts = [];
    if (state.subject.characteristic) subParts.push(state.subject.characteristic.toLowerCase());
    if (state.subject.clothes) subParts.push(`in ${state.subject.clothes.toLowerCase()} clothes`);
    if (state.subject.hair_color || state.subject.hair_style) {
      const hair = [state.subject.hair_color, state.subject.hair_style].filter(Boolean).join(' ').toLowerCase();
      subParts.push(`with ${hair} hair`);
    }
    let subLine = subParts.length > 0 ? `A ${subParts.join(', ')} person` : '';
    if (state.subject.action) subLine += (subLine ? ', ' : '') + state.subject.action.toLowerCase();
    const cloths = [state.subject.top_type, state.subject.bottom_type].filter(Boolean).map(s => s.toLowerCase());
    if (cloths.length > 0) subLine += (subLine ? ', ' : '') + `wearing ${cloths.join(' and ')}`;
    if (state.subject.accessories?.length > 0) {
      subLine += (subLine ? ', ' : '') + `with ${state.subject.accessories.map(a => a.toLowerCase()).join(', ')}`;
    }
    if (state.subject.weapon) subLine += (subLine ? ', ' : '') + `holding a ${state.subject.weapon.toLowerCase()}`;
    if (subLine) sections.push(`Subject: ${subLine}.`);

    // Scene section
    const scnParts = [];
    if (state.environment.scene_1) scnParts.push(state.environment.scene_1.toLowerCase());
    if (state.environment.scene_2) scnParts.push(state.environment.scene_2.toLowerCase());
    if (scnParts.length > 0) scnParts[0] = `${scnParts[0]} setting`;
    if (state.environment.effect) scnParts.push(`${state.environment.effect.toLowerCase()} effect`);
    if (state.environment.photo_filter) scnParts.push(`${state.environment.photo_filter.toLowerCase()} filter`);
    if (scnParts.length > 0) sections.push(`Scene: ${this._cap(scnParts.join(', '))}.`);

    // View section
    const viewParts = [];
    if (state.view.perspective) viewParts.push(`${state.view.perspective.toLowerCase()} view`);
    if (state.view.distance) viewParts.push(`${state.view.distance.toLowerCase()} shot`);
    if (viewParts.length > 0) sections.push(`View: ${this._cap(viewParts.join(', '))}.`);

    // Lighting section
    const litParts = [];
    if (state.lighting.lighting_1) litParts.push(state.lighting.lighting_1.toLowerCase());
    if (state.lighting.lighting_2) litParts.push(state.lighting.lighting_2.toLowerCase());
    if (litParts.length > 0) sections.push(`Lighting: ${this._cap(litParts.join(' and '))} lighting.`);

    // Style section
    let styleLine = '';
    if (state.type === 'photo' && state.style?.photo) {
      const p = [];
      if (state.style.photo.device) p.push(`shot on ${state.style.photo.device}`);
      if (state.style.photo.lens_type) p.push(`${state.style.photo.lens_type} lens`);
      if (state.style.photo.custom) p.push(state.style.photo.custom.toLowerCase());
      if (p.length > 0) styleLine = p.join(', ');
    } else if (state.type === 'render' && state.style?.render) {
      const p = [];
      if (state.style.render.style) p.push(state.style.render.style.toLowerCase());
      if (state.style.render.quality) p.push(`${state.style.render.quality.toLowerCase()} quality`);
      if (state.style.render.engine) p.push(`made in ${state.style.render.engine}`);
      if (p.length > 0) styleLine = p.join(', ');
    } else if (state.style?.art) {
      const p = [];
      if (state.style.art.style) p.push(state.style.art.style.toLowerCase());
      if (state.style.art.colors) p.push(`${state.style.art.colors.toLowerCase()} colors`);
      if (state.style.art.medium) {
        const med = state.style.art.medium.toLowerCase();
        const surfaces = ['canvas', 'paper', 'digital tablet', 'mixed media', 'collage', 'woodblock'];
        p.push(surfaces.includes(med) ? `on ${med}` : `using ${med}`);
      }
      if (p.length > 0) styleLine = p.join(', ');
    } else if (state.style?.design) {
      const p = [];
      if (state.style.design.type) p.push(state.style.design.type.toLowerCase());
      if (state.style.design.aesthetic) p.push(`${state.style.design.aesthetic.toLowerCase()} aesthetic`);
      if (state.style.design.reference) p.push(`in the style of ${state.style.design.reference}`);
      if (p.length > 0) styleLine = p.join(', ');
    }
    if (styleLine) sections.push(`Style: ${this._cap(styleLine)}.`);

    // Negative prompt
    if (state.negative_prompt) sections.push(`Negative: ${state.negative_prompt.trim()}.`);

    return sections.join('\n');
  }

  // Capitalize first char
  _cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Get output based on current format
  getOutput() {
    const format = document.querySelector('input[name="output-format"]:checked')?.value || 'json';
    return format === 'json' ? this.generateJSON() : this.generateNaturalLanguage();
  }

  // Update output textarea with scramble animation
  updateOutput() {
    const output = this.getOutput();
    const textarea = document.getElementById('json-output');
    const format = document.querySelector('input[name="output-format"]:checked')?.value || 'json';
    textarea.classList.toggle('text-format', format === 'text');

    // Apply scramble text animation using Anime.js
    if (typeof anime !== 'undefined') {
      const chars = '⠁⠃⠇⡇⣇⣧⣿';
      const duration = 200;
      
      // Cancel any existing animation
      anime.remove(textarea);
      
      // Animate with scramble effect
      anime({
        targets: { progress: 0 },
        progress: 100,
        easing: 'easeInOutQuad',
        duration: duration,
        update: function(anim) {
          const progress = anim.animations[0].progress / 100;
          const revealLength = Math.floor(progress * output.length);
          
          let scrambled = '';
          for (let i = 0; i < output.length; i++) {
            if (i < revealLength) {
              scrambled += output[i];
            } else {
              if (output[i] === ' ' || output[i] === '\n') {
                scrambled += output[i];
              } else {
                scrambled += chars[Math.floor(Math.random() * chars.length)];
              }
            }
          }
          textarea.value = scrambled;
        },
        complete: function() {
          textarea.value = output;
        }
      });
    } else {
      textarea.value = output;
    }
  }
}
