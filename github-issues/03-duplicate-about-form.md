## Bug Report

### Summary
The Admin page renders `<AboutForm />` twice, producing two identical "About Page Settings" forms that both bind the same Convex query state.

### Affected Code
- `src/pages/Admin.jsx:98` — first `<AboutForm />`
- `src/pages/Admin.jsx:107` — duplicate `<AboutForm />`

### Steps to Reproduce
1. Navigate to `/admin`.
2. Scroll to the About section.

### Expected Behavior
A single "About Page Settings" form is displayed.

### Actual Behavior
Two identical forms appear with the same fields (Featured Image, Title, Bio Title, Bio Text). Edits in one sync to the other, which is confusing and redundant.

### Suggested Fix
Remove line 107 (or line 98), keeping a single `<AboutForm />`.