# Publishing Policy

## Account Routing

- Personal account with confirmed draft permission: use the official draft API, but do not assume public publish API access.
- Account without draft permission: use a local package and manual editor handoff.
- Browser unavailable or prohibited: stop at the package. Never switch surfaces to bypass the restriction.

## Action Boundaries

| Action | Default | Confirmation |
|---|---|---|
| Render article and cover | Allowed | Article approval is enough |
| Open local preview | Allowed | Not required |
| Upload to a draft editor | Allowed only on a supported surface | User must have requested the upload |
| Save a draft | Allowed only on a supported surface | User must have requested a draft |
| Publicly publish | Prohibited by default | Explicit action-time confirmation required |

## API Draft Route

1. Prepare `article.html`, `cover.png`, and `metadata.json`.
2. Read AppSecret from macOS Keychain or a transient environment variable.
3. Obtain an access token without logging it.
4. Upload `cover.png` as permanent image material.
5. Add the article through `draft/add`.
6. Treat the returned draft media ID as creation confirmation.
7. Preview and publish manually unless the account has separate publication permission and the user confirms at action time.

## Manual Handoff

1. Open `article.html` locally.
2. Click `复制排版正文`.
3. Open the signed-in WeChat Official Account editor.
4. Paste the body, set title, author, and summary from `metadata.json`.
5. Upload `cover.png`.
6. Preview on mobile.
7. Save to the draft box.
8. Publish only after a separate final review.

## Editorial Checks

- Title and cover sentence are different but logically aligned.
- Cover text is exact Chinese, not generated lettering.
- No remote images remain in the body.
- Paragraphs are readable on a phone.
- Sources support factual wording and remain attributable.
- Personal cases are anonymised and presented as experience, not prevalence evidence.
