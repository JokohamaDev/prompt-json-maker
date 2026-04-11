# Prompt JSON Maker

A minimal, fast web application that converts user inputs into standardized JSON-formatted prompts for AI image generation platforms like Nano Banana, Grok Imagine, and Seedream v4.

**Version: 1.0**

## Features

- **Structured JSON Output**: Generate clean, machine-readable JSON prompts compatible with multiple AI image generation platforms
- **Intuitive Interface**: Easy-to-use form with categorized sections for prompt elements
- **Real-time Preview**: See JSON output update instantly as you fill in the form
- **Random Selector**: Randomize all dropdown fields for quick inspiration
- **Save/Load**: Save your prompt configurations to browser localStorage and load them later
- **Copy to Clipboard**: One-click copy of the generated JSON
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Automatically adapts to system preferences
- **Extensible**: Easy to add new options and categories by editing the data source

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Deployment**: GitHub Pages (static site)
- **Storage**: Browser localStorage
- **No build process required**

## Project Structure

```
/
├── index.html          # Main application page
├── css/
│   └── styles.css      # Minimal, fast styling
├── js/
│   ├── app.js         # Main application logic
│   ├── data.js        # Pre-defined selector options (extensible)
│   └── generator.js   # JSON generation logic
└── README.md          # This file
```

## How to Use

### Local Development

1. Clone this repository
2. Open `index.html` in your web browser
3. Fill in the form fields:
   - **Text Prompts**: Enter your main prompt and negative prompt
   - **Type**: Choose Photo, Painting, or Drawing
   - **Style Settings**: Configure device, lens, style, colors based on type
   - **View**: Set perspective and distance
   - **Subject**: Define characteristics, clothes, actions
   - **Scene**: Set environment details
   - **Lighting**: Configure lighting options
4. Watch the JSON output update in real-time
5. Use action buttons:
   - **Copy JSON**: Copy the output to clipboard
   - **Random Selector**: Randomize all dropdown fields
   - **Save**: Save current state to localStorage
   - **Load**: Load saved state from localStorage

### GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select the branch (usually `main` or `master`)
4. Save and wait for GitHub to deploy
5. Access your app at `https://yourusername.github.io/prompt-json-maker`

## JSON Schema

The generated JSON follows this standardized structure:

```json
{
  "prompt": "string",
  "negative_prompt": "string",
  "type": "photo|painting|drawing",
  "subject": {
    "characteristic": "string",
    "clothes": "string",
    "action": "string",
    "custom": "string"
  },
  "environment": {
    "scene_1": "string",
    "scene_2": "string"
  },
  "style": {
    "photo": {
      "device": "string",
      "lens_type": "string",
      "custom": "string"
    },
    "painting_drawing": {
      "style": "string",
      "colors": "string",
      "custom": "string"
    }
  },
  "view": {
    "perspective": "string",
    "distance": "string"
  },
  "lighting": {
    "lighting_1": "string",
    "lighting_2": "string"
  }
}
```

## Customization

### Adding New Options

Edit `js/data.js` to add new options to any dropdown:

```javascript
const SELECTOR_OPTIONS = {
  photo: {
    device: [
      "Your New Device",
      // ... existing options
    ]
  }
};
```

### Adding New Categories

1. Add the category to `SELECTOR_OPTIONS` in `js/data.js`
2. Add the corresponding HTML form elements in `index.html`
3. Update the JSON schema in `js/generator.js` if needed
4. Add event listeners in `js/app.js` if needed

## Supported Platforms

The JSON output is designed to be compatible with:
- Nano Banana (Gemini 2.5 Flash Image)
- Seedream v4
- Grok Imagine
- Most other AI image generation platforms that accept structured JSON prompts

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)