# Multimedia Streaming App

A fully responsive multimedia streaming application built with React.js that allows users to stream videos, audio tracks, and view images. Features include a modern UI, dark/light theme toggle, media players, search functionality, favorites, and more.

## Features

### User Interface
- ✨ Modern, clean, and intuitive UI
- 🏠 Home page with featured content
- 📱 Fully responsive design (mobile-friendly)
- 🌓 Dark & light theme toggle
- 📋 Grid/list view toggle for browsing media

### Media Players
- 🎬 **Video Player**: Play, pause, seek, fullscreen, volume control
- 🎵 **Audio Player**: Playlist support with next/previous track navigation
- 🖼️ **Image Viewer**: Slideshow option with navigation

### Functionalities
- 🔍 Search bar to filter media
- 🏷️ Category-wise media filtering (Movies, Songs, Short Clips, Images, etc.)
- 👤 User login/signup (dummy authentication)
- ❤️ Add to Favorites
- ⏰ Watch Later functionality
- ▶️ Continue Watching section
- 📤 Media upload page

### Technical Features
- ⚡ Smooth animations & transitions (Framer Motion)
- 🎨 Tailwind CSS for styling
- 🔄 Context API for state management
- 🧭 React Router for navigation
- 💾 LocalStorage for persistence
- 🧩 Reusable components

## Tech Stack

- **React.js** (v18.2.0) with Hooks
- **React Router** (v6.20.0) for navigation
- **Context API** for state management
- **Tailwind CSS** (v3.3.6) for styling
- **Framer Motion** (v10.16.16) for animations
- **React Icons** (v4.12.0) for icons
- **Vite** (v5.0.8) as build tool

## Project Structure

```
multimedia-streaming-app/
├── public/
├── src/
│   ├── components/
│   │   ├── players/
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── AudioPlayer.jsx
│   │   │   └── ImageViewer.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── MediaCard.jsx
│   │   ├── ViewToggle.jsx
│   │   └── CategoryFilter.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── MediaContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── Player.jsx
│   │   ├── Login.jsx
│   │   ├── Upload.jsx
│   │   └── Favorites.jsx
│   ├── data/
│   │   └── sampleData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd multimedia-streaming-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in the terminal

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Navigation
- **Home**: Browse featured content, continue watching, and recently added media
- **Browse**: View all media with category filters and search
- **Favorites**: Access your saved favorites
- **Upload**: Upload new media (requires login)
- **Login/Signup**: Create an account or sign in (dummy authentication)

### Features Usage

1. **Search**: Use the search bar in the header to find media across the app
2. **Theme Toggle**: Click the sun/moon icon in the header to switch themes
3. **View Toggle**: Switch between grid and list views in the Browse page
4. **Category Filter**: Filter media by category (Movies, Music, Images, etc.)
5. **Favorites**: Click the heart icon on any media card to add/remove from favorites
6. **Watch Later**: Click the clock icon to add media to watch later
7. **Media Players**:
   - **Video**: Full controls including play, pause, seek, volume, and fullscreen
   - **Audio**: Playlist support with automatic track progression
   - **Images**: Slideshow mode with navigation controls

### Sample Data

The app comes with pre-loaded sample media including:
- Videos (movies, documentaries, short clips)
- Audio tracks (jazz, electronic, classical, rock)
- Images (landscapes, cityscapes, nature)

All sample media uses publicly available URLs for demonstration purposes.

## Authentication

The app uses dummy authentication for demonstration:
- Any email/password combination will work for login
- Signup creates a new user profile (stored in localStorage)
- User data persists across sessions

## State Management

The app uses React Context API for state management:
- **ThemeContext**: Manages dark/light theme
- **AuthContext**: Handles user authentication
- **MediaContext**: Manages media data, favorites, watch later, and continue watching

All user preferences and data are stored in localStorage for persistence.

## Customization

### Adding New Media

1. Navigate to the Upload page (requires login)
2. Fill in the media details:
   - Media type (video, audio, or image)
   - Title (required)
   - Description
   - Category
   - Media URL (required)
   - Thumbnail URL
   - Additional fields based on media type
3. Click "Upload"

### Modifying Sample Data

Edit `src/data/sampleData.js` to add or modify sample media items.

### Styling

The app uses Tailwind CSS. Customize colors and styles in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized with React.memo where appropriate
- Lazy loading for images
- Efficient state management
- Smooth animations with Framer Motion

## Future Enhancements

Potential features to add:
- Real backend API integration
- User profiles and settings
- Comments and ratings
- Social sharing
- Advanced search filters
- Playlist creation
- Download functionality
- Subtitle support for videos

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## Support

For issues or questions, please open an issue on the project repository.

---

**Enjoy streaming! 🎬🎵🖼️**




