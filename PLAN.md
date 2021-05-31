# Plan (for myself)

Every time a new user visits, read all related data from the database, and then somehow cache it. Afterwards, start listening for any other changes made to the database(votes and downvotes) and display it accordingly.

On the second visit on that user, initially, get the data from cache and start listening for changes, and keep repeating that on the rest of the visits.

Visually:

```javascript
site.addEventListener("onUserVisit", () => {
    if (firstVisit()) {
        getDataFromDatabase().then((data) => render(data));
    } else {
        getDataFromCache().then((data) => render(data));
    }
    listenForChanges((change) => {
        displayNewChange(change);
    });
});
```
