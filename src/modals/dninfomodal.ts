import { App, MarkdownRenderer, Component } from 'obsidian';
import { DNBaseModal } from './dnbasemodal';

export class DNInfoModal extends DNBaseModal {
	private readonly _markdownContent = `
## Quick reference

The **Dashboard navigator** search allows you to quickly access and filter specific files within your vault. Quickly find notes, images, canvases, audios, videos, PDFs, and more with simple commands.

### Basic commands

- \`@notes\`: Lists all **notes**.
- \`@images\`: Lists all **images**.
- \`@canvas\` or \`@canvases\`: Lists all **canvases**.
- \`@audio\` or \`@audios\`: Lists all **audio** files.
- \`@video\` or \`@videos\`: Lists all **video** files.
- \`@pdf\` or \`@pdfs\`: Lists all **PDF** files.
- \`@other\`: Lists all **other** file types.
- \`@bases\`: Lists all **.base** files.
- \`@bookmarks\`: Lists all **bookmarked** files.

### Advanced filtering with search terms

You can combine the basic commands with search terms to narrow down your results:

* \`@notes #tag1\`: Lists **notes** with the tag \`#tag1\`.
* \`@notes desired_word #tag2\`: Lists **notes** with \`desired_word\` and \`#tag2\`.

### Search filters shorthands

- \`@n\` = \`@notes\`
- \`@i\` = \`@images\`
- \`@c\` = \`@canvas\` or \`@canvases\`
- \`@a\` = \`@audio\` or \`@audios\`
- \`@v\` = \`@video\` or \`@videos\`
- \`@p\` = \`@pdf\` or \`@pdfs\`
- \`@o\` = \`@other\`
- \`@bb\` = \`@bases\`
- \`@bm\` = \`@bookmarks\`

### Date filters and shorthands

For quick filtering by date ranges, use the following date filters or the respective shorthands:

**Current day:**
- \`@d\`, \`@day\`, or \`@today\`

**Current day and yesterday:**
- \`@d-1\` or \`@day-1\`

**Current day and past x days:**
- \`@d-2\` to \`@d-7\` or \`@day-2\` to \`@day-7\` (for 2 to 7 days before)

**Current week:**
- \`@w\` or \`@week\`

**Current month and past x months:**
- \`@m\` or \`@month\` (current month)
- \`@m-1\` or \`@month-1\` (current month and previous month)
- \`@m-2\` to \`@m-12\` or \`@month-2\` to \`@month-12\` (current month and 2 to 12 months prior)

**Current year:**
- \`@y\` or \`@year\`

**Example**:

To filter for data from the current month and the previous month, you would use \`@m-1\`.

### Combining search terms, file types and date filters

You can combine search terms, file types (one per search) and date filters for more precise results:

- \`@notes #tag1 @month\`: Lists **notes** with the tag \`tag1\` created/modified this month (*Shorthand*: \`@n #tag1 @m\`).

- \`@images @week\`: Lists **images** added this week (*Shorthand*: \`@i @w\`).

### Smart date range filtering

Dashboard Navigator supports advanced calendar-based filtering using the \`@date(..)\` or \`@d(..)\` syntax. This feature allows you to "zoom" into specific years, months, or custom time windows.

#### Specific periods

Target a specific block of time without needing ranges:

- **Yearly view**: \`@d(2025)\` — Filters all files modified in the year 2025.

- **Monthly view**: \`@d(2025-10)\` — Filters files modified during October 2025.

- **Daily view**: \`@d(2026-02-15)\` — Filters files modified on that specific day.

#### Custom date ranges

Use the \`..\` delimiter (\`double-dot\`) to define a **start** and **end** point. The parser is boundary-aware, expanding the dates to include the full period.

- **Fixed range**: \`@d(2024..2025)\`(Includes everything from **Jan 1, 2024**, to **Dec 31, 2025**)

- **Mixed precision**: \`@d(2025-01..2025-06-15)\` (From the **start of January** until the **end of June 15th**)


#### Open-ended ranges

Leave **one side of the delimiter empty** to create "infinite" boundaries:

- **From date until today**: \`@d(2025-01-01..)\` (**Everything** from **Jan 1, 2025** until **today**)

- **Archival view**: \`@d(..2023)\`(**Everything** modified **from the beginning** of time until the **final second of 2023**)

#### Date range: Format and syntax

- **Date format**: Use the ISO standard (YYYY-MM-DD) for specific dates.

- **Strict syntax**: **Exactly one range delimiter** \`..\` is required for ranges. Inputs like \`@d(2024..2025..2026)\` are **ignored**.

**Pro tip**: For relative offsets (like "Last 7 days"), use the standard shortcuts like \`@d-7\` or \`@w\` - no parentheses.

#### Special date filter label

When a **date range filter is active**, a clear indicator (label) appears in the Navigator view. This makes it easy to see exactly which time window is applied and quickly refine your search.

#### Use Date Range Filter with Other Existing Filters

- The date range filter works seamlessly with other **Dashboard Navigator filters**. You can combine it with \`@notes\` (to target only notes), \`@images\`, \`@bases\`, also add **Tags** and **Frontmatter** (multi-layered search). You can build simple to complex queries in order to easily find specific files in your vault. It allows for highly specific, multi-layered and incredibly fast searches.

**Examples**:

- Combine with **file type**: \`@notes @d(2024..)\` or \`@n @d(2024..)\` (**All notes modified** from **2024** to **now**).

- Combine with **tags**: \`#work #wip @d(2025-10)\` (Notes with tags \`#work\` AND \`#wip\` modified during **Oct 2025**).


### Quoted search

- **Specific quoted search**: Search for specific sentences in frontmatter metadata or for specific filename using double or single quotes. For example, \`"this is the description of a note"\`.

### Additional tips

* **Case sensitivity:** Search terms are **case-insensitive**.

* **Multiple commands:** You can use **multiple commands in a single query**, separated by spaces.

### Excluding results

To exclude specific content from your search results, you can use the \`!\` exclamation point followed by the text, tag or folder you want to exclude. This will remove any items that match the exclusion term.

**Example**:

- \`@notes #work #pending !#urgent\`: This will list **all notes** tagged with \`#work\` and \`#pending\` except those tagged with \`#urgent\`.

### Combining exclusions with other filters

You can combine exclusions with other filters, such as tags and date, to further refine your search:

- \`@notes #meeting !#international @month\`: This will list all notes tagged with \`#meeting\` that were created or modified this month, **excluding** those tagged with \`#international\`.

- To find all notes tagged \`#meeting\` created/modified in the current month: \`@notes #meeting @month\`.

By effectively using exclusions, you can tailor your searches to your specific needs and quickly find the information you're looking for.

### Frontmatter metadata search
    
To search for specific frontmatter metadata, use the following syntax:

**1. Search by property or value:**

- Property match (all notes with this property): \`'name_of_the_property:'\`

**Example**: \`'task:'\` or \`'created:'\`

- Search for the value in one metadata property: \`'task:' value\` or \`'task:' 'This is a sentence to match'\`. The sentence to match can be in single or double quotes

**Example**: \`'task:' 'create pdf'\`

**2. Search by property and value:**

- Exact match: \`'name_of_the_property: value'\`

**Example**: \`'topic: javascript'\`

**Tips:**

- Use single quotes (\`'\`) to enclose when searching for specific metadata.

- You can use the context menu (navigator view or dashboard view to open the **Frontmatter** or **File properties** modal). Click on the desired frontmatter metadata to quickly search for an exact match within your notes.

### Bookmarks

New **bookmarks** command (Navigator view - search): \`@bookmarks\` or \`@bm\` as its shorthand. This command will **list all bookmarked files** in Navigator view, so you can sort them by file name, extension, folder, date, search for tags and frontmatter.

- You can search for the file categories using the additional \`@bookmarks\`or \`@bm\` filter to identify which ones are bookmarked, e.g. \`@notes @bm\` (notes that are bookmarked) or \`@images @bm\`(images in your bookmarks).

### Tag actions

You can quickly filter your search results by interacting with **tags** directly within the **Navigator view**, **File Properties modal**, or **Tags modal**. These actions let you include or exclude tags from your current search query.

**\`Shift + left-click\`: Toggle tag inclusion**

1. A \`Shift + left-click\` on a tag toggles between these states:

- **Add tag:** This adds the tag to your search query. You'll **only see results that have this tag.** (e.g., \`#tag\`)

- **Remove tag:** This removes the tag from your search query. The tag will **no longer filter your results**.

- \`Ctrl + left-click\`: Toggle tag exclusion command**

2. A **Ctrl + left-click** on a tag toggles between these states, specifically managing an *exclusion command*:

- **Add exclusion command:** This adds a command to your search query to **exclude** the tag. You'll **only see results that *do NOT* have this tag.** (e.g., \`!#tag\`)

- **Remove exclusion command:** This removes the exclusion command for that tag from your search query. The tag will **no longer filter your results by exclusion**.

### Sort files

- You can sort the files by double clicking on the table header and also by using the dropdown select.

### Display results

You can select 5 types of layouts to display the search results:
- Default
- Row striped
- Column striped
- Bordered
- Cards

### Preview files (hover and context menu)

- **Quick file inspection**: You can choose to preview files using either the **hover preview** or the dedicated context menu item (**Show preview**) in the Dashboard and/or Navigator views. 

- By simply hovering over a file or note while holding down the \`Ctrl\` (Windows/Linux) or \`Command\` (macOS) key, you can instantly preview its content.

- **Context menu**: \`Show preview\` option. This allows you to preview a file or note without the need for a modifier key.

- The **preview window** displays the file's **name** and **path**. You will find three buttons on this window:

1. **Open**: Directly opens the file.
2. **Open in new tab**: Opens the file in a new tab.
3. **Open in new window**: Opens the file in a completely new window.


### Drag-and-drop preview window

- **Drag-and-drop positioning**: You have the freedom to move the preview window to any desired location on the screen. The preview window's position is remembered for subsequent previews (till you close the Dashboard navigator window), ensuring consistency and reducing the need for constant readjustment.

- **Default position**: If you close and reopen the Dashboard navigator window, the preview will automatically return to its default position.

### Context menu

- Right-click the mouse button on the desired file link or table result to open the context menu. You can open the note in various ways (same tab, new tab, new window and also show its properties and metadata). You can also open the note by **double clicking** on the desired result.

### Navigator view: Hide columns

The column-hiding feature gives you the flexibility to customize the **navigator view** to suit your specific preferences and workflow. By **hiding unnecessary columns** you can create a cleaner, more focused view that highlights the information most relevant to you.

You can hide the following columns:
- **Ext**: Shows the file extension.
- **Path**: Shows the location of the file within your vault structure.
- **Size**: Displays the file size.
- **Date**: Indicates the modification date of the file.
- **Tags**: Lists the tags associated with the note, making it easier to categorize and search for notes.
- **Frontmatter**: Lists the frontmatter/metadata associated with the note.
- **BL (backlinks)**: The total number of notes that link to this file.
- **OL (outgoing links)**: The total number of links from this note to other files.

### Tags dashboard view

- **Advanced tag(s) search**: This feature uses secondary tags as cross-references to help you navigate your notes like a dynamic map. By revealing which tags are used together, you can discover hidden associations and see how different ideas and topics are implicitly connected in your vault.

- The tags dashboard's initial state shows a list of your most recently created or modified notes along with their corresponding tags. This gives you a quick overview of your recent activity.

- The \`@tags\` command (top search bar) to search directly in **Tags** dashboard view:

  - **Beginning of the query**: When you start a search with \`@tags\`, it acts as a shortcut. It immediately switches your view to the Tags dashboard and focuses the cursor in the Tags dashboard's search bar, allowing you to start a new tag-focused search right away.

  - **End of the query**: When you place \`@tags\` at the end of a tag(s) search (e.g., \`#tag1 #tag2 @tags\`), it opens the Tags dashboard and shows you all the secondary tags that are used in conjunction with the tag(s) you've already searched for. This helps you find related topics and discover connections between your notes.

- You can also save the tags search using \`@tags\` with a description (saved searches window). When clicking on the saved search option it will open the saved query directly in **Tags** dashboard view.

#### Tags dashboard commands

These commands work on the tags displayed in the **recent notes & tags** section, the **secondary tags** displayed in the main **Tags** dashboard, and within the tags list in the **tags sidebar**.

- \`Left-click\`: Change the selected secondary tag into a primary tag, making it the main focus of your view.

- \`Shift + click\`: Add this tag to your current search using an AND condition. For example, if your search is \`#article\`, holding \`Shift\` and \`clicking\` on \`#status\` will change your search to \`#article #status\`(notes with tags **#article** AND **#status**).

- \`Ctrl + click\`: Exclude this clicked secondary tag. This is useful for filtering out results that contain a specific tag.

- \`Ctrl + middle-click\`: Quickly clear your tag search and start fresh. This removes all tags from your search query, allowing you to reset your view with a single click.

### Excluded file extensions

- Open **plugin settings** and select the file extensions that you don't want to display (extensions separated by commas).

- Enter file extensions: In the provided text field, list the file extensions you want to exclude, separated by commas. For example: \`txt, docx, js\`.

### Excluded folders

- Open **plugin settings** and select the file extensions that you don't want to display (folder paths separated by commas).

- Enter folder paths: In the provided space, list the folder names or paths to the folders(subfolders) you want to exclude, separating them with commas. For example: \`folder1/subfolder, source_files, folder2\`.

### Colored files

- Select custom colors for files in the dashboard and navigator views. 

- These colors will be reflected in the piechart graph, making it easier to identify and track different file types. To activate this feature, go to **plugin settings** and **toggle colored files**.

### Colored tags support

- If the theme being used supports colored tags or if you are using custom CSS snippet to color tags, the **tags** column and **file properties** window will show colored tags accordingly.

`;
	private _mdComponent: Component = new Component();

	constructor(app: App) {
		super(app);
	}

	render() {
		const { contentEl } = this;

		const markdownContainer = contentEl.createEl('div', { cls: 'dn-info-modal' });


		MarkdownRenderer.render(
			this.app,
			this._markdownContent,
			markdownContainer,
			this.app.vault.configDir,
			this._mdComponent
		);
	}


}