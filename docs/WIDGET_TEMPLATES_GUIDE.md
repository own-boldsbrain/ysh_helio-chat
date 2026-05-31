# ChatKit Widget Templates Guide

## Overview

This guide explains how to use the ChatKit widget template system in Yello Solar Hub. The widget templates allow you to generate rich, interactive UI components that appear within chat conversations, providing users with structured data, product cards, financing options, and more.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Available Widget Templates](#available-widget-templates)
3. [Backend Integration](#backend-integration)
4. [Frontend Integration](#frontend-integration)
5. [Widget Action Handling](#widget-action-handling)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Architecture Overview

### The Flow

```
User Query
    ↓
Backend receives message
    ↓
Parse intent & fetch data
    ↓
Call widget template function
    ↓
Generate widget JSON
    ↓
Send message with widget to ChatKit
    ↓
ChatKit renders widget in conversation
    ↓
User clicks button in widget
    ↓
onAction handler triggered in frontend
    ↓
Frontend sends action to backend
    ↓
Backend processes action & responds
```

### File Structure

```
src/lib/openai/
├── widget-templates.ts          # Widget template definitions
├── widget-templates-examples.ts # Usage examples
└── chatkit.ts                   # ChatKit configuration

backend/ (your backend service)
├── api/
│   ├── chatkit.py              # Message handling endpoint
│   └── widget-action.py        # Widget action endpoint
```

---

## Available Widget Templates

### 1. Product Card Widget

**Purpose:** Display solar equipment (panels, inverters, batteries) with images, pricing, specifications, and action buttons.

**Function:** `productCardWidget(data: ProductCardData)`

**Data Structure:**

```typescript
interface ProductCardData {
  productId: string
  name: string
  description: string
  imageUrl: string
  priceBRL: number
  originalPriceBRL?: number
  rating?: number
  discountPercentage?: number
  features?: string[]
  specifications?: Array<{ label: string; value: string }>
  manufacturer?: string
  sku?: string
}
```

**Generated Actions:**

- `add_to_quote` - Add product to user's quote/cart
- `view_product_details` - Open detailed product specifications page

**Use Cases:**

- "Mostre inversores de 5kW"
- "Quais painéis solares você recomenda?"
- "Preciso de um inversor híbrido"

---

### 2. Credit Lines Widget

**Purpose:** Compare multiple solar financing options from different banks in a list format.

**Function:** `creditLinesWidget(creditLines: CreditLineData[])`

**Data Structure:**

```typescript
interface CreditLineData {
  id: string
  bankName: string
  productName: string
  termMonths: number
  monthlyInterestRate: number
  annualInterestRate: number
  minAmount: number
  maxAmount: number
  features: string[]
  requirements?: string[]
  processingTimeDays?: number
}
```

**Generated Actions:**

- `simulate_financing` - Open financing simulator for selected credit line

**Use Cases:**

- "Quais opções de financiamento estão disponíveis?"
- "Como financiar um sistema solar?"
- "Preciso de crédito para energia solar"

---

### 3. Irradiation Map Widget

**Purpose:** Display solar irradiation data for a specific location with a visual map, GHI/DNI/DHI values, and estimated generation.

**Function:** `irradiationMapWidget(data: IrradiationMapData)`

**Data Structure:**

```typescript
interface IrradiationMapData {
  location: {
    latitude: number
    longitude: number
    city: string
    state: string
  }
  irradiationData: {
    ghi: number
    dni: number
    dhi: number
    unit: string
  }
  mapImageUrl: string
  dataSource: 'CAMS' | 'NASA_POWER'
  timeRange: {
    start: string
    end: string
  }
  estimatedGeneration?: {
    kwhPerMonth: number
    kwhPerYear: number
  }
}
```

**Generated Actions:**

- `start_site_analysis` - Initiate complete site analysis with 3D shading
- `export_irradiation_data` - Download irradiation data as CSV/JSON

**Use Cases:**

- "Qual a irradiação solar em Belo Horizonte?"
- "Quanto sol tem em minha cidade?"
- "Consultar dados de irradiação"

---

## Backend Integration

### Step 1: Set Up Endpoint for ChatKit Messages

Your backend needs an endpoint to receive messages from ChatKit and respond with widgets.

**Example (FastAPI - Python):**

```python
from fastapi import FastAPI, Request
from openai import OpenAI
import os

app = FastAPI()
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@app.post("/api/chatkit/message")
async def handle_chatkit_message(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    thread_id = data.get("thread_id")
    
    # Parse user intent (use LLM or pattern matching)
    intent = parse_user_intent(user_message)
    
    if intent == "search_products":
        # Fetch product from database
        product = await db.products.find_by_query(user_message)
        
        # Generate widget using template (call TypeScript function)
        widget_json = generate_product_widget(product)
        
        # Send message with widget to ChatKit
        response = openai_client.chatkit.threads.messages.create(
            thread_id=thread_id,
            role="assistant",
            content="Encontrei este produto para você:",
            widget=widget_json
        )
        
        return {"status": "success", "message_id": response.id}
```

### Step 2: Implement Widget Template Functions

You have two options:

#### Option A: Call TypeScript functions from Python (Recommended)

Use a bridge like `pyexecjs` or a subprocess to call the TypeScript functions:

```python
import execjs

# Load the widget templates
with open('src/lib/openai/widget-templates.ts') as f:
    widget_templates = f.read()

ctx = execjs.compile(widget_templates)

def generate_product_widget(product_data):
    return ctx.call('productCardWidget', product_data)
```

**Option B: Reimplement templates in Python**

Copy the logic from `widget-templates.ts` into Python functions:

```python
def product_card_widget(data):
    formatted_price = f"R$ {data['priceBRL']:,.2f}"
    
    return {
        "id": f"product-{data['productId']}",
        "type": "product",
        "data": {
            "name": data['name'],
            "description": data['description'],
            "image": data['imageUrl'],
            "price": formatted_price,
            "features": data.get('features', []),
            "actions": [
                {
                    "label": "Adicionar ao Orçamento",
                    "type": "add_to_quote",
                    "variant": "default",
                    "payload": {
                        "productId": data['productId'],
                        "name": data['name'],
                        "price": data['priceBRL']
                    }
                }
            ]
        }
    }
```

### Step 3: Set Up Widget Action Endpoint

Handle actions triggered by widget buttons:

```python
@app.post("/api/widget-action")
async def handle_widget_action(request: Request):
    data = await request.json()
    action_type = data.get("action", {}).get("type")
    payload = data.get("action", {}).get("payload", {})
    
    if action_type == "add_to_quote":
        product_id = payload.get("productId")
        user_id = get_current_user_id(request)
        
        # Add to user's quote
        await db.quotes.add_item(user_id, product_id)
        
        return {
            "status": "success",
            "message": "Produto adicionado ao orçamento"
        }
    
    elif action_type == "simulate_financing":
        credit_line_id = payload.get("creditLineId")
        
        # Redirect to simulator
        return {
            "status": "success",
            "action": "redirect",
            "url": f"/simulator?credit_line={credit_line_id}"
        }
```

---

## Frontend Integration

### Step 1: Configure ChatKit with Action Handler

In your ChatKit component, set up the `onAction` handler:

```tsx
// src/components/ChatKitEmbed.tsx

import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { toast } from 'sonner'

export function ChatKitEmbed() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { 
          method: 'POST' 
        })
        const { client_secret } = await res.json()
        return client_secret
      }
    },
    
    // Handle widget button clicks
    onAction: async (action) => {
      console.log('Widget action:', action)
      
      try {
        const response = await fetch('/api/widget-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        })
        
        const result = await response.json()
        
        if (result.status === 'success') {
          toast.success(result.message || 'Ação concluída')
          
          // Handle redirects
          if (result.action === 'redirect') {
            window.location.href = result.url
          }
        } else {
          toast.error(result.message || 'Erro ao processar ação')
        }
      } catch (error) {
        console.error('Action error:', error)
        toast.error('Erro ao processar ação')
      }
    }
  })

  return (
    <ChatKit 
      control={control} 
      className="h-[600px] w-[400px]"
    />
  )
}
```

---

## Widget Action Handling

### Action Flow

1. **User clicks button in widget** → Widget's `action.type` and `action.payload` are triggered
2. **Frontend `onAction` handler receives action** → Sends POST request to `/api/widget-action`
3. **Backend processes action** → Performs business logic (add to cart, start simulation, etc.)
4. **Backend responds** → Returns status and optional redirect/data
5. **Frontend handles response** → Shows toast, redirects, or updates UI

### Common Action Types

| Action Type | Description | Typical Payload |
|-------------|-------------|-----------------|
| `add_to_quote` | Add product to user's quote | `{ productId, name, price }` |
| `view_product_details` | Open product details page | `{ productId }` |
| `simulate_financing` | Open financing simulator | `{ creditLineId, bankName }` |
| `start_site_analysis` | Initiate 3D site analysis | `{ latitude, longitude, city }` |
| `export_irradiation_data` | Download irradiation CSV | `{ location, irradiationData }` |

### Defining Custom Actions

When creating widgets, define actions like this:

```typescript
actions: [
  {
    label: "Adicionar ao Orçamento",     // Button text
    type: "add_to_quote",                // Action identifier
    variant: "default",                  // Button style
    icon: "cart",                        // Optional icon
    payload: {                           // Data sent to backend
      productId: data.productId,
      name: data.name,
      price: data.priceBRL
    }
  }
]
```

---

## Best Practices

### 1. Data Validation

Always validate data before passing to widget templates:

```typescript
function validateProductData(data: any): ProductCardData | null {
  if (!data.productId || !data.name || !data.priceBRL) {
    console.error('Invalid product data:', data)
    return null
  }
  
  return {
    productId: data.productId,
    name: data.name,
    description: data.description || '',
    imageUrl: data.imageUrl || '/placeholder.jpg',
    priceBRL: parseFloat(data.priceBRL),
    // ... rest of the data
  }
}

const validatedData = validateProductData(rawData)
if (validatedData) {
  const widget = productCardWidget(validatedData)
}
```

### 2. Error Handling

Always wrap widget generation in try-catch:

```typescript
try {
  const widget = productCardWidget(data)
  return createMessageWithWidget(responseText, widget)
} catch (error) {
  console.error('Widget generation failed:', error)
  // Fall back to text-only message
  return {
    role: 'assistant',
    content: responseText
  }
}
```

### 3. Image URLs

Ensure all image URLs are absolute and accessible:

```typescript
const imageUrl = data.imageUrl.startsWith('http')
  ? data.imageUrl
  : `https://cdn.yello.com.br/products/${data.imageUrl}`
```

### 4. Localization

All currency and date formatting should respect Brazilian Portuguese locale:

```typescript
// Currency
const price = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(priceBRL)

// Date
const date = new Date(dateString).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})
```

### 5. Performance

For lists with many items, limit to 5-10 items per widget:

```typescript
const topCreditLines = creditLines
  .sort((a, b) => a.monthlyInterestRate - b.monthlyInterestRate)
  .slice(0, 5)

const widget = creditLinesWidget(topCreditLines)
```

---

## Examples

### Complete Example: Product Search Flow

**1. User Query:**
```
User: "Mostre inversores de 5kW com boa eficiência"
```

**2. Backend Processing:**
```python
# Parse query
intent = "search_products"
filters = {
    "category": "inversor",
    "power_kw": 5,
    "min_efficiency": 97
}

# Query database
products = await db.products.find(filters)
top_product = products[0]

# Generate widget
widget_json = product_card_widget({
    "productId": top_product.id,
    "name": top_product.name,
    "description": top_product.description,
    "imageUrl": top_product.image_url,
    "priceBRL": top_product.price,
    "features": top_product.features,
    "rating": top_product.rating
})

# Send response
openai_client.chatkit.threads.messages.create(
    thread_id=thread_id,
    role="assistant",
    content="Encontrei este inversor de alta eficiência:",
    widget=widget_json
)
```

**3. Widget Displayed:**
![Product card widget showing Growatt inverter with image, price, features, and "Add to Quote" button]

**4. User Action:**
```
User clicks "Adicionar ao Orçamento" button
```

**5. Frontend Handling:**
```tsx
onAction: async (action) => {
  // action = {
  //   type: "add_to_quote",
  //   payload: { productId: "INV-123", name: "...", price: 4799 }
  // }
  
  const response = await fetch('/api/widget-action', {
    method: 'POST',
    body: JSON.stringify({ action })
  })
  
  toast.success("Produto adicionado ao orçamento!")
}
```

**6. Backend Action Handling:**
```python
@app.post("/api/widget-action")
async def handle_action(request):
    action = request.json()["action"]
    
    if action["type"] == "add_to_quote":
        user_id = get_user_id(request)
        product_id = action["payload"]["productId"]
        
        await db.quotes.add_item(user_id, product_id)
        
        return {"status": "success"}
```

---

## Troubleshooting

### Widget Not Rendering

1. Check that widget JSON structure matches ChatKit schema
2. Verify `widget` field is included in message payload
3. Check browser console for ChatKit errors
4. Validate all required fields are present

### Actions Not Firing

1. Ensure `onAction` handler is configured in ChatKit setup
2. Check browser console for action events
3. Verify backend `/api/widget-action` endpoint is accessible
4. Check CORS configuration for cross-origin requests

### Images Not Loading

1. Ensure image URLs are absolute (start with `http://` or `https://`)
2. Check CORS headers on image server
3. Verify images are publicly accessible
4. Use placeholder images as fallback

---

## Additional Resources

- [ChatKit Python SDK Documentation](https://github.com/openai/chatkit-python)
- [ChatKit JavaScript SDK Documentation](https://github.com/openai/chatkit-js)
- [OpenAI ChatKit Guide](/docs/guides/chatkit)
- [Widget Templates Source Code](../src/lib/openai/widget-templates.ts)
- [Usage Examples](../src/lib/openai/widget-templates-examples.ts)

---

## Support

For issues or questions about widget templates:

1. Check existing issues in the repository
2. Review the examples in `widget-templates-examples.ts`
3. Consult the ChatKit documentation
4. Contact the Yello Solar Hub development team
