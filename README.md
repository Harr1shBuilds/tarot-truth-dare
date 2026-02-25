# 🃏 Tarot Truth & Dare

A luxury tarot-themed Truth & Dare web application featuring a three-card animated spread with a candle-lit ritual interface. Users select Truth or Dare and reveal randomly generated cards with smooth animations and cinematic transitions.

**Live Demo:** [https://manoharrish.github.io/tarot-truth-dare/](https://manoharrish.github.io/tarot-truth-dare/)

## Overview

Tarot Truth & Dare reimagines the traditional party game into a refined, atmospheric digital experience. Instead of a basic random picker, this application presents a three-card tarot spread with animated reveal effects and a dark, ritual-inspired interface.

The application supports large statement datasets (1000+ entries) stored in Supabase or a local JSON deck and ensures randomized selection for each draw.

## Features

*   **Three-card tarot spread animation**
*   **Smooth card flip and emergence effects**
*   **Candle-lit animated background** (Ritual Smoke & Cosmic Aura)
*   **Truth / Dare selection mode** (Moon Path / Flame Path)
*   **Randomized statement selection** (Supabase RPC integration)
*   **Large scalable statement dataset support**
*   **Responsive layout**
*   **GitHub Pages deployment ready**

## Tech Stack

**Frontend:**
*   HTML5
*   CSS3 (3D Transforms, Custom Animations)
*   JavaScript (Vanilla)

**Backend / Data:**
*   Supabase (PostgreSQL)
*   Optional JSON deck for local mode

**Deployment:**
*   GitHub Pages

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/manoharrish/tarot-truth-dare.git
    ```
2.  **Navigate into the project:**
    ```bash
    cd tarot-truth-dare
    ```
3.  **Open `index.html`** in your browser.
4.  If using Supabase, ensure your public API keys are configured inside `script.js`.

## Project Structure
```text
tarot-truth-dare/
│
├── index.html          # Main application structure
├── style.css           # Noir Obsidian design system
├── script.js           # Ritual engine & particle logic
├── cvm.jpeg            # Custom card back image
├── sounds/             # Audio assets
└── README.md           # Documentation
```

## Random Selection Logic

Random statement selection is handled either by:
*   **Supabase RPC** using `ORDER BY random() LIMIT 1`
*   **Local JSON deck** with in-memory non-repeating selection logic

The system is designed to scale to 2000+ entries while maintaining performance.

## Future Improvements

*   Difficulty-based filtering (easy / normal / savage)
*   Category-based tarot spread
*   Session-based no-repeat logic
*   Multiplayer support
*   Audio ambience layer
*   Admin dashboard for statement management

## Screenshots

*(Add project screenshots here)*

## License

This project is licensed under the MIT License.

## Author

**Manoharrish**  
GitHub: [https://github.com/manoharrish](https://github.com/manoharrish)
