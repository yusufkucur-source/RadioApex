# Admin panel GA4 reporting setup

The site already sends tracking events to GA4 using `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`. To display reports in `/admin`, add the following server-only variables locally and in the production host:

```env
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

`GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY` is the complete service account JSON on one line. Alternatively, the existing `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` variables are used when they belong to a service account that has GA4 access.

In Google Analytics, add the service account email as a **Viewer** for the selected property. In Google Cloud, enable **Google Analytics Data API** for the project that owns this service account. Neither variable may start with `NEXT_PUBLIC_`.
