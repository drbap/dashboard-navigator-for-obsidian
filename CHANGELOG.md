# Changelog

## [9.1.0] - 2025-09-08

- Dynamic search input clear buttons: Clear buttons in all search fields will now only appear when you start typing and will disappear when the field is empty. This follows modern UI/UX practices to create a cleaner interface. The clear button also now includes a tooltip .

- Saved searches buttons tooltips (delete search buttons).

## [9.0.0] - 2025-09-05

**New Features**

- **Backlinks** modal (backlinks with preview).

- **Outgoing links** modal (outgoing links with preview).

- Navigator Column: **BL** (total of backlinks -> file).

- Navigator Column: **OL** (total of outgoing links from note).

- Navigator view: Control **Image thumbnail size** (slider in plugin settings).

- Navigator view: Control **Image thumbnail size** (slider in quick display options).

- Navigator view: **Sort by backlinks** ascending or descending.

- Navigator view: **Sort by outgoing links** ascending or descending.

- Tags dashboard view: **Hide primary tags results** (toggle button).

- Tags dashboard view: tags sidebar **sort tags by frequency**.

**Hide new columns**
- hide BL (Backlinks) column (settings).
- hide BL (Backlinks) column (quick display options).
- hide OL (Outgoing links) column (settings).
- hide OL (Outgoing links) column (quick display options).

## [8.0.0] - 2025-08-27

**New Features**

- New **Tags** dashboard view. Cross-reference tags dashboard view.

- New `@tags` command (top search bar) to search directly in Tags dashboard view (please check README). 

- The main search bar now provides **tag autocomplete**.

- **Tag autocomplete** for the search in **Tags** dashboard view.

- **Recent notes & tags** in Tags dashboard view. You will see a list of the most recently created/modified notes with their corresponding tags.

- **Tags dashboard commands**: These commands work both in the main **Tags** dashboard and within the tags list in the tags sidebar (of Tags dashboard).

  - **Left-click**: Change the selected secondary tag into a primary tag, making it the main focus of your view.

  - **Shift + Click**: Add this tag to your current search using an AND condition. For example, if your search is `#article`, holding `Shift` and `clicking` on `#status` will change your search to `#article #status`(notes with tags #article AND #status).

  - **Ctrl + Click**: Exclude this clicked secondary tag. This is useful for filtering out results that contain a specific tag. Excluded tag(s) will appear in red color.

  - **Ctrl + Middle-Click**: Quickly clear your tag search and start fresh. This removes all tags from your search query, allowing you to reset your view with a single click.

- New **Bases** dashboard button count (Dashboard view).

- New **Bases** recent files (Dashboard view).

- New **Bases command** (Navigator view - search): `@bases` (shorthand: `@bb`) - Lists all `.base` files.

- New **bookmarks** command (Navigator view - search): `@bookmarks` or `@bm` as its shorthand. This command will **list all bookmarked files** in Navigator view, so you can sort them by file name, extension, folder, date, search for tags and frontmatter.
  - You can search for the file categories using the additional `@bookmarks`or `@bm` filter to identify which ones are bookmarked, e.g. `@notes @bm` (notes that are bookmarked) or `@images @bm`(images in your bookmarks).

- Default view can be **Dashboard**, **Navigator** or **Tags**.

- **Command Palette: Open tags** -> `Dashboard navigator: Open tags`. Open Tags Dashboard. A new command to open the Tags dashboard. You can assign a custom hotkey to quickly access it from anywhere.

- Main plugin buttons tooltips.

**Improvements**

- **Cache**: The plugin now utilizes an in-memory data cache to eliminate redundant processing. The cache ensures that subsequent dashboard views and searches are nearly instantaneous. The system intelligently rebuilds this data only when the vault's file structure or content has genuinely changed.

- **Saved searches modal**: search icon (filter input).

**Fixes**

- Version >= 1.9: Preview window padding fix.

- Other files category thumbnail icon fix (Navigator view).


## [7.1.0] - 2025-08-10
**New Features**

- Top **Bookmarks** in the Dashboard view.
  - You can choose the number of bookmarks to display, a setting that's independent of the number of recent files displayed in other dashboard sections. The order of these bookmarks always matches the order you've set in your bookmarks sidebar. By default, ten bookmarks will be shown.

- Settings: **Show pie chart panel** (dashboard view). You can show/hide the pie chart panel.

**Improvements**

- Settings adjustments.

## [7.0.0] - 2025-07-29
**New Features**

- **Cards layout** for Navigator view: A new 'Cards' layout option is now available in Navigator view. You can select this layout from the layout dropdown menu or within the plugin settings. This layout is also recommended for mobile devices.

- **Image thumbnails:** Image thumbnails are now displayed as previews in table and Cards layouts. You can deactivate image previews in settings or through the **Navigator view's quick display options** (a new modal, described below) to show file icons instead.

- **Recent search query** storage: The plugin now stores the most recent search query when the main window closes. This allows the last search result to be retained for subsequent openings.

- **Quick display options modal:** A new modal provides quick display options for Navigator view. Changes made here will update plugin settings. You can show/hide columns and toggle image thumbnails directly from this modal.

    - **Tip:** Right-clicking on any table header will open this modal.

- **Dedicated button for quick display options (Navigator view):** A new top button has been added to access the quick display options modal (Navigator view).

- **Icon hover details:** In Navigator view, hovering over an icon now displays the filename and its full path.

**Improvements**

- **Icon adjustments:** Navigator view icons have received adjustments for improved appearance.

- **Preview window close behavior:** The draggable preview window can now be closed by clicking outside of it, but within the Dashboard Navigator modal.

- **Plugin settings descriptions:** Adjustments have been made to plugin setting descriptions for enhanced clarity.

- **Mobile experience:** Various adjustments have been implemented to improve the plugin's usability on mobile devices. The Cards layout is strongly recommended for mobile users.


## [6.0.0] - 2025-06-21
- *New* **Save search** feature:
  - You can now **save your search queries** directly from the Navigator view! This feature lets you store **complex** or **frequently used searches**, along with a helpful description, so you can easily find and reuse them later.
- *New* **Saved searches modal/window**:
  - Just click on any saved search within the modal, and it'll instantly run that search in your Navigator view. No more re-typing complex queries! You can also filter your saved searches.

- *New* **Help/quick reference** (basic offline plugin help - search commands and how to use).

- *New* **Tags modal/window**.

- *New* context menu item: Tags (it will show the tags modal). 

- Improved Frontmatter modal.

- *New* **Tag Actions**. You can quickly filter your search results by interacting with **tags** directly within the **Navigator view**, **File Properties modal**, or **Tags modal**. These actions let you include or exclude tags from your current search query.

  - A `Shift + left-click` on a tag toggles between these states:

    - **Add tag:** This adds the tag to your search query. You'll **only see results that have this tag.** (e.g., `#tag`)

    - **Remove tag:** This removes the tag from your search query. The tag will **no longer filter your results**.

  - A `Ctrl + left-click` on a tag toggles between these states, specifically managing an *exclusion command*:

    - **Add exclusion command:** This adds a command to your search query to **exclude** the tag. You'll **only see results that *do NOT* have this tag.** (e.g., `!#tag`)

    - **Remove exclusion command:** This removes the exclusion command for that tag from your search query. The tag will **no longer filter your results by exclusion**.

## [5.3.0] - 2024-11-26
- **Colored Tags**: If the theme being used supports colored tags or if you are using custom CSS snippet to color tags, the **tags** column and **file properties** window will show colored tags accordingly.
- Improved get tags function.

## [5.2.1] - 2024-11-23

- **Improvement:** **Simplified root folder search**. Previously, you needed to use `//` to search for files in the root folder. Now, you can directly use `/`. To exclude files from the root folder, use `!/`.

- **Fixed**: **PDF files** preview (`hover + Ctrl key` and `Show preview`context menu).

- **Fixed**: Display of **embedded queries**. You can now easily view query results directly in the dashboard navigator preview. Example: <code>\```query tag:#todo```</code>.

## [5.2.0] - 2024-11-17
- **Navigator View**:
  - **Improved Table Headers**: Table headers now remain fixed while scrolling, improving readability and navigation.
  - **Improved Page Results/Pagination Bar**: Easily navigate through search results by scrolling (they now remain fixed while scrolling). Quickly switch between pages and also locate the column table headers.
- **Preview Window**:
  - **Fixed Titlebar**: The titlebar now stays fixed at the top of the preview window, providing easy access to controls even when scrolling long notes. You can now easily close the preview window and access the 3 open file buttons eliminating the need to scroll to the top of the window.

## [5.1.1] - 2024-11-16
- CSS adjustments of preview window.

## [5.1.0] - 2024-11-16

- **Preview window** improvements:
  - Resizable.
  - Open buttons always visible.
  - Close button
  - New design (hover will trigger left border of the titlebar to indicate that it is the part to drag). The mouse cursor will also change.

## [5.0.0] - 2024-11-15

**Dashboard view:**
- New **Recently opened** group list has been added. This list will display your recently opened files. To see a file in the list, simply close its tab or open another file.

**Navigator view:**
- **Preview files** on hover (holding the `Ctrl` or `Command` key). The preview window will show the file name and path.

- **New context menu item**: **Show Preview**. You can also preview the note/file without using the modifier key.

- **Drag preview window**: Move the preview window to your preferred position. Subsequent previews will open in the same spot, minimizing distractions. If you open the dashboard navigator window again, the preview will return to the default position (according to the file).

- **Frontmatter modal** and **File Properties modals** size and design adjustments. You can now directly open the selected file with the new "**Open**" button.

- File properties window: **Size** will display file size in bytes, KB, or MB.

- **Enhanced file extension search**: Find files precisely by their extension (e.g., `.png`, `.md`). Search results are limited to **files with the exact extension**.


## [4.1.0] - 2024-11-11

- Copy contents of frontmatter properties (Properties and Frontmatter modals).
- Properties and Frontmatter windows/modals are resizable.
- Navigator view: **Tag** column is now resizable.
- Fixed: `.ext` search (.png, .md or any other). You can also search excluding the desired extension like `!.png`(excludes .png extensions).
- Frontmatter divs word wrap adjustments.

## [4.0.1] - 2024-11-10
- Right-click on links in **Ext**, **Path**, **Tags** and **Frontmatter** columns. Will not work as a left-click.
- Right-click on tags and frontmatter properties (links) inside **Properties** and **Frontmatter** windows/modals. Will not work as a left-click.
- Mobile tweaks for the new frontmatter column (small screens).
- Frontmatter window: Frontmatter properties symbol (square -> circle).

## [4.0.0] - 2024-11-07
- **New Column**: **Frontmatter** (frontmatter metadata).

- **Settings**: Hide frontmatter column (toggle).

- **New context menu item**: **Frontmatter**.
   - **Frontmatter properties window**. This window will list frontmatter properties for the selected file. If you click on the selected property it will list all the files with the same property value combination.

- **Improved File Properties window/modal**: added frontmatter properties.

- **Enhanced Search Functionality**:
  - **Specific Quoted Search**: Search for specific sentences using quotes or single quotes. For example, `"this is the description of a note"`.

- **Improved dashboard category buttons**: Quickly filter your notes by clicking a dashboard category button. This automatically applies the filter to the navigator search and focuses the search input for easy typing.

- **Improved date filtering**: Enhanced date filtering for ranges like `@day-1`, `@day-2` (or `@d-2`),  etc. Now, these filters show **cumulative results**. For example, `@day-1` displays files created/modified **today** AND **yesterday**.

- **Improved month filtering**: `@month-1` or `@m-1` to `@month-12` or `@m-12`. `@month` or `@m`= current month (check readme for more information).

- **Visual Enhancements**: Larger tag font size and improved hover effects for tags and frontmatter columns.

## [3.1.0] - 2024-10-29

**Navigator**: 
- New **Ext** column (**File extension** column).
- Sort results by file extension (Ext column).
- **Navigator filter**: `@others`. You can use `@other`or `@others`.
- **New navigator category filters shorthands**: 
  - `@notes` or `@n`.
  - `@images` or `@i`.
  - `@canvas` or `@canvases` or `@c`.
  - `@audios` or `@a`.
  - `@videos` or `@v`.
  - `@pdf` or `@pdfs` or `@p`.
  - `@other` or `@others` or `@o`.
- **New navigator date filters shorthands**: 
  - `@d` (current day) or `@day` or `@today`.
  - `@yesterday` or `@day-1` or `@d-1`.
  - `@day-2` or `@d-2` to `@day-7` or `@d-7`.
  - `@w` or `@week`.
  - `@m` or `@month`.
  - `@y` or `@year`.

- UI sort select element (dropdown select -> options with column names - easier to use).
- When clicking on the dashboard category button it will show the filter on the navigator view search. Example: Notes button (dashboard view) -> `@notes`(navigator view search);

**Plugin Settings**:
- Hide Extension Column (Ext column).

## [3.0.0] - 2024-10-27
- **Improved user-friendly search with special filters** (advanced search).

- **Navigator**: Select columns to hide (settings -> toggle).
  - **Path** column
  - **Size** column
  - **Date** column
  - **Tags** column

- **Navigator**: **file hover fix** when *column striped layout* selected.

- **Navigator**: **Date column** hover -> tooltip shows `Created` and `Modified` date of the file.

Removed: 
- `Dashboard navigator: Open` command palette/shortcut. You can open **dashboard** or **navigator** views using their respective commands on command palette.

## [2.1.0] - 2024-10-04
- Added image file extensions -> category of images: jpeg, svg, avif.
- Added audio file extensions -> category of audios: aac, flac, aiff, m4a.
- Added video file extensions -> category of videos: mov, mkv.

## [2.0.0] - 2024-08-24
- Hotkeys open dashboard and open navigator.
- Excluded file extensions functionality.
- Excluded folders functionality.
- Select custom colors -> files and piechart (all available file categories).
- Colored files in dashboard and navigator views (toggle).

## [1.1.1] - 2024-07-27
- Navigator Size column adjustments (align right and padding).

## [1.1.0] - 2024-07-27
- New clear input search button.
- Click on path (navigator).
- Font size control using slider (results and links).

## [1.0.1] - 2024-07-25
- Renamed 'dn-activate' -> 'activate': addCommand to open dashboard navigator.

## [1.0.0] - 2024-07-21
First release
