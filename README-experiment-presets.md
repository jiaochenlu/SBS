# Experiment Presets Configuration

This document explains how the experiment presets are configured and how to extend them.

## Configuration File

The experiment presets are now stored in `experiment-presets-config.json` instead of being hard-coded in the JavaScript.

### File Structure

```json
{
  "version": "1.0",
  "description": "Experiment preset configurations for SBS platform",
  "presets": [
    {
      "id": "unique-preset-id",
      "name": "Display Name",
      "description": "Description shown as tooltip",
      "configuration": {
        "dataSchema": "chat-singleturn|chat-multiturn|search",
        "dataSource": "real-time-scraping|upload-local|import-scrape",
        "querySet": "ad-hoc|upload-query" // optional
      }
    }
  ]
}
```

## Available Configuration Options

### Data Schema
- `chat-singleturn`: Single-turn chat conversations
- `chat-multiturn`: Multi-turn chat conversations  
- `search`: Search result data

### Data Source
- `real-time-scraping`: Real-time data scraping
- `upload-local`: Upload local scrape result files
- `import-scrape`: Import scrape results from URL

### Query Set (optional)
- `ad-hoc`: Ad-hoc queries provided by judges
- `upload-query`: Upload predefined query sets

## Adding New Presets

To add a new experiment preset:

1. Open `experiment-presets-config.json`
2. Add a new preset object to the `presets` array
3. Provide a unique `id`, descriptive `name`, and `configuration`
4. Save the file - changes will be loaded automatically when the page is refreshed

### Example: Adding a new preset

```json
{
  "id": "custom-chat-experiment",
  "name": "Custom Chat Quality Experiment",
  "description": "Custom experiment for evaluating chat quality",
  "configuration": {
    "dataSchema": "chat-singleturn",
    "dataSource": "real-time-scraping",
    "querySet": "ad-hoc"
  }
}
```

## Migration Benefits

- **Maintainability**: No need to edit JavaScript code to add/modify presets
- **Flexibility**: Easy to customize configurations without code changes
- **Future-ready**: Can be easily extended to load from an API endpoint
- **Validation**: Built-in error handling and fallback to hard-coded presets

## Development Setup

For local development, you need to serve the files through an HTTP server to avoid CORS issues when loading the config file:

```bash
# Using Node.js http-server
npx http-server -p 8000

# Using Python (if available)
python -m http.server 8000

# Then access the page at:
# http://localhost:8000/create-experiment.html
```

## Future Enhancements

The configuration system is designed to be easily extended to:
- Load presets from a REST API endpoint
- Support user-defined custom presets
- Add validation rules for preset configurations
- Support preset versioning and migration

## Troubleshooting

**Problem**: Dropdown shows no experiment type options
**Solution**: Make sure you're accessing the page through an HTTP server (not file://) to avoid CORS restrictions when loading the config file.

**Problem**: Config file changes don't appear
**Solution**: Refresh the page after making changes to the config file.