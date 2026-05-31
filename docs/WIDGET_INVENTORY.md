# Yello Solar Hub - Widget Inventory

This document provides a comprehensive inventory of all widgets available in the Yello Solar Hub platform.

## 📊 Widget Summary

Total Widgets: 17
Categories: 9
Primary Focus: Solar Energy Solutions (10/17)

## 🏗️ Widget Categories

### Solar Energy Widgets (10)

1. Solar Location Search Widget
2. Roof Drawing Widget
3. Solar Analysis Results Widget
4. Utility Analysis Widget
5. Solar Kit Widget
6. Financing Calculation Widget
7. Solar Equipment Widget
8. Solar Irradiation Widget
9. Solar Sizing Widget
10. Solar Location Search Widget

### General Purpose Widgets (7)

1. Product Widget
2. Poll Widget
3. Progress Widget
4. Stats Widget
5. Card Widget
6. List Widget
7. Form Widget

---

## 📋 Detailed Widget Inventory

### 1. Solar Location Search Widget

- **Type**: `solar-location-search`
- **Purpose**: Allows users to search for and select a location for solar analysis
- **Data Structure**: 
  - `initialAddress` - Starting address value
- **Primary Use**: Solar project initialization
- **Trigger Keywords**: "dimensionamento", "dimensionar", "localização", "endereço"

### 2. Roof Drawing Widget

- **Type**: `roof-drawing`
- **Purpose**: Enables users to draw or outline roof areas for solar panel placement
- **Data Structure**:
  - `location` - Coordinate and address information
- **Primary Use**: Roof area assessment for solar installations
- **Trigger Keywords**: "telhado", "desenhar", "área"

### 3. Solar Analysis Results Widget

- **Type**: `solar-analysis-results`
- **Purpose**: Displays comprehensive solar analysis results including irradiation, system recommendations, and financial projections
- **Data Structure**:
  - `location` - Location details
  - `roof` - Roof characteristics (area, orientation, quality)
  - `irradiation` - Solar irradiation data
  - `system` - Recommended system specifications
  - `financial` - Financial projections and savings
  - `environmental` - Environmental impact metrics
  - `demographics` - Regional data
- **Primary Use**: Complete solar feasibility report
- **Trigger Keywords**: "resultados", "análise completa", "relatório"

### 4. Utility Analysis Widget

- **Type**: `utility-analysis`
- **Purpose**: Analyzes energy bills and consumption patterns
- **Data Structure**:
  - `title`, `subtitle`, `question` - Display information
  - `analysisTitle` - Title of the analysis
  - `steps` - Process steps
  - `summary` - Analysis summary
  - `averageLabel`, `averageValue` - Consumption metrics
  - `chartData`, `chartLabels` - Visual data
  - `actions` - Available actions
- **Primary Use**: Energy consumption analysis
- **Trigger Keywords**: "analise", "fatura", "energia", "consumo"

### 5. Solar Kit Widget

- **Type**: `solar-kit`

- **Purpose**: Displays solar equipment kits with components and specifications
- **Data Structure**:
  - `title`, `subtitle` - Kit information
  - `specs` - Technical specifications
  - `components` - List of components with icons and descriptions
  - `price`, `monthlySavings`, `paybackPeriod` - Financial information
  - `actions` - Available actions
- **Primary Use**: Solar equipment selection
- **Trigger Keywords**: "kit", "kit solar", "escolher"

### 6. Financing Calculation Widget

- **Type**: `financing-calc`
- **Purpose**: Provides financing options and payment calculations for solar projects
- **Data Structure**:
  - `title`, `subtitle` - Display information
  - `totalAmount`, `downPayment`, `financedAmount` - Financial figures
  - `options` - List of financing options from different banks
  - `actions` - Available actions
- **Primary Use**: Solar project financing simulation
- **Trigger Keywords**: "financiamento", "crédito", "simular"

### 7. Solar Equipment Widget

- **Type**: `solar-equipment`
- **Purpose**: Displays and allows selection of individual solar equipment components
- **Data Structure**:
  - `equipment` - Array of equipment objects with id, name, category, power, price, manufacturer, efficiency, warranty, description
  - `onSelect` - Callback when equipment is selected
  - `onAddToCart` - Callback when equipment is added to cart
- **Primary Use**: Equipment selection and e-commerce
- **Trigger Keywords**: None specified in demo messages

### 8. Solar Irradiation Widget

- **Type**: `solar-irradiation`
- **Purpose**: Visualizes solar irradiation data for selected locations
- **Data Structure**:
  - `data` - Irradiation data object with location, coordinates, GHI, DNI, DHI, avgSolarHours, annualProduction, dataSource, quality
- **Primary Use**: Solar resource assessment
- **Trigger Keywords**: None specified in demo messages

### 9. Solar Sizing Widget

- **Type**: `solar-sizing`
- **Purpose**: Helps users determine appropriate solar system size based on consumption
- **Data Structure**:
  - `onCalculate` - Callback when calculation is completed
  - `initialConsumption` - Initial consumption value
  - `location` - Location for the analysis
- **Primary Use**: System sizing calculator
- **Trigger Keywords**: None specified in demo messages

### 10. Solar Location Search Widget

- **Type**: `solar-location-search`
- **Purpose**: Allows location-based solar potential assessment
- **Data Structure**: Not fully visible in widgetExamples.ts
- **Primary Use**: Location-specific solar analysis
- **Trigger Keywords**: Not defined in demo messages

### 11. Product Widget

- **Type**: `product`
- **Purpose**: Displays product information with images, pricing, and features
- **Data Structure**:
  - `name`, `description` - Product information
  - `image` - Product image
  - `price`, `originalPrice`, `badge` - Pricing information
  - `rating` - Product rating
  - `features` - Product features list
  - `actions` - Available actions
- **Primary Use**: Product showcase and sales
- **Trigger Keywords**: "show product"

### 12. Poll Widget

- **Type**: `poll`
- **Purpose**: Interactive polling functionality
- **Data Structure**:
  - `question` - Poll question
  - `options` - Poll options with vote counts
  - `totalVotes` - Total number of votes
  - `allowMultiple` - Whether multiple selections are allowed
- **Primary Use**: User engagement and feedback collection
- **Trigger Keywords**: "show poll"

### 13. Progress Widget

- **Type**: `progress`
- **Purpose**: Visualizes progress of projects or tasks
- **Data Structure**:
  - `title`, `subtitle` - Progress tracker information
  - `items` - List of progress items with status
  - `overallProgress` - Overall progress percentage
  - `dueDate` - Deadline information
- **Primary Use**: Project tracking and milestone visualization
- **Trigger Keywords**: "show progress"

### 14. Stats Widget

- **Type**: `stats`
- **Purpose**: Displays statistical data with visual indicators
- **Data Structure**:
  - `title`, `period` - Statistics header information
  - `metrics` - List of metrics with values, changes, and trends
- **Primary Use**: Data visualization and KPI tracking
- **Trigger Keywords**: "show stats"

### 15. Card Widget

- **Type**: `card`
- **Purpose**: General-purpose card component for displaying information
- **Data Structure**:
  - `title`, `subtitle`, `content` - Card content
  - `badges` - Status badges
  - `actions` - Available actions
  - `status` - Status information
- **Primary Use**: General information display
- **Trigger Keywords**: "show order", "show payment"

### 16. List Widget

- **Type**: `list`
- **Purpose**: Displays items in a list format
- **Data Structure**:
  - `header` - List header
  - `items` - List items with icons, titles, subtitles, badges
  - `footer` - Footer information
- **Primary Use**: Task lists, feature lists, and item collections
- **Trigger Keywords**: "show tasks", "show features"

### 17. Form Widget

- **Type**: `form`
- **Purpose**: Interactive form component
- **Data Structure**:
  - `id`, `title` - Form identification
  - `fields` - Form fields with types and options
  - `submitLabel`, `cancelLabel` - Action labels
- **Primary Use**: Data collection and user input
- **Trigger Keywords**: "show booking"

## 🎯 Widget Activation

Widgets can be activated in the chat interface through specific trigger keywords defined in the `widgetDemoMessages` object. This makes them accessible during conversations with the AI assistant.

## 🔧 Widget Architecture

All widgets follow a consistent architecture:

- Defined in the `Widget` interface with id, type, and data
- Rendered through the `WidgetRenderer` component
- Support interactive actions through the `WidgetAction` interface
- Animated using Framer Motion for smooth transitions
- Styled with Tailwind CSS and Radix UI components

## 🎨 Visual Design

- Consistent solar-themed color palette (yellows, reds, pinks)
- Smooth animations with Framer Motion
- Responsive design for all device sizes
- Accessibility-first approach with semantic HTML
- Unified visual language across all widgets

## 🌞 Solar Focus

The widget ecosystem is heavily focused on solar energy applications, with 10 out of 17 widgets specifically designed for solar project assessment, equipment selection, financing, and analysis.

This comprehensive widget system allows users to interact with complex solar energy data and processes through an intuitive chat interface.