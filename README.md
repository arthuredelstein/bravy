# bravy

`bravy` is a tool for helping with some brave-core development tasks.

## Usage

### `chromium_src` overrides

Creates a template `chromium_src` override of a specific Chromium file. Examples:
```
bravy override third_party/blink/renderer/modules/eventsource/event_source.h
bravy override third_party/blink/renderer/modules/eventsource/event_source.cc
bravy override third_party/blink/renderer/modules/eventsource/event_source.cc --both
```

### Feature flag
Create a template feature flag (adds code to several files)
`bravy flag kHttpsByDefault`

