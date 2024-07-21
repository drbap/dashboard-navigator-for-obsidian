# Dashboard navigator plugin for Obsidian

![Dashboard navigator for Obsidian](images/dashboard_navigator_plugin_intro.png)

**Dashboard navigator** was designed to help you manage and quickly navigate your knowledge base. You can get instant overview of key vault stats, categorized recent files, total number of files per category (notes, images, audios, videos and more) and powerful search to easily locate your vault files (navigator).

## Features

![Dashboard navigator for Obsidian - dashboard](images/dn_dashboard_01.png)

- **Vault stats and graph**: Gain insightful statistics about your vault, including:
  - Number of notes, images, audios, videos, PDF and other file formats.
    - When you click on the dashboard file type buttons (desired file type) you will enter the navigator mode with the results only showing the desired file type. 
  - Total files, 
  - Total folders, 
  - Vault pie chart of notes and other file formats.
  
- **Recent files by type**: Easily access your most frequently used files, categorized for quick reference. Save time searching and keep important notes readily available.

![Dashboard navigator for Obsidian - search](images/dn_navigator_01.png)

- **Advanced file search**: Find your files quickly with powerful **search** and **sort** functionalities. Search and sort files by **name**, **path** (location within your vault), **size** and **date created** and **date modified**. You can also search notes by **tag**.
  - You can search using some knowledge of regular expressions, for example you can search for notes with **tags** `#work` and `#pending` typing `#work|#pending`.

## Filter Notes and Files by Day, Week, Month and Year

![Dashboard navigator for Obsidian - filter](images/dn_navigator_day_week_month_year.png)

- Enter `@` + the keywords below to quickly filter the results:
  - `day` (or today)
  - `day-1` (yesterday)
  - `day-2` to `day-7`
  - `week`
  - `month`
  - `year`
 
## Sort Files

![Dashboard navigator for Obsidian - sort](images/dn_navigator_sort.png)

- You can sort the files by double clicking on the table header and also by using the dropdown select.
 
## Display Results

- You can selected 4 types of layouts to display the search results:
  - Default
  - Row striped
  - Column striped
  - Bordered
 
## Context Menu

![Dashboard navigator for Obsidian - context menu](images/dn_navigator_context_menu.png)

![Dashboard navigator for Obsidian - context menu 2](images/dn_navigator_context_menu_02.png)

- Right-click the mouse button on the desired file link or table result to open the context menu. You can open the note in various ways (same tab, new tab, new window and also show its properties). You can also open the note by **double clicking** on the desired result.

# File Properties

![Dashboard navigator for Obsidian - file properties](images/dn_navigator_file_properties.png)

 
## Plugin Settings

![Dashboard navigator for Obsidian - settings](images/dn_navigator_settings.png)

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/laser-beam/`.

## Feedback

Have suggestions for new features, usability improvements, or found a bug? Your feedback is appreciated! Submit an issue on GitHub and I'll do my best to respond as soon as possible. Thanks.

## License and Acknowledgements

Dashboard navigator plugin for Obsidian

MIT License ⓒ Bernardo Pires

The Dashboard navigator icon (ribbon icon) is from [Lucide](https://lucide.dev/) Icons used by Obsidian. The Lucide icon library is licensed under the [ISC License](https://lucide.dev/license).
