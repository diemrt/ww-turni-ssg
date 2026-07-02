# Worship Team Shifts Website

A mobile-first static website to display worship team shift schedules built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 📱 Mobile-first responsive design
- 🎨 Grayscale UI with vibrant team member colors
- 🎵 Role-based icons (guitar, drums, keyboard, vocals, bass)
- 🇮🇹 Italian date formatting
- ✨ Smooth animations and hover effects
- 📊 Reads shifts from `turni.json`

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

### Environment Check (PowerShell)

Use `init.ps1` to verify the toolchain works:

```powershell
.\init.ps1 setup   # verify Node.js (>=18) and npm, then npm install
.\init.ps1 build   # run npm run build (tsc -b && vite build) into dist/
```

### Documentation / Developer Guide

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Architecture, tech stack, main flow and code structure.
- [AGENTS.md](AGENTS.md) — Session workflow (clock-in/clock-out), 1-WIP rule, independent subagent verification and the `init.ps1` guide.
- [docs/GIT.md](docs/GIT.md) — Version control guidelines.
- [docs/ISSUES.md](docs/ISSUES.md) — How issues are tracked with `issue-manager.ps1`.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Data Structure

The application reads shift data from `public/turni.json`. The structure is:

```json
{
  "title": "Turni di Marzo 2026",
  "shifts": [
    {
      "date": "2026-03-01",
      "team": [
        { "memberName": "Diego", "role": "guitar", "color": "yellow" },
        { "memberName": "Samu", "role": "keyboard", "color": "blue" }
      ]
    }
  ],
  "availableTeamMembers": [
    {
      "name": "Diego",
      "roles": ["guitar", "vocals"],
      "color": "yellow"
    }
  ],
  "availableRoles": ["guitar", "bass", "drums", "vocals", "keyboard"]
}
```

**Important Notes:**
- Each team member in a shift has a **single role** (not an array of roles)
- Each team member entry includes: `memberName`, `role`, and `color`
- The `availableTeamMembers` array defines all possible team members with their potential roles (array) and assigned colors
- For each shift/date, a person can only have one role on stage

## Updating Shifts

### Using the PowerShell Script (Recommended)

To generate a new month's schedule:

```powershell
.\generate-turni.ps1 -Month 4 -Year 2026
```

This will:
- Create a timestamped backup in `public/backups/`
- Update `public/turni.json` with empty shifts for the specified month
- Preserve all team member and role configurations

### Manual Update

To update the shift schedule manually:

1. Edit `public/turni.json` with new shift data
2. Rebuild the application: `npm run build`
3. Deploy the `dist/` folder to your hosting service

**Important Notes:**
- Each team member in a shift has a **single role** (not an array of roles)
- Each team member entry includes: `memberName`, `role`, and `color`
- The `availableTeamMembers` array defines all possible team members with their potential roles (array) and assigned colors
- For each shift/date, a person can only have one role on stage

## Deployment

The built application is a static site that can be deployed to:

- **Netlify**: Drop the `dist/` folder or connect your Git repository
- **Vercel**: Import your project or use the CLI
- **GitHub Pages**: Push the `dist/` folder to a `gh-pages` branch
- **Any static hosting**: Upload the contents of `dist/`

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Formatting**: Custom Italian locale

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── Header.tsx
│   ├── ShiftCard.tsx
│   ├── TeamMemberCard.tsx
│   ├── TeamSummary.tsx
│   ├── QuickFilter.tsx
│   ├── EmptyState.tsx
│   └── LoadingState.tsx
├── types/
│   └── index.ts     # TypeScript type definitions
├── utils/
│   ├── dateFormatter.ts
│   └── iconMapper.ts
├── App.tsx
└── main.tsx
public/
├── turni.json       # Shift schedule data (fetched at runtime)
└── backups/         # Timestamped backups created by generate-turni.ps1
```

## Color Scheme

- **Primary UI**: Grayscale (slate/gray tones)
- **Team Colors**: Vibrant individual colors (yellow, blue, green, red, orange, pink, purple, cyan, brown, gray)

## License

MIT
