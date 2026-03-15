PROJECT: A4 REGISTRATION MAP GENERATION SYSTEM
OBJECTIVE: AutoCAD-style accurate plot drawing with correct calculation, alignment, scaling, and editable zoom text.

------------------------------------------------------------
1) CORE PROBLEM OBSERVED
------------------------------------------------------------

Current output issues:

1. Plot alignment incorrect.
2. Area calculation mismatch in trapezoid case.
3. Dimensions manually positioned (not geometry-based).
4. Text overlaps or shifts when size changes.
5. Zoom chesina appudu text editing difficult.
6. Fixed scaling causes distortion.
7. No structured A4 layout grid.
8. Rectangle logic used even when trapezoid required.

------------------------------------------------------------
2) GEOMETRY REQUIREMENT
------------------------------------------------------------

Input Parameters:
Top Width (T)
Bottom Width (B)
Left Height (L)
Right Height (R)

Condition 1: RECTANGLE
If T == B and L == R
    Draw Rectangle
Else
    Draw Trapezoid

------------------------------------------------------------
3) COORDINATE SYSTEM (MANDATORY)
------------------------------------------------------------

Origin must be bottom-left corner (0,0)

Rectangle Coordinates:
P1 = (0,0)
P2 = (B,0)
P3 = (B,L)
P4 = (0,L)

Trapezoid Coordinates:
P1 = (0,0)
P2 = (B,0)
P3 = (T,L)
P4 = (0,L)

No center-based drawing.
No hardcoded canvas center values.

------------------------------------------------------------
4) AREA CALCULATION LOGIC
------------------------------------------------------------

If Rectangle:
Area_sqft = B × L

If Trapezoid:
Area_sqft = ((T + B) / 2) × L

Conversion:
Area_sqyd = Area_sqft / 9
Area_sqm  = Area_sqft × 0.092903

Round values to 2 decimal places.

DO NOT use rectangle formula for trapezoid case.

------------------------------------------------------------
5) AUTO-SCALING SYSTEM (NO DISTORTION)
------------------------------------------------------------

Define fixed drawing zone inside A4:

Drawing_Width  = 450 units
Drawing_Height = 450 units

ScaleX = Drawing_Width / max(T,B)
ScaleY = Drawing_Height / L

Scale = minimum(ScaleX, ScaleY)

Apply same scale to both X and Y.
Never use separate X/Y scaling.

------------------------------------------------------------
6) A4 LAYOUT STRUCTURE (FIXED TEMPLATE)
------------------------------------------------------------

Divide A4 page into zones:

Zone 1 – Header (Title, Survey No, Owner Name)
Zone 2 – Drawing Area (Plot only)
Zone 3 – Footer (Area Details, Signature, Reference)

Margins must be equal left & right.
Drawing must always remain centered inside drawing zone.
Text must not shift based on plot size.

------------------------------------------------------------
7) DIMENSION SYSTEM REQUIREMENT
------------------------------------------------------------

Do NOT place dimension text manually.

Use proper dimension logic:

- Extension lines
- Dimension line offset (minimum 20 units outside plot)
- Arrow heads proportional to scale
- Text centered on dimension line

Dimension placement must be midpoint-based:

Example:
Bottom Dimension Position X = (P1.x + P2.x) / 2
Bottom Dimension Position Y = -offset

Never use fixed pixel offsets like:
x + 20, y + 30

------------------------------------------------------------
8) TEXT SYSTEM (ZOOM EDITABLE)
------------------------------------------------------------

Requirements:

1. Use MTEXT (not exploded text).
2. Enable Annotative scale.
3. Text height proportional to drawing scale.
4. Separate layer for:
   - Plot
   - Dimensions
   - Text
   - Border
5. No grouping that prevents editing.
6. Text must remain selectable in PDF export.

Zoom chesina appudu:
Text clear ga visible undali.
Edit easy ga avvali.
Explode avvakudadhu.

------------------------------------------------------------
9) STRAIGHT HOUSE DIMENSION OPTION (NEW FEATURE)
------------------------------------------------------------

Add option:

[ ] Equal Width (Rectangle Mode)
[ ] Different Top/Bottom (Trapezoid Mode)

If Equal Width selected:
    T = B automatically.

If user changes one value,
other should auto-update in rectangle mode.

------------------------------------------------------------
10) ROOT CAUSE OF CURRENT ERRORS
------------------------------------------------------------

1. Hardcoded center coordinates.
2. No origin reset.
3. Rectangle-only area formula.
4. No proper dimension engine.
5. Fixed text offsets.
6. No structured A4 template.
7. No dynamic scaling logic.

------------------------------------------------------------
11) FINAL EXPECTED OUTPUT
------------------------------------------------------------

✔ AutoCAD-style clean plot.
✔ Accurate trapezoid calculation.
✔ Proper A4 registration look.
✔ Centered alignment.
✔ Clean margin discipline.
✔ Editable zoom text.
✔ Correct unit conversions.
✔ Straight dimension option available.
✔ No distortion.
✔ Print-ready PDF.

------------------------------------------------------------
END OF TECHNICAL REQUIREMENT
------------------------------------------------------------