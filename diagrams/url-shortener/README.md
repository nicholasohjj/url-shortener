# URL Shortener System Diagrams

This directory contains PlantUML diagrams documenting the URL shortener system architecture and flows.

## Diagrams

### 1. `system-overview.puml`
**System Overview & Architecture Diagram**
- High-level view of all system components
- Shows the complete architecture from UI to database
- Includes component relationships and data flow
- Best for understanding the overall system structure

### 2. `component-diagram.puml`
**Component Diagram**
- Detailed component breakdown
- Shows layers: Client, Application, Business Logic, Data Access
- Database schema documentation
- Best for understanding system layers and dependencies

### 3. `create-url-sequence.puml`
**Create Short URL Sequence Diagram**
- Step-by-step flow for creating a short URL
- Shows all interactions between components
- Includes error handling scenarios
- Best for understanding the URL creation process

### 4. `redirect-sequence.puml`
**Redirect & Click Tracking Sequence Diagram**
- Flow for accessing a short URL
- Shows click tracking and redirect logic
- Database update operations
- Best for understanding the redirect and tracking mechanism

### 5. `data-flow.puml`
**Data Flow Diagram**
- Simplified flow of data through the system
- Decision points and branching logic
- Best for understanding business logic flow

## How to View

### Option 1: VS Code Extension
Install the "PlantUML" extension by jebbs, then open any `.puml` file and use the preview.

### Option 2: Online Viewer
1. Copy the contents of any `.puml` file
2. Go to http://www.plantuml.com/plantuml/uml/
3. Paste the content to view the diagram

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# Then generate PNG:
plantuml diagrams/url-shortener/*.puml
```

## System Features Documented

- ✅ URL validation
- ✅ Slug generation (random or custom)
- ✅ Unique slug enforcement
- ✅ Click counting
- ✅ Last accessed timestamp tracking
- ✅ HTTP redirect mechanism
- ✅ Error handling

