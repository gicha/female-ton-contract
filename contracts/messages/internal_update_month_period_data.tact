import "../structs/period_data_item";

message InternalUpdateMonthPeriodData {
    /// array of encrypted data to add
    toAdd: map<Int, PeriodDataItem>;
    /// array of encrypted data to delete
    toDelete: map<Int, PeriodDataItem>;
}
