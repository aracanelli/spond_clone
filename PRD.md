# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# PROJECT: SPOND-LIKE GROUP & EVENT MANAGEMENT PLATFORM (FREE-NOTIFICATION MVP)
# ARCHITECTURE: MVVM (Model–View–ViewModel)
# PRIMARY PLATFORM: Web (Responsive, mobile-native feel and desktop-native feel)
# BACKEND / DB: Supabase (Postgres, RLS, Edge Functions)
# AUTH: Clerk (Username, Email, Phone Number, Google SSO)
# DEPLOYMENT: Vercel

---

## 1. PRODUCT OVERVIEW
A modern, responsive, Spond-like group management and event coordination platform that uses a **free notification stack** rather than SMS APIs. This includes:

- Email-based RSVP (YES/NO magic links)
- Web Push Notifications (including iOS via PWA)
- Optional “text-like” notifications using email-to-SMS gateways based on the user’s phone number + carrier (free)

Users are prompted **once on first login** to provide:
- Phone number
- Their mobile carrier  
This enables the system to optionally send email-to-SMS alerts at no cost.

This version removes Twilio/SMS API dependencies entirely.

---

## 2. HIGH-LEVEL ARCHITECTURE

### Stack:
- **Next.js 15+**
- **MVVM** for clean separation of logic:
  - Model: Supabase DB models
  - ViewModel: state & methods via hooks
  - View: UI components
- **Supabase**
  - Postgres tables for groups, events, RSVPs
  - Edge Functions for notification dispatch
- **Clerk**
  - Username
  - Email
  - Phone number input (not used for SMS API)
  - Google SSO
- **Notifications**
  - Email Magic Links (Resend or Supabase Email)
  - Web Push using Service Worker + VAPID
  - Email-to-SMS using user-provided carrier domains (ex: number@vtext.com)
- **Deployment**
  - Vercel

---

## 3. CORE FEATURES

---

## 3.1 USER ONBOARDING (NEW REQUIREMENT)
On the **first successful login**, show a required onboarding modal:

**Fields:**
1. Phone number  
2. Carrier (dropdown)
   - Bell
   - Rogers
   - Telus
   - Fido
   - Koodo
   - Virgin Mobile
   - Videotron
   - AT&T
   - Verizon
   - T-Mobile
   - Sprint
   - “Other”  

Stored in Supabase in `UserPreferences`.

Purpose:  
- Support **email-to-SMS notifications** at zero cost.
- Users may opt-out later.

If the user declines text notifications → set `allow_sms = false`.

---

## 3.2 GROUPS / SUBGROUPS
Features:
- Create groups (admin+organizer roles auto awarded to creator)
- Subgroups (teams, clubs, “subs”)
- Group image, description

Role types:
- Admin
- Organizer
- Player (default)

Admin can reassign roles.

---

## 3.3 EVENTS
Features:
- Create events (one-time + recurring)
- Title, description, location
- Start/end time
- Participant limits
- Event reminders
- Visibility by group/subgroup
- RSVP: YES / NO

Event owner can:
- Edit
- Cancel
- View RSVP list

---

## 3.4 RSVP (EMAIL MAGIC LINKS — FREE)
All RSVP happens through **instant email links**:

Email includes:
- **YES button** → `https://app.com/rsvp?event=123&user=456&response=yes`
- **NO button**

Upon click:
- Update attendee record
- Show “RSVP successful” confirmation screen

No need for login if token-based security is used.

---

## 3.5 ANNOUNCEMENTS
Admins/Organizers can send announcements:
- Email
- Web Push
- Optional carrier-based email-to-SMS (if user opted-in)

Announcements include:
- Message content
- Group/subgroup targeting
- Optional event links

---

## 3.6 NOTIFICATION SYSTEM (FREE MVP STACK)
(Notification is a core part of this PRD)

### A) EMAIL NOTIFICATIONS (Primary)
Used for:
- Event invitations
- RSVP confirmations
- Reminders
- Announcements

Tech stack:
- Supabase email or Resend
- Template-based emails

---

### B) WEB PUSH NOTIFICATIONS (Instant & Free)
Used for:
- Event reminders  
- Announcement alerts  
- Last-minute updates  

Implementation:
- On login, if browser supports Web Push:
  - Prompt user to “Enable Push Notifications”
- Requires:
  - Service worker
  - VAPID Keys
  - Subscription stored in DB
- Mobile devices (iOS) require PWA install flow:
  1. User prompted to “Add to Home Screen”
  2. After opening PWA → Web Push is allowed

---

### C) EMAIL-TO-SMS (Carrier-based — Free)
Used for users who want “text-like” alerts.

Workflow:
1. Onboard user collects phone + carrier.
2. System constructs email-to-SMS address:
   - Example: `5551234567@vtext.com` for Verizon
   - `5551234567@fido.ca` for Fido
3. Notification engine sends **email** → carrier converts to SMS and delivers to their phone.

Limitations:
- Formatting is plain text only
- Replying via SMS is NOT supported for RSVP
- Deliverability depends on carrier reliability

This channel is **optional** and users can opt out.

---

## 3.7 NOTIFICATION PRIORITY LOGIC
When sending event reminders or announcements:

1. If Web Push enabled → send Web Push  
2. Else if Email-to-SMS enabled → send email-to-SMS  
3. Always send Email (for reliability)

User can adjust their preferences in settings.

---

## 4. DATA MODELS (SUPABASE)

### Users
- id
- clerk_id
- email
- phone_number
- created_at

### UserPreferences
- id
- user_id
- phone_number
- carrier
- allow_sms (bool)
- allow_push (bool)
- created_at

### PushSubscriptions
- id
- user_id
- subscription_json
- created_at

### Groups
- id
- name
- description
- image_url
- owner_id

### GroupMembers
- id
- group_id
- user_id
- role

### Subgroups
- id
- group_id
- name
- type

### SubgroupMembers
- id
- subgroup_id
- user_id

### Events
- id
- group_id
- creator_id
- title
- description
- location
- start_time
- end_time
- is_recurring
- recurring_rule
- participant_limit

### EventAttendees
- id
- event_id
- user_id
- rsvp (yes/no/pending)
- updated_at

### Announcements
- id
- group_id
- sender_id
- content
- created_at

---

## 5. MVVM REQUIREMENTS

### Models (Data Layer)
- Supabase queries
- Strong TypeScript interfaces

### ViewModels (Logic)
Hooks such as:
- `useOnboardingViewModel`
- `useEventsViewModel`
- `useGroupsViewModel`
- `useNotificationsViewModel`

Each provides:
- state
- validation
- mutators (create/edit/delete)
- NO UI logic

### Views (UI)
- Built using Tailwind, shadcn/ui
- Framer Motion animations
- Mobile layouts (bottom nav)
- Desktop layouts (left sidebar)

---

## 6. NON-FUNCTIONAL REQUIREMENTS
- Responsive and mobile-native feel  
- High performance on Vercel  
- Accessible (WCAG AA)  
- Secure:
  - Supabase RLS
  - Clerk JWT validation
  - Tokenized RSVP links  
- Offline-ready PWA components  
- Test suite: unit tests + Playwright E2E

---

## 7. REQUIRED OUTPUT FROM CURSOR
Cursor must:

1. Bootstrap Next.js project with MVVM folder structure  
2. Add Clerk authentication  
3. Build onboarding flow (phone + carrier collection)  
4. Configure Supabase with all schemas  
5. Implement the full free notification stack:
   - Email magic link RSVP
   - Web Push (with service worker + fallback messages)
   - Email-to-SMS sending  
6. Build:
   - Groups UI
   - Events UI
   - Subgroups UI
   - Invitations flow  
   - Announcement system  
7. PWA installation prompt for iOS users  
8. Notification preferences page  
9. All ViewModels with full typed interfaces  
10. Full Jest/Vitest + Playwright testing setup  
11. Vercel deployment configuration  

---

## 8. DESIGN REQUIREMENTS
- Modern, simple, elegant UI  
- Native-feeling mobile interface  
- Smooth animations  
- Minimalistic cards, lists, buttons  
- Accessible fonts & colors  
- Branding-neutral (easy to theme later)

---

# END OF PRD
