# Security Policy

## Dashboard Navigator Plugin Security

This security policy outlines the security measures implemented in the Dashboard navigator plugin for Obsidian, which adheres to Obsidian Developer Policies (https://docs.obsidian.md/Developer+policies).

**Plugin Composition:**

This free and open-source plugin includes **3 files**: 
- **main.js** (JavaScript code - plugin main functionality).
- **styles.css** (CSS file to control plugin style and appearance).
- **manifest.json** (file with general plugin information).

**Security Benefits:**

* **Read-Only Files:** The plugin does not edit or delete any of your files.
* **No User Data or Telemetry Stored and/or Sent Over the Internet:** The plugin runs locally and does not store or transmit any user data. The plugin only stores user preferences, such as default view, font size and other plugin settings.
* **No Network Requests:** The plugin does not make any network request.
* **Embedded Assets:** All plugin assets are included within the plugin itself, with no external connections.
* **Open-Source Transparency**: The open-source nature of the plugin allows users to inspect the code and verify that it adheres to security best practices.

**Security Recommendations:**

* **Trusted Sources:** Always install this plugin from trusted sources, such as the Obsidian application or the plugin's official GitHub repository.
* **Plugin Updates:** Keeping your plugin updated ensures you benefit from any improvements or bug fixes that might enhance security.

**Reporting Vulnerabilities:**

If you suspect a vulnerability in this plugin, please follow these responsible disclosure practices:

* **Do not publicly disclose the vulnerability.** Public disclosure can leave users vulnerable before a fix is implemented. Contact the developer/repository owner (@drbap).
* **Provide a clear description of the vulnerability and the steps to reproduce it.**

By following these guidelines, you can ensure a secure and reliable experience when using the Dashboard Navigator plugin.
