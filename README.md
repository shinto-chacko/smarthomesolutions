# DigitalMinds.homes

A responsive smart-home showcase for DigitalMinds Homes, built with plain HTML, CSS, and JavaScript.

## Features

- Interactive smart-home dashboard with lighting, climate, security, and entertainment controls.
- Auto-expanding left navigation, one-section-at-a-time scroll snapping, and a mobile slide-out menu.
- Consultation-first messaging, a housing-society energy-savings estimator, eight smart-home solution ideas, a left/right Solutions-to-room-ideas slider with six room examples, Alexa routine previews, and filterable product categories in a single-row carousel with feature-and-benefit dialogs.
- Clickable scroll-position dots on the Solutions and Products carousels.
- Responsive layouts and keyboard-accessible controls.
- No build tools or package installation required.

## Deploying to GitHub Pages

1. In GitHub repository settings, open **Pages** and select the branch and `/ (root)` folder for deployment.
2. In Spaceship DNS, point the `www` CNAME record to `shinto-chacko.github.io`.
3. Set the GitHub Pages custom domain to `www.digitalminds.homes`. The repository's `CNAME` file already contains this hostname.
4. Once DNS is verified in GitHub Pages, enable **Enforce HTTPS**.

The contact form opens the visitor's default email app; it does not submit data to a server.
The device categories are examples for consultation; the site does not sell hardware.
The society estimator shows an illustrative 30–40% electricity-saving range, not a guaranteed reduction in maintenance charges.

## 📂 Project Structure

```text
├── index.html       # Primary semantic HTML5 structure and sections
├── styles.css       # Responsive visual styling
├── script.js        # Device controls, savings estimate, solution/product pagination, Alexa previews, and contact email
├── README.md        # Documentation and deployment instructions
```
