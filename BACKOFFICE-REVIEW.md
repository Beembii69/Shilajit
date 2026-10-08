# Back office review — 2026-10-08

Update: Spark photo-free mode now permits closing counts and withdrawals without Storage. The photo inputs are disabled and hidden. All 14 emulator scenarios passed again with image fields omitted. The Storage blockers below apply to future photo mode, not to current photo-free records. Real inventory and employee/login/live lifecycle checks are still outstanding.

Not yet ready for full employee rollout.

Verified:
- JavaScript syntax for admin.html and inventory.mjs passes.
- 14 Firestore emulator scenarios pass: authorized restock, founder stock-edit denial, approval reservation, assigned accountant delivery, insufficient-stock denial, missing inventory-write denial, seven-product closing reconciliation, duplicate closing denial, immutable counts, seven-product approval with history, seven-product cancellation release, withdrawal with evidence paths, withdrawal overdraw denial, immutable withdrawal records.
- Desktop console loads without captured JavaScript errors after refresh.
- Guided order tutorial highlights the actual fields and reaches the final submit instruction without creating an order.
- Founder preview hides stock-edit controls. Preview is not an employee authentication test.
- Live Firestore rules were published earlier; stock reads work. Approval is blocked by uninitialized stock rather than the prior permission error.

Fix made during review:
- Order creation now disables the actual submit button instead of the first button in the form (which may be a tutorial or add-product button), and ignores another submission while that button is disabled.
- Stock form handlers ignore submission when their action button is disabled.

Outstanding:
- Firebase Console Storage currently says the project must upgrade its pricing plan to use Storage. No billing changes were made. Configure Storage, its rules and CORS before testing upload/read and photo-required closing counts or withdrawals.
- Local image-selection automation is blocked by the Chrome extension's file URL access setting. Preview, removal, reselection and failed-upload preservation still need a manual image test.
- Actual opening inventory is unrecorded (all seven balances are zero). Enter real counts before approving orders; do not invent stock.
- Togtuunbaatar has no configured login email. Complete account and role setup when supplied.
- Test with real employee logins, not just ADMIN preview, and test iOS/Android devices. Attempted browser viewport override did not change the observed app width, so mobile verification is incomplete.
- Latest website changes remain local; GitHub Pages has not received them.
- A live end-to-end create → approve → prepared → delivered test remains pending. Emulator checks do not establish successful live Storage integration.

Next priority: complete Storage setup and record opening stock, then run one agreed test order through the full workflow before deployment. After that, add a compact dashboard reminder for pending approvals, overdue deliveries and missing closing counts.
