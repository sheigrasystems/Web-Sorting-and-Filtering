# Web Sorting and Filtering for DataFlex

Web Sorting and Filtering adds dynamic sorting and SQL filtering to DataFlex WebLists.

It provides:

- Column sorting backed by dynamically created DataFlex client indexes.
- A filter panel whose filters are declared by Data Dictionaries.
- Free-text searching across visible WebList columns.
- Filtering through related Data Dictionaries using SQL `EXISTS` clauses.
- Display and removal of applied filters as tags.
- Browser-local saved filters, with hooks for application-defined storage.

## Requirements

- DataFlex 2026 (26.0).
- A DataFlex WebApp using Web UI.
- A SQL database.

The embedded DataFlex database is not supported. The library dynamically creates DataFlex client indexes for WebList sorting and uses `psSQLFilter` for filtering.

## Installation

The package installs its stylesheet, JavaScript controls and icon font into the consuming WebApp and adds the required entries to `AppHtml/Index.html`.

Until the package is published, use the library workspace directly for development. A normal published installation will be performed through the DataFlex Package Manager.

## Getting started

Most applications already have their own DataDictionary and WebColumn subclasses. In that case, add the supplied mixins to those subclasses:

```dataflex
Use Datadict.pkg
Use mixin_DDWebFilters.pkg

Class cMyDataDictionary is a DataDictionary
    Import_Class_Protocol mixin_DDWebFilters

    Procedure Construct_Object
        Forward Send Construct_Object
        Send Init_DDWebFilters
    End_Procedure
End_Class
```

```dataflex
Use cWebColumn.pkg
Use mixin_TemporarySortIndexes.pkg

Class cMyWebColumn is a cWebColumn
    Import_Class_Protocol mixin_TemporarySortIndexes

    Procedure Construct_Object
        Forward Send Construct_Object
        Send Define_TemporarySortIndexes_Properties
    End_Procedure
End_Class
```

Ready-made `csDataDictionary` and `csWebColumn` subclasses are also supplied for applications that do not need their own subclasses.

The remaining application and view setup is covered in [Getting started](docs/getting-started.md).

## Documentation

- [Getting started](docs/getting-started.md)
- [Defining filters](docs/defining-filters.md)
- [Temporary sorting indexes](docs/temporary-indexes.md)
- [Saving and loading filters](docs/saved-filters.md)
- [Class and extension-point reference](docs/class-reference.md)

## License

This project is licensed under the [MIT License](LICENSE).
