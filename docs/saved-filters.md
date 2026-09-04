# Saving and loading filters

By default, the filter manager saves one filter layout in the browser's local storage. Applications can replace that behaviour with their own storage, such as a database table, by implementing the manager events below.

`psSaveRestoreKey` can distinguish saved layouts belonging to different contexts. When it is not set, the manager derives its local-storage key from the view.

## Layout format

`FilterLayout` returns the current filter layout as a string:

```dataflex
String sLayout
Get FilterLayout to sLayout
```

Persist this string unchanged. Its internal serialization should be treated as an implementation detail.

To restore a layout, call:

```dataflex
Send ApplyFilterLayout sLayout True
```

The Boolean tells the manager whether a saved layout was found. Passing `False` allows it to update the controls appropriately when no layout exists.

## Replacing local storage

Override the following events in the `csWebFilterManager` object. Set `bHandled` to `True` when the application has taken responsibility; otherwise the manager falls back to browser local storage.

### Saving

```dataflex
Procedure OnSaveFilters String sFilters Boolean ByRef bHandled
    Move True to bHandled
    // Save sFilters using application storage.
End_Procedure
```

### Loading

Loading may be asynchronous or may prompt the user to choose a named filter set. Once the data is available, pass it back with `ApplyFilterLayout`.

```dataflex
Procedure OnLoadFilters Boolean ByRef bHandled
    String sFilters
    Boolean bFound

    Move True to bHandled
    // Load or select a layout into sFilters and set bFound.
    Send ApplyFilterLayout sFilters bFound
End_Procedure
```

### Deleting

```dataflex
Procedure OnDeleteSavedFilters Boolean ByRef bHandled
    Move True to bHandled
    // Delete the selected or current saved layout.
    Send SavedFiltersAvailable False
End_Procedure
```

### Checking availability

```dataflex
Procedure OnCheckSavedFilters Boolean ByRef bHasSavedFilters Boolean ByRef bHandled
    Boolean bResult

    Move True to bHandled
    // Check application storage.
    Move bResult to bHasSavedFilters
End_Procedure
```

Call `SavedFiltersAvailable` later if the check is asynchronous. `CheckSavedFilters` asks the manager to perform the check again.

## Multiple named filter sets

The library's local-storage fallback intentionally stores only one layout. The custom events allow an application to offer multiple sets without imposing a naming or database design on every consumer.

A typical implementation can:

1. Prompt for a name in `OnSaveFilters` and store the supplied layout against the user, view and name.
2. Present the available names in `OnLoadFilters` and call `ApplyFilterLayout` for the selected record.
3. Select and remove a name in `OnDeleteSavedFilters`.
4. Report whether any records exist in `OnCheckSavedFilters`.

The application owns naming, permissions, user scoping and database persistence; the library owns producing and applying the layout string.

Set `pbAllowSave` to `False` if saved-filter controls should not be offered.
