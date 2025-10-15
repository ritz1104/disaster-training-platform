# Logo Update Instructions

## Steps to complete the logo update:

1. **Download your logo image** from the Google Drive link:
   https://drive.google.com/file/d/1Gl1S1rrml4jYa9Mrc4HOLHuLl2JxLgyU/view?usp=sharing

2. **Save the logo file** as `ndma-logo.jpg` in this directory:
   `client/public/ndma-logo.jpg`

3. **File format recommendations:**
   - Use JPG, PNG, or SVG format
   - Recommended size: 512x512 pixels or larger
   - Keep file size under 1MB for optimal loading

4. **Alternative file names** (if you prefer different format):
   - `ndma-logo.png`
   - `ndma-logo.svg`
   - `ndma-logo.webp`

5. **If using a different filename**, update the following files:
   - `/client/src/pages/Login.jsx` (line 44)
   - `/client/src/pages/Register.jsx` (line 45) 
   - `/client/src/components/common/NDMALogo.jsx` (line 21)

## Files Already Updated:
✅ Login page - now references `/ndma-logo.jpg`
✅ Register page - now references `/ndma-logo.jpg`  
✅ Navbar (NDMALogo component) - now uses image instead of SVG
✅ Added proper styling with rounded corners and object-contain

## After adding the logo file:
The logo will automatically appear in:
- Navbar (top-left with NDMA text)
- Login page (centered at top)
- Register page (centered at top)
- All other components using NDMALogo component