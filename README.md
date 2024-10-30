
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

- **Advanced file search**: Find your files quickly with powerful **search** and **sort** functionalities. More information below.

## Intuitive Advanced Search

The Dashboard navigator search allows you to quickly access and filter specific files within your vault. Quickly find notes, images, canvases, audios, videos, PDFs, and more with simple commands.


### Basic Commands

- `@notes`: Lists all **notes**.
- `@images`: Lists all **images**.
- `@canvas` or `@canvases`: Lists all **canvases**.
- `@audios`: Lists all **audio** files.
- `@videos`: Lists all **video** files.
- `@pdf` or `@pdfs`: Lists all **PDF** files.
- `@other`: Lists all **other** file types.

### Advanced Filtering with Search Terms

You can combine the basic commands with search terms to narrow down your results:

* `@notes #tag1`: Lists **notes** with the tag `#tag1`.
* `@notes desired_word #tag2`: Lists **notes** with `desired_word` and `#tag2`.

### Date-Based Filtering

You can also filter content based on specific dates:

- Enter `@` + the keywords below to quickly filter the results:
  - `@day` (or today)
  - `@day-1` (yesterday)
  - `@day-2` to `@day-7`
  - `@week`
  - `@month`
  - `@year`

### Search Filters Shorthands
- **File categories shorthands**: 
  - `@notes` or `@n`.
  - `@images` or `@i`.
  - `@canvas` or `@canvases` or `@c`.
  - `@audios` or `@a`.
  - `@videos` or `@v`.
  - `@pdf`or `@pdfs` or `@p`.
  - `@other`or `@others` or `@o`.
- **Date filters shorthands**: 
  - `@d` (current day) or `@day` or `@today`.
  - `@d-1` or `@day-1` or `@yesterday`.
  - `@d-2` or `@day-2` to `@d-7` or `@day-7`.
  - `@w` or `@week`.
  - `@m` or `@month`.
  - `@y` or `@year`.

### Combining Search Terms, File Types and Date Filters

You can combine search terms, file types (one per search) and date filters for more precise results:

- `@notes #tag1 @month`: Lists **notes** with the tag `tag1` created/modified this month (*Shorthand*: `@n #tag1 @m`).
- `@images @week`: Lists **images** added this week (*Shorthand*: `@i @w`).


### Additional Tips

* **Case Sensitivity:** Search terms are **case-insensitive**.

* **Multiple Commands:** You can use **multiple commands in a single query**, separated by spaces.

* Feel free to experiment with different combinations of commands and filters to find the best way to access your content. For example: `@month @notes` and `@notes @month` (same effect -> lists notes created/modified in the month). You can even expand this search with `@month @notes title_of_the_note` (or part of the note title, or tag).

### Excluding Results

To exclude specific content from your search results, you can use the `!` exclamation point followed by the text, tag or folder you want to exclude. This will remove any items that match the exclusion term.

**Example:**

- `@notes #work #pending !#urgent`: This will list **all notes** tagged with `#work` and `#pending` except those tagged with `#urgent`.

### Combining Exclusions with Other Filters

You can combine exclusions with other filters, such as tags and date, to further refine your search:

- `@notes #meeting !#international @month`: This will list all notes tagged with `#meeting` that were created or modified this month, **excluding** those tagged with `#international`.

- To find all notes tagged `#meeting` created/modified in the current month: `@notes #meeting @month`.

By effectively using exclusions, you can tailor your searches to your specific needs and quickly find the information you're looking for.

## Sort Files

![Dashboard navigator for Obsidian - sort](images/dn_navigator_sort.png)

- You can sort the files by double clicking on the table header and also by using the dropdown select.
 
## Display Results

- You can select 4 types of layouts to display the search results:
  - Default
  - Row striped
  - Column striped
  - Bordered
 
## Context Menu

![Dashboard navigator for Obsidian - context menu](images/dn_navigator_context_menu.png)

![Dashboard navigator for Obsidian - context menu 2](images/dn_navigator_context_menu_02.png)

- Right-click the mouse button on the desired file link or table result to open the context menu. You can open the note in various ways (same tab, new tab, new window and also show its properties). You can also open the note by **double clicking** on the desired result.

## File Properties

![Dashboard navigator for Obsidian - file properties](images/dn_navigator_file_properties.png)

## Navigator View: Hide Columns

The column-hiding feature gives you the flexibility to customize the **navigator view** to suit your specific preferences and workflow. By **hiding unnecessary columns**, you can create a cleaner, more focused view that highlights the information most relevant to you.

You can hide the following columns:
- **Ext**: Shows the file extension.
- **Path**: Shows the location of the file within your vault structure.
- **Size**: Displays the file size of the file.
- **Date**: Indicates the modification date of the file.
- **Tags**: Lists the tags associated with the note, making it easier to categorize and search for notes.

## Excluded File Extensions

- Open **plugin settings** and select the file extensions that you don't want to display (extensions separated by commas).

- Enter file extensions: In the provided text field, list the file extensions you want to exclude, separated by commas. For example: `txt, docx, js`.


## Excluded Folders

- Open **plugin settings** and select the file extensions that you don't want to display (folder paths separated by commas).

- Enter folder paths: In the provided space, list the folder names or paths to the folders(subfolders) you want to exclude, separating them with commas. For example: `folder1/subfolder, source_files, folder2`.

## Colored Files

![Dashboard navigator for Obsidian - colored files](images/dashboard_navigator.gif)

- Select custom colors for files in the dashboard and navigator views. These colors will be reflected in the piechart graph, making it easier to identify and track different file types. To activate this feature, go to **plugin settings** and **toggle colored files**.

## Plugin Settings

![Dashboard navigator for Obsidian - settings](images/dn_navigator_settings.png)

![Dashboard navigator for Obsidian - settings 2 colored files](images/dn_navigator_settings2.png)

## Select Custom Colors

![Dashboard navigator for Obsidian - context menu 2](images/dn_navigator_context_menu_02.png)

- Open **plugin settings** and select custom colors for notes, images and other file categories (piechart and files).

## Installation

1. Open **Obsidian Settings**.
2. In the side menu, select **Community plugins**.
3. Select **Browse** (button).
4. Search for **Dashboard navigator**.
5. Select it and choose **Install**.
6. **Enable** Dashboard navigator after installation.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/dashboard-navigator/`.

## Feedback

Have suggestions for new features, usability improvements, or found a bug? Your feedback is appreciated! Submit an issue on GitHub and I'll do my best to respond as soon as possible. Thanks.

## License and Acknowledgements

Dashboard navigator plugin for Obsidian

MIT License ⓒ Bernardo Pires

The Dashboard navigator icon (ribbon icon) and file icons are from [Lucide](https://lucide.dev/) Icons used by Obsidian. The Lucide icon library is licensed under the [ISC License](https://lucide.dev/license).
