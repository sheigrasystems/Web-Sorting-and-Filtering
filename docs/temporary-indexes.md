# Temporary sorting indexes

DataFlex WebLists require an appropriate index to sort data efficiently. The library can create DataFlex client indexes at runtime so that columns are sortable without requiring a permanent server-side index for every possible ordering.

This feature requires a SQL database. The embedded DataFlex database is not supported.

## Application-level manager

Create one `cTemporaryIndexManager` inside `oWebApp` and release its indexes at the end of every process request:

```dataflex
Object oTemporaryIndexManager is a cTemporaryIndexManager
End_Object

Procedure OnReleaseProcess
    Send TearDown of ghoTemporaryIndexManager
End_Procedure
```

Merge the `Send TearDown` line into an existing `OnReleaseProcess` implementation. Never add a second implementation of the same method.

Temporary indexes are cached only for the current request and are destroyed by `TearDown`.

## Column integration

Use `csWebColumn`, or import `mixin_TemporarySortIndexes` into the application's own WebColumn subclass. Sorting is enabled by default through `pbSortByTempIndex`.

Set it to `False` on a column that should retain the normal `cWebColumn` index behaviour:

```dataflex
Set pbSortByTempIndex to False
```

## Automatic definitions

When no explicit definition is supplied, the manager:

1. Places the selected sort column first.
2. Uses the selected field's existing index definition where available.
3. Otherwise follows it with the table's primary-index segments.
4. Reuses an existing suitable index when possible.

## Explicit definitions

Override `OnRequestIndexDefinition` for a column that needs additional segments:

```dataflex
Procedure OnRequestIndexDefinition tdIndexSegment[] ByRef aIndexSegments
    Move (RefTable(SalesOrderHeader.CustomerID)) to aIndexSegments[0].iCol
End_Procedure
```

For complete control, build segments with `DefineSegment`, optionally specifying direction and case handling:

```dataflex
Move (DefineSegment(RefTable(MyTable.MyColumn), DF_DESCENDING, DF_CASE_USED)) to aIndexSegments[0]
```

## Multi-tenant applications

Subclass `cTemporaryIndexManager` and override `TenantColumn` when each table's index must begin with a tenant identifier:

```dataflex
Function TenantColumn Integer iTable Returns Integer
    If (iTable = MyTable.File_Number) Begin
        Function_Return (RefTable(MyTable.TenantId))
    End
    Function_Return -1
End_Function
```

The manager moves that field to the first segment and avoids adding it twice. It can reuse an index that already begins with the tenant column followed by the requested sort column.
