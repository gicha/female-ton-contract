message AddHealthData {
    /// Address of the user who accessed the data
    accessedAddress: Address;
    
    /// Encrypted health data by public key of the user who accessed the data
    encryptedData: String; 
}
