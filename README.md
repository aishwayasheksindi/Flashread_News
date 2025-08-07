#  FlashRead: AI-Powered News Digest App

This web application fetches the latest trending news, summarizes each article using AI, and provides **sentiment analysis** along with **key takeaways**.

---

## Live Demo

This web application is deployed publicly.

- **Frontend (Vercel)**: [https://flashread-frontend.vercel.app](https://flashread-frontend.vercel.app)  
- **Backend (Railway)**: [https://flashreadbackend-production.up.railway.app](https://flashreadbackend-production.up.railway.app)  
- **News Endpoint**: [https://flashreadbackend-production.up.railway.app/api/news](https://flashreadbackend-production.up.railway.app/api/news)
  (It shows fetched articles.)

  >  **Note: GNews API Limitations**
     > FlashRead uses the **free tier of the GNews API**, which has a limit of **100 requests per day**.
     > If no news articles are displayed, it might be due to this daily usage limit being exceeded.
     > Please try again after 24 hours.
  >
  > 
---
##  How FlashRead Works

- Users can search for news by selecting:
  - **Country**
  - **Category**
  - **From and To Dates**
  - Or combine these filters for more specific results.

- Alternatively, users can type a **custom topic** in the **search bar** (e.g., “AI”, “Elections in India”, “Climate change”).  
  This allows access to a wider range of topics beyond those available in the category dropdown.

- After entering a topic, users can **optionally apply country and date filters** on top of their search to refine results.




-  **No Articles?**  
  If no articles are shown for a given input combination:
  - It may be because there are **no relevant articles** matching the criteria.
  - Click the **Clear** button to reset filters and try different combinations.
  - If the issue persists, it likely means no articles exist for those specific inputs.

- **Important Note**
GNews doesn’t allow combining filters at a deep semantic level. It treats them as surface-level metadata filters and can't deeply understand the real meaning of the article.

    
  







