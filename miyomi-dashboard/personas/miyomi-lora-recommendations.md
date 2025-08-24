# Miyomi LoRA Model Recommendations
## Visual AI Training Specifications

### RECOMMENDED BASE MODEL
**Primary**: SDXL 1.0 + Realistic Vision V6.0
**Secondary**: Flux.1 Dev (for cutting-edge quality)
**Fallback**: SD 1.5 + ChilloutMix (for speed/cost optimization)

### CUSTOM LORA TRAINING SPECIFICATION

#### **Physical Characteristics Training Data**
```
Subject: Asian-American woman, age 22
- Face: Oval face shape, high cheekbones, almond eyes
- Hair: Black, shoulder-length with layers, typically messy bun or straight
- Build: Petite (5'4"), athletic from boxing, confident posture
- Style: Streetwear aesthetic, oversized hoodies, high-waisted jeans
- Accessories: Layered gold chains, small hoops, clear phone case with stickers
```

#### **Recommended LoRA Training Dataset (100-150 images)**

**Category Breakdown**:
1. **Portrait Shots** (40%): Various angles, lighting, expressions
2. **Trading Setup** (25%): At desk with monitors, pointing at charts
3. **NYC Environments** (20%): Rooftops, street scenes, apartment
4. **Lifestyle** (15%): Gym, coffee shops, casual moments

**Key Expressions to Train**:
- Confident smirk (signature look)
- Intense focus (analyzing data)
- Excited pointing (making a point)
- Slight eye roll (dismissing bad takes)
- Genuine laugh (community moments)

#### **Style Triggers for Consistent Generation**
```
Positive Prompts:
miyomi_trader, young_asian_woman, confident_expression, streetwear_style, 
nyc_background, trading_setup, neon_lighting, cyberpunk_aesthetic, 
gold_jewelry, messy_bun, oversized_hoodie

Negative Prompts:
formal_attire, corporate_setting, overly_polished, suit, tie, 
conservative_clothing, traditional_finance_aesthetic
```

### EXISTING LORA MODELS TO COMBINE

#### **1. Base Character Style**
**Recommended**: "Asian Streetwear LoRA v2.1"
- **Strength**: 0.7-0.8
- **Use Case**: Core facial features and clothing style
- **Download**: CivitAI Model #47832

#### **2. Environment Enhancement**
**Recommended**: "NYC Cyberpunk LoRA"
- **Strength**: 0.5-0.6
- **Use Case**: Background settings, neon lighting
- **Alternative**: "Urban Neon Aesthetics LoRA"

#### **3. Trading/Finance Theme**
**Recommended**: Custom training on:
- Multiple monitor setups
- Trading charts and graphs
- Financial data overlays
- Holographic UI elements

### PROMPT ENGINEERING TEMPLATES

#### **Daily Pick Video Thumbnail**
```
(masterpiece:1.2), miyomi_trader, confident young asian woman, pointing at camera, 
neon pink and cyan lighting, trading monitors in background, 
"DAILY PICK" text overlay, excited expression, gold chains, 
messy bun hairstyle, nyc rooftop background, cyberpunk aesthetic,
high contrast lighting, sharp focus
```

#### **Market Analysis Content**
```
miyomi_trader sitting at trading desk, multiple monitors showing charts,
focused expression, finger pointing at screen, neon data overlays,
pink and cyan color scheme, professional setup, 
manhattan bridge visible through window, evening lighting
```

#### **Lifestyle/BTS Content**
```
miyomi_trader casual lifestyle, oversized black hoodie, 
gold layered necklaces, coffee in hand, nyc street background,
natural lighting, confident walk, candid moment,
streetwear aesthetic, authentic expression
```

### TECHNICAL SPECIFICATIONS

#### **Training Parameters**
- **Base Resolution**: 512x768 (portrait optimized)
- **Training Steps**: 1500-2000
- **Learning Rate**: 1e-4
- **Batch Size**: 4
- **Network Dimension**: 128
- **Network Alpha**: 64

#### **Style Consistency Weights**
```yaml
facial_features: 0.9      # High consistency for recognition
clothing_style: 0.7       # Medium flexibility for variety  
environment: 0.6          # Background variety while maintaining theme
expression: 0.8           # Consistent personality across emotions
color_palette: 0.9        # Strong brand color consistency (pink/cyan)
```

### PLATFORM-SPECIFIC OPTIMIZATIONS

#### **TikTok/Instagram Reels (9:16)**
```
Portrait orientation, face prominently featured, 
high contrast for mobile viewing, text overlay space reserved,
dynamic poses for video thumbnail appeal
```

#### **YouTube Thumbnails (16:9)**
```
Landscape composition, miyomi on left third, 
chart/data visualization on right, 
explosive expressions, bright contrasting colors,
"SHOCKED" or "POINTING" poses for click-through
```

#### **Twitter Headers (3:1)**
```
Wide landscape, miyomi positioned right,
nyc skyline or trading setup on left,
professional but energetic vibe,
brand colors prominent
```

### ADVANCED TECHNIQUES

#### **ControlNet Integration**
1. **OpenPose**: Consistent pointing gestures and confident postures
2. **Canny Edge**: Maintain sharp facial features across generations
3. **Depth**: Proper background/foreground separation for trading setups

#### **Multi-LoRA Stacking Strategy**
```
Base Character (0.8) + NYC Environment (0.5) + Cyberpunk Aesthetic (0.4) + 
Trading Setup (0.6) + Streetwear Style (0.7)
```

#### **Seed Management**
- **Core Seeds**: 5-10 consistently good seeds for face generation
- **Environment Seeds**: Rotating set for background variety
- **Expression Seeds**: Specific seeds for each emotional state

### QUALITY CONTROL CHECKLIST

#### **Must-Have Elements**
- [ ] Recognizable as Miyomi (facial consistency)
- [ ] Age-appropriate (early 20s appearance)
- [ ] Brand-consistent styling (streetwear + finance)
- [ ] Proper lighting (neon cyberpunk aesthetic)
- [ ] NYC/urban environment context
- [ ] Confident, energetic expression

#### **Red Flags to Avoid**
- [ ] Too formal/corporate appearance
- [ ] Wrong age representation (too young/old)
- [ ] Generic trading bro aesthetic
- [ ] Overly sexualized content
- [ ] Inconsistent facial features
- [ ] Wrong ethnic representation

### CONTENT PIPELINE INTEGRATION

#### **Automated Generation Workflow**
1. **Market Analysis** → Generate chart/data visualizations
2. **LoRA Generation** → Create Miyomi pointing at analysis
3. **Background Composite** → Add NYC/trading environment
4. **Text Overlay** → Add "DAILY PICK" or market info
5. **Brand Consistency Check** → Validate color scheme and style
6. **Platform Optimization** → Resize for target platform

#### **A/B Testing Framework**
- **Expression Variants**: Confident vs. excited vs. serious
- **Environment Variants**: Rooftop vs. trading desk vs. street
- **Style Variants**: Hoodie vs. leather jacket vs. athleisure
- **Pose Variants**: Pointing vs. arms crossed vs. hands on hips

This LoRA specification will create a consistent, recognizable visual identity for Miyomi that can be rapidly deployed across all content formats while maintaining her unique personality and brand aesthetic.