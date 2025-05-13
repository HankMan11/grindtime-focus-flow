
# Running the GrindTime Focus Flow App with Xcode

This guide will walk you through the process of running the GrindTime Focus Flow app on a physical iOS device or in the iOS simulator using Xcode.

## Prerequisites

1. A Mac computer with Xcode installed (version 12 or later recommended)
2. Basic knowledge of using Git and terminal commands
3. Node.js and npm installed

## Setup Instructions

### Step 1: Clone and Prepare the Project

1. Export the project to your own GitHub repository using the "Export to Github" button in Lovable.
2. Clone the repository to your local machine:
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd <PROJECT_FOLDER>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Step 2: Build the Web App

1. Build the project:
   ```bash
   npm run build
   ```

### Step 3: Set Up iOS with Capacitor

1. Add iOS platform:
   ```bash
   npx cap add ios
   ```

2. Sync the web app with the iOS project:
   ```bash
   npx cap sync ios
   ```

### Step 4: Open and Run in Xcode

1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode:
   - Select your target device (either a connected iPhone or an iOS simulator)
   - Click the Play button to build and run the app

### Updating the App

Whenever you make changes to the web app:

1. Rebuild the web app:
   ```bash
   npm run build
   ```

2. Sync the changes to iOS:
   ```bash
   npx cap sync ios
   ```

3. Open in Xcode and run again:
   ```bash
   npx cap open ios
   ```

## Troubleshooting

- If you encounter build errors in Xcode, make sure you have the latest version of Xcode installed
- Check that you're using a compatible iOS version for your simulator or device
- Ensure that all Capacitor plugins are properly installed and configured

For more detailed information about Capacitor and iOS development, visit the [Capacitor documentation](https://capacitorjs.com/docs/ios).
