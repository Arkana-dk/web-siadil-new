# 📊 Filter Duplikat - Visual Flow Diagram

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB SIADIL APPLICATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │   API/Data   │───────▶│  useData()   │                  │
│  │   Source     │        │    Hook      │                  │
│  └──────────────┘        └──────┬───────┘                  │
│                                  │                           │
│                                  ▼                           │
│                        ┌─────────────────┐                  │
│                        │   Documents[]   │                  │
│                        │   Reminders[]   │                  │
│                        └────────┬────────┘                  │
│                                  │                           │
│                                  │  Optional Filter          │
│                                  ▼                           │
│                    ╔═════════════════════════╗              │
│                    ║  filterDuplicates.ts   ║              │
│                    ║  (Core Library)         ║              │
│                    ╠═════════════════════════╣              │
│                    ║ • removeDuplicateDocs  ║              │
│                    ║ • removeDuplicateRem   ║              │
│                    ║ • getDuplicateStats    ║              │
│                    ║ • findDuplicates       ║              │
│                    ╚══════════╦══════════════╝              │
│                                │                           │
│                                ▼                           │
│                    ┌─────────────────────┐                │
│                    │  Unique Documents  │                │
│                    │  Unique Reminders  │                │
│                    └──────────┬──────────┘                │
│                                │                           │
│                                ▼                           │
│                    ┌─────────────────────┐                │
│                    │    Components       │                │
│                    │  • HeaderSection    │                │
│                    │  • QuickAccess      │                │
│                    │  • DocumentView     │                │
│                    └─────────────────────┘                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Option 1: Global Filter (Di useData Hook)

```
API Request
    │
    ▼
Raw Data (with duplicates)
    │
    ▼
┌──────────────────────┐
│  filterDuplicates   │
│   (in useData)      │
└──────────┬───────────┘
           │
           ▼
Clean Data (no duplicates)
           │
           ▼
   All Components
  (get clean data)
```

### Option 2: Component Filter

```
API Request
    │
    ▼
Raw Data (with duplicates)
    │
    ├────────────────┬────────────────┐
    ▼                ▼                ▼
Component A    Component B      Component C
    │                │                │
    ▼                │                │
┌────────┐          │                │
│ Filter │          │                │
└───┬────┘          │                │
    │                │                │
    ▼                ▼                ▼
 Clean           Raw              Raw
```

---

## 🎨 Filter Types Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILTER TYPE COMPARISON                        │
├─────────────────────┬───────────────────┬───────────────────────┤
│                     │                   │                        │
│  Simple Filter      │  Multiple Keys    │  Priority Filter       │
│                     │                   │                        │
│  ┌───┐ ┌───┐       │  ┌───┐ ┌───┐     │  ┌───┐ ┌───┐          │
│  │ A │ │ A │       │  │ AB│ │ AB│     │  │ A1│ │ A2│          │
│  └───┘ └───┘       │  └───┘ └───┘     │  └───┘ └───┘          │
│  ┌───┐             │  ┌───┐           │       Choose           │
│  │ B │             │  │ AC│           │       Newer            │
│  └───┘             │  └───┘           │         │              │
│                     │                   │         ▼              │
│  Filter by ID       │  Filter by        │  ┌───┐               │
│        ▼            │  Number + Title   │  │ A2│               │
│  ┌───┐ ┌───┐       │        ▼          │  └───┘               │
│  │ A │ │ B │       │  ┌───┐ ┌───┐     │  ┌───┐               │
│  └───┘ └───┘       │  │ AB│ │ AC│     │  │ B │               │
│                     │  └───┘ └───┘     │  └───┘               │
│  Result: 2 items    │  Result: 2 items │  Result: 2 items     │
│                     │                   │                       │
└─────────────────────┴───────────────────┴───────────────────────┘
```

---

## 📍 Implementation Locations

```
┌────────────────────────────────────────────────────────────────┐
│                  WHERE TO IMPLEMENT?                            │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1️⃣  GLOBAL (useData Hook)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Location: src/app/dashboard/siadil/hooks/useData.ts          │
│                                                                 │
│  Pros:                          Cons:                           │
│  ✅ Single point of filtering  ⚠️  Affects all components      │
│  ✅ All data clean globally    ⚠️  Need to modify hook         │
│  ✅ Consistent behavior        ⚠️  May filter too aggressively │
│                                                                 │
│  Best for: Complete data control                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2️⃣  COMPONENT LEVEL (HeaderSection, etc)                     │
├─────────────────────────────────────────────────────────────────┤
│  Location: src/app/dashboard/siadil/components/               │
│                                                                 │
│  Pros:                          Cons:                           │
│  ✅ Isolated changes           ⚠️  Need to add to each         │
│  ✅ Easy to test/rollback      ⚠️  Potential inconsistency     │
│  ✅ Flexible per component     ⚠️  Multiple filter points      │
│                                                                 │
│  Best for: Specific component needs                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3️⃣  PAGE LEVEL (page.tsx)                                    │
├─────────────────────────────────────────────────────────────────┤
│  Location: src/app/dashboard/siadil/page.tsx                  │
│                                                                 │
│  Pros:                          Cons:                           │
│  ✅ Centralized in page        ⚠️  Page-specific only          │
│  ✅ Easy to manage             ⚠️  Props passing needed        │
│  ✅ Good for page-wide filter  ⚠️  Moderate complexity         │
│                                                                 │
│  Best for: Page-wide consistency                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Filter Function Selection

```
┌─────────────────────────────────────────────────────────────────┐
│              WHICH FILTER FUNCTION TO USE?                      │
└─────────────────────────────────────────────────────────────────┘

START HERE
    │
    ▼
┌─────────────────────────────────────┐
│ Need to filter by single field?    │
├─────────────────────────────────────┤
│  YES                   │  NO        │
│  │                     │            │
│  ▼                     ▼            │
│  removeDuplicate       Multiple    │
│  Documents()           Keys?        │
│                        │            │
│                        ▼            │
│                   removeDuplicates  │
│                   ByMultipleKeys()  │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ Need priority logic?                │
├─────────────────────────────────────┤
│  YES                   │  NO        │
│  │                     │            │
│  ▼                     ▼            │
│  removeDuplicates      Use basic   │
│  WithPriority()        filter      │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ Need monitoring/stats?              │
├─────────────────────────────────────┤
│  YES                   │  NO        │
│  │                     │            │
│  ▼                     ▼            │
│  getDuplicateStats()   Done!       │
│  findDuplicateDocs()               │
└─────────────────────────────────────┘
```

---

## 🎯 Use Case Matrix

```
┌───────────────────────────────────────────────────────────────────┐
│                    USE CASE MATRIX                                 │
├──────────────────────────┬─────────────────────┬──────────────────┤
│      Use Case            │   Recommended       │    Function       │
│                          │   Location          │                   │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Filter all documents     │ useData Hook        │ removeDuplicate  │
│ globally                 │                     │ Documents        │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Filter reminders in      │ HeaderSection       │ removeDuplicate  │
│ header                   │                     │ Reminders        │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Filter quick access      │ QuickAccessSection  │ removeDuplicate  │
│ documents                │                     │ Documents        │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Keep newest documents    │ Any location        │ removeDuplicates │
│ when duplicate           │                     │ WithPriority     │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Monitor duplicates       │ useEffect/useData   │ getDuplicate     │
│ for debugging            │                     │ Stats            │
├──────────────────────────┼─────────────────────┼──────────────────┤
│ Find all duplicate       │ Admin/Debug         │ findDuplicate    │
│ documents                │ Component           │ Documents        │
└──────────────────────────┴─────────────────────┴──────────────────┘
```

---

## ⚡ Performance Impact

```
┌────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE ANALYSIS                         │
└────────────────────────────────────────────────────────────────┘

Time Complexity: O(n)
Space Complexity: O(n)

┌─────────────────────────────────────────────────────────────────┐
│  Documents Count     │  Processing Time    │  Impact             │
├──────────────────────┼─────────────────────┼─────────────────────┤
│  < 100              │  ~1ms               │  Negligible ✅      │
│  100 - 1,000        │  ~5ms               │  Minimal ✅         │
│  1,000 - 10,000     │  ~50ms              │  Acceptable ✅      │
│  > 10,000           │  ~500ms             │  Consider opt. ⚠️   │
└─────────────────────────────────────────────────────────────────┘

Optimization Tips:
✅ Use useMemo() to prevent re-computation
✅ Filter at earliest point (useData hook)
✅ Use appropriate unique key (id vs number)
```

---

## 🔐 Safety & Rollback

```
┌────────────────────────────────────────────────────────────────┐
│                    SAFETY FEATURES                              │
└────────────────────────────────────────────────────────────────┘

✅ Non-Invasive
   └─▶ Doesn't modify existing system

✅ Optional
   └─▶ Can be enabled/disabled anytime

✅ Easy Rollback
   └─▶ Comment out 2-3 lines

✅ Type-Safe
   └─▶ Full TypeScript support

✅ No Side Effects
   └─▶ Pure functions only

┌────────────────────────────────────────────────────────────────┐
│                  ROLLBACK PROCEDURE                             │
└────────────────────────────────────────────────────────────────┘

Step 1: Comment import
   // import { removeDuplicateDocuments } from '@/lib/filterDuplicates';

Step 2: Comment filter logic
   // const uniqueDocs = useMemo(...);

Step 3: Revert variable usage
   uniqueDocs  ──▶  documents

Step 4: Test
   ✅ Verify system works normally
```

---

## 📊 Decision Tree

```
                    Need to remove duplicates?
                              │
                    ┌─────────┴─────────┐
                   YES                  NO
                    │                    │
                    ▼                    ▼
            Where to apply?          Don't use
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    Globally  Per Component  Mixed
        │           │           │
        ▼           ▼           ▼
    useData     Component   Combine
     Hook        Level       Both
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
            Which strategy?
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    Simple    Multiple    Priority
    Filter      Keys        Based
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
              Implement!
                    │
                    ▼
            Test & Monitor
                    │
        ┌───────────┴───────────┐
       OK?                    Issues?
        │                        │
        ▼                        ▼
    Deploy!                  Debug
                               │
                               ▼
                         Fix or Rollback
```

---

## 🎉 Success Indicators

```
┌────────────────────────────────────────────────────────────────┐
│              IMPLEMENTATION SUCCESS METRICS                     │
└────────────────────────────────────────────────────────────────┘

✅ No console errors
✅ UI displays correctly
✅ Performance acceptable
✅ Duplicates filtered successfully
✅ User experience maintained
✅ System stability unchanged

Monitor These:
📊 getDuplicateStats() - Show filtering stats
📈 Performance timing - Should be minimal
🐛 Console logs - No unexpected errors
👁️ Visual testing - UI looks good
```

---

**Diagram ini membantu visualisasi sistem filter duplikat! 📊**
