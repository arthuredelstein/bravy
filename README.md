# bravy

`bravy` is a tool for helping with some brave-core development tasks.

## Installation

```
cd bravy
npm install -g .
```

## Usage

First go to your `brave` directory.

```
cd brave-browser/src/brave
```

### `chromium_src` overrides

Creates a template `chromium_src` override of a specific Chromium file. Examples:
```
bravy override third_party/blink/renderer/modules/eventsource/event_source.h
bravy override third_party/blink/renderer/modules/eventsource/event_source.cc
```
or
```
bravy override third_party/blink/renderer/modules/eventsource/event_source --both
```

### Feature flag
Create a template feature flag (adds code to several files)
```
bravy flag kHttpsByDefault
```

