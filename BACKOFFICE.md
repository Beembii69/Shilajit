# Back office setup

ADMIN and Founder have “Батлах захиалгууд” in the sidebar and tabs. It lists pending new/called orders, including restored orders, oldest first. Open details to approve or record customer cancellation; existing stock checks and activity recording apply. ADMIN retains “Миний хүргэлт”; Founder has the approvals section instead. Employee preview updates navigation for the selected role.

“Миний хүргэлт” lists the signed-in employee's unfinished assigned orders, earliest promised date first (overdue first). ADMIN preview uses the selected employee's assignment identity. Open details for phone and Google Maps address-search links, delivery confirmation, and failed-delivery reasons. Failed attempts are allowed only on ready orders by the assigned employee or a manager; they preserve status and stock and add immutable activity events. The latest attempt is also visible in details. Unassigned legacy orders are absent from this view. Live testing is deferred at the user's request.

## Photo evidence and storage withdrawals

Closing counts now require a leftover-product photo. All configured staff may create storage withdrawals, with quantities, a reason/recipient, a ПАДААН receipt photo, and a storage-room photo. Withdrawals deduct unreserved stock only; do not also register an order delivery as a storage withdrawal, because delivery already deducts stock. Withdrawal records are immutable and include the actor and timestamp. Both count and withdrawal histories have authenticated photo-view buttons. JPEG, PNG, and WEBP files are accepted up to 5 MB each; phones can use the rear camera. HEIC must be exported as JPEG first.

Enable/configure Firebase Storage for the existing storage bucket. Publish storage.rules as well as firestore.rules. Photo viewing uses authenticated getBlob requests, so apply storage-cors.json to the bucket (for example, gcloud storage buckets update gs://baragshun-website.firebasestorage.app --cors-file=storage-cors.json). Add other actual deployment origins if needed. The Storage rule that checks Firestore records may require enabling cross-service permissions in Firebase Console. Nothing has been deployed automatically.

Uploads happen before the atomic stock transaction. Failed saves attempt to delete unused uploads; browser interruption can leave an unused file. Saved evidence cannot be overwritten or deleted through these rules. Firestore validates file paths; actual uploaded file contents are validated by Storage rules, not by Firestore. Add У. Тогтуунбаатар’s email to both Firestore and Storage staff allowlists when his login is ready. Live Storage/camera integration still needs testing against the configured bucket.

## Stock and closing counts

Open “Барааны үлдэгдэл / Өдрийн хаалтын тооллого”. ADMIN, Нягтлан, and Үйлдвэрийн дарга can add production stock and submit physical closing counts. Founder and other staff can view balances and counts. Start by entering actual opening stock through a restock entry or today's physical closing count; missing inventory starts at zero, never an invented balance.

Monday–Friday are workdays. Authorized stock editors can mark a specific current/future Saturday as a workday. Sunday is off. Closing counts are submitted for today in Asia/Ulaanbaatar, once per day, covering all seven products. Differences require a note; the saved physical counts reconcile on-hand balances while keeping reservations. Counts below reserved stock are rejected: review/cancel affected orders first. The panel shows today's reminder and unrecorded counts in the last 30 days. “Unrecorded” days before adoption do not imply employees missed an existing requirement.

Approval reserves stock; delivery deducts on-hand and releases the reservation; cancellation releases reserved stock. These writes and order activity events are atomic. Insufficient available stock blocks approval/delivery. Recovery returns an order to new and reserves only after fresh approval. Old approved orders are not automatically migrated into reservations; their first delivery after this change deducts unreserved stock. Wholesale/inquiry orders need known product quantities before approval. Stock additions retain immutable movement records; closing counts retain expected/actual quantities, differences, employee, note, and server time. No historical stock is reconstructed.

Deploy admin.html, inventory.mjs, and firestore.rules together. Firebase rules still require a separate console publish; changes in this repository do not deploy them.

Order activity history is stored in orders/{orderId}/activity. New staff order creation, status changes, cancellation, recovery, and payment updates write events atomically with the order. Events show the real authenticated actor, server timestamp, previous/new status or amount, and notes. ADMIN preview records ADMIN. Staff can read events; event edits and deletes are denied. Open order details and press “Үйлдлийн түүх харах” to load history. No historical events are invented for old orders. Customer storefront creation and customer self-cancellation do not yet write events. Rules and the updated admin page must both be deployed before use.

New staff orders save current MNT unit prices, subtotal, a flat MNT discount, final total, and cumulative amount paid (initially zero). Changing future catalogue prices does not change saved orders. Update both UNIT_PRICES and the rule price map/calculation when changing catalogue prices. ADMIN, Founder, and Нягтлан can edit cumulative payment amounts independently of order status. Partial payments are supported; overpayments are rejected. Payment status is derived from amount paid and total. A zero-total order needs no payment. These are manual records, not bank transactions. Historical and storefront orders without saved prices show “Үнэ бүртгээгүй хуучин захиалга”; their prices are not guessed. Existing payment records are preserved when cancelling or restoring orders; refunds are not tracked. Payment updates retain only the most recent editor, time, and note.

All staff can record customer cancellation on unfinished orders and restore cancelled orders to new. Cancellation stores a reason, optional note, actor, and time; recovery stores its actor and time and clears the previous approval, requiring fresh approval. The latest cancellation and recovery remain visible. Delivered orders cannot be cancelled or restored through these actions.

Нягтлан and Үйлдвэрийн дарга can both mark approved orders “Бэлтгэсэн”. ADMIN and Founder retain this permission.

Current delivery assignment: ADMIN, Нягтлан, Үйлдвэрийн дарга, or У. Тогтуунбаатар can be selected for new staff orders; Founder is excluded. Assigned employees can confirm ready orders as delivered. ADMIN and Founder retain oversight and can record completion on behalf of the assigned employee. Reports credit the selected assignee. This supersedes the earlier sole-delivery-employee configuration.

ADMIN has an employee-view selector for testing interface permissions. It changes visible reports and actions without signing into another account. Writes still use the real ADMIN identity and affect live Firebase data. This does not test employee Firebase authentication or server permissions. The delivery view can be previewed before its login is configured.

Payment checking is no longer a workflow step. Current flow: new → approved → ready → done. Production can mark approved orders ready. The delivery role has one completion action, “Хүргэсэн ✓”, for ready orders. ADMIN and Founder can record completion on his behalf while his login is pending. Older paid orders display as approved and can advance to ready.

Keep the stable delivery-pending reporting identifier when adding У. Тогтуунбаатар’s login email, so historical delivery counts remain linked to him. deliveredBy records the person who updated the order, while deliveryAssignee records the delivery employee.

Staff orders now require a promised delivery date and an assigned delivery employee. ADMIN and Founder see monthly staff counts and can click counts to filter orders. Creation counts use the creation month; completed and late delivery counts use the delivery month; overdue counts use the promised-date month. All date comparisons use Asia/Ulaanbaatar. Delivery on the promised date is on time. Historical orders without recorded dates are excluded from lateness counts. Delivery counts credit the assigned employee; the order also records who marked it complete. У. Тогтуунбаатар can be assigned before his login is configured.

Uses the existing Firebase Authentication project and orders collection. Customer and staff orders appear together. Historical customer orders have no staff attribution.

Create email/password accounts in Firebase Authentication for the four configured emails if needed. Staff must verify their email; login sends a verification link for unverified staff accounts.

Publish firestore.rules in Firebase Console → Firestore Database → Rules before using the workflow. Review current console rules before replacing them, including any collections used outside this repository. Editing this repository does not deploy Firebase rules.

All staff can create orders. Market and other sources require details. Every order starts as new. ADMIN and Founder approve; Нягтлан and Үйлдвэрийн дарга can mark approved orders prepared. All staff can record cancellation/recovery. Assigned employees can mark delivery complete, with ADMIN and Founder retaining oversight. Payment recording is separate from this workflow.

У. Тогтуунбаатар has no login yet. Once his email is available, add him with role delivery to STAFF in admin.html and to the rule functions. Allow delivery on the ready → done transition and redeploy the page and rules.

Changes are local until committed and pushed. Firebase rules require separate deployment. Live Firebase integration has not been tested.
# Spark rollout — photo-free mode

The current page sets `PHOTO_UPLOADS_ENABLED = false`: closing counts and warehouse withdrawals save without images and do not contact Firebase Storage. Image inputs are hidden and disabled, with a Mongolian notice on each form. Existing attached photos are preserved. Firestore permits records without photo fields; if paths are supplied, their ownership and structure still must be valid (withdrawal paths must be supplied as a pair). Roles, stock checks, actor attribution and immutable history remain enforced.

The 14 emulator scenarios were rerun with closing/withdrawal photo fields removed and passed. Live employee login and full order lifecycle testing remain required. Enter actual opening inventory before approval. To enable photos later, configure Storage/rules/CORS first, then set the flag to true. The photo setup instructions below apply only when photo mode is enabled.
