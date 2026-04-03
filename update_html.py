import glob
import os

BASE = 'C:/Users/money/Documents/Modelos Personalizados do Office/.claude/worktrees/beautiful-dhawan'

html_files = glob.glob(os.path.join(BASE, '*.html'))

old_fonts_1 = 'href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Source+Sans+3:wght@400;600;700&display=swap"'
old_fonts_2 = 'href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Space+Grotesk:wght@400;500;700&family=Source+Sans+3:wght@400;600;700&display=swap"'
new_fonts = 'href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"'

old_theme = 'content="#0E1A32"'
new_theme = 'content="#141414"'

for f in html_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()

    original = content
    content = content.replace(old_fonts_1, new_fonts)
    content = content.replace(old_fonts_2, new_fonts)
    content = content.replace(old_theme, new_theme)

    if content != original:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated: {os.path.basename(f)}')
    else:
        print(f'No changes: {os.path.basename(f)}')
