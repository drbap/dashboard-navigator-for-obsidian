# Changelog

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
