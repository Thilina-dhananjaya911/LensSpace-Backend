# LensSpace - Photography Spot Finder 📸🗺️

LensSpace is a full-stack web application designed for mobile and landscape photographers to discover, document, and share optimal photography viewpoints with exact geographical precision. The platform integrates real-time maps, crowdsourcing metrics, and social curation features tailored to the creative photography community.

---

## 📌 1. Problem Description
Landscape and celestial photographers heavily rely on precise locations, lighting conditions, and environment accessibility to capture perfect shots. Existing generalized map solutions (like Google Maps) lack specific context for photographers, such as:
- Difficulty identifying exact trail viewpoints, sunrise/sunset alignments, or dark-sky spots for astrophotography.
- Lack of real-time community-driven information on crowd levels and safety parameters of remote locations.
- No streamlined way to share specific focal-length reference shots tied directly to geographical coordinates.

**Target Users:** Travel bloggers, amateur/professional mobile photographers, landscape artists, and astrophotographers.

---

## 💡 2. Proposed Solution
LensSpace solves these contemporary issues by providing a dedicated crowdsourced ecosystem where users can pin exact photography coordinates backed by open-source maps, specify real-time spot status metrics, and securely curate reference imagery via an integrated community photo hub.

---

## ✨ 3. Core Features
- **Dynamic Hero Banner:** Automatically pulls the spot's uploaded image into a cinematic breakout background layout layered with dark text-contrast gradients.
- **Widescreen Balanced UI:** A professional 12-column split-grid desktop interface (7:5 ratio) separating main details from community additions.
- **Smart GPS & API Autocomplete:** Integrates OpenStreetMap (Nominatim API) for physical address lookup alongside responsive browser-level GPS auto-fill hooks.
- **Sticky Community Sidebar Feed:** A custom 2-column scrollable sidebar feed allowing users to scroll detailed descriptions while keeping the uploader identity context locked to the viewport.
- **Custom React Share Hub:** Fully interactive glassmorphic web modal featuring a dynamically generated 160px scannable QR Code allowing seamless phone layout routing, alongside a clipboard fallback mechanism.
- **Route Authorization Security:** Strict middleware and layout guards restricting data modifications and spot additions exclusively to authenticated session traffic.

---

## 🛠️ 4. Technologies Used
### Backend & Database:
- **Node.js** & **Express.js** (REST API Backend Architecture)
- **MongoDB** & **Mongoose** (Data Modeling & Persistence)
- **Multer** (Multipart Form-Data / Image Storage)

### Frontend (Optional Extension Component):
- **React.js** & **Vite** (Modular Component UI)
- **Tailwind CSS** (Utility-First Premium Styling Engine)
- **qrcode.react** (Scalable Vector QR Generation)

---

## 📡 5. REST API Architecture & Endpoints

The system implements clean RESTful principles manipulating structural JSON payloads:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/spots` | Retrieve all documented photography spots | No |
| **GET** | `/api/spots/:id` | Fetch isolated details, reviews, and images for a unique spot | No |
| **POST** | `/api/spots` | Create a new spot (Accepts multipart/form-data images) | **Yes** |
| **PUT** | `/api/spots/:id` | Modify an existing spot's details/status arrays | **Yes** |
| **DELETE** | `/api/spots/:id` | Delete a spot from the collection permanently | **Yes** |

### API Interaction Example (POST /api/spots)
**Headers:** `Content-Type: multipart/form-data`
```json
{
  "title": "Pidurangala Rock",
  "category": "Landscape",
  "locationName": "Sigiriya, Sri Lanka",
  "coordinates": [7.9644, 80.7630],
  "safetyLevel": "Caution",
  "liveVibe": "Crowded",
  "image": [Binary Image File]
}