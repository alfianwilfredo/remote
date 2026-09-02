# Project Agent Guidelines

This project is supercharged with 4 integrated agent capabilities:

1. **Ponytail (The Lazy Senior Dev Mindset):**
   - Write the minimum code that works. Stop at the highest rung of the 7-rung ladder (YAGNI → Codebase reuse → Stdlib → Native platform → Installed dependency → One line → Minimum code).
   - Boring over clever. Fewest files possible. No unrequested abstractions.

2. **Superpowers (Engineering Disciplines):**
   - Rigorous development workflow: brainstorm & align specs → structured implementation plan → subagents & TDD → systematic debugging → verify before completion.

3. **UI/UX Pro Max (Design Intelligence):**
   - Professional UI/UX intelligence, aesthetics, design systems, 79+ styles, curated palettes, and accessibility standards (contrast ≥ 4.5:1, touch targets ≥ 44px).
   - Local search utility: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`

4. **Caveman (Token Compression):**
   - Ultra-terse output modes (`/caveman`, `/caveman-commit`, `/caveman-review`) to eliminate fluff while preserving 100% technical fidelity.

## Skills Directory
All custom skills are installed and discoverable under [`.agents/skills/`](file:///.agents/skills/).
Detailed rules are modularly defined in [`.agents/rules/`](file:///.agents/rules/).
