# Audio Assets

This directory contains BGM and SFX files for The Accounting Quest. 

## 📁 Required Audio Files

Place audio files in this directory with these exact names:

### Background Music (BGM)

#### Level 1 BGM
- **bgm_level1.mp3** - Looping background music for Level 1 (Lemonade Stand)
  - Title: "Airship Serenity" by Kevin MacLeod
  - Source: Incompetech (https://incompetech.com)
  - Duration: 4:00
  - Mood: Calming, Uplifting, Educational
  - Format: MP3
  - License: Creative Commons: By Attribution 4.0 (CC-BY-4.0)

#### Level 2 BGM
- **bgm_level2.mp3** - Looping background music for Level 2 (Lemonade Corporation)
  - Title: "Bit Quest" by Kevin MacLeod
  - Source: Incompetech (https://incompetech.com)
  - Duration: 3:12
  - Mood: Bouncy, Bright, Energetic
  - Format: MP3
  - License: Creative Commons: By Attribution 4.0 (CC-BY-4.0)

#### Level 3 BGM
- **bgm_level3.mp3** - Looping background music for Level 3 (Lemonade Group)
  - Title: "Level Up" by Kevin MacLeod
  - Source: Incompetech (https://incompetech.com)
  - Duration: 3:39
  - Mood: Energetic, Complex, Dynamic
  - Format: MP3
  - License: Creative Commons: By Attribution 4.0 (CC-BY-4.0)

### Sound Effects (SFX)
- **sfx_transaction.mp3** - Plays when a journal entry is recorded
  - Duration: 0.3-0.5 seconds
  - Source: Interface Sounds (Kenney) - click/positive sound
  
- **sfx_success.mp3** - Plays when quiz answer is correct
  - Duration: 0.5-1 second
  - Source: UI Audio (Kenney) - success/positive sound
  
- **sfx_error.mp3** - Plays when error occurs
  - Duration: 0.3-0.5 seconds
  - Source: UI Audio (Kenney) - error/negative sound

- **sfx_dialog.mp3** - Plays when dialog appears or character speaks
  - Duration: 0.2-0.5 seconds
  - Source: UI Audio (Kenney) - notification/beep sound

## 🎵 Audio Sources & Attribution

### BGM Source: Incompetech (Kevin MacLeod)
Background music sourced from **Incompetech** (https://incompetech.com), created by Kevin MacLeod.

**License:** [Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
- ✅ Free for commercial use
- ✅ Free for educational use
- ✅ Attribution required (included below)
- ✅ Can be modified

**Assets Used:**
1. **Airship Serenity** (Level 1 - Lemonade Stand BGM)
   - Artist: Kevin MacLeod
   - URL: https://incompetech.com/music/royalty-free/music.html
   - Duration: 4:00
   - License: CC-BY-4.0

2. **Bit Quest** (Level 2 - Lemonade Corporation BGM)
   - Artist: Kevin MacLeod
   - URL: https://incompetech.com/music/royalty-free/music.html
   - Duration: 3:12
   - License: CC-BY-4.0

3. **Level Up** (Level 3 - Lemonade Group BGM)
   - Artist: Kevin MacLeod
   - URL: https://incompetech.com/music/royalty-free/music.html
   - Duration: 3:39
   - License: CC-BY-4.0

### SFX Source: Kenney.nl
All SFX sourced from **Kenney** (https://kenney.nl/assets), a professional game asset creator.

**License:** [Creative Commons CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- ✅ Free for commercial use
- ✅ Free for educational use
- ✅ No attribution required
- ✅ Can be modified

**Assets Used:**
1. **Interface Sounds** (100 interface click and button sounds)
   - URL: https://kenney.nl/assets/interface-sounds
   - Version: 1.0
   
2. **UI Audio** (50 UI interaction sounds)
   - URL: https://kenney.nl/assets/ui-audio
   - Version: 1.0

3. **Voiceover Pack** (optional: 90 character voice clips)
   - URL: https://kenney.nl/assets/voiceover-pack
   - Version: 1.0
   - Currently unused but available for future character voice integration

### Alternative Sources
If you prefer different audio:

1. **Pixabay Music** (https://pixabay.com/music/)
   - CC0 public domain
   - High quality, no attribution required

2. **Incompetech** (https://incompetech.com/)
   - CC-BY-3.0 licensed
   - Kevin MacLeod's high-quality game music

3. **Free SFX** (https://www.freesoundeffects.com/)
   - Various licenses - verify before use

## 📥 How to Install Audio Files

### Option 1: Download from Kenney (Recommended)
1. Visit https://kenney.nl/assets/interface-sounds → Download ZIP
2. Visit https://kenney.nl/assets/ui-audio → Download ZIP
3. Extract the ZIPs
4. Select 4 files matching the Mood/Duration above
5. Rename and place in this directory:
   - `sfx_transaction.mp3` (from Interface Sounds - click)
   - `sfx_dialog.mp3` (from UI Audio - notification/beep)
   - `sfx_success.mp3` (from UI Audio - positive)
   - `sfx_error.mp3` (from UI Audio - negative/error)

### Option 2: Download All-in-1 Bundle
Visit https://kenney.itch.io/kenney-game-assets (free/pay-what-you-want)
- Includes all Kenney assets updated regularly

## ⚙️ Implementation Notes

- Audio files are **optional** - the game works without them (graceful fallback)
- If files are missing, console warnings appear but gameplay continues
- Audio is loaded in `src/scenes/BootScene.ts` and initialized in `src/scenes/VNScene.ts`
- Volume is controlled via GameSettings: `musicVolume: 0.7`, `sfxVolume: 0.8`
- See `src/managers/AudioManager.ts` for implementation details

## 📄 License Attribution

**The Accounting Quest Audio Assets License:**

**Background Music (Incompetech):**

All BGM tracks are by Kevin MacLeod and licensed under Creative Commons: By Attribution 4.0.
- https://creativecommons.org/licenses/by/4.0/

Required Attribution Format:
- "Airship Serenity" Kevin MacLeod (incompetech.com)
- "Bit Quest" Kevin MacLeod (incompetech.com)
- "Level Up" Kevin MacLeod (incompetech.com)

**Sound Effects (Kenney.nl):**
- By Kenney (https://kenney.nl/assets)
- Licensed under Creative Commons CC0 1.0 Universal
- https://creativecommons.org/publicdomain/zero/1.0/
- No attribution required but appreciated

**Assets Used:**
- Interface Sounds (100 interface click and button sounds)
- UI Audio (50 UI interaction sounds)

## 🚀 Testing

After adding audio files:
```bash
npm run dev
```

Open the game and:
1. Click dialogs → should hear `sfx_dialog.mp3`
2. Record transaction → should hear `sfx_transaction.mp3`
3. Answer quiz correctly → should hear `sfx_success.mp3`
4. Answer quiz incorrectly → should hear `sfx_error.mp3`

If no sound plays, check browser console for warnings (DevTools → Console).
