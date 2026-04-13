# The Beat 515 - Metadata Update Options

## Current Song Metadata Update Methods

There are **3 ways** to update the currently playing song on your website:

---

## Option 1: Manual Updates (Admin Panel) ✅ WORKING NOW
**Best for:** Quick manual updates when needed

### How to use:
1. Go to: https://project-init-27.preview.emergentagent.com/admin
2. Login with DJ or Admin credentials
3. Click "Now Playing" tab
4. Enter: Song Title, Artist, Album
5. Click "UPDATE NOW PLAYING"

**Credentials:**
- DJ: `dj@thebeat515.com` / `DJBeat515!`
- Admin: `admin@thebeat515.com` / `Beat515Admin!`

---

## Option 2: Webhook API (Recommended for Automation) ✅ WORKING NOW
**Best for:** Automatic updates from broadcasting software

### Endpoint:
```
POST https://project-init-27.preview.emergentagent.com/api/stream/update-metadata
```

### Parameters:
- `song_title` (required): Song name
- `artist` (optional): Artist name
- `album` (optional): Album name

### Example Usage:

**cURL:**
```bash
curl -X POST "https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=Flowers&artist=Miley%20Cyrus&album=Endless%20Summer%20Vacation"
```

**Python:**
```python
import requests

url = "https://project-init-27.preview.emergentagent.com/api/stream/update-metadata"
params = {
    "song_title": "Flowers",
    "artist": "Miley Cyrus",
    "album": "Endless Summer Vacation"
}
requests.post(url, params=params)
```

**JavaScript:**
```javascript
const url = 'https://project-init-27.preview.emergentagent.com/api/stream/update-metadata';
const params = new URLSearchParams({
    song_title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation'
});

fetch(`${url}?${params}`, { method: 'POST' });
```

---

## Option 3: Broadcasting Software Integration

### SAM Broadcaster Cloud/Pro
1. Go to **Settings** → **Web Request**
2. Enable "Send Now Playing Info to URL"
3. Set URL to:
   ```
   https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=%t&artist=%a&album=%l
   ```
4. SAM will automatically update your site when songs change!

### RadioDJ
1. Go to **Options** → **Internet Broadcasting**
2. Under "Song Change URL", add:
   ```
   https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=$artist$&artist=$title$
   ```
3. Enable "Send Song Updates"

### BUTT (Broadcast Using This Tool)
1. Go to **Settings** → **Server**
2. In "Song Update URL" field, paste:
   ```
   https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=%song%&artist=%artist%
   ```

### Station Playlist Creator
1. **Tools** → **Options** → **Web Hook**
2. Add webhook URL:
   ```
   https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=%title%&artist=%artist%&album=%album%
   ```

### Rocket Broadcaster
1. **Settings** → **Metadata**
2. Set "HTTP POST URL":
   ```
   https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=%TITLE%&artist=%ARTIST%
   ```

---

## Option 4: Live365 Direct Metadata (Not Currently Available)
**Status:** ❌ Not working - Live365 doesn't expose public metadata endpoints

The backend attempts to fetch metadata from Live365 every 2 minutes, but Live365's streaming service doesn't provide public access to real-time metadata without authentication.

**Possible solutions:**
1. Contact Live365 support and request API access
2. Use one of the methods above instead
3. If you have Live365 API credentials, provide them and we can integrate it

---

## How It Works

1. When metadata is updated (via any method), it:
   - Updates "Now Playing" on the home page
   - Adds the song to "Recently Played" history
   - Broadcasts the change to all connected listeners

2. The frontend auto-refreshes every 2 minutes to show the latest song

3. Recently Played page shows complete history with timestamps

---

## Testing the Webhook

Try this in your browser or command line:
```
https://project-init-27.preview.emergentagent.com/api/stream/update-metadata?song_title=My%20Test%20Song&artist=Test%20Artist
```

Check the result at:
```
https://project-init-27.preview.emergentagent.com
```

---

## Questions?

- **Which broadcasting software are you using?** I can provide specific setup instructions.
- **Do you have Live365 API credentials?** If yes, we can integrate direct metadata fetching.
- **Need help setting up the webhook?** Let me know which method you'd like to use!
