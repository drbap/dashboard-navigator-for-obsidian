# Changelog

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
  - `@pdf`or `@pdfs` or `@p`.
  - `@other`or `@others` or `@o`.
- **New navigator date filters shorthands**: 
  - `@d` (current day) or `@day` or `@today`.
  - `@yesterday` or `@day-1` or `@d-1`.
  - `@day-2` or `@d-2` to `@day-7` or `@d-7`.
  - `@w` or `@week`.
  - `@m` or `@month`.
  - `@y` or `@year`.

- UI sort select element (with column names).
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
