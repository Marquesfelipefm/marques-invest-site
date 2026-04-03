import re

CSS_PATH = 'C:/Users/money/Documents/Modelos Personalizados do Office/.claude/worktrees/beautiful-dhawan/assets/css/styles.css'

with open(CSS_PATH, 'r', encoding='utf-8') as f:
    css = f.read()

# PHASE 1: Replace font import
css = css.replace(
    '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@600;700&display=swap");',
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap");'
)

# PHASE 2: Replace FIRST :root block
old_root1 = """:root {
  --bg: #060606;
  --bg-soft: #0f1013;
  --surface: rgba(13, 13, 17, 0.9);
  --surface-strong: #111217;
  --surface-dark: linear-gradient(160deg, #050505 0%, #0b0c10 54%, #12141a 100%);
  --line: rgba(216, 184, 76, 0.14);
  --line-strong: rgba(216, 184, 76, 0.24);
  --text: #fbf8f1;
  --text-soft: rgba(251, 248, 241, 0.8);
  --text-faint: rgba(251, 248, 241, 0.56);
  --accent: #d8b84c;
  --accent-deep: #f0d67a;
  --accent-soft: rgba(216, 184, 76, 0.14);
  --success: #58d08a;
  --danger: #ff8b8b;
  --panel-text: #fff8e4;
  --panel-muted: rgba(255, 248, 228, 0.72);
  --shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
  --shadow-soft: 0 20px 44px rgba(0, 0, 0, 0.24);
}"""

new_root = """:root {
  /* Background scale - warm charcoal */
  --bg: #141414;
  --bg-soft: #1a1a1a;
  --bg-elevated: #1f1f1f;
  --surface: rgba(26, 26, 26, 0.95);
  --surface-strong: #222222;
  --surface-dark: linear-gradient(160deg, #101010 0%, #141414 54%, #1a1a1a 100%);

  /* Gold accent - refined */
  --accent: #c9a84c;
  --accent-deep: #dfc273;
  --accent-muted: #8a6e2f;
  --accent-soft: rgba(201, 168, 76, 0.10);

  /* Text hierarchy */
  --text: #f0ede8;
  --text-soft: #9a9288;
  --text-faint: rgba(154, 146, 136, 0.72);

  /* Lines */
  --line: rgba(154, 146, 136, 0.12);
  --line-strong: rgba(154, 146, 136, 0.22);

  /* Shadows - layered system */
  --shadow: 0 20px 48px rgba(0, 0, 0, 0.22), 0 6px 16px rgba(0, 0, 0, 0.10);
  --shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);

  /* Semantic */
  --success: #58d08a;
  --danger: #ff8b8b;
  --panel-text: #f0ede8;
  --panel-muted: #9a9288;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radius - architectural, not bubbly */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Transitions */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --duration: 0.35s;
}"""

css = css.replace(old_root1, new_root)

# PHASE 3: Replace SECOND :root block
old_root2 = """/* Final brand system: Marques Invest */
:root {
  --bg: #0e1a32;
  --bg-soft: #142649;
  --surface: rgba(16, 27, 52, 0.9);
  --surface-strong: #162746;
  --surface-dark: linear-gradient(180deg, rgba(11, 20, 39, 0.96), rgba(15, 27, 51, 0.92));
  --line: rgba(212, 166, 70, 0.14);
  --line-strong: rgba(212, 166, 70, 0.26);
  --text: #f6f3ee;
  --text-soft: rgba(246, 243, 238, 0.82);
  --text-faint: rgba(246, 243, 238, 0.58);
  --accent: #d4a646;
  --accent-deep: #e0b85c;
  --accent-soft: rgba(212, 166, 70, 0.14);
  --panel-text: #f6f3ee;
  --panel-muted: rgba(246, 243, 238, 0.76);
  --shadow: 0 28px 80px rgba(2, 7, 20, 0.32);
  --shadow-soft: 0 20px 46px rgba(2, 7, 20, 0.22);
}"""

css = css.replace(old_root2, '/* Brand variables consolidated into single :root above */')

# PHASE 4: Replace body backgrounds
css = css.replace(
    """background:
    radial-gradient(circle at top left, rgba(216, 184, 76, 0.15), transparent 24%),
    radial-gradient(circle at top right, rgba(216, 184, 76, 0.08), transparent 22%),
    linear-gradient(180deg, #020202 0%, #070809 48%, #0d0f13 100%);""",
    'background: #141414;'
)

# Remove body pseudo-elements
css = css.replace(
    '''body::before,
body::after {
  content: "";
  position: fixed;
  z-index: 0;
  pointer-events: none;
  filter: blur(24px);
}

body::before {
  top: -90px;
  left: -80px;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  background: rgba(216, 184, 76, 0.16);
}

body::after {
  right: -110px;
  bottom: 120px;
  width: 340px;
  height: 340px;
  border-radius: 999px;
  background: rgba(216, 184, 76, 0.08);
}''',
    '''body::before,
body::after {
  display: none;
}'''
)

# Body background override at line 2579
css = css.replace(
    """body {
  background:
    radial-gradient(circle at top left, rgba(212, 166, 70, 0.12), transparent 20%),
    radial-gradient(circle at bottom right, rgba(44, 76, 128, 0.22), transparent 32%),
    linear-gradient(180deg, #0a1326 0%, #0e1a32 44%, #132241 100%);
}

body::before {
  top: -140px;
  left: -80px;
  width: 360px;
  height: 360px;
  background: rgba(212, 166, 70, 0.12);
}

body::after {
  right: -120px;
  bottom: 120px;
  width: 420px;
  height: 420px;
  background: rgba(62, 102, 160, 0.12);
}""",
    '/* Body background consolidated above */'
)

# Final refinement body background
css = css.replace(
    """/* Final refinement: Marques Invest dark heritage system */

body {
  background:
    radial-gradient(circle at 8% 8%, rgba(212, 166, 70, 0.12), transparent 18%),
    radial-gradient(circle at 92% 12%, rgba(33, 56, 97, 0.32), transparent 24%),
    linear-gradient(180deg, #08111f 0%, #0e1a32 42%, #132241 100%);
}

body::before {
  background: radial-gradient(circle, rgba(212, 166, 70, 0.12), transparent 72%);
}

body::after {
  background: radial-gradient(circle, rgba(34, 57, 102, 0.28), transparent 72%);
}""",
    '/* Body background consolidated into single definition */'
)

# PHASE 5: Replace font references
css = css.replace('font-family: "Source Sans 3", sans-serif;', 'font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;')
css = css.replace('font-family: "Space Grotesk", sans-serif;', 'font-family: "Inter", sans-serif;')
css = css.replace('"Montserrat", "Source Sans 3", sans-serif', '"Inter", sans-serif')
css = css.replace('"Cinzel", Georgia, serif', '"Cormorant Garamond", Georgia, serif')

# PHASE 6: Navy blue background colors -> charcoal
navy_to_charcoal = [
    ('rgba(14, 26, 50,', 'rgba(26, 26, 26,'),
    ('rgba(13, 24, 46,', 'rgba(22, 22, 22,'),
    ('rgba(10, 19, 37,', 'rgba(18, 18, 18,'),
    ('rgba(18, 31, 58,', 'rgba(28, 28, 28,'),
    ('rgba(16, 27, 52,', 'rgba(24, 24, 24,'),
    ('rgba(12, 21, 41,', 'rgba(20, 20, 20,'),
    ('rgba(12, 22, 42,', 'rgba(20, 20, 20,'),
    ('rgba(19, 35, 67,', 'rgba(28, 28, 28,'),
    ('rgba(11, 20, 39,', 'rgba(18, 18, 18,'),
    ('rgba(17, 30, 57,', 'rgba(26, 26, 26,'),
    ('rgba(15, 27, 50,', 'rgba(24, 24, 24,'),
    ('rgba(20, 38, 73,', 'rgba(30, 30, 30,'),
    ('rgba(7, 14, 28,', 'rgba(14, 14, 14,'),
    ('rgba(33, 56, 97,', 'rgba(40, 40, 40,'),
    ('rgba(44, 76, 128,', 'rgba(50, 50, 50,'),
    ('rgba(62, 102, 160,', 'rgba(50, 50, 50,'),
    ('rgba(34, 57, 102,', 'rgba(40, 40, 40,'),
    ('rgba(8, 8, 10,', 'rgba(20, 20, 20,'),
    ('rgba(9, 10, 13,', 'rgba(20, 20, 20,'),
    ('rgba(15, 16, 20,', 'rgba(24, 24, 24,'),
    ('rgba(13, 13, 17,', 'rgba(22, 22, 22,'),
    ('rgba(10, 18, 35,', 'rgba(18, 18, 18,'),
    ('rgba(4, 10, 23,', 'rgba(10, 10, 10,'),
    ('rgba(2, 7, 20,', 'rgba(6, 6, 6,'),
]

for old, new in navy_to_charcoal:
    css = css.replace(old, new)

# Hex navy blue values
hex_replacements = [
    ('#0e1a32', '#141414'),
    ('#142649', '#1a1a1a'),
    ('#162746', '#1f1f1f'),
    ('#132241', '#1a1a1a'),
    ('#0a1326', '#101010'),
    ('#08111f', '#0e0e0e'),
    ('#09111f', '#0e0e0e'),
    ('#0b0c10', '#111111'),
    ('#12141a', '#161616'),
]

for old, new in hex_replacements:
    css = css.replace(old, new)

# PHASE 7: Gold accent refinement
gold_hex = [
    ('#d4a646', '#c9a84c'),
    ('#d8b84c', '#c9a84c'),
    ('#e0b85c', '#dfc273'),
    ('#f1d57f', '#dfc273'),
    ('#f6e49b', '#dfc273'),
    ('#d7b74c', '#c9a84c'),
    ('#f4dfa0', '#dfc273'),
    ('#b8872e', '#a67c2e'),
]

for old, new in gold_hex:
    css = css.replace(old, new)

# Gold rgba
css = css.replace('rgba(216, 184, 76,', 'rgba(201, 168, 76,')
css = css.replace('rgba(184, 135, 46,', 'rgba(180, 150, 60,')

# Text color refinement
css = css.replace('rgba(246, 243, 238,', 'rgba(240, 237, 232,')
css = css.replace('rgba(251, 248, 241,', 'rgba(240, 237, 232,')
css = css.replace('rgba(255, 248, 228,', 'rgba(240, 237, 232,')
css = css.replace('#f6f3ee', '#f0ede8')
css = css.replace('#fbf8f1', '#f0ede8')
css = css.replace('#fff8e4', '#f0ede8')

# Shadow color refinement
css = css.replace('rgba(21, 32, 61,', 'rgba(20, 20, 20,')

# PHASE 8: Border radius
css = css.replace('border-radius: 999px;', 'border-radius: var(--radius-sm);')
css = css.replace('border-radius: 34px;', 'border-radius: var(--radius-xl);')
css = css.replace('border-radius: 36px;', 'border-radius: var(--radius-xl);')
css = css.replace('border-radius: 32px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 30px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 28px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 26px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 24px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 22px;', 'border-radius: var(--radius-md);')
css = css.replace('border-radius: 20px;', 'border-radius: var(--radius-md);')
css = css.replace('border-radius: 18px;', 'border-radius: var(--radius-md);')
css = css.replace('border-radius: 16px;', 'border-radius: var(--radius-md);')

# PHASE 9: Transition timing
css = css.replace('0.2s ease', 'var(--duration) var(--ease)')

# PHASE 10: Remove radial-gradient gold decorations from cards
css = re.sub(
    r'background:\s*\n\s*radial-gradient\(circle at top right, rgba\(201, 168, 76, [\d.]+\), transparent \d+%\),\s*\n\s*linear-gradient\(180deg, rgba\([\d, .]+\), rgba\([\d, .]+\)\);',
    'background: var(--bg-soft);',
    css
)
css = re.sub(
    r'background:\s*\n\s*radial-gradient\(circle at \d+% \d+%, rgba\(201, 168, 76, [\d.]+\), transparent \d+%\),\s*\n\s*linear-gradient\(180deg, rgba\([\d, .]+\), rgba\([\d, .]+\)\);',
    'background: var(--bg-soft);',
    css
)

# Simple linear gradient backgrounds -> flat
css = re.sub(
    r'background: linear-gradient\(180deg, rgba\([\d, .]+\), rgba\([\d, .]+\)\);',
    'background: var(--bg-soft);',
    css
)

# PHASE 11: Fix button-primary - solid gold
css = re.sub(
    r'\.button-primary,\s*\n\.filter-button\.is-active \{\s*\n\s*background: linear-gradient\([^)]+\);\s*\n\s*color: [^;]+;\s*\n\s*box-shadow: [^;]+;\s*\n\}',
    """.button-primary,
.filter-button.is-active {
  background: var(--accent);
  color: #0a0a0a;
  border-radius: var(--radius-md);
  box-shadow: none;
}""",
    css
)

css = re.sub(
    r'\.button-primary:hover \{\s*\n\s*box-shadow: [^;]+;\s*\n\}',
    """.button-primary:hover {
  background: var(--accent-deep);
  box-shadow: 0 0 24px rgba(201, 168, 76, 0.2), 0 8px 24px rgba(0, 0, 0, 0.2);
}""",
    css
)

# PHASE 12: Fix eyebrow/tags
css = css.replace(
    """.eyebrow,
.section-kicker,
.tag,
.panel-label,
.news-category-chip,
.agenda-impact.is-medium,
.admin-chip.is-live {
  border-color: rgba(201, 168, 76, 0.14);
  background: rgba(201, 168, 76, 0.08);
  color: var(--accent-deep);
  font-family: "Inter", sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}""",
    """.eyebrow,
.section-kicker,
.tag,
.panel-label,
.news-category-chip,
.agenda-impact.is-medium,
.admin-chip.is-live {
  border: none;
  background: none;
  color: var(--accent-muted, #8a6e2f);
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}"""
)

# PHASE 13: Blockquote refinement
css = css.replace(
    'border-radius: 0 var(--radius-md) var(--radius-md) 0;\n  background: rgba(201, 168, 76, 0.06);\n  color: #dfc273;',
    'border-radius: 0;\n  background: transparent;\n  color: var(--text);\n  font-style: italic;'
)

# PHASE 14: Fix hero-copy decorative pseudo-elements
css = css.replace(
    """body[data-page="home"] .hero-copy::before,
.page-summary::before,
.feature-main::before,
.newsletter-card::before {
  background: radial-gradient(circle, rgba(201, 168, 76, 0.16), transparent 72%);
}""",
    """body[data-page="home"] .hero-copy::before,
.page-summary::before,
.feature-main::before,
.newsletter-card::before {
  display: none;
}"""
)

with open(CSS_PATH, 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS transformations complete!')
print(f'Final size: {len(css)} chars, {css.count(chr(10))} lines')
