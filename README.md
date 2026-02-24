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

The application reads shift data from `src/data/turni.json`. The structure is:

```json
{
  "title": "Turni di Marzo 2026",
  "shifts": [
    {
      "date": "2026-03-01",
      "team": [
        { "memberName": "Diego", "role": "guitar" },
        { "memberName": "Samu", "role": "keyboard" }
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

## Updating Shifts

To update the shift schedule:

1. Edit `src/data/turni.json` with new shift data
2. Rebuild the application: `npm run build`
3. Deploy the `dist/` folder to your hosting service

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
│   └── TeamMemberCard.tsx
├── data/
│   └── turni.json   # Shift schedule data
├── types/
│   └── index.ts     # TypeScript type definitions
├── utils/
│   ├── dateFormatter.ts
│   └── iconMapper.ts
├── App.tsx
└── main.tsx
```

## Color Scheme

- **Primary UI**: Grayscale (slate/gray tones)
- **Team Colors**: Vibrant individual colors (yellow, blue, green, red, orange, pink, purple, cyan, brown, gray)

## License

MIT
