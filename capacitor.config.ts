
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1584c484065941c1a916e861761beb3d',
  appName: 'grindtime-focus-flow',
  webDir: 'dist',
  server: {
    url: 'https://1584c484-0659-41c1-a916-e861761beb3d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    scheme: 'GrindTimeFocusFlow',
    contentInset: 'always',
    webViewAllowingInlineMediaPlayback: true,
    limitsNavigationsToAppBoundDomains: true,
    scrollEnabled: true,
    allowsLinkPreview: false
  }
};

export default config;
