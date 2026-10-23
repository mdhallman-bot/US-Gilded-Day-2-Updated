# Industrial Transformation Short Lesson

This is a separate version. Nothing was changed in the earlier GitHub repository,
Apps Script deployment, or response spreadsheet.

## Files

- index.html — the complete student lesson. Charts, styling, and the PDF library
  are built in; upload this one file to your NEW GitHub repository.
- Code.gs — paste into a NEW Apps Script project, not the earlier project.
- This README — setup and verification.

The Carnegie portrait and TED-Ed/Boost links require internet access. The engine
illustration, charts, questions, vocabulary, and PDF library are included in HTML.

## What changed

- Nine short written responses instead of twenty.
- Combustion engine opening with an original explanatory SVG.
- TED-Ed questions 2 and 3 retained; no separate industrialization-definition question.
- GDP investigation retained; one combined survival synthesis question.
- Lighting investigation removed.
- Eight supporting graph panels visible at once; choose one metric to discuss.
- Absolute and relative well-being retained, followed by the poverty reveal.
- Income-distribution pies and the three-house comparison removed.
- Six abbreviated visible evidence cards; two synthesis questions.
- Required eight-term vocabulary practice with feedback and first/latest score.
- Interview directions and verified class links retained at the end.

## Set up the NEW saving service

1. Go to https://script.google.com and create a **new project**.
2. Paste Code.gs into that project's Code.gs file and save.
3. Run setupShortLesson and authorize it. It creates a **new private response
   spreadsheet** named “Industrial Transformation Short Lesson Responses.”
   Find its URL in the execution log.
4. Deploy > New deployment > Web app. Execute as yourself and allow **Anyone**.
   The HTML already uses the new /exec URL supplied for this lesson.
   No shared-secret setup is required.
5. If you already deployed the earlier Code.gs from this package, replace it with
   this updated Code.gs, save, run setupShortLesson if needed, then choose
   Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.
   Edit the existing new-lesson deployment so its /exec URL stays the same.
6. Open the /exec URL. Check for "ok":true, "status":"ready", and
   "lessonId":"u2-day2-industrial-short-v1".
7. Upload index.html to the NEW repository and enable GitHub Pages from main /root.

Pseudonymous usernames are not authentication. Anyone who knows a username can
load its saved work. Use made-up usernames and keep the spreadsheet private.

Until the new connection is filled in, the lesson works with clearly labeled
**device-only saving**, PDF download, and recovery-copy download. It does not
contact the earlier saving service. Device-only work does not follow students
to another computer.

Do not update the earlier Apps Script deployment, paste the new code into its
project, or reuse its endpoint. The new setup also refuses a project containing
the earlier lesson's SHEET_ID or SHARED_SECRET properties.

## Before assigning

- Use a made-up username such as TEST27.
- Write an answer and click Save now. Confirm “Saved to spreadsheet.”
- Reload and resume with the same username; confirm the answer returns.
- Check the new spreadsheet's ShortSaves tab.
- Complete and check all vocabulary matches.
- Download the PDF and check its username, answers, graphs, and vocabulary.
- Open the interview link for your class:
  - 1A: https://app.briskteaching.com/ws/mshhgu
  - 1B: https://app.briskteaching.com/ws/egyhvm
  - 4A: https://app.briskteaching.com/ws/kftf9c

The new lesson ID and browser-storage keys are independent of the earlier
version. The script rejects a mismatched lesson ID; the browser rejects an
earlier-lesson backend response before accepting cloud state.

## Graph interpretation

All eight supporting topics are shown, but some original text cards did not
contain a time series. Sourced numeric comparisons were substituted:

- Information: growth in U.S. telephone numbers, not a claim about message speed.
- Household infrastructure: U.S. farm electrification, not all households.
- Work time: share with a workweek of 48 hours or less; 1919 is approximate.
- Travel: approximate before/after wagon versus rail journey benchmarks, not an
  annual series or a claim that all journeys took that long.

Dashed lines join two benchmarks, not measured intervening years. Approximate
points are labeled. Different graphs have different units, scales, and dates.
Each graph includes its own source and limitation.

## Validation completed

- JavaScript syntax and eight SVG graph render checks.
- Nine distinct response fields and all three interview links.
- Mocked Apps Script setup, save/load, duplicate retries, revision conflicts,
  and wrong-lesson rejection.
- Verified that setup refuses an earlier-lesson project and creates one new
  spreadsheet when run in a fresh project.
- Client rejects an earlier-lesson backend response.

Live Google authorization, deployment, and cross-device saving must be verified
after you deploy the new Apps Script project.
