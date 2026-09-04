# Defining filters

Filters are registered in Data Dictionary objects. This keeps filter definitions close to the tables and relationships they describe.

## Basic filters

Override `OnRegisterFilters` and call `RegisterFilter` for each filter:

```dataflex
Procedure OnRegisterFilters tWebFilter[] ByRef aFilters
    Send RegisterFilter (&aFilters) "Account No" (RefTable(SalesOrderHeader.AccountNumber)) efContains
    Send RegisterFilter (&aFilters) "Orders From" (RefTable(SalesOrderHeader.OrderDate)) efGE
    Send RegisterFilter (&aFilters) "Orders To" (RefTable(SalesOrderHeader.OrderDate)) efLE
End_Procedure
```

`RegisterFilter` accepts:

1. The filter array by reference.
2. The user-facing name.
3. A `RefTable(Table.Column)` value.
4. A condition.
5. An optional initial value.

The available conditions are:

| Condition | Meaning |
| --- | --- |
| `efLE` | Less than or equal |
| `efLT` | Less than |
| `efEQ` | Equal |
| `efGE` | Greater than or equal |
| `efGT` | Greater than |
| `efNE` | Not equal |
| `efBegins` | Begins with |
| `efEnds` | Ends with |
| `efContains` | Contains |

The begins, ends and contains conditions apply only to ASCII fields.

## Constrained choices

Use `OnDefineFilterConstraints` to present a filter as a list of choices:

```dataflex
Procedure OnDefineFilterConstraints Integer iColumn Variant[][] ByRef aConstraints

    If (iColumn = RefTable(Person.FirstName)) Begin
        Send DefineFilterConstraint (&aConstraints) "" "- Select -"
        Send DefineFilterConstraint (&aConstraints) "Eric" "Eric"
        Send DefineFilterConstraint (&aConstraints) "John" "John"
    End
End_Procedure
```

The first value is saved and filtered; the optional second value is displayed. `FilterConstraint` provides the same code/description pair as a return value, which is useful when inserting into an array populated elsewhere.

Choices can be loaded dynamically. For example, an application may execute a `SELECT DISTINCT` query into `aConstraints` and insert an empty choice at the beginning.

## Related-table filters

Register the filter in the related DD and connect that DD through the normal `DDO_Server` structure:

```dataflex
Object oPerson_DD is a cPersonDataDictionary
    Procedure OnRegisterFilters tWebFilter[] ByRef aFilters
        Send RegisterFilter (&aFilters) "First Name" (RefTable(Person.FirstName)) efEQ
    End_Procedure
End_Object

Object oCustomer_DD is a cCustomerDataDictionary
    Set DDO_Server to oPerson_DD
End_Object

Object oOrderHeader_DD is a cSalesOrderHeaderDataDictionary
    Set DDO_Server to oCustomer_DD
End_Object
```

The manager follows DataFlex table relationships and builds a correlated SQL `EXISTS` clause for filters belonging to a related table. Filters targeting the same related table are grouped into one `EXISTS` clause. Correlation uses the main table's primary index, including composite primary indexes.

## Custom SQL

Use `OnBuildSqlFilter` when a registered filter cannot be expressed as a simple field comparison:

```dataflex
Procedure OnBuildSqlFilter tWebFilter tFilter String ByRef sWhere
    If (tFilter.iColumn = RefTable(SalesOrderHeader.Status)) Begin
        Move @SQL"""
        "Status" = 5 AND "OrderDate" != '17530101' AND "SalesPersonId" != 0
        """ to sWhere
    End
End_Procedure
```

The returned text becomes part of `psSQLFilter`. It must therefore be valid for the application's SQL database and should be constructed safely when values are involved.

## Other extension events

- `OnFilterRegistered` can adjust the `tWebFilter` immediately after registration.
- `OnDefineFilterDefault` can supply a default for a column and condition.
- `OnApplySelectedFilterValue` can translate the selected value before SQL is built—for example, converting an internal record identifier into the code that should be filtered.
- `OnShowFilter` on the manager can adjust a filter before the filter panel is shown.

## Free-text searching

`csWebListFilterForm` builds a search across eligible WebList columns.

- `piMinSearchTextLength` defaults to `2`.
- `pbFilterOnHiddenColumns` defaults to `False`.

The free-text search is combined with the registered filters when the manager constructs the DD's `psSQLFilter`.
