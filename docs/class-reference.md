# Class and extension-point reference

This is a concise guide to the classes intended for application use. Classes marked as internal may change as the implementation evolves.

## Primary integration classes

### `cWebViewFiltersPanel`

A container used by the Class Palette template for the manager, search form, filter menu and applied-filter display. The class itself intentionally adds no behaviour; its template supplies the coordinated object structure.

### `csWebFilterManager`

Coordinates registered DD filters, the filter panel, free-text searching, SQL generation, applied-filter tags and saved layouts.

Common properties:

- `piFilterPanelLabelOffset`: label offset used by dynamically created filter controls; default `100`.
- `piFilterPanelWidth`: filter panel width; default `300`.
- `pbAllowSave`: whether saving is offered; default `True`.
- `psSaveRestoreKey`: optional identity used when saving and restoring layouts.

Important methods and events:

- `ClearFilters`, `ApplyFilters`, `RemoveFilter` and `ShowResults` manage current filtering.
- `FilterLayout` and `ApplyFilterLayout` exchange portable saved-layout strings.
- `OnShowFilter` adjusts a filter before display.
- `OnSaveFilters`, `OnLoadFilters`, `OnDeleteSavedFilters` and `OnCheckSavedFilters` replace local storage.
- `SavedFiltersAvailable` reports the result of an application-defined availability check.

### `csDataDictionary`

A ready-made `DataDictionary` subclass containing `mixin_DDWebFilters`. Applications with their own DD base class should normally import the mixin instead.

### `mixin_DDWebFilters`

Adds filter registration and `psSQLFilter` integration to a DataDictionary subclass.

Public definition hooks:

- `OnRegisterFilters`
- `OnFilterRegistered`
- `OnDefineFilterDefault`
- `OnDefineFilterConstraints`
- `OnBuildSqlFilter`
- `OnApplySelectedFilterValue`

Helpers:

- `RegisterFilter`
- `DefineFilterConstraint`
- `FilterConstraint`

### `csWebColumn`

A ready-made `cWebColumn` subclass containing `mixin_TemporarySortIndexes`. Applications with their own column base class should normally import the mixin instead.

### `mixin_TemporarySortIndexes`

Adds runtime index selection and creation to a WebColumn subclass.

- `pbSortByTempIndex` enables the behaviour and defaults to `True`.
- `OnRequestIndexDefinition` supplies an explicit segment definition.
- `DefineSegment` creates a `tdIndexSegment` value.

### `cTemporaryIndexManager`

Creates, reuses and releases DataFlex client indexes for sorting. Create one inside `oWebApp` and call `TearDown` from the application's existing `OnReleaseProcess`.

Override `TenantColumn` for tables that require a tenant identifier as the first index segment.

## Supporting controls

### `csWebListFilterForm`

Free-text search form connected to the view's WebList.

- `piMinSearchTextLength` defaults to `2`.
- `pbFilterOnHiddenColumns` defaults to `False`.

### `csWebFilterMenuItem`

Opens the filter panel.

### `csWebLoadFiltersMenuItem`

Loads a saved filter layout and reflects whether saved filters are available.

### `csWebFilterTagsDisplay`

Displays active filters as removable tags.

## Advanced integration

### `mixin_WebFilterManager`

Used internally by controls that need to discover and register themselves with the view's filter manager. It may also be useful to custom controls that participate in the same manager relationship.

## Internal implementation classes

The following support the public controls but are not normally instantiated or called by application code:

- `csWebFilterPanel` and its dynamic input classes.
- `csWebModalFloatingPanel` and its header/toolbar classes.
- `cSQLQuery`, used to assemble SQL fragments and relationship joins.

Application code should prefer the documented manager and DataDictionary events over changing these internals.
