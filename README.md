# H5P Viewer

## Introduction

The **H5P Viewer** is a React-based application designed to facilitate the viewing of H5P content. It features a user-friendly interface and allows for navigation between different sections, including About, Login, License, Impressum, and Contact.

## Features

- **Play H5P Grid**: View interactive H5P content in a grid layout.
- **About Section**: Learn more about the application.
- **Login Functionality**: Securely log in to access personalized features.
- **License and Impressum**: Details about the application licensing and legal information.
- **Contact Page**: Get in touch with the developers.

## Project Structure

```plaintext
.
├── App.js
├── components
│   ├── About.jsx
│   ├── contact.jsx
│   ├── Impressum.jsx
│   ├── license.jsx
│   ├── Login.jsx
│   ├── PlayH5p.jsx
│   ├── PlayH5pGrid.jsx
│   └── Popup.jsx
├── styles.css
├── logo.svg
└── README.md
```

## Usage

1. Clone this repository.
2. Install the dependencies using `npm install`.
3. Run the application with `npm start`.
4. Access the application in your browser at `http://localhost:3000`.

## Routes

- `/`: Displays the **Play H5P Grid**.
- `/about`: About section with details about the application.
- `/login`: Login functionality for users.
- `/License`: Licensing information.
- `/Impressum`: Legal information.
- `/Contact`: Contact page.

## Development

- This application uses React Router for seamless navigation.
- Components are modular and designed to ensure scalability and maintainability.

## License

Refer to the [License](./components/license.jsx) page for licensing details.

## Contact

For any inquiries or issues, please visit the [Contact](./components/contact.jsx) page.
