## Bug Report

### Summary
The schema, seeder, admin UI, and Header all support 9 sound types including `nav-hover` and `nav-click`, but the `saveSound` and `getSoundByType` argument validators only accept 7 types. Uploading a `nav-hover` or `nav-click` sound in the Admin SoundManager fails Convex argument validation.

### Affected Code
- `convex/sounds.ts:15-23` — `getSoundByType` args union missing `nav-hover`, `nav-click`
- `convex/sounds.ts:43-51` — `saveSound` args union missing `nav-hover`, `nav-click`

### Steps to Reproduce
1. Go to Admin → Sound Effects.
2. Click **Upload** on either "Nav Hover" or "Nav Click".
3. Select an audio file and confirm.

### Expected Behavior
The sound uploads and creates/replaces the record.

### Actual Behavior
The mutation is rejected with an argument validation error ("Invalid argument" for `type`).

### Suggested Fix
Add the two literals to both unions:
```ts
v.literal("nav-hover"),
v.literal("nav-click")
```

### Environment
- Branch: `main`
- Convex deployment: `dev:decisive-bass-576`
- Seen on: local dev (`npm run dev`)