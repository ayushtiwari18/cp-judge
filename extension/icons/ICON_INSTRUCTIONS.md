# Extension Icons

## Requirements

The extension needs three icon sizes:

- **16x16** - Toolbar icon (small)
- **48x48** - Extension management page
- **128x128** - Chrome Web Store & installation

## Creating Icons

### Design Guidelines

**Theme**: Lightning bolt / Code execution  
**Colors**: Purple gradient (#667eea to #764ba2)  
**Style**: Modern, flat, minimalist  
**Background**: Transparent PNG  

### Recommended Tools

1. **Figma** (Free) - https://figma.com
2. **Canva** (Free) - https://canva.com
3. **Photoshop** (Paid)
4. **GIMP** (Free) - https://gimp.org

### Quick Icon Creation

**Option 1: Use Emoji as Temporary Icon**

1. Open any text-to-image tool
2. Use: ⚡ (lightning bolt emoji)
3. Add purple gradient background
4. Export at required sizes

**Option 2: Online Icon Generator**

- https://icon.kitchen/ (PWA Icon Generator)
- https://www.logomaker.com/

### File Naming

```
icons/
  icon16.png   # 16x16 px
  icon48.png   # 48x48 px
  icon128.png  # 128x128 px
```

## Current Status

⚠️ **Icons are currently placeholder references in manifest.json**

The extension will work without icons, but Chrome will show a default placeholder.

### To Add Icons

1. Create PNG files following guidelines above
2. Save as `icon16.png`, `icon48.png`, `icon128.png`
3. Place in `extension/icons/` directory
4. Reload extension

## Design Inspiration

- [VS Code Icon](https://code.visualstudio.com/) - Simple, recognizable
- [GitHub Icon](https://github.com/) - Clean, iconic
- [Competitive Programming Helper](https://github.com/agrawal-d/cph) - Similar tool

## Brand Identity

**Primary Colors**:
- Purple: `#667eea`
- Dark Purple: `#764ba2`

**Symbol Ideas**:
- ⚡ Lightning bolt (speed)
- ▶️ Play button (execution)
- 🎯 Target (accuracy)
- {} Curly braces (code)

---

**Note**: Professional icon design recommended before Chrome Web Store submission.
