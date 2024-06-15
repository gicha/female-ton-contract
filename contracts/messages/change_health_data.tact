message ChangeHealthData {
    /// Address of the user who accessed the data
    accessedAddress: Address;
    /// seqno of date to set inactive
    seqno: Int as uint256;
    /// encrypted period date start
    encryptedPeriodDateStart: String = "";
    /// encrypted period date end
    encryptedPeriodDateEnd: String = "";
    

}
