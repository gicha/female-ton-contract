message AddHealthData {
    /// Address of the user who accessed the data
    accessedAddress: Address;
    
    /// encrypted period date start
    encryptedPeriodDateStart: String = "";
    /// encrypted period date end
    encryptedPeriodDateEnd: String = "";
}
