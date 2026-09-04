# Getting started

This guide shows the pieces required to add sorting and filtering to a WebList.

## 1. Choose the application subclasses

The intended approach for an established application is to import the library mixins into its existing subclasses.

### DataDictionary subclass

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

All Data Dictionaries that register or receive filters must be based on this subclass. `Init_DDWebFilters` enables DataFlex DD SQL filters.

If the application has no custom DataDictionary subclass, it may subclass or use `csDataDictionary` instead.

### WebColumn subclass

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

Use this class for sortable WebList columns. If the application has no custom WebColumn subclass, it may use `csWebColumn` directly.

## 2. Add the temporary index manager

Add one manager object to `oWebApp`:

```dataflex
Use cTemporaryIndexManager.pkg

Object oWebApp is a cWebApp
    Object oTemporaryIndexManager is a cTemporaryIndexManager
    End_Object

    Procedure OnReleaseProcess
        Send TearDown of ghoTemporaryIndexManager
    End_Procedure
End_Object
```

If `OnReleaseProcess` already exists, add only the `Send TearDown` line to it. Do not declare the procedure a second time: the later DataFlex method definition would replace the earlier one.

The Class Palette template intentionally supplies this procedure as commented guidance for that reason.

## 3. Add the filter controls to a view

The Class Palette entry for `cWebViewFiltersPanel` inserts the complete control structure. The containing view must expose `phoFilterManager`:

```dataflex
{ Category = Filters }
Property Handle phoFilterManager

Object oWebViewFiltersPanel is a cWebViewFiltersPanel
    Set peRegion to prTop

    Object oFilterManager is a csWebFilterManager
        Set piFilterPanelLabelOffset to 120
        Set piFilterPanelWidth to 320
    End_Object

    // The Class Palette template supplies the search form, menu items
    // and applied-filter tag display here.
End_Object
```

The manager finds the view's WebList and connects the filter controls during object construction.

## 4. Register filters in the Data Dictionaries

Override `OnRegisterFilters` in the relevant DD object:

```dataflex
Procedure OnRegisterFilters tWebFilter[] ByRef aFilters
    Send RegisterFilter (&aFilters) "Account No" (RefTable(SalesOrderHeader.AccountNumber)) efContains
    Send RegisterFilter (&aFilters) "Orders From" (RefTable(SalesOrderHeader.OrderDate)) efGE
End_Procedure
```

Filters can be registered by the main DD and by related server DDs in the view's DD structure. See [Defining filters](defining-filters.md) for the supported conditions and extension events.

## 5. Use the column subclass

Use the mixin-enabled WebColumn class for the list columns:

```dataflex
Object oOrderNumber is a cMyWebColumn
    Entry_Item SalesOrderHeader.SalesOrderNumber
    Set psCaption to "Order Number"
End_Object
```

The column requests a suitable index when the WebList sorts or performs a column lookup. See [Temporary sorting indexes](temporary-indexes.md).
