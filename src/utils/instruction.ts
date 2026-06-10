export const instruction = {
  google_drive: [
    {
      "Create Google Cloud Project": [
        "Go to: Google Cloud Console (https://console.cloud.google.com)",
        "Create a new project.",
        "Select the project.",
      ],
      "Enable Google Drive API": [
        "Go to APIs & Services > Enabled APIs & Services",
        "Select Google Drive API",
        "Click Enable",
      ],
      "Create OAuth Credentials": [
        "Go to APIs & Services > Credentials",
        "Open 'Create credentials' dropdown at the top",
        "Select OAuth client ID",
        "Choose your Application type (Web application recommended)",
        "Enter your Application name",
        "Add Authorized JavaScript origins as 'http://localhost:5173'",
        "Add Authorized redirect URL as 'http://localhost:5003/api/google/callback'",
        "Hit the Create button.",
      ],
      "Take all the below informations:": [
        "Client ID",
        "Client Secret",
        "Hit the 'Download JSON' button (Recommended)",
        "Click OK button",
      ],
    },
  ],
  dropbox_platform: [
    {
      "Create Dropbox App": [
        "Go to: https://www.dropbox.com/developers/apps",
        "Click 'Create App'",
        "API: Scoped Access",
        "Access Type: Full Dropbox",
        "Name your App: Give a name to your app",
      ],
      "Configure Permissions": [
        "files.content.write",
        "files.content.read",
        "files.metadata.read",
        "files.metadata.write (If listing files)",
        "Click 'Submit'",
      ],
      "Configure Redirect URI ('Settings' Tab)": [
        "Frontend: http://localhost:5173 then Click 'Add'",
        "Backend: http://localhost:5003/api/dropbox/callback then Click 'Add'",
        "Refresh the page to ensure the URLs are saved",
      ],
      "Get App Credentials": [`Get the App key & App secret`],
    },
  ],
};
