# FileDrop

FileDrop is a browser-ready prototype for organization-based file sharing.

## Features

- Users belong to an organization and have unique IDs.
- Direct Send supports same-organization and external recipients by user ID.
- Community Board posts files to everyone in the current user's organization.
- Drag-and-drop and file picker upload flows are both supported.
- Uploaded demo files can be opened later from direct shares, board posts, and the inbox.
- Inbox combines direct files and organization board files.
- The same UI can run as a static web app or a Chrome/Edge Manifest V3 extension popup.

## Run Locally

```powershell
node server.cjs
```

Open `http://127.0.0.1:4180` from this folder.

## Run as Desktop App

FileDrop now includes a Tauri desktop wrapper in `src-tauri/`. The browser extension files remain in the project root, so plugin functionality is preserved.

Prerequisites:

- Node.js
- Rust/Cargo
- Tauri Windows prerequisites

Install dependencies and run the desktop shell:

```powershell
npm install
npm run desktop:dev
```

Build a standalone Windows app:

```powershell
npm run desktop:build
```

## Load as Browser Extension

1. Open Chrome or Edge extensions.
2. Enable developer mode.
3. Choose "Load unpacked".
4. Select this `org-file-share-app` folder.

## Prototype Notes

This version stores demo users and uploaded file data in `localStorage`, which is only suitable for small prototype files. A production build should add authentication, signed upload URLs, object storage, malware scanning, audit logs, organization membership enforcement, and expiring download links.
