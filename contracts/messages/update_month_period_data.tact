import "../structs/period_data_item";

message UpdateMonthPeriodData {
    /// Address of the user who accessed the data
    accessedAddress: Address;
    /// month period index since 1970
    monthIndex: Int;
    /// array of encrypted data to add
    toAdd: map<Int, PeriodDataItem>;
    /// array of encrypted data to delete
    toDelete: map<Int, PeriodDataItem>;
}
