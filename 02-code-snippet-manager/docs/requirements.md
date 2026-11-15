# System Requirements Specification: Code Snippet Manager

## 1. Executive Summary

The **Code Snippet Manager** is a developer-centric workspace designed to organize, edit, version, and rapidly retrieve code snippets. Supporting over 30 programming and scripting languages, it features full-text search across code and metadata, hierarchical folder organization, tagging, version history tracking, markdown annotations, one-click clipboard copying, and granular workspace privacy controls.

## 2. Functional Requirements

### 2.1 Authentication & Workspace Isolation
- User registration and authentication via JWT and bcrypt.
- Multi-workspace isolation: Users operate within their own isolated snippet library.
- Public vs Private snippet visibility flags.

### 2.2 Code Snippet Lifecycle & Editor
- Create, read, update, and delete (CRUD) snippets.
- Support for multiple code fragments/files per snippet (e.g. HTML + CSS + JS or implementation + unit test).
- Integration with Monaco Editor / CodeMirror: Line numbers, code folding, bracket matching, mini-map, indentation preferences (2 vs 4 spaces, tabs).
- Supported languages: TypeScript, JavaScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, SQL, HTML, CSS, SCSS, JSON, YAML, Markdown, Bash/Shell, Dockerfile, GraphQL, Swift, Kotlin.

### 2.3 Hierarchical Folders & Organization
- Nested folder structures with parent-child relationships.
- Ability to move snippets across folders.
- Root-level snippets (uncategorized inbox).

### 2.4 Tags & Categories
- Many-to-many tag relationships for dynamic filtering (e.g. `#react`, `#auth`, `#algorithms`, `#database`).
- Tag color badges and instant tag-based filtering.

### 2.5 Full-Text Search & Filtering
- Real-time search engine querying snippet titles, descriptions, tags, and raw code content.
- Faceted filtering: by language, folder, tag, favorite status, or creation/update date.

### 2.6 Version History & Revision Tracking
- Automatic snapshot creation on every snippet content edit.
- Ability to view previous versions, timestamps, and commit messages.
- One-click rollback to any prior historical version.

### 2.7 Productivity & Ergonomics
- Instant one-click code copy to system clipboard with visual confirmation.
- Favorites / Bookmarks: Fast access to frequently referenced snippets.
- Rich markdown description and documentation notes rendered alongside code.

### 2.8 Bulk Import & Export
- Export user library or selected snippets to JSON or ZIP format.
- Import snippets from JSON schemas.

## 3. Non-Functional Requirements
- High-speed query execution (< 30ms search latency on 5,000+ snippets).
- Pure isolation: Dedicated PostgreSQL database schema with Prisma ORM.
- Comprehensive test coverage across unit, integration, API, and security dimensions.
