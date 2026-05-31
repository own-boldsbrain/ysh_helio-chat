# Planning Guide

Yello Solar Hub: A comprehensive solar energy analysis platform that combines AI-powered conversational interface with high-fidelity solar irradiance data, 3D environmental modeling, and photovoltaic performance simulation. The platform serves as an engineering copilot for solar integrators in Brazil, providing analysis-ready tools for site assessment, shading analysis, equipment selection, financial analysis, and regulatory compliance - all built on a foundation of open-source tools and AWS public datasets for Earth observation.

**Experience Qualities**:

1. **Professional** - The interface should feel like a sophisticated engineering tool that inspires confidence, combining conversational AI assistance with technical precision and data-driven insights
2. **Intelligent** - The platform should actively guide users through complex workflows, from site assessment to regulatory compliance, leveraging AI to simplify technical decisions
3. **Comprehensive** - Every aspect of solar project development should be addressable within the platform, from initial site analysis using satellite data to final project documentation

**Complexity Level**: Complex Application (advanced functionality, multi-modal data integration)

  - Integrates high-fidelity solar irradiance data from CAMS and NASA POWER, processes 3D geospatial data from OpenStreetMap and IBGE DEMs, performs photovoltaic simulations using industry-standard models, provides access to AWS Earth observation datasets (Sentinel-2, CBERS-4), offers AI-powered conversational guidance for regulatory compliance and technical questions, manages multiple project workflows with state persistence, and generates engineering artifacts (reports, diagrams, specifications). Built with a hybrid architecture combining frontend React components with backend simulation capabilities, designed to scale as a "Solar Accuracy as a Service" platform.

### 3D Shading Analysis with Terrain Data

- **Functionality**: Advanced shading analysis using Digital Elevation Models (DEM) and 3D urban geometry to calculate precise solar shading impacts from terrain features and buildings. Provides interactive 3D visualization with MapLibre GL showing terrain exaggeration, satellite imagery, and hillshade rendering. Analyzes far-field (terrain horizon) and near-field (building) obstructions with hourly, monthly, and annual shading metrics.
- **Purpose**: Enables accurate solar potential assessment by quantifying shading losses from topography and urban environment, critical for ROI calculations and system sizing. Addresses Phase 2 technical architecture requirements for environmental context modeling and 3D shading analysis (hybrid approach combining DEM-based horizon profiling with building shadow projection).
- **Trigger**: User navigates to "Análise de Sombreamento" from sidebar menu or initiates analysis from dimensioning workflow
- **Progression**: Enter address or CEP → Location geocoded → Interactive 3D map loads with satellite + terrain → Select view mode (2D/3D/Terrain) → Optional roof polygon drawing → Click "Iniciar Análise" → Progress bar with stage indicators (terrain data, building detection, horizon profile) → Results display with tabs (Summary with annual metrics + horizon profile chart, Monthly breakdown with progress bars, Recommendations with actionable insights)
- **Success criteria**: Map loads with 3D terrain and satellite imagery, smooth camera transitions between view modes (2D/3D pitch 60°/terrain pitch 70°), analysis completes in <5 seconds with progress feedback, displays terrain metrics (elevation, slope, aspect, solar factor), detects building obstructions with height/distance/azimuth/impact, generates 360° horizon profile visualization, calculates annual shading % with monthly/hourly breakdowns, provides contextualized recommendations based on shading level (<5% excellent, 5-10% good, 10-20% moderate, >20% significant), responsive layout adapts to mobile/desktop, integrates with existing solar analysis workflows

### Complete Solar Sizing Workflow (End-to-End)

- **Functionality**: Comprehensive wizard-based workflow guiding users through complete solar system dimensioning from location input to final proposal generation. Multi-step process includes: (1) Location & solar data collection via CEP with irradiation lookup, (2) Consumption analysis with electrical phase selection, (3) System sizing with 3 scenario options (Conservative 1.14x, Balanced 1.30x, Optimized 1.45x), (4) Equipment selection with real component pricing (panels, inverters, mounting structures), (5) Financing options (cash vs. bank financing with monthly payment calculations), (6) Final results with complete technical and financial analysis, regulatory compliance notes, and next steps, (7) **PDF proposal generation** with professional formatting
- **Purpose**: Provides turnkey solution for solar professionals and homeowners to generate complete, actionable solar proposals with accurate pricing, financing options, ROI calculations, regulatory compliance, and downloadable/shareable PDF documents in one continuous flow. Eliminates need for multiple tools and manual calculations while ensuring consistency and accuracy across all sizing scenarios
- **Trigger**: User navigates to "Workflow Completo" from Dimensionamento section in sidebar menu or "Gerar Proposta PDF" for standalone PDF generation
- **Progression**: Welcome screen with progress indicator → Step 1: CEP input with ViaCEP integration and irradiation data → Step 2: Monthly consumption (kWh) and electrical phase selection (mono/bi/tri) → Step 3: Choose sizing scenario with side-by-side comparison of 3 options showing panels, inverter size, production, coverage → Step 4: Select equipment from curated catalog with brand/model/specs/pricing (panels, inverters, mounting structures) → Step 5: Choose payment method (cash with total cost or financing with bank/term/down payment selection and monthly payment calculation) → Step 6: Complete proposal with system specs, financial analysis (payback, ROI), regulatory note (Lei 14.300/2022), and next steps checklist → **Download PDF or Preview PDF** → Workflow complete with data persisted
- **Success criteria**: All 6 steps complete with validation at each stage, back navigation preserves entered data, progress bar shows current position, each step has clear visual design with cards and selection states, CEP lookup returns valid address and calculates realistic irradiation (5.2-6.0 kWh/m²/dia range), consumption translates to system size using 80% PR, 3 scenarios calculate correctly with proper multipliers, equipment costs aggregate accurately (panels + inverter + structure + installation + project), financing calculations show monthly payment with interest compounding, final proposal displays all data in organized sections with export capability, **PDF generates with professional formatting including client data, location, consumption, solar data, system configuration with equipment specs, financial analysis with detailed breakdown, shading analysis, financing options with net savings calculation, regulatory compliance notes (Lei 14.300/2022), next steps checklist, and proper branding**, responsive design works on mobile/tablet/desktop, smooth animations between steps (300ms), toast notifications for errors and success states, workflow data structure typed with TypeScript interfaces, integrates with existing navigation and routing system

### PDF Proposal Generator

- **Functionality**: Standalone professional PDF proposal generator for solar photovoltaic systems with comprehensive technical and financial details. Includes client information section, project location with coordinates, consumption data analysis, solar irradiation data for the site, complete system configuration (panels, inverters, mounting structure), detailed financial analysis with investment breakdown (equipment, installation, project costs), monthly/annual economy estimates, payback calculation, 25-year ROI, optional financing details with bank, term, interest rate, and monthly payments, shading analysis results, regulatory compliance notes (Lei 14.300/2022), next steps checklist, and custom observations. Features professional layout with solar gradient branding, multi-page support with automatic pagination, data tables with alternating rows, color-coded sections, and complete footer with generation timestamp.
- **Purpose**: Enables solar integrators and engineers to create professional, client-ready proposals directly from the platform without external tools. Provides standardized, branded documentation that includes all necessary technical specifications, financial analysis, and regulatory information required for solar project approval and client decision-making. Streamlines proposal workflow and ensures consistency across all projects.
- **Trigger**: User navigates to "Gerar Proposta PDF" from Dimensionamento section in sidebar menu
- **Progression**: Form page loads with pre-filled example data → User enters/edits client information (name, document, email, phone) → Enters project location (address, city, state, CEP, irradiation) → Inputs consumption data (monthly kWh, average bill, electrical phase) → Configures system (scenario selection, system size, panel/inverter specs and quantities) → Enters financial data (investment, monthly economy, payback, ROI) → Optional financing details (bank, term, interest rate, monthly payment) → Adds shading analysis percentage → Clicks "Visualizar PDF" for preview in new window OR "Baixar Proposta PDF" for direct download → PDF generates with all sections properly formatted → Success toast confirmation
- **Success criteria**: Form fields validate input types (numbers, text, selections), all sections render correctly in PDF with proper spacing and alignment, solar gradient colors (yellow-orange-red) appear in header and accents, client and location data display in organized cards with rounded corners, consumption and solar data render in clean tables with proper number formatting (Brazilian locale with comma decimal separator), system configuration shows equipment details with proper formatting (brand, model, quantities, power ratings), financial analysis displays investment breakdown and ROI metrics with currency formatting, optional shading analysis section only appears when data present, financing section calculates and displays net monthly savings with color coding (green for positive, red for negative), regulatory note appears in yellow highlighted box with proper Lei 14.300/2022 text, next steps render as numbered list, observations section handles long text with proper wrapping, multi-page support with automatic page breaks, page numbers display on every page (Page X of Y), footer shows generation timestamp and platform branding, preview opens in new browser tab, download triggers file save with sanitized filename including client name and date, PDF file size remains reasonable (<500KB for typical proposal), works on all modern browsers, mobile-responsive form layout, toast notifications for success/error states, loading states during PDF generation, TypeScript interfaces ensure type safety

### Collapsible Sidebar Navigation

- **Functionality**: ChatGPT-style sidebar with navigation menu, GPT options, project management, and chat history
- **Purpose**: Provides organized access to all app features and chat sessions, matching ChatGPT's familiar interface
- **Trigger**: User clicks the menu icon (hamburger on mobile, toggle on desktop)
- **Progression**: Click toggle → Sidebar slides in from left → Display navigation sections → User selects option → Sidebar closes (on mobile)
- **Success criteria**: Smooth slide animation (300ms spring), organized sections (Novo chat, Buscar, Galeria, Codex, GPTs, Projetos, Chats), chat history list with selection, mobile-responsive with backdrop overlay

### Chat Session Management

- **Functionality**: Creates, saves, and manages multiple independent chat conversations
- **Purpose**: Allows users to maintain separate conversation threads organized by topic
- **Trigger**: User clicks "Novo chat" button or selects an existing chat from history
- **Progression**: Click new chat → New session created → Previous chat saved → Empty chat ready → First message auto-titles the chat
- **Success criteria**: Each chat session persists independently with KV storage, chat titles auto-generate from first user message (50 char limit with ellipsis), sessions sorted by most recent

### Chat History Display
- **Functionality**: Lists all previous chat sessions in the sidebar with titles and selection
- **Purpose**: Enables quick navigation between different conversation topics
- **Trigger**: Sidebar opens, chat history section visible
- **Progression**: Open sidebar → View chat list → Click chat → Load chat messages → Sidebar closes (mobile)
- **Success criteria**: Chats display with meaningful titles, selected chat highlighted, smooth transitions between chats, empty state message when no chats exist

### Chat Message Input
- **Functionality**: Text input area where users type messages to send to the AI
- **Purpose**: Primary interaction point for users to communicate with the AI
- **Trigger**: User clicks into the input area at the bottom of the screen
- **Progression**: Focus input → Type message → Press Enter or click send button → Message submits
- **Success criteria**: Messages are sent on Enter (but Shift+Enter creates new line), input clears after sending

### AI Response Generation (Hélio - Copiloto Solar)
- **Functionality**: Sends user message to OpenAI's GPT-4o with specialized solar engineering prompt and displays the response in Portuguese (pt-BR)
- **Purpose**: Core chat functionality that provides AI-powered solar engineering guidance, dimensioning calculations, equipment recommendations, financial analysis, and regulatory compliance assistance
- **Trigger**: User sends a message
- **Progression**: User sends message → Message appears in chat → Loading indicator shows → AI response generated with Hélio system prompt → Response completes
- **Success criteria**: Responses are clear and technical-friendly in Portuguese, explain technical jargons (kWp, PR, MPPT, etc.), request only essential data (CEP, monthly consumption, electrical phase), present 3 sizing scenarios (1.14x/1.30x/1.45x), include financial analysis (ROI/payback), offer shared generation (GC) for users without suitable roofs, include regulatory notes (Lei 14.300/2022), conclude with 2-3 clear next-step CTAs, errors are handled gracefully

### Message History

- **Functionality**: Displays all messages in chronological order with clear visual distinction between user and AI
- **Purpose**: Provides conversation context and allows users to review past exchanges
- **Trigger**: Automatically displayed as messages are sent/received
- **Progression**: New message → Scroll to bottom → Message visible in history
- **Success criteria**: Messages persist between sessions, scroll behavior is smooth, alternating message styles are clear

### Message Editing

- **Functionality**: Allows users to edit their sent messages and regenerate AI responses from that point
- **Purpose**: Enables users to refine their questions or fix typos without starting a new conversation
- **Trigger**: User hovers over their message and clicks the "Edit" button
- **Progression**: Hover message → Click Edit → Inline textarea appears → Edit content → Press Enter or click Save → Message updates → AI generates new response
- **Success criteria**: Edited message replaces original, conversation from that point forward is regenerated, cancel option restores original message

### Response Regeneration

- **Functionality**: Regenerates the AI's last response without changing the user's message
- **Purpose**: Allows users to get alternative responses if they're not satisfied with the first answer
- **Trigger**: User hovers over the last AI message and clicks the "Regenerate" button
- **Progression**: Hover last AI message → Click Regenerate → Loading indicator shows → New response appears replacing old one
- **Success criteria**: Only available on last AI message, previous conversation history is preserved, new response replaces old one

### Prompt Library

- **Functionality**: Curated collection of prompt templates organized by category with search functionality
- **Purpose**: Helps users get started quickly with proven prompts for common tasks (coding, writing, analysis, translation, etc.)
- **Trigger**: User clicks the Lightning icon in the header toolbar
- **Progression**: Click Lightning icon → Modal opens with categorized prompts → User searches or browses → Clicks prompt card → Template fills input field → User customizes and sends
- **Success criteria**: 8+ prompt templates across multiple categories (Desenvolvimento, Criatividade, Produtividade, Linguagem, Dados, Comunicação, Educação), real-time search filtering, smooth modal animations, prompts fill the input field when selected

### Advanced Search
- **Functionality**: Search across all chat conversations including titles and message content with keyboard shortcut (⌘K / Ctrl+K)
- **Purpose**: Quickly find past conversations and specific information discussed
- **Trigger**: User clicks search icon in header or presses ⌘K/Ctrl+K keyboard shortcut
- **Progression**: Open search → Type query → See real-time filtered results → Click result → Opens that conversation → Search closes
- **Success criteria**: Searches both titles and message content, shows match count and preview snippets, highlights matching chats, keyboard accessible (⌘K), displays timestamps, instant results

### Share and Export
- **Functionality**: Share conversations via link or export in multiple formats (Markdown, JSON)
- **Purpose**: Enables collaboration, backup, and analysis of conversations outside the app
- **Trigger**: User clicks Share icon in header (only visible when chat has messages)
- **Progression**: Click Share → Modal opens → Copy shareable link OR download as Markdown/JSON → Success toast confirmation
- **Success criteria**: Generate shareable demo links, export clean Markdown with message formatting, export structured JSON with metadata, clipboard copy functionality, file download with proper naming

### User Settings & Preferences
- **Functionality**: Comprehensive settings panel for personalizing the chat experience across Profile, Preferences, and Notifications tabs
- **Purpose**: Allow users to customize their experience including display name, language, message density, code themes, auto-scroll, sounds, and notifications
- **Trigger**: User clicks Gear icon in header toolbar
- **Progression**: Click settings → Modal opens with tabs → User navigates tabs → Adjusts settings → Saves or cancels → Settings persist via KV storage
- **Success criteria**: 3 organized tabs (Profile, Preferences, Notifications), displays Facebook user info (nome, email, foto), persists all preferences using useKV, includes switches for boolean options, dropdowns for selections, preview of changes before saving

### Message Actions
- **Functionality**: Enhanced message interaction with copy button on all messages
- **Purpose**: Improves usability by allowing users to easily copy message content
- **Trigger**: User hovers over any message
- **Progression**: Hover message → Action buttons appear → Click Copy → Content copied to clipboard → Toast confirmation → Button shows "Copied" feedback
- **Success criteria**: Copy button appears on all messages (user and assistant), clipboard copy works reliably, visual feedback with check icon and text change, toast notification on copy

### New Chat
- **Functionality**: Creates a new chat session and saves the current one
- **Purpose**: Allows users to begin a new topic without old context while preserving previous conversations
- **Trigger**: User clicks "New Chat" button in header or sidebar
- **Progression**: Click button → Current chat auto-saved → New session created → Chat clears → Ready for new message
- **Success criteria**: Previous chat preserved in history, new empty chat ready, sidebar updates with new session, toast confirmation

### ChatKit Widgets

- **Functionality**: Rich interactive cards and components following ChatKit's component architecture (Card, ListView, Row, Col, Box, Button, Text, Title, Badge, Image, Divider, Icon, Progress, Form, Select, DatePicker, Markdown) that appear in chat messages. Includes product showcases, lists, forms, polls, progress trackers, stats dashboards with enhanced visual design and purposeful animations
- **Purpose**: Provide interactive, structured content within chat conversations beyond plain text, enabling data visualization and user interaction with a premium, polished feel. Demonstrates the full range of ChatKit widget capabilities including layout containers, interactive elements, and rich media components
- **Trigger**: User sends specific messages or selects widget examples from the demo menu
- **Progression**: User triggers widget → Widget card appears with smooth animation → User interacts with buttons/forms/polls/selects → Actions are captured and displayed with toast notifications → Widget state updates in real-time with smooth transitions
- **Success criteria**: Widgets render correctly with smooth entrance animations (300ms with stagger), are fully interactive with hover states and micro-interactions, actions are logged and displayed via toast, various widget types are demonstrated (product cards with enhanced image display and badges, polls with animated vote reveals, progress bars with staggered animations, stats with trend indicators, forms with selects and inputs), component hierarchy follows ChatKit patterns (containers > layout components > content components), state persists during interaction, Portuguese localization for all widget content

### Earth Observation Data Explorer

- **Functionality**: Dedicated page displaying AWS public datasets for Earth Observation data of Brazil, including Sentinel-2 and CBERS-4 satellite imagery with S3 bucket access and SNS notification details. Forms the foundation of the platform's data acquisition strategy as outlined in Section 1 of the technical architecture.
- **Purpose**: Provides solar energy professionals access to satellite imagery datasets for analyzing installation sites, monitoring solar farms, and environmental assessments. Complements the high-fidelity irradiance data from CAMS/NASA POWER with visual and multispectral Earth observation capabilities for site context and terrain analysis.
- **Trigger**: User navigates to "Earth Observation" from sidebar menu (Compass icon)
- **Progression**: Click navigation → Page loads with interactive map centered on Brazil → Browse tabs for different datasets → View ARN, CLI commands, and STAC endpoints → Copy resources for external use → Explore detailed dataset information → Understand integration with solar analysis workflows
- **Success criteria**: MapLibre map displays Brazil with 3D terrain and satellite imagery (matching the visualization requirements for terrain modeling), four dataset tabs (Sentinel-2, CBERS-4, and their SNS Topics), copyable ARN and CLI commands with visual feedback, STAC endpoint links to Brazil Data Cube STAC API (https://brazildatacube.dpi.inpe.br/stac/), detailed information about each satellite mission including resolution and applications for solar site assessment, gradient color coding per dataset type (blue-cyan for Sentinel, green-emerald for CBERS, purple-pink for Sentinel SNS, orange-red for CBERS SNS), responsive grid layout adapting to mobile/desktop, clear documentation of no-sign-request access pattern for public data

### Realtime Voice Conversations (OpenAI Realtime API - GA)

- **Functionality**: Low-latency, multimodal voice conversations with the Hélio solar assistant using OpenAI's Realtime API (GA interface) over WebSocket. Features real-time speech-to-speech interactions with server-side Voice Activity Detection (VAD), streaming audio input/output, and live transcription display. Fully integrates the GA API updates including new event names (conversation.item.added, response.output_audio.delta, response.output_text.delta), session type specification, and updated audio configuration structure.
- **Purpose**: Enables natural voice-based interactions for solar engineering consultations, allowing users to ask questions hands-free while working on site assessments, reviewing equipment specs, or discussing project details. Demonstrates cutting-edge conversational AI capabilities for technical domains.
- **Trigger**: User navigates to "Realtime Voice" from sidebar menu (Microphone icon)
- **Progression**: Open page → Click "Conectar" → WebSocket session establishes with session.update → Click "Falar" → Microphone activates with audio level visualization → User speaks naturally → Server VAD detects speech boundaries → Audio streams to model → Assistant responds with streaming audio output → Live transcript displays for both user and assistant → Conversation history builds in real-time → Click "Desconectar" to end session
- **Success criteria**: WebSocket connection establishes reliably with proper session configuration (type: "realtime", audio.output.voice, turn_detection), microphone access granted with browser permissions, real-time audio level visualization displays 20 animated bars responding to voice amplitude, server VAD automatically detects start/end of speech without manual triggers, assistant audio responses play immediately with <300ms latency, live transcripts update incrementally showing both conversation.item.added and output deltas, conversation history persists during session with timestamps and role badges, animated UI states for connecting/listening/speaking with smooth transitions, proper cleanup on disconnect (stops media streams, closes AudioContext), handles GA API event names correctly (output_audio.delta, output_text.delta, output_audio_transcript.delta), error handling with user-friendly Portuguese messages, responsive layout adapts to mobile/tablet/desktop, integrated documentation tab explains GA API features and migration from beta

## Technical Architecture Foundation

### Data Layer (Backend Capability - Phase 1-2 Implementation)
- **High-Fidelity Solar Irradiance Data**
  - Primary Source: CAMS Radiation Service (Copernicus) - validated for Brazil with <5% GHI bias
  - Secondary Source: NASA POWER - backup and cross-validation
  - Data Types: Global Horizontal Irradiance (GHI), Direct Normal Irradiance (DNI), Diffuse Horizontal Irradiance (DHI)
  - Temporal Resolution: Hourly time series for multi-year analysis
  - Access Method: Python pvlib.iotools module with rate limiting and caching (Redis/file-based)
  - Quality Assurance: Validated against INMET/INPE ground station data, consistent performance across Brazilian climate zones
  
- **Geospatial Data Sources**
  - Terrain: IBGE DEMs (Modelo Digital de Elevação) and global SRTM/COPDEM for horizon profiling
  - Urban Geometry: OpenStreetMap building footprints via OSMnx with height imputation algorithms
  - Storage: PostGIS-enabled PostgreSQL for spatial indexing and server-side geospatial computation
  - Earth Observation: AWS public datasets (Sentinel-2, CBERS-4) for visual site context and multispectral analysis

### Simulation Engine (Backend Core - Phase 2-3 Implementation)
- **PV System Modeling**: pvlib-python as industry-standard simulation core
  - ModelChain architecture for standardized, reproducible simulations
  - Configurable loss models: temperature, AOI, spectral, soiling, DC/AC losses
  - Module/inverter database integration for equipment specifications
  
- **3D Shading Analysis**: Hybrid approach combining efficiency with accuracy
  - Far-field (terrain): DEM-based horizon profiling with PostGIS viewshed analysis
  - Near-field (buildings): pybdshadow for dynamic building shadow projection from 3D extruded OSM geometries
  - Height Imputation: Multi-tier algorithm (explicit height tag → building:levels × 3m → type-based heuristic → nearest-neighbor inference)
  - Temporal Resolution: Hourly shadow factors applied to DNI/DHI components

### Service Architecture (Backend API - Phase 3-4 Implementation)
- **API Framework**: FastAPI (async-first, high-concurrency I/O handling)
- **Job Queue**: Celery + Redis/RabbitMQ for asynchronous simulation workflows
- **Endpoints**:
  - POST /analysis - Submit simulation job (sync/async modes)
  - GET /analysis/status/{job_id} - Check job progress
  - GET /analysis/results/{job_id} - Retrieve completed results
  - GET /geodata/buildings - Query processed 3D building data for map rendering
- **Request Schema**: Location (lat/lng), PV system params, time period, shading model selection, loss model configuration

### AI Copilot Integration (Phase 4 Enhancement)
- **Interface**: OpenAI ChatKit with advanced integration (self-hosted agent backend)
- **Knowledge Base**: RAG architecture with vector store containing:
  - Brazilian solar regulations: Lei 14.300, ANEEL resolutions (REN 482, 1000)
  - Technical standards: ABNT NBR 16690, 16274
  - Utility interconnection requirements: CEMIG, CPFL, Enel manuals
  - Financing options: FNE Sol, Banco do Brasil, Caixa, BV credit lines
- **Capabilities**:
  - Natural language queries on regulations and technical standards
  - Workflow initiation via conversation ("Start a 15 kWp project in Belo Horizonte")
  - Results interpretation and engineering recommendations
  - Document generation guidance (memorial descritivo, ART preparation)

## Implementation Roadmap

### Phase 1: MVP - Core Solar Analysis (Current)
- ✅ Chat interface with AI conversation
- ✅ AWS Earth Observation data explorer with interactive map
- ✅ Equipment catalog browsing
- ✅ Basic project management interface
- 🎯 **Next**: Integrate CAMS API via pvlib.iotools for irradiance data retrieval
- 🎯 **Next**: Implement basic PV simulation without shading (pvlib ModelChain)

### Phase 2: Environmental Context (In Progress)
- ✅ **3D Shading Analysis Component** - Interactive 3D terrain visualization with MapLibre GL
- ✅ **Terrain Data Integration** - Simulated DEM analysis with elevation, slope, and aspect calculations
- ✅ **Building Obstruction Detection** - Mock building height and distance analysis for urban environments
- ✅ **Horizon Profile Calculation** - 360° horizon elevation profile for far-field shading
- ✅ **Interactive Map Views** - 2D, 3D, and terrain visualization modes with smooth transitions
- ✅ **Shading Impact Metrics** - Annual, monthly, and hourly shading analysis with visual reports
- ✅ **Address/CEP Search** - Location input with automatic geocoding for analysis initialization
- 🎯 PostGIS setup for geospatial data storage
- 🎯 IBGE DEM ingestion pipeline for real terrain modeling data
- 🎯 OSMnx integration for building footprint extraction from OpenStreetMap
- 🎯 Real terrain-based horizon shading using AWS public datasets
- 🎯 Integration with Brazil Data Cube (Sentinel-2, CBERS-4) for site imagery

### Phase 3: Urban Accuracy & Async API
- 🎯 Building height imputation module (3-tier algorithm)
- 🎯 pybdshadow integration for 3D building shadows
- 🎯 Celery task queue for long-running simulations
- 🎯 FastAPI endpoint refactoring for async job submission
- 🎯 Progress tracking and result retrieval system

### AI Copilot Integration (Phase 4 Enhancement)
- **Interface**: OpenAI ChatKit with advanced integration (self-hosted agent backend)
- **Hélio System Prompt Architecture**: Specialized prompt engineering for solar PV guidance
  - **Language**: Clear and technical-friendly Portuguese (pt-BR)
  - **Core Responsibilities**: Dimensioning, equipment selection, financial analysis, regulatory compliance
  - **Jargon Explanation Protocol**: Automatically defines technical terms (kWp, PR, MPPT, irradiation, payback, ROI, string, electrical phase) in context
  - **Data Collection Strategy**: Request ONLY essentials (CEP/city, monthly consumption kWh, electrical phase) - avoid overwhelming users
  - **Sizing Methodology**: Always present 3 scenarios with clear explanations:
    - Conservative (1.14x): Lower initial investment, covers 85-90% consumption
    - Balanced (1.30x) ⭐ RECOMMENDED: Compensates losses, covers 95-100% + safety margin
    - Optimized (1.45x): Maximizes future savings, generates surplus credits
  - **Financial Analysis**: Include investment total, monthly savings estimate, simple payback (years), 25-year ROI, cash vs financed comparison
  - **Financing Options**: Present major banks (BB, Caixa, BV, Santander, FNE Sol) with typical terms, always show "Monthly payment R$X vs Current bill R$Y = Net savings R$Z"
  - **Shared Generation (GC) Protocol**: Offer subscription/solar farm alternatives when user mentions: no roof available, apartment living, shaded area, poor roof conditions
  - **Regulatory Notes**: Include brief Lei 14.300/2022 compliance note with micro/mini generation classification and utility interconnection requirements
  - **Call-to-Action Strategy**: End every response with 2-3 clear, actionable next steps (view compatible equipment, simulate financing, analyze shading, generate proposal, check utility requirements)
  - **Tone Guidelines**: Proactive (anticipate questions), pedagogical (explain "why"), precise (correct units), impartial (multiple equipment brands), evidence-based (cite CAMS, NASA POWER, Lei 14.300, NBR 16690)
- **Knowledge Base**: RAG architecture with vector store containing:
  - Brazilian solar regulations: Lei 14.300, ANEEL resolutions (REN 482, 1000)
  - Technical standards: ABNT NBR 16690, 16274
  - Utility interconnection requirements: CEMIG, CPFL, Enel manuals
  - Financing options: FNE Sol, Banco do Brasil, Caixa, BV credit lines
- **Capabilities**:
  - Natural language queries on regulations and technical standards
  - Workflow initiation via conversation ("Start a 15 kWp project in Belo Horizonte")
  - Results interpretation and engineering recommendations
  - Document generation guidance (memorial descritivo, ART preparation)

### Phase 4: AI Copilot & Knowledge Base
- ✅ ChatKit session management with automatic refresh and validation
- ✅ Session persistence with localStorage caching
- ✅ Device fingerprinting for unique user identification
- ✅ Error recovery with intelligent retry logic
- ✅ Facebook user authentication integration
- ✅ Widget action handling with toast notifications
- ✅ Custom theme support matching Yello brand
- ✅ Session status monitoring and debug interface
- ✅ **OpenAI Realtime API (GA) integration for voice conversations**
- ✅ **WebSocket-based low-latency speech-to-speech interactions**
- ✅ **Server-side VAD (Voice Activity Detection) for natural conversations**
- ✅ **Real-time audio streaming with live transcription**
- ✅ **GA API event handling (conversation.item.added, response.output_*.delta)**
- ✅ **Hélio System Prompt Engineering**: Specialized Portuguese prompt with jargon explanation, 3-scenario dimensioning (1.14x/1.30x/1.45x), financial analysis, GC alternatives, regulatory notes, clear CTAs
- 🎯 Vector store setup with regulatory/technical documentation
- 🎯 ChatKit backend agent integration with RAG
- 🎯 Conversational workflow triggers ("Generate memorial descritivo")
- 🎯 Contextual help based on user's current project state

### Future Enhancements
- ✅ **Automated PDF report generation (jsPDF with autoTable)** - Professional solar proposal generation with complete technical and financial details
- 📋 Electrical schematic generation (SKiDL for KiCad netlists)
- 📋 ML-based short-term solar forecasting
- 📋 Multi-site portfolio optimization
- 📋 Real-time monitoring integration for installed systems

## Edge Case Handling
- **Empty Messages**: Disable send button when input is empty or only whitespace
- **API Failures**: Show error message inline in chat, allow retry without losing context
- **Long Messages**: Automatically expand textarea, support proper line breaks and formatting
- **Rapid Sending**: Disable input while AI is responding to prevent message queue issues
- **No JavaScript**: Graceful degradation message (required for React app)
- **Editing During Response**: Disable edit functionality while AI is generating a response
- **Regenerate on Non-Last Message**: Only show regenerate button on the last assistant message
- **Empty Edit**: Prevent saving empty or whitespace-only edits
- **Widget Actions**: Log widget interactions (button clicks, form submissions, poll votes, etc.) to demonstrate action handling
- **Widget Rendering**: Handle various widget types (cards, lists, forms, polls, progress trackers, stats) with proper styling and layout
- **Interactive Elements**: Ensure buttons, selects, date pickers, and poll options in widgets function correctly with smooth animations
- **Widget State**: Maintain widget-specific state (poll votes, progress updates) during user interaction
- **No Active Session**: Auto-create first session on app load if no sessions exist
- **Session Switching**: Preserve current session state before switching to different chat
- **Sidebar on Mobile**: Close sidebar when chat selected or new chat created, show backdrop overlay to dismiss
- **Empty Chat History**: Display helpful empty state message in sidebar when no chats exist
- **Long Chat Titles**: Truncate titles with ellipsis after 50 characters
- **Keyboard Shortcuts**: Handle ⌘K/Ctrl+K for search, ⌘N/Ctrl+N for new chat, ESC to close modals and sidebar
- **Modal State Management**: Ensure only one modal open at a time, proper z-index layering
- **Copy Functionality**: Handle clipboard API failures gracefully with fallback
- **Export File Naming**: Sanitize chat titles for safe filenames
- **Settings Persistence**: Validate preferences data structure, handle migration from old versions
- **Search Performance**: Debounce search queries for large chat histories
- **Focus Management**: Proper focus trap in modals, return focus to trigger on close, move to first element on open
- **Touch Targets**: Minimum 24×24px on desktop, 44×44px on mobile for all interactive elements
- **Input Font Size**: 16px minimum on mobile inputs to prevent zoom
- **Keyboard Navigation**: Full keyboard support for all interactive elements with visible focus indicators
- **Screen Readers**: ARIA labels, roles, and live regions for dynamic content
- **Form Validation**: Inline error messages with proper aria-invalid and focus management

## Design Direction
The design should embrace OpenAI ChatKit's conversational UX paradigm - professional yet approachable, guiding users through solar project journeys with intelligent, context-aware assistance. The interface combines the conversational familiarity of modern AI chat with the technical precision of engineering software. Following ChatKit's widget-based architecture, each feature (equipment selection, sizing calculator, credit analysis, earth observation) manifests as interactive conversational flows with rich embedded widgets. The platform balances warmth (solar energy gradient in yellows, oranges, and reds) with authority (clean typography, structured data, clear hierarchy). Technical features appear as natural conversation progressions with embedded interactive cards rather than separate pages. The experience communicates "intelligent solar energy copilot" - a conversational AI that understands the complete buyer/installer journey from site assessment through financing, presenting complex data through intuitive widgets while maintaining the Yello solar gradient throughout.

## Color Selection
Solar-inspired triadic color scheme with warm gradients (yellow-orange-red) representing solar energy, complemented by cool blues/purples for technical elements and Earth observation features, all built on a neutral base for professional readability.

- **Primary Color**: Deep black (oklch(0.00 0 0)) - Professional foundation for text and primary UI elements, provides maximum contrast and authority
- **Secondary Colors**: Warm gray (oklch(0.90 0.002 85)) - Subtle backgrounds for cards and secondary surfaces
- **Accent Color**: Solar gradient (Yellow #FFD60A → Orange/Red #FF3D3D → Pink #FF0066) - The signature visual identity representing solar energy transformation from dawn to dusk. Used for hero elements, CTAs, and brand moments
- **Technical Accent**: Blue-Purple gradient (oklch(0.60 0.18 240) → oklch(0.60 0.18 280)) - For technical features, data visualization, Earth observation elements
- **Background**: Warm off-white with subtle gradient (oklch(0.99 0.002 85)) - Provides a soft, premium canvas that complements solar warmth
- **Foreground/Background Pairings**: 
  - Background (Warm Off-White oklch(0.99 0.002 85)): Deep text (oklch(0.15 0.01 85)) - Ratio 16.8:1 ✓
  - Card (Pure White oklch(1.00 0 0)): Deep text (oklch(0.15 0.01 85)) - Ratio 17.1:1 ✓
  - Accent Solar Gradient Mid (Orange #FF3D3D / oklch(0.70 0.19 35)): White text (oklch(1.00 0 0)) - Ratio 4.8:1 ✓
  - Technical Accent (Blue-Purple oklch(0.60 0.18 260)): White text (oklch(1.00 0 0)) - Ratio 4.9:1 ✓
  - Sidebar (Light Gray oklch(0.96 0.002 85)): Deep text (oklch(0.15 0.01 85)) - Ratio 15.2:1 ✓

## Font Selection
Inter for UI and body text (geometric sans-serif that conveys technical precision), PT Serif for headers and formal document elements (adds authority and professionalism), Roboto Mono for code/technical data (distinguishes technical content).

- **Typographic Hierarchy**:
  - **App Title/Hero**: Inter Bold/28px/tight letter spacing - Strong brand presence with solar gradient
  - **Page Headers**: Inter Bold/32-40px - Clear section definition for Dashboard, Equipment, etc.
  - **Section Headers**: Inter Semibold/18-24px - Organized content hierarchy
  - **Body Text**: Inter Regular/16px/1.6 line-height - Comfortable reading for extended use
  - **Technical Data**: Roboto Mono/14px - ARNs, coordinates, CLI commands, API endpoints
  - **Data Labels**: Inter Medium/14px/uppercase/wide tracking - Chart labels, metric titles
  - **Card Titles**: Inter Semibold/16-18px - Widget and component headers
  - **Small Text/Captions**: Inter Regular/12-14px/muted color - Timestamps, helper text

## Animations
Purposeful, delightful animations that enhance the premium feel - smooth transitions, gentle springs, sidebar slide animations, and micro-interactions that respond to user input. Elements should feel alive and responsive without being distracting. Enhanced focus on scale transforms, rotation effects, sidebar transitions, and staggered reveals. All animations honor prefers-reduced-motion for accessibility and use compositor-only properties (transform, opacity) for 60fps performance.

**Layout & Precision**:
- Optical alignment throughout with ±1px adjustments for visual balance (icon + text centered vertically)
- Grid-based spacing system using consistent Tailwind scale (gap-2.5, gap-3, gap-3.5 for precision)
- Icon sizes adjusted for optical weight: 17-18px for primary nav, 15-16px for secondary, 13px for inline actions
- Button heights optimized for touch: h-10 for primary sidebar items, h-9 for nested items, h-8 for tertiary actions, h-7 for message action buttons
- Reduced vertical spacing (py-3.5 instead of py-4, mb-2 instead of mb-3) for denser, more precise layout
- Consistent horizontal padding: px-3 for sections, px-4 for header/footer, px-5 for content areas
- Overflow control: `overflow-hidden` on container, `overflow-y-auto` on scrollable areas only
- Safe area insets: Full support with `env(safe-area-inset-*)` for notched devices
- Viewport control: `viewport-fit=cover` meta tag, fixed body positioning prevents bounce scrolling
- Truncation with ellipsis on all text that could overflow, with `min-w-0` on flex parents
- `flex-shrink-0` on icons to prevent compression, maintaining optical alignment

- **Purposeful Meaning**: Animations reinforce hierarchy, guide attention, and provide feedback. Sidebar slides in with spring physics (300ms, damping 30, stiffness 300), Widget interactions include smooth progress animations (600ms), poll vote reveals with width transitions, entrance animations with opacity and y-translation, and state changes that feel natural with spring physics. All animations automatically disable for users with prefers-reduced-motion preference
- **Performance-First**: All animations use compositor-only properties (transform, opacity) with will-change hints to maintain 60fps. Never animate layout properties (top, left, width, height) that trigger reflow/repaint. CSS animations preferred, then Web Animations API, lastly Framer Motion with proper optimization
- **Accessibility**: Full prefers-reduced-motion support via custom React hook (usePrefersReducedMotion) that disables or reduces animations based on user preference. Reduced motion variants show instant state changes instead of animated transitions
- **Hierarchy of Movement**: 
  - **Primary**: Sidebar slide animation (300ms spring), Message appearance (fade + slide 200ms) and widget entrance animations (300ms) with stagger effects - Core navigation and conversation flow
  - **Secondary**: Header icon hover with rotation (8deg) and scale (1.08), button scales (1.05-1.06 hover, 0.94-0.95 tap), avatar hover effects with spring physics, sidebar menu item hover (1.02 scale) - Micro-interactions that add polish
  - **Tertiary**: Loading indicator gentle rotation (8deg oscillation, 2s loop), typing indicator with scale and opacity pulses, backdrop fade (200ms) - Background activity that doesn't compete for attention
  - **Widget-Specific**: Product image zoom on hover (1.05 scale), badge entrance with rotation, poll progress bars with smooth width transitions, stats cards with staggered reveals (0.1s delay per item)
- **Interruptible Animations**: All animations use spring physics or ease-out curves that can be interrupted mid-animation for responsive feel. No animation locks that prevent user interaction

## Component Selection

- **Components**: 
  - **Sidebar**: Custom collapsible sidebar component with dark background, organized sections, and smooth slide animation
  - **ScrollArea**: For chat message container and sidebar content with smooth scrolling
  - **Button**: For send button, new chat action, toolbar actions, and sidebar menu items with gradient variants and enhanced hover states
  - **Textarea**: Auto-resizing input with enhanced focus states (2px border, accent color)
  - **Avatar**: Gradient-filled rounded squares (xl size) for user and AI indicators with rotation hover effects, circular for user profile in sidebar
  - **Card**: For individual message bubbles and widgets with enhanced borders (2px), shadow variations, and glassmorphic backdrop blur
  - **Separator**: Subtle dividers with reduced opacity (30-40%) in sidebar sections and modals
  - **Progress**: For progress tracker widgets with animated fills and enhanced height (h-3 for main, h-2.5 for items)
  - **Badge**: For status indicators in various widgets with bold fonts and gradient support
  - **Dialog**: For modal overlays (Settings, Share, Search, Prompt Library) with backdrop blur and smooth animations
  - **Input**: For search fields with icon prefixes and enhanced focus states
  - **Switch**: For boolean preference toggles in settings
  - **Select**: For dropdown preferences in settings
  - **Tabs**: For organizing settings into logical sections (Profile, Preferences, Notifications)
  - **Label**: For form field labels with proper semantic HTML

- **Customizations**: 
  - **Auto-scroll behavior**: Custom hook to scroll to bottom on new messages
  - **Typing indicator**: Custom animated component with scale and opacity pulses using framer-motion
  - **Sidebar component**: Custom ChatGPT-style dark sidebar with sections for navigation, GPTs, projects, and chat history. Includes mobile overlay backdrop and smooth slide animations
  - **Message component**: Custom component with enhanced glassmorphic backgrounds (70% opacity), gradient avatars (10x10, rounded-xl), improved spacing, and copy button on hover
  - **Prompt Library**: Full-page modal with category filtering, search, and grid layout of prompt cards with icons
  - **Search Dialog**: Keyboard-accessible search with real-time filtering, result previews, and timestamp display
  - **Share Dialog**: Export options with visual file type cards, link copying with animation feedback
  - **Settings Dialog**: Tabbed interface with organized preference sections, user profile display from spark.user()
  - **Widget components**: 
    - **Product**: Enhanced with aspect-[4/3] image ratio, object-contain, gradient badge positioning, shadow enhancements, responsive layout for actions
    - **Poll**: Vote animations with 600ms transitions, enhanced padding (p-4), bold typography, Portuguese localization
    - **Progress**: Staggered item reveals, enhanced progress bar heights, improved status indicators
    - **Stats**: Gradient backgrounds on metric cards (from-muted/80 to-muted/50), uppercase labels with tracking-wide
  - **Glassmorphic effects**: Enhanced backdrop blur (xl) and transparency on header (50%), input area (50%), AI messages (70%), sidebar mobile overlay (40%), and modal backdrops (50%)

- **States**: 
  - **Sidebar**: Open/closed with slide animation, mobile overlay with backdrop, selected chat highlighted
  - **Sidebar Menu Items**: Scale hover (1.02), tap (0.98), ghost button style with hover background
  - **Toolbar Icons**: Scale hover (1.05), tap (0.95), ghost style with accent hover background, disabled states
  - **Send Button**: Gradient background with enhanced scale animations (1.06 hover, 0.94 tap), shadow-xl on hover, disabled state when empty
  - **Input Area**: Enhanced focus with accent border (60% opacity), glassmorphic background (60% opacity), 2px border, shadow-sm
  - **Messages**: User messages on transparent background, AI messages with enhanced blur effect (70% opacity, backdrop-blur-md) and subtle border
  - **Edit/Regenerate/Copy Buttons**: Fade in on hover with enhanced spacing, scale animations (1.05 hover, 0.95 tap), bold weight icons, copy button shows check icon feedback
  - **Modals**: Scale and fade entrance (0.95 to 1.0), backdrop blur overlay, smooth exit animations
  - **Prompt Cards**: Hover scale (1.02), tap (0.98), border highlight on hover, shadow elevation
  - **Search Results**: Hover scale (1.01), border highlight, timestamp display
  - **Settings Inputs**: Focus states with accent border, proper disabled states
  - **Widget Interactive Elements**: 
    - Poll options animate on vote with width transitions and shadow
    - Progress bars fill smoothly with color variations based on status
    - Stats reveal with stagger (0.1s delay), scale from 0.9 to 1.0
    - Product cards have image zoom on hover, badge entrance animations
  - **Header Icon**: Rotate (8deg) and scale (1.08) on hover with spring animation (stiffness: 400, damping: 17)
  - **Demo Buttons**: Enhanced hover states with scale (1.03) and y-translation (-2px), shadow-md on hover

- **Icon Selection**:
  - **PaperPlaneRight**: Send message action
  - **Plus**: New chat action  
  - **Robot/Sparkle**: AI avatar indicator and app logo
  - **User**: User avatar indicator
  - **PencilSimple/PencilLine**: Edit message action, new chat in sidebar
  - **ArrowClockwise**: Regenerate response action
  - **Check**: Confirm edit, copy confirmation
  - **X**: Cancel edit, close sidebar, close modals
  - **List**: Toggle sidebar menu (hamburger)
  - **Lightning**: Prompt library, ActionsGPT, smart features
  - **MagnifyingGlass**: Search in chats, search input
  - **Share**: Share conversation
  - **Gear**: Settings
  - **Copy**: Copy message content
  - **Download**: Export/download actions
  - **Link**: Shareable links
  - **FileText**: File formats (Markdown, JSON)
  - **Globe**: Language selection
  - **Bell**: Notifications
  - **Palette**: Preferences
  - **ImageSquare**: Gallery
  - **Code**: Codex
  - **Compass**: Explore GPTs
  - **FolderOpen**: Projects
  - **DotsThree**: Show more items
  - **Chat**: Chat history items
  - **Clock**: Time display
  - **CalendarBlank**: Date display
  - **CheckCircle**: Completion status

- **Spacing**: 
  - Message padding: px-4 sm:px-6 py-5 (reduced from p-6 for tighter vertical rhythm)
  - Message gap: gap-3.5 (14px between avatar and content, precise optical alignment)
  - Avatar size: w-9 h-9 (36px, optically balanced with text)
  - Icon sizes: 18px header icons, 17px primary sidebar nav, 15-16px nested items, 13px inline actions
  - Button heights: h-10 (40px) primary sidebar, h-9 (36px) nested, h-8 (32px) tertiary, h-7 (28px) message actions
  - Section spacing: mb-2 between sections (reduced from mb-3), my-2.5 for separators
  - Container padding: px-3 sections, px-4 header/footer, px-5 content areas
  - Input area: px-4 sm:px-5 pt-4 with bottom safe area support
  - Header: py-3.5 (reduced from py-4 for tighter header)
  - Sidebar padding: px-3 for content, py-3.5 for header/footer
  - Safe area insets: Full support via env() for notched devices

- **Mobile**: 
  - Sidebar slides in from left with dark backdrop overlay (40% opacity)
  - Sidebar closes on chat selection or new chat action
  - Hamburger menu button (fixed top-left) to toggle sidebar
  - Reduce message padding to px-4 py-5
  - Fixed input at bottom with safe area consideration (paddingBottom: max(1.25rem, env(safe-area-inset-bottom)))
  - Full-screen chat area with collapsible header
  - Stack header elements vertically if needed
  - Body fixed positioning with overflow-hidden prevents bounce scrolling
  - viewport-fit=cover meta tag for full-screen notch support
  - All interactive elements min 44×44px touch target on touch devices
  - Font size min 16px on inputs to prevent iOS zoom
  - Overflow control: container overflow-hidden, scrollable areas overflow-y-auto only
  - Truncate all text with min-w-0 on flex parents, flex-shrink-0 on icons
