# Security Spec

## Data Invariants
1. A movie must have a valid string title, number year, and boolean isCartoon.
2. `addedBy` must match the user creating the document.
3. Users can only update `likedBy` arrays with their own ID. They cannot spoof others' likes.

## Dirty Dozen Payloads
- Create movie with `addedBy` set to another user.
- Add someone else's ID to `likedBy` array.
- Update `title` of an existing movie (should probably be restricted or allowed only for the creator).
- Create movie with string `year`.

## The Test Runner
Wait, actually we should just write the rules.
