import re

CSS_PATH = 'C:/Users/money/Documents/Modelos Personalizados do Office/.claude/worktrees/beautiful-dhawan/assets/css/styles.css'

with open(CSS_PATH, 'r', encoding='utf-8') as f:
    css = f.read()

# Fix double Cormorant Garamond
css = css.replace('"Cormorant Garamond", "Cormorant Garamond", Georgia, serif', '"Cormorant Garamond", Georgia, serif')

# Fix double Cinzel->Cormorant replacement
css = css.replace('"Cormorant Garamond", "Cormorant Garamond"', '"Cormorant Garamond"')

# Remove the first body::before/after block that was already replaced
# but might have a duplicate from the second override layer
# The body::before/after at line ~76 should be display:none, check for duplicate overrides

# Remove now-empty override comments
css = css.replace('/* Body background consolidated above */\n\n', '')
css = css.replace('/* Body background consolidated into single definition */\n\n', '')

# Remove radial-gradient pseudo-element overrides that reference obsolete colors
# These are ::before elements creating gold glow spots - not needed anymore
css = css.replace(
    """body[data-page="home"] .hero-copy::before,
.page-summary::before,
.feature-main::before,
.newsletter-card::before {
  display: none;
}""",
    """body[data-page="home"] .hero-copy::before,
.page-summary::before,
.feature-main::before,
.newsletter-card::before {
  display: none;
}"""  # keep as is, it's correct
)

# Remove the first layer's topbar definition (lines ~116-129) since it's fully overridden
# We keep only the later definitions which have the final styling
first_topbar = """.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1460px;
  margin: 0 auto 34px;
  padding: 14px 16px 14px 20px;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: var(--radius-xl);
  background: rgba(20, 20, 20, 0.84);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-soft);
}"""

# Replace first topbar with consolidated version that includes display properties
css = css.replace(first_topbar, """.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1460px;
  margin: 0 auto 34px;
  padding: 18px 24px;
  border: none;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(16px);
  box-shadow: none;
}""")

# Remove the duplicate topbar overrides later in the file
# The override at ~2589
css = css.replace(
    """.topbar {
  max-width: 1440px;
  padding: 18px 24px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: var(--radius-lg);
  background: rgba(18, 18, 18, 0.74);
  backdrop-filter: blur(22px);
  box-shadow: var(--shadow-soft);
}""",
    '/* topbar consolidated above */'
)

# Remove the second topbar override
css = css.replace(
    """.topbar {
  border: none;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(16px);
  box-shadow: none;
}""",
    '/* topbar consolidated above */'
)

# Remove first-layer brand-name that's fully overridden
first_brand_name = """.brand-name {
  position: relative;
  display: block;
  color: transparent;
  background: linear-gradient(180deg, #dfc273 0%, #c9a84c 44%, #dfc273 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 18px rgba(201, 168, 76, 0.16);
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 2.02rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 0.92;
}"""

css = css.replace(first_brand_name, '/* brand-name consolidated below */')

# Remove first-layer nav-links a that's fully overridden
first_nav = """.nav-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-soft);
  font-size: 1rem;
  font-weight: 700;
  transition:
    transform var(--duration) var(--ease),
    border-color var(--duration) var(--ease),
    color var(--duration) var(--ease),
    background var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease);
}

.nav-links a:hover {
  transform: translateY(-1px);
  border-color: rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text);
  box-shadow: 0 10px 20px rgba(20, 20, 20, 0.05);
}"""

css = css.replace(first_nav, '/* nav-links consolidated below */')

# Remove first-layer market-ribbon that's overridden
first_ribbon = """.market-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1460px;
  margin: 0 auto 18px;
  padding: 10px 14px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: var(--radius-lg);
  background: rgba(20, 20, 20, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow-soft);
  overflow-x: auto;
}"""

css = css.replace(first_ribbon, """.market-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1440px;
  margin: 0 auto 18px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--bg-soft);
  overflow-x: auto;
}""")

# Remove duplicate market-ribbon override
css = css.replace(
    """.market-ribbon {
  max-width: 1440px;
  padding: 10px 16px;
  border-color: rgba(201, 168, 76, 0.1);
  background: rgba(20, 20, 20, 0.72);
}""",
    '/* market-ribbon consolidated above */'
)

# Clean up multiple consecutive blank lines
css = re.sub(r'\n{4,}', '\n\n\n', css)

# Clean up comment-only lines that are now orphaned
css = re.sub(r'\n/\* (topbar|brand-name|nav-links|market-ribbon) consolidated (above|below) \*/\n', '\n', css)

with open(CSS_PATH, 'w', encoding='utf-8') as f:
    f.write(css)

print(f'Cleanup complete! Final: {css.count(chr(10))} lines')
