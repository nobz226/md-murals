## Bug Report

### Summary
`deleteProject` and `deleteImage` call `ctx.storage.delete(image.storageId)` without guarding for `undefined`. Seed images have no `storageId`, so deleting a seeded project/image throws a storage validation error and the mutation never completes.

### Steps to Reproduce
1. Run `seedData` from the Admin dashboard (SeedButton).
2. Open Admin → Projects.
3. Click **Delete** on any seeded project (or delete a seeded image through ImageUploader).

### Expected Behavior
The project and its images are removed successfully.

### Actual Behavior
`ctx.storage.delete` is called with `undefined`, throwing a Convex validation error; the delete never completes.

### Suggested Fix
Guard against missing storage IDs, matching the existing pattern in `clearData`:
```ts
if (image.storageId) {
  await ctx.storage.delete(image.storageId);
}
```

### Environment
- Branch: `main`
- Convex deployment: `dev:decisive-bass-576`
- Seen on: local dev (`npm run dev`)